import { execSync, spawn } from "child_process";

function getDockerCmd(): string | null {
  try {
    execSync("command -v docker", { stdio: "ignore" });
    return "docker";
  } catch {
    /* ignore */
  }
  try {
    execSync("command -v podman", { stdio: "ignore" });
    return "podman";
  } catch {
    /* ignore */
  }
  return null;
}

function isDaemonRunning(cmd: string): boolean {
  try {
    execSync(`${cmd} info`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const dockerCmd = getDockerCmd();

if (!dockerCmd) {
  console.error(
    "❌ Docker (or Podman) is not installed.\n" +
      "   Install Docker: https://docs.docker.com/engine/install/\n" +
      "   Install Podman: https://podman.io/getting-started/installation",
  );
  process.exit(1);
}

if (!isDaemonRunning(dockerCmd)) {
  console.error(
    `❌ ${dockerCmd} daemon is not running. Please start ${dockerCmd} and try again.`,
  );
  process.exit(1);
}

// Start the database (skip if already running)
function isDbRunning(cmd: string): boolean {
  try {
    const out = execSync(`${cmd} ps --format '{{.Names}}'`, {
      encoding: "utf-8",
    });
    return out.includes("chore-champ-postgres");
  } catch {
    return false;
  }
}

if (isDbRunning(dockerCmd)) {
  console.log("Database container already running.");
} else {
  try {
    execSync("./start-database.sh", { stdio: "inherit" });
  } catch {
    console.error("❌ Failed to start the database.");
    process.exit(1);
  }
}

// Start Next.js dev server with output piped to terminal
const next = spawn("npx", ["next", "dev", "--turbo"], {
  stdio: "inherit",
  shell: true,
});

next.on("close", (code) => {
  process.exit(code ?? 0);
});
