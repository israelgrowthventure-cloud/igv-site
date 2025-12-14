#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

python scripts/test_production_http.py
node scripts/test_production_browser_playwright.mjs
