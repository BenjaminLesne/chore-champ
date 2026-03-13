#!/bin/bash
# PostToolUse hook: blocks AI from adding eslint-disable comments for protected rules.
# Runs after Edit/Write — reads the file and checks for banned disable patterns.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

# Only check TS/TSX files
[[ "$FILE" != *.ts && "$FILE" != *.tsx ]] && exit 0

# Protected rules that the AI must never disable
PROTECTED_RULES=(
  "no-restricted-syntax"
  "@typescript-eslint/no-unsafe-type-assertion"
)

for rule in "${PROTECTED_RULES[@]}"; do
  if grep -qE "eslint-disable.*${rule}" "$FILE"; then
    echo "🚫 You cannot add eslint-disable for '${rule}'." >&2
    echo "Instead, fix the code: use type guards, zod schemas, or isRecord() to narrow types safely." >&2
    exit 2
  fi
done

exit 0
