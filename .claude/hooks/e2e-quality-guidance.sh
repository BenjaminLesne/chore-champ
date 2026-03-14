#!/bin/bash
# PostToolUse hook for Edit|Write: when an e2e spec file is edited,
# remind the AI of quality expectations so it doesn't write shallow tests.

input=$(cat)

# Extract file_path from tool input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Only act on e2e spec files
case "$file_path" in
  e2e-tests/*.spec.ts|*/e2e-tests/*.spec.ts) ;;
  *) exit 0 ;;
esac

cat >&2 <<'EOF'
⚠️  E2E test quality rules:
- Tests MUST complete a full user workflow (create → verify → interact → verify result)
- MUST assert on data changes, not just page navigation
- MUST use waitForResponse() to verify server actions complete
- NEVER write tests that only check headings, navigation links, or URLs
- Reference: e2e-tests/past-winners.spec.ts is the quality bar
EOF

exit 0
