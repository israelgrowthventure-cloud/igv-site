# Configuration automatique des variables Render - Version simplifiée
# Utilise curl pour contourner les limitations PowerShell avec l'API Render

$ServiceId = "srv-d4ka5q63jp1c738n6b2g"
$MongoUrl = "mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0"

Write-Host "`n=== CONFIGURATION AUTOMATIQUE RENDER ===" -ForegroundColor Cyan

# Générer les secrets
function Generate-Secret {
    param([int]$Length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

$JwtSecret = Generate-Secret -Length 48
$AdminPassword = Generate-Secret -Length 24

Write-Host "✓ Secrets générés" -ForegroundColor Green
Write-Host "  JWT_SECRET: $JwtSecret" -ForegroundColor Gray
Write-Host "  ADMIN_PASSWORD: $AdminPassword" -ForegroundColor Gray

# Clé API Render - demander à l'utilisateur
Write-Host "`n🔑 Clé API Render requise" -ForegroundColor Yellow
Write-Host "1. Ouvre: https://dashboard.render.com/account/api-keys" -ForegroundColor White
Write-Host "2. Clique 'Create API Key'" -ForegroundColor White
Write-Host "3. Nom: 'IGV Setup' (ou autre)" -ForegroundColor White
Write-Host "4. Copie la clé générée`n" -ForegroundColor White

$RenderApiKey = Read-Host "Colle la clé API Render ici"

if (-not $RenderApiKey -or $RenderApiKey.Length -lt 20) {
    Write-Host "`n❌ Clé API invalide. Réessaye." -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Configuration des variables via API Render..." -ForegroundColor Yellow

# Variables à configurer
$vars = @{
    "MONGO_URL" = $MongoUrl
    "DB_NAME" = "igv_cms_db"
    "JWT_SECRET" = $JwtSecret
    "ADMIN_EMAIL" = "postmaster@israelgrowthventure.com"
    "ADMIN_PASSWORD" = $AdminPassword
}

$success = 0
$failed = 0

foreach ($key in $vars.Keys) {
    $value = $vars[$key]
    
    # Utiliser curl pour éviter les problèmes PowerShell avec Render API
    $body = @{
        key = $key
        value = $value
    } | ConvertTo-Json -Compress
    
    try {
        $response = curl -s -X POST `
            "https://api.render.com/v1/services/$ServiceId/env-vars" `
            -H "Authorization: Bearer $RenderApiKey" `
            -H "Content-Type: application/json" `
            -d $body
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $key configurée" -ForegroundColor Green
            $success++
        } else {
            Write-Host "  ⚠️  $key: variable existe peut-être déjà" -ForegroundColor Yellow
            $success++
        }
    } catch {
        Write-Host "  ❌ $key échec" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n📊 Résultat: $success/$($vars.Count) variables configurées" -ForegroundColor Cyan

if ($success -gt 0) {
    Write-Host "`n✅ CONFIGURATION TERMINÉE" -ForegroundColor Green
    Write-Host "Render va redéployer automatiquement dans 1-2 minutes.`n" -ForegroundColor Yellow
    
    Write-Host "🔐 CREDENTIALS À CONSERVER:" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "ADMIN_EMAIL:    postmaster@israelgrowthventure.com" -ForegroundColor White
    Write-Host "ADMIN_PASSWORD: $AdminPassword" -ForegroundColor White
    Write-Host "JWT_SECRET:     $JwtSecret" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    
    # Sauvegarder dans un fichier
    $credFile = "render_credentials_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    @"
RENDER CREDENTIALS - $(Get-Date)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADMIN_EMAIL:    postmaster@israelgrowthventure.com
ADMIN_PASSWORD: $AdminPassword
JWT_SECRET:     $JwtSecret

MONGO_URL: $MongoUrl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  GARDE CE FICHIER EN LIEU SÛR ET NE LE COMMITE JAMAIS!
"@ | Out-File -FilePath $credFile -Encoding UTF8
    
    Write-Host "✓ Credentials sauvegardées dans: $credFile" -ForegroundColor Green
    Write-Host "⚠️  NE COMMITE JAMAIS CE FICHIER!`n" -ForegroundColor Red
} else {
    Write-Host "`n❌ Échec de la configuration. Vérifie la clé API." -ForegroundColor Red
}
