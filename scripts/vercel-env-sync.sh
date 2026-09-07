#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="${1:-.env.production}"
TARGET="${2:-production}"
DRY_RUN="${DRY_RUN:-0}"
PLAINTEXT_REGEX="${PLAINTEXT_REGEX:-^(NEXT_PUBLIC_|NODE_ENV$|.*_ENABLED$|.*_URL_STRATEGY$|.*_PUBLIC_URL$|.*_REGION$)}"
command -v vercel >/dev/null 2>&1 || { echo "❌ vercel CLI not found. Install it: pnpm add -g vercel"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "❌ file not found: $ENV_FILE"; exit 1; }
[ -d ".vercel" ] || echo "⚠️  project not linked — run 'vercel link' first (continuing…)"
secret_count=0; plain_count=0
while IFS= read -r line <&3 || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  case "$line" in *=*) ;; *) continue ;; esac
  key="${line%%=*}"; val="${line#*=}"
  key="$(printf '%s' "$key" | tr -d '[:space:]')"
  val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  [ -z "$key" ] && continue
  if [ -z "$val" ]; then echo "⏭️  $key (valor vazio — pulado)"; continue; fi
  if printf '%s' "$key" | grep -Eq "$PLAINTEXT_REGEX"; then
    flag="--no-sensitive"; kind="plaintext"; plain_count=$((plain_count+1))
  else
    flag="--sensitive"; kind="secret  "; secret_count=$((secret_count+1))
  fi
  echo "→ [$kind] $key  ($TARGET)"
  [ "$DRY_RUN" = "1" ] && continue
  vercel env rm "$key" "$TARGET" -y </dev/null >/dev/null 2>&1 || true
  vercel env add "$key" "$TARGET" --value "$val" $flag --force -y >/dev/null 2>&1
done 3< "$ENV_FILE"
echo "✅ $secret_count secret(s), $plain_count plaintext em '$TARGET'."
[ "$DRY_RUN" = "1" ] && echo "(DRY_RUN — nada foi enviado)"
