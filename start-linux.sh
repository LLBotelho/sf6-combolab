#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Instale Node.js 22 LTS primeiro."; exit 1; fi
if [ ! -d node_modules ]; then npm install; fi
npm run dev
