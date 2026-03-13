#!/bin/bash
# PreToolUse hook: blocks Edit/Write on source files that have no test file.
# Reads tool input from stdin (JSON).

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path → allow
[[ -z "$FILE" ]] && exit 0

# Make path relative to repo root for matching
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
REL="${FILE#$REPO_ROOT/}"

# Block edits to the test skip list (only humans should manage it)
[[ "$REL" == .claude/hooks/test-skiplist.txt ]] && {
  echo "🚫 The test skip list is managed by humans only." >&2
  echo "Ask the user to update .claude/hooks/test-skiplist.txt manually." >&2
  exit 2
}

# Only check src/ files
[[ "$REL" != src/* ]] && exit 0

# Skip non-ts/tsx files
[[ "$REL" != *.ts && "$REL" != *.tsx ]] && exit 0

# Skip files that ARE tests
[[ "$REL" == *.test.* || "$REL" == *.spec.* ]] && exit 0

# Skip common non-testable patterns
[[ "$REL" == */types/* || "$REL" == */types.ts ]] && exit 0
[[ "$REL" == *.d.ts ]] && exit 0
[[ "$REL" == */index.ts || "$REL" == */index.tsx ]] && exit 0
[[ "$REL" == */layout.tsx || "$REL" == */page.tsx ]] && exit 0
[[ "$REL" == */loading.tsx || "$REL" == */error.tsx || "$REL" == */not-found.tsx ]] && exit 0
[[ "$REL" == */route.ts ]] && exit 0
[[ "$REL" == *config* || "$REL" == *middleware* ]] && exit 0
[[ "$REL" == */providers/* ]] && exit 0

# Check user-managed skip list (one glob pattern per line)
SKIPFILE="$REPO_ROOT/.claude/hooks/test-skiplist.txt"
if [[ -f "$SKIPFILE" ]]; then
  while IFS= read -r pattern || [[ -n "$pattern" ]]; do
    [[ -z "$pattern" || "$pattern" == \#* ]] && continue
    # shellcheck disable=SC2254
    [[ "$REL" == $pattern ]] && exit 0
  done < "$SKIPFILE"
fi

# Check if a corresponding test file exists
DIR=$(dirname "$FILE")
BASENAME=$(basename "$FILE")
NAME="${BASENAME%.*}"
EXT="${BASENAME##*.}"

if [[ ! -f "$DIR/$NAME.test.$EXT" && ! -f "$DIR/$NAME.spec.$EXT" ]]; then
  echo "⚠️  No test file found for $REL" >&2
  echo "Expected: ${REL%.*}.test.$EXT" >&2
  echo "" >&2
  echo "Tests are mandatory. Create the test file first, then retry this edit." >&2
  echo "" >&2
  echo "If this file genuinely doesn't need tests (e.g. pure UI wrapper," >&2
  echo "thin re-export, CSS module, i18n config), ask the user to add" >&2
  echo "a glob pattern to .claude/hooks/test-skiplist.txt." >&2
  exit 2
fi

exit 0
