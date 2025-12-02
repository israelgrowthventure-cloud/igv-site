#!/usr/bin/env pwsh
# Script de test du nouveau service igv-site-v2
# Usage: .\test-igv-site-v2.ps1

param(
    [string]$ServiceUrl = "https://igv-site-v2.onrender.com",
    [string]$DomainUrl = "https://israelgrowthventure.com"
)

Write-Host "🔍 TEST DU NOUVEAU SERVICE IGV-SITE-V2`n" -ForegroundColor Cyan

# Test 1: Service Render direct
Write-Host "Test 1: Service Render ($ServiceUrl)" -ForegroundColor Yellow
try {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $response = Invoke-WebRequest -Uri "$ServiceUrl/?v=$timestamp" -UseBasicParsing -TimeoutSec 15
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ HTTP 200 OK" -ForegroundColor Green
        
        if ($response.Content -match 'main\.(\w+)\.js') {
            $hash = $matches[1]
            Write-Host "  ✅ Bundle détecté: main.$hash.js" -ForegroundColor Green
            
            if ($hash -ne '4130aa42') {
                Write-Host "  ✅ Nouveau bundle confirmé (≠ 4130aa42)" -ForegroundColor Green -BackgroundColor Black
                $script:serviceHash = $hash
            } else {
                Write-Host "  ❌ ANCIEN bundle détecté (main.4130aa42.js)" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "  ❌ Aucun bundle main.*.js trouvé" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "  ❌ Erreur: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Domaine custom (si configuré)
Write-Host "`nTest 2: Domaine custom ($DomainUrl)" -ForegroundColor Yellow
try {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $response = Invoke-WebRequest -Uri "$DomainUrl/?v=$timestamp" -UseBasicParsing -TimeoutSec 15
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ HTTP 200 OK" -ForegroundColor Green
        
        if ($response.Content -match 'main\.(\w+)\.js') {
            $hashDomain = $matches[1]
            Write-Host "  ✅ Bundle détecté: main.$hashDomain.js" -ForegroundColor Green
            
            if ($script:serviceHash -and $hashDomain -eq $script:serviceHash) {
                Write-Host "  ✅ Même bundle que le service Render" -ForegroundColor Green
            } elseif ($hashDomain -eq '4130aa42') {
                Write-Host "  ⚠️ Le domaine sert encore l'ancien bundle" -ForegroundColor Yellow
                Write-Host "     Attendez la propagation DNS ou purgez le cache Cloudflare" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "  ⚠️ Domaine pas encore configuré ou propagation DNS en cours" -ForegroundColor Yellow
}

# Test 3: Vérification des routes principales
Write-Host "`nTest 3: Routes principales" -ForegroundColor Yellow
$routes = @('/', '/about', '/packs', '/contact', '/editor')
$allOk = $true

foreach ($route in $routes) {
    try {
        $response = Invoke-WebRequest -Uri "$ServiceUrl$route" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $route → 200 OK" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $route → $($response.StatusCode)" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host "  ❌ $route → Erreur" -ForegroundColor Red
        $allOk = $false
    }
}

# Résumé
Write-Host "`n📋 RÉSUMÉ" -ForegroundColor Cyan
if ($script:serviceHash) {
    Write-Host "  Service URL: $ServiceUrl" -ForegroundColor White
    Write-Host "  Bundle actuel: main.$($script:serviceHash).js" -ForegroundColor Green
    Write-Host "  Status: ✅ OPÉRATIONNEL" -ForegroundColor Green
} else {
    Write-Host "  Status: ❌ PROBLÈME DÉTECTÉ" -ForegroundColor Red
    exit 1
}

if ($allOk) {
    Write-Host "  Routes: ✅ Toutes OK" -ForegroundColor Green
} else {
    Write-Host "  Routes: ⚠️ Certaines en erreur" -ForegroundColor Yellow
}

Write-Host ""
