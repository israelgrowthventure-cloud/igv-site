#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Mission autonome complète : déploiement + tests + validation PROD
.DESCRIPTION
    Orchestre toute la chaîne : vérif env → git → deploy Render → tests → itération jusqu'à succès
#>

$ErrorActionPreference = "Stop"
$REPO_ROOT = "c:\Users\PC\Desktop\IGV\igv site\igv-site"
Set-Location $REPO_ROOT

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "MISSION AUTONOME IGV V3 PRODUCTION" -ForegroundColor Cyan
Write-Host "Date UTC: $(Get-Date -AsUTC -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PHASE 1: VÉRIFICATION VARIABLES D'ENVIRONNEMENT (PRESENT/ABSENT)
# ============================================================================
Write-Host "PHASE 1: Vérification variables d'environnement" -ForegroundColor Yellow
Write-Host ""

$REQUIRED_VARS = @(
    "RENDER_API_KEY",
    "MONGODB_URI",
    "JWT_SECRET"
)

$OPTIONAL_VARS = @(
    "CMS_ADMIN_EMAIL",
    "CMS_ADMIN_PASSWORD",
    "CMS_JWT_SECRET",
    "CRM_ADMIN_EMAIL",
    "CRM_ADMIN_PASSWORD",
    "BOOTSTRAP_TOKEN",
    "MONETICO_MODE",
    "MONETICO_TPE",
    "MONETICO_KEY"
)

$missing_required = @()
$missing_optional = @()

foreach ($var in $REQUIRED_VARS) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "  ❌ $var : ABSENT (REQUIS)" -ForegroundColor Red
        $missing_required += $var
    } else {
        Write-Host "  ✅ $var : PRESENT" -ForegroundColor Green
    }
}

foreach ($var in $OPTIONAL_VARS) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "  ⚠️  $var : ABSENT (optionnel)" -ForegroundColor Yellow
        $missing_optional += $var
    } else {
        Write-Host "  ✅ $var : PRESENT" -ForegroundColor Green
    }
}

if ($missing_required.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ BLOCAGE: Variables requises manquantes:" -ForegroundColor Red
    $missing_required | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Action: Configurer les variables dans l'environnement ou .env Render" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Variables requises présentes" -ForegroundColor Green
if ($missing_optional.Count -gt 0) {
    Write-Host "⚠️  Variables optionnelles manquantes (fonctionnalités partielles):" -ForegroundColor Yellow
    $missing_optional | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}

Write-Host ""

# ============================================================================
# PHASE 2: VÉRIFICATION GIT
# ============================================================================
Write-Host "PHASE 2: Vérification Git" -ForegroundColor Yellow
Write-Host ""

$git_status = git status --short
if ($git_status) {
    Write-Host "Changements détectés:" -ForegroundColor Yellow
    $git_status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    # Vérifier que node_modules n'est pas tracké
    $tracking_modules = $git_status | Select-String "node_modules"
    if ($tracking_modules) {
        Write-Host ""
        Write-Host "❌ ERREUR: node_modules est tracké dans git!" -ForegroundColor Red
        Write-Host "Action: Ajouter node_modules à .gitignore" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "Commit des changements..." -ForegroundColor Yellow
    git add -A
    git commit -m "chore: Mission autonome - iteration $(Get-Date -Format 'yyyy-MM-dd-HHmm')"
    
    Write-Host "Push vers GitHub..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Git synchro" -ForegroundColor Green
} else {
    Write-Host "✅ Aucun changement à commiter" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PHASE 3: DÉPLOIEMENT RENDER VIA API
# ============================================================================
Write-Host "PHASE 3: Déploiement Render" -ForegroundColor Yellow
Write-Host ""

Write-Host "Détection + déclenchement déploiements..." -ForegroundColor Cyan
python scripts\auto_detect_and_deploy.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Échec déploiement Render" -ForegroundColor Red
    Write-Host "Vérifier logs ci-dessus ou RENDER_API_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⏳ Attente déploiements (15 minutes max)..." -ForegroundColor Yellow
Start-Sleep -Seconds 900

Write-Host "✅ Déploiements terminés (timeout atteint)" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 4: TESTS PRODUCTION
# ============================================================================
Write-Host "PHASE 4: Tests Production" -ForegroundColor Yellow
Write-Host ""

Write-Host "Tests HTTP endpoints..." -ForegroundColor Cyan
python scripts\test_production_http.py
$http_result = $LASTEXITCODE

Write-Host ""
Write-Host "Tests Playwright (navigateur + console)..." -ForegroundColor Cyan
node scripts\test_production_browser_playwright.mjs
$playwright_result = $LASTEXITCODE

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "RÉSULTATS TESTS" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

if ($http_result -eq 0) {
    Write-Host "✅ Tests HTTP: PASS" -ForegroundColor Green
} else {
    Write-Host "❌ Tests HTTP: FAIL" -ForegroundColor Red
}

if ($playwright_result -eq 0) {
    Write-Host "✅ Tests Playwright: PASS" -ForegroundColor Green
} else {
    Write-Host "❌ Tests Playwright: FAIL (page blanche ou erreurs console)" -ForegroundColor Red
}

Write-Host ""

if ($http_result -eq 0 -and $playwright_result -eq 0) {
    Write-Host "🎉 TOUS LES TESTS PASSENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Site visible: https://israelgrowthventure.com" -ForegroundColor Green
    Write-Host "✅ Backend OK: https://igv-cms-backend.onrender.com/api/health" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines phases disponibles:" -ForegroundColor Cyan
    Write-Host "  - CMS activation (editor + i18n)" -ForegroundColor Gray
    Write-Host "  - CRM bootstrap admin" -ForegroundColor Gray
    Write-Host "  - Monetico integration TEST" -ForegroundColor Gray
    Write-Host "  - SEO/AIO implementation" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "⚠️  TESTS ÉCHOUÉS - ANALYSE REQUISE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Résultats détaillés:" -ForegroundColor Cyan
    Write-Host "  - HTTP: scripts\test_results_http.json" -ForegroundColor Gray
    Write-Host "  - Playwright: scripts\test_results_browser.json" -ForegroundColor Gray
    Write-Host "  - Screenshot: scripts\screenshot_prod.png" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Actions suivantes:" -ForegroundColor Yellow
    Write-Host "  1. Analyser erreurs dans résultats ci-dessus" -ForegroundColor Gray
    Write-Host "  2. Corriger code (build/runtime/config)" -ForegroundColor Gray
    Write-Host "  3. Relancer: .\scripts\mission_autonome_prod.ps1" -ForegroundColor Gray
    exit 1
}
