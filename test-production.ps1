# Script de test de la production israelgrowthventure.com
# Exécuter après correction Render

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  TEST DE PRODUCTION - israelgrowthventure.com" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

$baseUrl = "https://israelgrowthventure.com"
$allPassed = $true

# 1. Test de la page d'accueil
Write-Host "[1/5] Test de la page d'accueil..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/" -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Host "  PASS - Status: $($resp.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Status: $($resp.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# 2. Récupérer les noms de fichiers
Write-Host "`n[2/5] Récupération des noms de fichiers..." -ForegroundColor Yellow
try {
    $html = Invoke-WebRequest -Uri "$baseUrl/" -TimeoutSec 15 -UseBasicParsing
    $jsFiles = [regex]::Matches($html.Content, 'static/js/([^"]+\.js)') | ForEach-Object { $_.Value }
    $cssFiles = [regex]::Matches($html.Content, 'static/css/([^"]+\.css)') | ForEach-Object { $_.Value }
    
    if ($jsFiles.Count -gt 0) {
        $jsFile = $jsFiles[0]
        Write-Host "  Fichier JS: $jsFile" -ForegroundColor Gray
    } else {
        Write-Host "  WARN - Aucun fichier JS trouvé" -ForegroundColor Yellow
        $jsFile = "static/js/main.js"
    }
    
    if ($cssFiles.Count -gt 0) {
        $cssFile = $cssFiles[0]
        Write-Host "  Fichier CSS: $cssFile" -ForegroundColor Gray
    } else {
        Write-Host "  WARN - Aucun fichier CSS trouvé" -ForegroundColor Yellow
        $cssFile = "static/css/main.css"
    }
} catch {
    Write-Host "  WARN - Erreur récupération HTML" -ForegroundColor Yellow
    $jsFile = "static/js/main.js"
    $cssFile = "static/css/main.css"
}

# 3. Test du fichier JavaScript
Write-Host "`n[3/5] Test du fichier JavaScript..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/$jsFile" -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $contentType = $resp.Headers['Content-Type']
    if ($resp.StatusCode -eq 200 -and ($contentType -like "*javascript*")) {
        Write-Host "  PASS - Status: 200, Content-Type: $contentType" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Status: $($resp.StatusCode), Content-Type: $contentType" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  FAIL - Status: $statusCode" -ForegroundColor Red
    $allPassed = $false
}

# 4. Test du fichier CSS
Write-Host "`n[4/5] Test du fichier CSS..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/$cssFile" -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    $contentType = $resp.Headers['Content-Type']
    if ($resp.StatusCode -eq 200 -and ($contentType -like "*css*")) {
        Write-Host "  PASS - Status: 200, Content-Type: $contentType" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Status: $($resp.StatusCode), Content-Type: $contentType" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  FAIL - Status: $statusCode" -ForegroundColor Red
    $allPassed = $false
}

# 5. Test du backend
Write-Host "`n[5/5] Test du backend CMS..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/health" -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        Write-Host "  PASS - Backend OK" -ForegroundColor Green
    } else {
        Write-Host "  FAIL - Status: $($resp.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL - Backend inaccessible" -ForegroundColor Red
    $allPassed = $false
}

# Résumé
Write-Host "`n================================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  TOUS LES TESTS SONT PASSES" -ForegroundColor Green
    Write-Host "  Le site fonctionne correctement!" -ForegroundColor Green
} else {
    Write-Host "  CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host "`n  Actions recommandees:" -ForegroundColor Yellow
    Write-Host "  1. Verifier que israelgrowthventure.com pointe vers igv-site" -ForegroundColor Gray
    Write-Host "  2. Consulter RENDER_FIX_404.md pour le guide complet" -ForegroundColor Gray
    Write-Host "  3. Redeployer avec 'Clear build cache & deploy'" -ForegroundColor Gray
}
Write-Host "================================================================`n" -ForegroundColor Cyan
