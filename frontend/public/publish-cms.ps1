# Script de publication CMS automatique
# Usage: .\publish-cms.ps1
# Ce script commit et push automatiquement les modifications du CMS

$ErrorActionPreference = "Stop"

Write-Host "`n📝 PUBLICATION CMS" -ForegroundColor Cyan -BackgroundColor Black

# 1. Vérifier que content-editable.json existe
$contentFile = Join-Path $PSScriptRoot "content-editable.json"
if (-not (Test-Path $contentFile)) {
    Write-Host "`n❌ content-editable.json introuvable" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Fichier CMS trouvé" -ForegroundColor Green

# 2. Revenir à la racine du repo
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

Write-Host "📂 Répertoire: $repoRoot" -ForegroundColor Gray

# 3. Vérifier s'il y a des changements
$status = git status --porcelain frontend/public/content-editable.json 2>&1
if (-not $status) {
    Write-Host "`n⚠️ Aucun changement détecté dans le CMS" -ForegroundColor Yellow
    Write-Host "   Le contenu est déjà à jour." -ForegroundColor Gray
    exit 0
}

Write-Host "`n📝 Changements détectés:" -ForegroundColor Yellow
Write-Host "   $status" -ForegroundColor Gray

# 4. Commit automatique
Write-Host "`n💾 Commit des modifications..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMessage = "cms: Update content ($timestamp)"

try {
    git add frontend/public/content-editable.json
    git commit -m $commitMessage
    Write-Host "✅ Commit créé: $commitMessage" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur commit: $_" -ForegroundColor Red
    exit 1
}

# 5. Push vers GitHub
Write-Host "`n🚀 Push vers GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Push réussi!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur push: $_" -ForegroundColor Red
    Write-Host "   Vérifiez votre connexion et vos credentials Git" -ForegroundColor Yellow
    exit 1
}

# 6. Confirmation
Write-Host "`n🎉 PUBLICATION RÉUSSIE!" -ForegroundColor Green -BackgroundColor Black
Write-Host "`n📊 Que se passe-t-il maintenant?" -ForegroundColor Cyan
Write-Host "   1. GitHub a reçu votre commit" -ForegroundColor Gray
Write-Host "   2. Le workflow 'Deploy to Render' se déclenche automatiquement" -ForegroundColor Gray
Write-Host "   3. Render rebuild et déploie le site (2-3 min)" -ForegroundColor Gray
Write-Host "   4. Votre contenu sera visible sur israelgrowthventure.com" -ForegroundColor Gray

Write-Host "`n⏳ Délai: ~2-3 minutes pour voir les changements en ligne" -ForegroundColor Yellow
Write-Host "🌐 Site: https://israelgrowthventure.com" -ForegroundColor Cyan
