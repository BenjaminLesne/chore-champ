#!/bin/bash
# PreToolUse hook for Bash: blocks --no-verify and --no-gpg-sign flags.
# AI must fix hook errors (eslint, tests, types, translations) instead of skipping them.

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

if echo "$command" | grep -qE '\-\-no-verify|\-\-no-gpg-sign'; then
  echo "🚫 --no-verify / --no-gpg-sign is forbidden." >&2
  echo "" >&2
  echo "Pre-commit/pre-push hooks exist to enforce code quality." >&2
  echo "If a hook fails, fix the underlying issue:" >&2
  echo "  - ESLint errors → fix the code as the rule message says" >&2
  echo "  - TypeScript errors → fix types" >&2
  echo "  - Test failures → fix the tests" >&2
  echo "  - Translation sync → run /translate <namespaces>" >&2
  exit 2
fi

exit 0
