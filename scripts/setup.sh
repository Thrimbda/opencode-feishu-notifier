#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_DIR="${HOME}/.config/opencode/plugin"

cd "$ROOT_DIR"

if [ ! -f "package.json" ]; then
  echo "package.json not found in $ROOT_DIR" >&2
  exit 1
fi

npm install
npm run build

mkdir -p "$PLUGIN_DIR"
cp "${ROOT_DIR}/dist/index.js" "$PLUGIN_DIR/opencode-feishu-notifier.js"

node "${ROOT_DIR}/dist/cli.js"

echo "Plugin installed at $PLUGIN_DIR/opencode-feishu-notifier.js"
