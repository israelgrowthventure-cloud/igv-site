# 🚀 SCRIPT DE DÉPLOIEMENT - PowerShell
# israelgrowthventure.com
# Date: 2 janvier 2026

Write-Host "🚀 DÉPLOIEMENT IGV SITE + CRM" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier répertoire
if (-not (Test-Path "frontend") -and -not (Test-Path "backend")) {
    Write-Host "❌ Erreur: Exécutez ce script depuis la racine du projet igv-site" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Répertoire OK" -ForegroundColor Green
Write-Host ""

# 2. Build frontend
Write-Host "📦 Build frontend..." -ForegroundColor Yellow
Set-Location frontend

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Build frontend réussi" -ForegroundColor Green
} catch {
    Write-Host "❌ Build frontend échoué!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# 3. Vérification backend (basique)
Write-Host "🐍 Vérification backend..." -ForegroundColor Yellow

if (Test-Path "backend/server.py") {
    Write-Host "✅ Fichiers backend présents" -ForegroundColor Green
} else {
    Write-Host "❌ Fichiers backend manquants" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ PRÊT POUR DÉPLOIEMENT" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Vérifier variables Render (voir RENDER_ENV_VARS_REQUIRED.md)"
Write-Host "2. git add . && git commit -m 'feat: production ready'"
Write-Host "3. git push origin main"
Write-Host "4. Attendre déploiement Render (5-10 min)"
Write-Host "5. Tests LIVE (voir RAPPORT_COMPLET_ACTIONS.md)"
Write-Host ""

Write-Host "🎯 VARIABLES CRITIQUES À VÉRIFIER SUR RENDER:" -ForegroundColor Magenta
Write-Host "   - MONETICO_TPE (à récupérer auprès de CIC)" -ForegroundColor White
Write-Host "   - MONETICO_KEY (clé de sécurité CIC)" -ForegroundColor White
Write-Host "   - MONGODB_URI" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY" -ForegroundColor White
Write-Host ""

Write-Host "🚀 GO!" -ForegroundColor Green
