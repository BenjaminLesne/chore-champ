#!/bin/bash
# PreToolUse hook: blocks Edit/Write on src/app/ route files
# unless an e2e spec covers that route.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path → allow
[[ -z "$FILE" ]] && exit 0

# Make path relative to repo root
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
REL="${FILE#$REPO_ROOT/}"

# Block edits to the e2e skip list (only humans should manage it)
[[ "$REL" == .claude/hooks/e2e-skiplist.txt ]] && {
  echo "🚫 The e2e skip list is managed by humans only." >&2
  echo "Ask the user to update .claude/hooks/e2e-skiplist.txt manually." >&2
  exit 2
}

# Only check files under src/app/
[[ "$REL" != src/app/* ]] && exit 0

# Skip non-ts/tsx files
[[ "$REL" != *.ts && "$REL" != *.tsx ]] && exit 0

# Skip files that ARE tests
[[ "$REL" == *.test.* || "$REL" == *.spec.* ]] && exit 0

# Skip common non-route files
[[ "$REL" == */layout.tsx ]] && exit 0
[[ "$REL" == */loading.tsx ]] && exit 0
[[ "$REL" == */error.tsx ]] && exit 0
[[ "$REL" == */not-found.tsx ]] && exit 0
[[ "$REL" == */route.ts ]] && exit 0
[[ "$REL" == */types/* || "$REL" == */types.ts ]] && exit 0
[[ "$REL" == *.d.ts ]] && exit 0

# Extract route segment from path: src/app/dashboard/foo.tsx → dashboard
# For src/app/page.tsx (root route), use empty string (skip — root route doesn't need e2e)
ROUTE_SEGMENT=$(echo "$REL" | sed -n 's|^src/app/\([^/]*\)/.*|\1|p')
[[ -z "$ROUTE_SEGMENT" ]] && exit 0

# Check user-managed skip list
SKIPFILE="$REPO_ROOT/.claude/hooks/e2e-skiplist.txt"
if [[ -f "$SKIPFILE" ]]; then
  while IFS= read -r pattern || [[ -n "$pattern" ]]; do
    [[ -z "$pattern" || "$pattern" == \#* ]] && continue
    [[ "$ROUTE_SEGMENT" == "$pattern" ]] && exit 0
  done < "$SKIPFILE"
fi

# Check if any e2e spec references this route
E2E_DIR="$REPO_ROOT/e2e-tests"
if [[ -d "$E2E_DIR" ]]; then
  if grep -rqEl "'/${ROUTE_SEGMENT}'|\"/${ROUTE_SEGMENT}\"|@route /${ROUTE_SEGMENT}( |$)" "$E2E_DIR"/*.spec.ts 2>/dev/null; then
    exit 0
  fi
fi

echo "⚠️  No e2e test covers the '/$ROUTE_SEGMENT' route" >&2
echo "Expected: an e2e-tests/*.spec.ts file containing '/$ROUTE_SEGMENT'" >&2
echo "" >&2
echo "E2E tests are mandatory for route pages. Create the e2e spec first, then retry this edit." >&2
echo "" >&2
echo "If this route genuinely doesn't need e2e tests, ask the user to add" >&2
echo "'$ROUTE_SEGMENT' to .claude/hooks/e2e-skiplist.txt." >&2
exit 2
