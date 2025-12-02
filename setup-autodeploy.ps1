# Script pour activer l'Auto-Deploy sur Render et forcer un rebuild
# Usage: $env:RENDER_API_KEY = "rnd_xxx"; .\setup-autodeploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n🔧 CONFIGURATION AUTO-DEPLOY RENDER" -ForegroundColor Cyan -BackgroundColor Black

# 1. Vérifier API Key
if (-not $env:RENDER_API_KEY) {
    Write-Host "`n❌ RENDER_API_KEY non défini" -ForegroundColor Red
    Write-Host "   Exécutez: `$env:RENDER_API_KEY = 'rnd_xxx'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ API Key trouvée" -ForegroundColor Green

# 2. Trouver le service igv-site
Write-Host "`n🔍 Recherche du service igv-site..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $env:RENDER_API_KEY"
        "Accept" = "application/json"
    }
    
    $services = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers -Method Get
    $igvSite = $services | Where-Object { $_.service.name -eq "igv-site" } | Select-Object -First 1
    
    if (-not $igvSite) {
        Write-Host "❌ Service igv-site non trouvé" -ForegroundColor Red
        exit 1
    }
    
    $serviceId = $igvSite.service.id
    Write-Host "✅ Service trouvé: $serviceId" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur API Render: $_" -ForegroundColor Red
    exit 1
}

# 3. Activer Auto-Deploy
Write-Host "`n⚙️ Activation Auto-Deploy..." -ForegroundColor Yellow
try {
    $body = @{
        autoDeploy = "yes"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" `
        -Headers $headers `
        -Method Patch `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Auto-Deploy activé!" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Impossible d'activer Auto-Deploy via API: $_" -ForegroundColor Yellow
    Write-Host "   Allez manuellement sur Render Dashboard → igv-site → Settings" -ForegroundColor Gray
    Write-Host "   et activez 'Auto-Deploy' = Yes" -ForegroundColor Gray
}

# 4. Forcer un rebuild immédiat
Write-Host "`n🚀 Déclenchement du rebuild..." -ForegroundColor Yellow
try {
    $deployBody = @{
        clearCache = "clear"
    } | ConvertTo-Json
    
    $deploy = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
        -Headers $headers `
        -Method Post `
        -Body $deployBody `
        -ContentType "application/json"
    
    Write-Host "✅ Deploy déclenché: $($deploy.id)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur déploiement: $_" -ForegroundColor Red
    exit 1
}

# 5. Monitoring
Write-Host "`n⏳ Monitoring du déploiement (max 5 min)..." -ForegroundColor Cyan
Write-Host "   URL: https://igv-site.onrender.com" -ForegroundColor Gray

$startTime = Get-Date
$timeout = 300 # 5 minutes
$oldHash = "bf9fcd7e"
$newHash = $null

while (((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
    Start-Sleep 15
    
    try {
        $site = Invoke-WebRequest -Uri "https://igv-site.onrender.com" -UseBasicParsing -TimeoutSec 10
        if ($site.Content -match 'main\.([a-f0-9]{8})\.js') {
            $currentHash = $matches[1]
            
            if ($currentHash -ne $oldHash) {
                $newHash = $currentHash
                Write-Host "`n✅ NOUVEAU BUILD DÉTECTÉ!" -ForegroundColor Green -BackgroundColor Black
                Write-Host "   Bundle: main.$newHash.js" -ForegroundColor Green
                break
            }
        }
        
        $elapsed = [int]((Get-Date) - $startTime).TotalSeconds
        Write-Host "   [$elapsed s] Bundle actuel: main.$currentHash.js" -ForegroundColor Gray
        
    } catch {
        Write-Host "   [Attente site...] $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 6. Tests finaux
if ($newHash) {
    Write-Host "`n🧪 TESTS DES ROUTES" -ForegroundColor Cyan -BackgroundColor Black
    
    # Test /api/health
    Write-Host "`n1️⃣ /api/health..." -ForegroundColor Yellow
    try {
        $health = Invoke-WebRequest -Uri "https://igv-site.onrender.com/api/health" -UseBasicParsing
        $healthData = $health.Content | ConvertFrom-Json
        Write-Host "   ✅ $($health.StatusCode) - Status: $($healthData.status)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
    # Test routes SPA
    Write-Host "`n2️⃣ Routes SPA..." -ForegroundColor Yellow
    $routes = @('/about', '/packs', '/contact', '/editor')
    $successCount = 0
    
    foreach ($route in $routes) {
        try {
            $resp = Invoke-WebRequest -Uri "https://igv-site.onrender.com$route" -UseBasicParsing
            Write-Host "   ✅ $route → $($resp.StatusCode)" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "   ❌ $route → $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📊 RÉSULTAT FINAL" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host "   Bundle: main.$newHash.js ✅" -ForegroundColor Green
    Write-Host "   Routes: $successCount/$($routes.Count) OK" -ForegroundColor $(if ($successCount -eq $routes.Count) { 'Green' } else { 'Yellow' })
    
    if ($successCount -eq $routes.Count) {
        Write-Host "`n🎉 SUCCÈS! Le site fonctionne parfaitement." -ForegroundColor Green -BackgroundColor Black
        Write-Host "`n📝 PROCHAINE ÉTAPE:" -ForegroundColor Cyan
        Write-Host "   Désormais, chaque 'git push' sur main déclenchera automatiquement" -ForegroundColor Gray
        Write-Host "   un rebuild sur Render. Plus besoin de scripts!" -ForegroundColor Gray
    }
    
} else {
    Write-Host "`n⏱️ TIMEOUT - Le déploiement prend plus de 5 minutes" -ForegroundColor Yellow
    Write-Host "   Vérifiez sur: https://dashboard.render.com" -ForegroundColor Gray
}
