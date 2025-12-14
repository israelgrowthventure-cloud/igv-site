param(
  [string]$FrontUrl = "https://israelgrowthventure.com",
  [string]$BackendUrl = "https://igv-cms-backend.onrender.com"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  $env:FRONT_URL = $FrontUrl
  $env:BACKEND_URL = $BackendUrl

  python scripts/test_production_http.py
  node scripts/test_production_browser_playwright.mjs
}
finally {
  Pop-Location
}
