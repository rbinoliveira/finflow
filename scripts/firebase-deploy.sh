#!/usr/bin/env bash
# Publica tudo que este repositório tem de Firebase, em uma passada só.
# Monta a lista de alvos a partir do que existe: nada de --only chumbado,
# que quebraria no dia em que functions ou storage entrarem no projeto.
set -euo pipefail

FIREBASE="${FIREBASE_BIN:-./node_modules/.bin/firebase}"
DRY_RUN="${DRY_RUN:-0}"

command -v "$FIREBASE" >/dev/null 2>&1 || [ -x "$FIREBASE" ] || {
  echo "❌ firebase CLI não encontrado. Rode: pnpm install"; exit 1
}

has_key() { grep -q "\"$1\"[[:space:]]*:" firebase.json 2>/dev/null; }

targets=()

if has_key firestore; then
  [ -f firestore.rules ]        && targets+=("firestore:rules")
  [ -f firestore.indexes.json ] && targets+=("firestore:indexes")
fi

if has_key storage && [ -f storage.rules ]; then
  targets+=("storage")
fi

if has_key functions && [ -d functions ]; then
  targets+=("functions")
fi

if has_key hosting; then
  targets+=("hosting")
fi

if has_key remoteconfig; then
  targets+=("remoteconfig")
fi

if [ "${#targets[@]}" -eq 0 ]; then
  echo "⚠️  Nada de Firebase para publicar (firebase.json sem alvos conhecidos)."
  exit 0
fi

only="$(IFS=,; echo "${targets[*]}")"

echo "→ firebase deploy --only $only"

if [ "$DRY_RUN" = "1" ]; then
  echo "(DRY_RUN — nada foi publicado)"
  exit 0
fi

"$FIREBASE" deploy --only "$only"

echo "✅ Firebase publicado: $only"
