#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -gt 0 ]; then FILES=("$@"); else FILES=(".env.example" ".env.local" ".env.production"); fi
keys_of() { grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$1" | sed -E 's/=.*//'; }
fail=0; ref=""; ref_file=""
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then echo "❌ missing: $f"; fail=1; continue; fi
  keys="$(keys_of "$f")"
  sorted="$(printf '%s\n' "$keys" | LC_ALL=C sort)"
  if [ "$keys" != "$sorted" ]; then
    echo "❌ $f is not in alphabetical order."
    diff <(printf '%s\n' "$keys") <(printf '%s\n' "$sorted") | head -6
    fail=1
  fi
  count="$(printf '%s\n' "$keys" | grep -c . || true)"
  echo "• $f — $count variables"
  if [ -z "$ref" ]; then ref="$sorted"; ref_file="$f"
  elif [ "$sorted" != "$ref" ]; then
    echo "❌ $f differs from $ref_file:"
    diff <(printf '%s\n' "$ref") <(printf '%s\n' "$sorted") || true
    fail=1
  fi
done
if [ "$fail" -eq 0 ]; then echo "✅ Files aligned, same sequence and in alphabetical order."
else echo "→ Fix the divergences above."; fi
exit "$fail"
