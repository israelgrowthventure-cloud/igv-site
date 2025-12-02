# 🚀 DÉPLOIEMENT IMMÉDIAT SUR RENDER
# Ce script force un rebuild complet du site igv-site

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DÉPLOIEMENT IMMÉDIAT" -ForegroundColor Cyan -BackgroundColor Black

# Votre clé API Render (depuis GitHub Secrets)
$apiKey = Read-Host "Entrez votre RENDER_API_KEY (commence par rnd_)"

if (-not $apiKey -or -not $apiKey.StartsWith("rnd_")) {
    Write-Host "❌ Clé API invalide" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# 1. Trouver le service
Write-Host "`n🔍 Recherche du service igv-site..." -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers -Method Get
    $service = $services | Where-Object { $_.service.name -eq "igv-site" } | Select-Object -First 1
    
    if (-not $service) {
        Write-Host "❌ Service igv-site introuvable" -ForegroundColor Red
        Write-Host "   Services disponibles:" -ForegroundColor Gray
        $services | ForEach-Object { Write-Host "   - $($_.service.name)" -ForegroundColor Gray }
        exit 1
    }
    
    $serviceId = $service.service.id
    Write-Host "✅ Service trouvé: $serviceId" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur API: $_" -ForegroundColor Red
    Write-Host "   Vérifiez votre clé API" -ForegroundColor Yellow
    exit 1
}

# 2. Déclencher le deploy
Write-Host "`n🚀 Déclenchement du rebuild (clear cache)..." -ForegroundColor Yellow
try {
    $body = @{ clearCache = "clear" } | ConvertTo-Json
    $deploy = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
        -Headers $headers `
        -Method Post `
        -Body $body
    
    Write-Host "✅ Deploy déclenché!" -ForegroundColor Green
    Write-Host "   ID: $($deploy.id)" -ForegroundColor Gray
    Write-Host "   Status: $($deploy.status)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur déploiement: $_" -ForegroundColor Red
    exit 1
}

# 3. Monitoring
Write-Host "`n⏳ Monitoring du déploiement..." -ForegroundColor Cyan
Write-Host "   (Cela peut prendre 2-4 minutes)`n" -ForegroundColor Gray

$oldHash = "bf9fcd7e"
$maxAttempts = 24
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep 10
    
    try {
        $site = Invoke-WebRequest -Uri "https://igv-site.onrender.com?v=$attempt" -UseBasicParsing -TimeoutSec 10
        
        if ($site.Content -match 'main\.([a-f0-9]{8})\.js') {
            $hash = $matches[1]
            
            if ($hash -ne $oldHash) {
                Write-Host "`n🎉 NOUVEAU BUILD DÉPLOYÉ!" -ForegroundColor Green -BackgroundColor Black
                Write-Host "   Bundle: main.$hash.js" -ForegroundColor Green
                
                # Tests
                Write-Host "`n🧪 Tests des routes:" -ForegroundColor Cyan
                
                try {
                    $health = Invoke-WebRequest "https://igv-site.onrender.com/api/health" -UseBasicParsing
                    $healthData = $health.Content | ConvertFrom-Json
                    Write-Host "   ✅ /api/health → $($healthData.status) (v$($healthData.version))" -ForegroundColor Green
                } catch {
                    Write-Host "   ❌ /api/health → Erreur" -ForegroundColor Red
                }
                
                $routes = @('/about', '/packs', '/contact', '/editor')
                $successCount = 0
                
                foreach ($route in $routes) {
                    try {
                        $resp = Invoke-WebRequest "https://igv-site.onrender.com$route" -UseBasicParsing
                        Write-Host "   ✅ $route → $($resp.StatusCode)" -ForegroundColor Green
                        $successCount++
                    } catch {
                        Write-Host "   ❌ $route → Erreur" -ForegroundColor Red
                    }
                }
                
                Write-Host "`n📊 RÉSULTAT: $successCount/4 routes SPA OK" -ForegroundColor $(if ($successCount -eq 4) { 'Green' } else { 'Yellow' })
                
                if ($successCount -eq 4) {
                    Write-Host "`n🎉 SITE OPÉRATIONNEL!" -ForegroundColor Green -BackgroundColor Black
                    Write-Host "   https://israelgrowthventure.com" -ForegroundColor Cyan
                }
                
                exit 0
            }
            
            $elapsed = $attempt * 10
            Write-Host "[$elapsed s] Bundle: main.$hash.js (inchangé)" -ForegroundColor Gray
        }
        
    } catch {
        $elapsed = $attempt * 10
        Write-Host "[$elapsed s] Redémarrage en cours..." -ForegroundColor Yellow
    }
}

Write-Host "`n⏱️ Timeout après $($maxAttempts * 10) secondes" -ForegroundColor Yellow
Write-Host "   Le build prend plus de temps que prévu" -ForegroundColor Gray
Write-Host "   Vérifiez: https://dashboard.render.com" -ForegroundColor Cyan
