# Script pour configurer automatiquement les variables d'environnement sur Render
# Version: 2025-12-03

param(
    [string]$RenderApiKey = $env:RENDER_API_KEY,
    [string]$ServiceId = "srv-d4ka5q63jp1c738n6b2g"
)

Write-Host "`n=== CONFIGURATION VARIABLES RENDER ===" -ForegroundColor Cyan
Write-Host "Service: igv-cms-backend ($ServiceId)" -ForegroundColor Yellow

if (-not $RenderApiKey) {
    Write-Host "`n⚠️  RENDER_API_KEY non trouvée dans les variables d'environnement" -ForegroundColor Yellow
    Write-Host "Pour obtenir une clé API:" -ForegroundColor White
    Write-Host "1. Va sur https://dashboard.render.com/account/api-keys" -ForegroundColor Gray
    Write-Host "2. Crée une nouvelle clé API" -ForegroundColor Gray
    Write-Host "3. Définis la variable: `$env:RENDER_API_KEY = 'ta-cle-api'`n" -ForegroundColor Gray
    exit 1
}

# Configuration des variables à ajouter/mettre à jour
$envVars = @(
    @{
        key = "MONGO_URL"
        generateValue = $false
        value = ""
        description = "URL MongoDB Atlas (mongodb+srv://...)"
        required = $true
    },
    @{
        key = "JWT_SECRET"
        generateValue = $true
        value = ""
        description = "Secret JWT (généré automatiquement, 32 caractères)"
        required = $true
    },
    @{
        key = "ADMIN_PASSWORD"
        generateValue = $true
        value = ""
        description = "Mot de passe admin (généré automatiquement)"
        required = $true
    },
    @{
        key = "DB_NAME"
        generateValue = $false
        value = "igv_cms_db"
        description = "Nom de la base de données MongoDB"
        required = $false
    },
    @{
        key = "ADMIN_EMAIL"
        generateValue = $false
        value = "postmaster@israelgrowthventure.com"
        description = "Email administrateur CMS"
        required = $false
    }
)

# Fonction pour générer un secret aléatoire
function Generate-Secret {
    param([int]$Length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $secret = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $secret
}

Write-Host "`n📋 Variables à configurer:`n" -ForegroundColor Cyan

foreach ($var in $envVars) {
    if ($var.generateValue) {
        $var.value = Generate-Secret
        Write-Host "  ✓ $($var.key): <généré automatiquement>" -ForegroundColor Green
    } elseif ($var.value) {
        Write-Host "  ✓ $($var.key): $($var.value)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($var.key): À FOURNIR" -ForegroundColor Yellow
        Write-Host "     $($var.description)" -ForegroundColor Gray
    }
}

# Demander MONGO_URL
Write-Host "`n🔑 Configuration MONGO_URL (CRITIQUE):" -ForegroundColor Cyan
Write-Host "Entre l'URL MongoDB Atlas complète:" -ForegroundColor White
Write-Host "Format: mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority" -ForegroundColor Gray
$mongoUrl = Read-Host "MONGO_URL"

if (-not $mongoUrl -or $mongoUrl -notmatch "mongodb") {
    Write-Host "`n❌ URL MongoDB invalide. Abandon." -ForegroundColor Red
    exit 1
}

# Mettre à jour la valeur
($envVars | Where-Object { $_.key -eq "MONGO_URL" }).value = $mongoUrl

Write-Host "`n✓ Configuration prête" -ForegroundColor Green
Write-Host "`n⏳ Envoi des variables à Render via API..." -ForegroundColor Yellow

# Headers pour l'API Render
$headers = @{
    "Authorization" = "Bearer $RenderApiKey"
    "Content-Type" = "application/json"
}

# Récupérer les variables existantes
try {
    $getUrl = "https://api.render.com/v1/services/$ServiceId/env-vars"
    $existingVars = Invoke-RestMethod -Uri $getUrl -Method Get -Headers $headers
    Write-Host "✓ Variables existantes récupérées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur API Render: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    exit 1
}

# Mettre à jour ou ajouter chaque variable
$success = 0
$failed = 0

foreach ($var in $envVars) {
    if (-not $var.value) { continue }
    
    $existingVar = $existingVars | Where-Object { $_.envVar.key -eq $var.key }
    
    try {
        if ($existingVar) {
            # Mettre à jour
            $updateUrl = "https://api.render.com/v1/services/$ServiceId/env-vars/$($existingVar.envVar.id)"
            $body = @{ value = $var.value } | ConvertTo-Json
            Invoke-RestMethod -Uri $updateUrl -Method Patch -Headers $headers -Body $body | Out-Null
            Write-Host "  ✓ $($var.key) mise à jour" -ForegroundColor Green
        } else {
            # Ajouter
            $addUrl = "https://api.render.com/v1/services/$ServiceId/env-vars"
            $body = @{
                key = $var.key
                value = $var.value
            } | ConvertTo-Json
            Invoke-RestMethod -Uri $addUrl -Method Post -Headers $headers -Body $body | Out-Null
            Write-Host "  ✓ $($var.key) ajoutée" -ForegroundColor Green
        }
        $success++
    } catch {
        Write-Host "  ❌ $($var.key) échec: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n📊 Résultat: $success réussies, $failed échouées" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n✅ CONFIGURATION TERMINÉE" -ForegroundColor Green
    Write-Host "Le service va automatiquement redéployer dans quelques instants." -ForegroundColor Yellow
    Write-Host "`n🔐 IMPORTANT - Sauvegarde tes credentials:" -ForegroundColor Red
    Write-Host "ADMIN_EMAIL: postmaster@israelgrowthventure.com" -ForegroundColor White
    Write-Host "ADMIN_PASSWORD: $(($envVars | Where-Object { $_.key -eq 'ADMIN_PASSWORD' }).value)" -ForegroundColor White
    Write-Host "JWT_SECRET: $(($envVars | Where-Object { $_.key -eq 'JWT_SECRET' }).value)" -ForegroundColor White
    Write-Host "`n⚠️  Conserve ces valeurs en lieu sûr!`n" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Configuration partielle. Vérifie les erreurs ci-dessus." -ForegroundColor Yellow
}
