import { execSync, spawn } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

// ── Config ──────────────────────────────────────────────
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PRD_FILE = join(SCRIPT_DIR, "prd.json");
const PROGRESS_FILE = join(SCRIPT_DIR, "progress.txt");
const ARCHIVE_DIR = join(SCRIPT_DIR, "archive");
const LAST_BRANCH_FILE = join(SCRIPT_DIR, ".last-branch");

type Tool = "amp" | "claude" | "codex";

type ClaudeUsage = {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens?: number;
};

type CodexUsage = {
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
};

type TokenSummary =
  | {
      tool: "claude";
      durationS: number;
      cost: number;
      usage: ClaudeUsage;
      contextPct: number;
      ctxLabel: string;
    }
  | {
      tool: "codex";
      durationS: number;
      usage: CodexUsage;
      turns: number;
    };

type RunResult = {
  output: string;
  tokenSummary: TokenSummary | null;
};

type ScoreMap = Record<string, number>;
type MetricMap = Record<string, string>;

// ── Type guards ────────────────────────────────────────
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isTool(value: unknown): value is Tool {
  return value === "amp" || value === "claude" || value === "codex";
}

function parseJsonRecord(text: string): Record<string, unknown> | null {
  const parsed: unknown = JSON.parse(text);
  return isRecord(parsed) ? parsed : null;
}

type LighthouseProgressSummary = {
  storyLabel: string;
  beforeScores: ScoreMap;
  afterScores: ScoreMap;
  beforeMetrics: MetricMap;
  afterMetrics: MetricMap;
} | null;

// ── Colors ──────────────────────────────────────────────
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

// ── Parse arguments ─────────────────────────────────────
function parseArgs(): { tool: Tool; maxIterations: number } {
  const args = process.argv.slice(2);
  let tool: Tool = "claude";
  let maxIterations = 50;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (arg === "--tool" && args[i + 1]) {
      const val = args[++i];
      if (isTool(val)) tool = val;
    } else if (arg.startsWith("--tool=")) {
      const val = arg.split("=")[1];
      if (isTool(val)) tool = val;
    } else if (/^\d+$/.test(arg)) {
      maxIterations = Number(arg);
    }
  }

  if (!["amp", "claude", "codex"].includes(tool)) {
    console.error(
      `Error: Invalid tool '${tool}'. Must be 'amp', 'claude', or 'codex'.`,
    );
    process.exit(1);
  }

  return { tool, maxIterations };
}

// ── Helpers ─────────────────────────────────────────────
function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  return parseJsonRecord(readFileSync(path, "utf-8"));
}

function readText(path: string): string {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf-8");
}

function getPromptPath(): string {
  const promptMd = join(SCRIPT_DIR, "prompt.md");
  if (existsSync(promptMd)) return promptMd;
  return join(SCRIPT_DIR, "CLAUDE.md");
}

function initProgressFile() {
  writeFileSync(
    PROGRESS_FILE,
    `# Ralph Progress Log\nStarted: ${new Date().toISOString()}\n---\n`,
  );
}

function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000)
    return `${Math.floor((tokens / 1_000_000) * 10) / 10}M`;
  if (tokens >= 1_000) return `${Math.floor(tokens / 1_000)}K`;
  return String(tokens);
}

function formatTokenCount(tokens: number | undefined): string {
  return (tokens ?? 0).toLocaleString("en-US");
}

