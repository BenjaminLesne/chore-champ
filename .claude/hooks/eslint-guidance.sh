#!/bin/bash
# PostToolUse hook for Bash: when a command fails with ESLint errors,
# remind the AI to follow the rule's guidance instead of suppressing it.

input=$(cat)

# Only act on failed commands
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
stdout=$(echo "$input" | jq -r '.tool_output.stdout // empty')
stderr=$(echo "$input" | jq -r '.tool_output.stderr // empty')
combined="$stdout$stderr"

# Check if output contains ESLint errors
if echo "$combined" | grep -q 'eslint'; then
   if echo "$combined" | grep -qE '✖|error\b'; then
      cat <<'EOF'
⚠️  ESLint errors detected.
READ the error messages carefully — they contain specific fix instructions.
DO NOT suppress with eslint-disable, `as unknown as`, or type workarounds.
Fix the code the way the rule message tells you to.
Even if the errors are pre-existing and not caused by your changes, fix them anyway.
EOF

      # Rule-specific guidance
      if echo "$combined" | grep -q 'no-non-null-assertion'; then
         cat <<'EOF'

💡 no-non-null-assertion: When a value is T | null or T | undefined, capture it
   in a const, then early-throw or early-return if falsy. The rest of the function
   sees T — no ! assertion or as cast needed.
EOF
      fi
   fi
fi

exit 0
