#!/usr/bin/env pwsh
# Script de déploiement Render avec API
# Usage: .\force-render-deploy.ps1

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FORCE RENDER DEPLOY VIA API (avec Clear Cache)        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Vérifier RENDER_API_KEY
$apiKey = $env:RENDER_API_KEY
if (-not $apiKey) {
    Write-Host "❌ ERREUR: Variable RENDER_API_KEY non définie`n" -ForegroundColor Red
    Write-Host "Pour la définir:" -ForegroundColor Yellow
    Write-Host '  $env:RENDER_API_KEY = "rnd_votre_clé_ici"' -ForegroundColor Gray
    Write-Host "`nObtenir la clé:" -ForegroundColor Yellow
    Write-Host "  https://dashboard.render.com/account/api-keys`n" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ RENDER_API_KEY trouvée`n" -ForegroundColor Green

# Headers API
$headers = @{
    'Authorization' = "Bearer $apiKey"
    'Accept' = 'application/json'
    'Content-Type' = 'application/json'
}

# Étape 1: Récupérer la liste des services
Write-Host "📋 Étape 1: Récupération des services..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod `
        -Uri 'https://api.render.com/v1/services' `
        -Headers $headers `
        -Method GET
    
    # Chercher igv-site
    $igvService = $response | Where-Object { $_.name -eq 'igv-site' } | Select-Object -First 1
    
    if (-not $igvService) {
        Write-Host "❌ Service 'igv-site' non trouvé`n" -ForegroundColor Red
        Write-Host "Services disponibles:" -ForegroundColor Yellow
        $response | ForEach-Object { Write-Host "  - $($_.name) ($($_.type))" -ForegroundColor Gray }
        exit 1
    }
    
    $serviceId = $igvService.id
    Write-Host "  ✅ Service trouvé!" -ForegroundColor Green
    Write-Host "     ID: $serviceId" -ForegroundColor Gray
    Write-Host "     Type: $($igvService.type)" -ForegroundColor Gray
    Write-Host "     Branch: $($igvService.branch)" -ForegroundColor Gray
    Write-Host "     URL: $($igvService.serviceDetails.url)`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des services`n" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Étape 2: Déclencher un déploiement manuel avec clear cache
Write-Host "🚀 Étape 2: Déclenchement du déploiement (avec clear cache)..." -ForegroundColor Yellow

$deployBody = @{
    clearCache = "clear"
} | ConvertTo-Json

try {
    $deploy = Invoke-RestMethod `
        -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
        -Headers $headers `
        -Method POST `
        -Body $deployBody
    
    Write-Host "  ✅ Déploiement lancé!" -ForegroundColor Green
    Write-Host "     Deploy ID: $($deploy.id)" -ForegroundColor Gray
    Write-Host "     Status: $($deploy.status)" -ForegroundColor White
    Write-Host "     Created: $($deploy.createdAt)" -ForegroundColor Gray
    Write-Host "     Commit: $($deploy.commit.id.Substring(0,7)) - $($deploy.commit.message)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur lors du déclenchement du déploiement`n" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Étape 3: Monitoring du déploiement
Write-Host "`n⏳ Étape 3: Monitoring du déploiement..." -ForegroundColor Yellow
Write-Host "   (Durée estimée: 5-7 minutes)`n" -ForegroundColor Gray

$maxAttempts = 20
$attempt = 0
$previousHash = "bf9fcd7e"  # Hash actuel

while ($attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 20
    
    Write-Host "Check $attempt/$maxAttempts - $(Get-Date -Format 'HH:mm:ss'):" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest `
            -Uri "https://igv-site.onrender.com/?v=$(Get-Random)" `
            -UseBasicParsing `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        if ($response.Content -match 'main\.(\w+)\.js') {
            $currentHash = $matches[1]
            
            if ($currentHash -ne $previousHash) {
                Write-Host "  🎉🎉🎉 NOUVEAU BUILD DÉTECTÉ! 🎉🎉🎉`n" -ForegroundColor Green -BackgroundColor Black
                Write-Host "     Ancien: main.$previousHash.js" -ForegroundColor Red
                Write-Host "     Nouveau: main.$currentHash.js" -ForegroundColor Green
                
                # Test routes SPA
                Write-Host "`n🧪 Test des routes SPA:" -ForegroundColor Yellow
                $testRoutes = @('/about', '/api/health')
                foreach ($route in $testRoutes) {
                    try {
                        $testResp = Invoke-WebRequest "https://igv-site.onrender.com$route" -UseBasicParsing -TimeoutSec 10
                        Write-Host "  ✅ $route → $($testResp.StatusCode)" -ForegroundColor Green
                    } catch {
                        Write-Host "  ⚠️ $route → $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
                    }
                }
                
                Write-Host "`n✅✅✅ DÉPLOIEMENT RÉUSSI! ✅✅✅" -ForegroundColor Green -BackgroundColor Black
                Write-Host "`n📋 RÉSUMÉ:" -ForegroundColor Cyan
                Write-Host "   Service: igv-site" -ForegroundColor White
                Write-Host "   Bundle: main.$currentHash.js" -ForegroundColor Green
                Write-Host "   URL: https://israelgrowthventure.com" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host "  ⏳ Build en cours... (hash: $currentHash)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠️ Bundle non détecté (service redémarre...)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ⚠️ Service non disponible (build en cours)" -ForegroundColor Yellow
    }
}

Write-Host "`n⚠️ Timeout du monitoring (10 minutes)" -ForegroundColor Yellow
Write-Host "Le build peut encore être en cours." -ForegroundColor Gray
Write-Host "Vérifier: https://dashboard.render.com/web/$serviceId" -ForegroundColor Cyan
exit 1