function formatDuration(durationS: number): string {
  const totalSeconds = Math.max(0, Math.round(durationS));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function stripAnsi(value: string): string {
  return value.replace(/\x1b\[[0-9;]*m/g, "");
}

function padAnsi(value: string, width: number): string {
  const visibleWidth = stripAnsi(value).length;
  return `${value}${" ".repeat(Math.max(0, width - visibleWidth))}`;
}

function makeRow(label: string, value: string, width: number): string {
  const contentWidth = width - 4;
  const labelWidth = Math.min(
    24,
    Math.max(10, Math.floor(contentWidth * 0.32)),
  );
  const valueWidth = Math.max(0, contentWidth - labelWidth - 3);
  return `║ ${padAnsi(dim(label), labelWidth)} ${padAnsi(value, valueWidth)} ║`;
}

function makeTitleRow(value: string, width: number): string {
  return `║ ${padAnsi(bold(value), width - 4)} ║`;
}

function makeSeparator(width: number): string {
  return `╟${"─".repeat(width - 2)}╢`;
}

function buildBox(title: string, rows: string[], width = 78): string {
  const safeWidth = Math.max(width, stripAnsi(title).length + 6);
  return [
    `╔${"═".repeat(safeWidth - 2)}╗`,
    makeTitleRow(title, safeWidth),
    rows.length > 0 ? makeSeparator(safeWidth) : "",
    ...rows,
    `╚${"═".repeat(safeWidth - 2)}╝`,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseNumericMap(input: string): ScoreMap {
  const matches = input.matchAll(/([A-Za-z ]+?) (\d+)(?=,|$)/g);
  const result: ScoreMap = {};

  for (const match of matches) {
    const label = match[1]?.trim();
    const value = Number(match[2]);
    if (!label || Number.isNaN(value)) continue;
    result[label] = value;
  }

  return result;
}

function parseMetricMap(input: string): MetricMap {
  const matches = input.matchAll(
    /([A-Za-z ]+?) ([0-9.]+(?:\s?[a-zA-Z%]+)?)(?=,|$)/g,
  );
  const result: MetricMap = {};

  for (const match of matches) {
    const label = match[1]?.trim();
    const value = match[2]?.trim();
    if (!label || !value) continue;
    result[label] = value;
  }

  return result;
}

function parseLatestLighthouseSummary(
  progressPath: string,
): LighthouseProgressSummary {
  const progress = readText(progressPath);
  const matches = [
    ...progress.matchAll(/^## (\d{4}-[^\n]+)\n([\s\S]*?)(?=^---$|^## |\Z)/gm),
  ];
  const latestEntry = matches.at(-1);
  if (!latestEntry) return null;

  const header = latestEntry[1]?.trim() ?? "";
  const body = latestEntry[2] ?? "";
  const beforeLine =
    /^- Lighthouse before: (.+?)\. Key metrics: (.+?)\.\s*$/m.exec(body);
  const afterLine =
    /^- Lighthouse after: (.+?)\. Key metrics: (.+?)\.\s*$/m.exec(body);

  if (!beforeLine || !afterLine) return null;

  return {
    storyLabel: header.split(" - ")[1] ?? header,
    beforeScores: parseNumericMap(beforeLine[1] ?? ""),
    afterScores: parseNumericMap(afterLine[1] ?? ""),
    beforeMetrics: parseMetricMap(beforeLine[2] ?? ""),
    afterMetrics: parseMetricMap(afterLine[2] ?? ""),
  };
}

function formatScoreDelta(before: number, after: number): string {
  const delta = after - before;
  const deltaLabel =
    delta > 0 ? green(`+${delta}`) : delta < 0 ? red(String(delta)) : dim("0");
  const arrow =
    after > before ? green("↗") : after < before ? red("↘") : dim("→");
  return `${String(before).padStart(3)} ${arrow} ${String(after).padStart(3)}  ${deltaLabel}`;
}

function formatMetricDelta(before?: string, after?: string): string {
  if (!before || !after) return dim("n/a");
  const arrow = before === after ? dim("→") : yellow("→");
  return `${before} ${arrow} ${after}`;
}

function buildIterationSummary(
  iteration: number,
  totalTasks: number,
  maxIterations: number,
  tokenSummary: TokenSummary | null,
  lighthouseSummary: LighthouseProgressSummary,
): string {
  const titleBits = [
    `✨ Iteration ${iteration}/${totalTasks} (max ${maxIterations})`,
  ];
  if (lighthouseSummary?.storyLabel)
    titleBits.push(lighthouseSummary.storyLabel);

  const rows: string[] = [];

  if (tokenSummary) {
    if (tokenSummary.tool === "codex") {
      const totalTokensUsed =
        tokenSummary.usage.input_tokens +
        tokenSummary.usage.cached_input_tokens +
        tokenSummary.usage.output_tokens;
      rows.push(
        makeRow("Duration", formatDuration(tokenSummary.durationS), 78),
      );
      rows.push(
        makeRow(
          "Tokens used this iteration",
          formatTokenCount(totalTokensUsed),
          78,
        ),
      );
    } else {
      const promptTotal =
        tokenSummary.usage.input_tokens +
        tokenSummary.usage.cache_creation_input_tokens +
        tokenSummary.usage.cache_read_input_tokens;
      const totalTokensUsed =
        promptTotal + (tokenSummary.usage.output_tokens ?? 0);
      rows.push(
        makeRow("Duration", formatDuration(tokenSummary.durationS), 78),
      );
      rows.push(makeRow("Cost", `$${tokenSummary.cost}`, 78));
      rows.push(
        makeRow(
          "Tokens used this iteration",
          formatTokenCount(totalTokensUsed),
          78,
        ),
      );
      rows.push(
        makeRow(
          "Context used",
          `${tokenSummary.contextPct}% of ${tokenSummary.ctxLabel}`,
          78,
        ),
      );
    }
  }

  if (lighthouseSummary) {
    if (rows.length > 0) rows.push(makeSeparator(78));
    rows.push(makeRow("📊 Lighthouse", bold("Before -> After"), 78));

    for (const category of [
      "Performance",
      "Accessibility",
      "Best Practices",
      "SEO",
    ]) {
      const before = lighthouseSummary.beforeScores[category];
      const after = lighthouseSummary.afterScores[category];
      if (before === undefined || after === undefined) continue;
      rows.push(makeRow(category, formatScoreDelta(before, after), 78));
    }

    rows.push(makeSeparator(78));
    rows.push(makeRow("⏱ Metrics", bold("Before -> After"), 78));
    for (const metric of ["LCP", "TBT", "CLS", "FCP", "Speed Index", "TTI"]) {
      rows.push(
        makeRow(
          metric,
          formatMetricDelta(
            lighthouseSummary.beforeMetrics[metric],
            lighthouseSummary.afterMetrics[metric],
          ),
          78,
        ),
      );
    }
  }

  return `\n${buildBox(titleBits.join("  •  "), rows, 78)}`;
}

// ── Git helpers ────────────────────────────────────────
function getCurrentGitBranch(): string {
  return execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  }).trim();
}

// ── Archive previous run ────────────────────────────────
function archiveIfBranchChanged() {
  if (!existsSync(PRD_FILE) || !existsSync(LAST_BRANCH_FILE)) return;

  const currentBranch = getCurrentGitBranch();
  const lastBranch = readText(LAST_BRANCH_FILE).trim();

  if (currentBranch && lastBranch && currentBranch !== lastBranch) {
    const date = new Date().toISOString().slice(0, 10);
    const folderName = lastBranch.replace(/^ralph\//, "");
    const archiveFolder = join(ARCHIVE_DIR, `${date}-${folderName}`);

    console.log(`Archiving previous run: ${lastBranch}`);
    mkdirSync(archiveFolder, { recursive: true });
    if (existsSync(PRD_FILE))
      copyFileSync(PRD_FILE, join(archiveFolder, "prd.json"));
    if (existsSync(PROGRESS_FILE))
      copyFileSync(PROGRESS_FILE, join(archiveFolder, "progress.txt"));
    console.log(`   Archived to: ${archiveFolder}`);

    initProgressFile();
  }
}

function trackBranch() {
  const branch = getCurrentGitBranch();
  if (branch) writeFileSync(LAST_BRANCH_FILE, branch);
}

// ── Run tool ────────────────────────────────────────────
function runTool(tool: Tool): Promise<RunResult> {
  if (tool === "amp") return runAmp();
  if (tool === "codex") return runCodex();
  return runClaude();
}

function runAmp(): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn("amp", ["--dangerously-allow-all"], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const promptFile = getPromptPath();
    const prompt = readFileSync(promptFile, "utf-8");
    child.stdin.write(prompt);
    child.stdin.end();

    let output = "";
    child.stdout.on("data", (data: Buffer) => {
      const text = data.toString();
      process.stderr.write(text);
      output += text;
    });
    child.stderr.on("data", (data: Buffer) => {
      process.stderr.write(data.toString());
    });
    child.on("close", () => resolve({ output, tokenSummary: null }));
  });
}

function runCodex(): Promise<RunResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const promptFile = getPromptPath();
    const prompt = [
      `Ralph workspace details:`,
      `- Your working directory is the repository root.`,
      `- The Ralph instruction file is at ${promptFile}.`,
      `- Read the PRD at ${PRD_FILE}.`,
      `- Read and append progress at ${PROGRESS_FILE}.`,
      ``,
      readFileSync(promptFile, "utf-8"),
    ].join("\n");
    const child = spawn(
      "codex",
      ["exec", "--json", "--dangerously-bypass-approvals-and-sandbox", prompt],
      {
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    let output = "";
    let totalUsage: CodexUsage = {
      input_tokens: 0,
      cached_input_tokens: 0,
      output_tokens: 0,
    };
    let turnCount = 0;
    let tokenSummary: TokenSummary | null = null;
    const rl = createInterface({ input: child.stdout });

    rl.on("line", (line) => {
      const event = parseJsonRecord(line);
      if (!event) {
        process.stderr.write(`${line}\n`);
        return;
      }

      if (event.type === "item.completed") {
        const item = isRecord(event.item) ? event.item : null;
        if (item?.type === "agent_message" && isString(item.text)) {
          console.log(item.text);
          output += item.text;
        }
      } else if (event.type === "turn.completed") {
        if (!isRecord(event.usage)) return;
        const usage: CodexUsage = {
          input_tokens: isNumber(event.usage.input_tokens)
            ? event.usage.input_tokens
            : 0,
          cached_input_tokens: isNumber(event.usage.cached_input_tokens)
            ? event.usage.cached_input_tokens
            : 0,
          output_tokens: isNumber(event.usage.output_tokens)
            ? event.usage.output_tokens
            : 0,
        };
        totalUsage = {
          input_tokens: totalUsage.input_tokens + usage.input_tokens,
          cached_input_tokens:
            totalUsage.cached_input_tokens + usage.cached_input_tokens,
          output_tokens: totalUsage.output_tokens + usage.output_tokens,
        };
        turnCount += 1;
        const durationS =
          Math.round(((Date.now() - startedAt) / 1000) * 10) / 10;
        tokenSummary = {
          tool: "codex",
          durationS,
          usage: totalUsage,
          turns: turnCount,
        };
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      process.stderr.write(data.toString());
    });
    child.on("close", () => resolve({ output, tokenSummary }));
  });
}

function runClaude(): Promise<RunResult> {
  return new Promise((resolve) => {
    const claudeMd = join(SCRIPT_DIR, "CLAUDE.md");
    const child = spawn(
      "claude",
      [
        "--dangerously-skip-permissions",
        "--print",
        "--verbose",
        "--output-format",
        "stream-json",
        "--max-turns",
        "50",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    const prompt = readFileSync(claudeMd, "utf-8")
      .replace(/\{\{PRD_PATH\}\}/g, PRD_FILE)
      .replace(/\{\{PROGRESS_PATH\}\}/g, PROGRESS_FILE);
    child.stdin.write(prompt);
    child.stdin.end();

    let resultOutput = "";
    let tokenSummary: TokenSummary | null = null;
    let lastTurnUsage: ClaudeUsage | null = null;
    const rl = createInterface({ input: child.stdout });

    rl.on("line", (line) => {
      const event = parseJsonRecord(line);
      if (!event) return;

      if (event.type === "assistant") {
        const message = isRecord(event.message) ? event.message : null;
        if (!message) return;
        // Track last turn's usage (= current context window fill)
        if (isRecord(message.usage)) {
          lastTurnUsage = {
            input_tokens: isNumber(message.usage.input_tokens)
              ? message.usage.input_tokens
              : 0,
            cache_creation_input_tokens: isNumber(
              message.usage.cache_creation_input_tokens,
            )
              ? message.usage.cache_creation_input_tokens
              : 0,
            cache_read_input_tokens: isNumber(
              message.usage.cache_read_input_tokens,
            )
              ? message.usage.cache_read_input_tokens
              : 0,
            output_tokens: isNumber(message.usage.output_tokens)
              ? message.usage.output_tokens
              : undefined,
          };
        }
        const content: unknown[] = Array.isArray(message.content)
          ? message.content
          : [];
        for (const raw of content) {
          if (!isRecord(raw)) continue;
          const block = raw;
          if (block.type === "thinking" && isString(block.thinking)) {
            console.log(dim(`[thinking] ${block.thinking}`));
          } else if (block.type === "text" && isString(block.text)) {
            console.log(block.text);
          } else if (block.type === "tool_use") {
            const input = isRecord(block.input) ? block.input : {};
            const name = isString(block.name) ? block.name : "unknown";
            console.log(
              cyan(`[tool] ${name}(${Object.keys(input).join(", ")})`),
            );
          }
        }
      } else if (event.type === "result") {
        const durationMs = isNumber(event.duration_ms) ? event.duration_ms : 0;
        const durationS = Math.round((durationMs / 1000) * 10) / 10;
        const totalCost = isNumber(event.total_cost_usd)
          ? event.total_cost_usd
          : 0;
        const cost = Math.round(totalCost * 100) / 100;

        // Use last turn's usage for context window fill (matches ccstatusline)
        const rawUsage = isRecord(event.usage) ? event.usage : null;
        const usage: ClaudeUsage = lastTurnUsage ?? {
          input_tokens: isNumber(rawUsage?.input_tokens)
            ? rawUsage.input_tokens
            : 0,
          cache_creation_input_tokens: isNumber(
            rawUsage?.cache_creation_input_tokens,
          )
            ? rawUsage.cache_creation_input_tokens
            : 0,
          cache_read_input_tokens: isNumber(rawUsage?.cache_read_input_tokens)
            ? rawUsage.cache_read_input_tokens
            : 0,
          output_tokens: isNumber(rawUsage?.output_tokens)
            ? rawUsage.output_tokens
            : undefined,
        };
        const totalTokens =
          usage.input_tokens +
          usage.cache_creation_input_tokens +
          usage.cache_read_input_tokens;

        const modelUsage = isRecord(event.modelUsage) ? event.modelUsage : {};
        const firstModelRaw = Object.values(modelUsage)[0];
        const firstModel = isRecord(firstModelRaw) ? firstModelRaw : null;
        const contextWindow = isNumber(firstModel?.contextWindow)
          ? firstModel.contextWindow
          : 0;
        const contextPct =
          contextWindow > 0
            ? Math.round((totalTokens / contextWindow) * 1000) / 10
            : 0;
        const ctxLabel = formatContextWindow(contextWindow);

        tokenSummary = {
          tool: "claude",
          durationS,
          cost,
          usage,
          contextPct,
          ctxLabel,
        };
        resultOutput = isString(event.result) ? event.result : "";
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      process.stderr.write(data.toString());
    });

    child.on("close", () => resolve({ output: resultOutput, tokenSummary }));
  });
}

// ── Escalation detection ────────────────────────────────
type Escalation = { category: string; subject: string; body: string };

function parseEscalations(progressPath: string): Escalation[] {
  const text = readText(progressPath);
  const lines = text.split("\n");
  const re = /\[ESCALATION:(\w+)\]\s*(.+?)\s*[—–-]\s*(.+)/;
  return lines
    .filter((l) => l.startsWith("- [ESCALATION:"))
    .map((raw) => {
      const match = re.exec(raw);
      if (!match) return null;
      return {
        category: match[1] ?? "",
        subject: match[2] ?? "",
        body: match[3] ?? "",
      };
    })
    .filter((e): e is Escalation => e !== null);
}

function buildEscalationSummary(escalations: Escalation[]): string {
  const rows: string[] = [];
  for (const esc of escalations) {
    rows.push(makeRow(`[${esc.category}]`, bold(esc.subject), 78));
    rows.push(makeRow("", esc.body, 78));
  }
  return buildBox(
    `⚠ ${escalations.length} Escalation${escalations.length > 1 ? "s" : ""} — Requires Human Decision`,
    rows,
    78,
  );
}

// ── Task counting ──────────────────────────────────────
function countTasks(): { total: number; remaining: number } {
  const prd = readJson(PRD_FILE);
  if (!prd) return { total: 0, remaining: 0 };
  const stories: unknown[] = Array.isArray(prd.userStories)
    ? prd.userStories
    : [];
  const total = stories.length;
  const remaining = stories.filter(
    (s: unknown) => isRecord(s) && !s.passes,
  ).length;
  return { total, remaining };
}

// ── Main ────────────────────────────────────────────────
async function main() {
  const { tool, maxIterations } = parseArgs();

  archiveIfBranchChanged();
  trackBranch();

  if (!existsSync(PROGRESS_FILE)) initProgressFile();

  const { total, remaining } = countTasks();
  console.log(
    bold(
      `Starting Ralph - Tool: ${tool} - ${remaining} task${remaining !== 1 ? "s" : ""} remaining out of ${total} (max ${maxIterations} iterations)`,
    ),
  );

  for (let i = 1; i <= maxIterations; i++) {
    const tasks = countTasks();
    const taskLabel = `${i}/${tasks.remaining} (max ${maxIterations})`;
    console.log(`\n${"=".repeat(63)}`);
    console.log(bold(`  Ralph Iteration ${taskLabel} (${tool})`));
    console.log("=".repeat(63));

    const result = await runTool(tool);
    console.log(
      buildIterationSummary(
        i,
        tasks.remaining,
        maxIterations,
        result.tokenSummary,
        parseLatestLighthouseSummary(PROGRESS_FILE),
      ),
    );
    if (result.output.includes("<promise>COMPLETE</promise>")) {
      const escalations = parseEscalations(PROGRESS_FILE);
      if (escalations.length > 0) {
        console.log(`\n${buildEscalationSummary(escalations)}`);
      }
      console.log(
        green(
          bold(
            `\nRalph completed all tasks! (iteration ${i}, ${tasks.total} tasks)`,
          ),
        ),
      );
      process.exit(0);
    }

    console.log(dim(`Iteration ${i} complete. Continuing...`));
    await new Promise((r) => setTimeout(r, 2000));
  }

  const escalations = parseEscalations(PROGRESS_FILE);
  if (escalations.length > 0) {
    console.log(`\n${buildEscalationSummary(escalations)}`);
  }
  console.log(
    red(
      bold(
        `\nRalph reached max iterations (${maxIterations}) without completing all tasks.`,
      ),
    ),
  );
  console.log(`Check ${PROGRESS_FILE} for status.`);
  process.exit(1);
}

void main();
