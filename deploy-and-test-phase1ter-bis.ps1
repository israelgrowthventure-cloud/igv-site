# Phase 1ter-bis - Deploiement robuste avec attente
# Script de deploiement et test automatique

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PHASE 1ter-bis: Deploiement robuste" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$workspaceRoot = "C:\Users\PC\Desktop\IGV\igv site\igv-website-complete"
cd $workspaceRoot

# Verification Git status
Write-Host "`nVerification Git status..." -ForegroundColor Yellow
git status --short

# Attente Backend + Frontend
Write-Host "`nAttente deploiement Render (max 10 minutes)..." -ForegroundColor Yellow

# Attente Backend
Write-Host "`nAttente backend..." -ForegroundColor Cyan
$backendUrl = "https://igv-cms-backend.onrender.com/api/health"
$maxTries = 20
$try = 0
$backendReady = $false

do {
    $try++
    Write-Host "   Tentative $try/$maxTries..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        $content = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200 -and $content.status -eq "ok") {
            Write-Host " Backend pret!" -ForegroundColor Green
            $backendReady = $true
            break
        } else {
            Write-Host " Backend pas pret" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " Backend non joignable" -ForegroundColor Yellow
    }
    
    if ($try -lt $maxTries) {
        Start-Sleep -Seconds 30
    }
} while ($try -lt $maxTries)

if (-not $backendReady) {
    Write-Host "`nBackend non disponible apres 10 minutes" -ForegroundColor Red
    Write-Host "Verifiez les logs Render" -ForegroundColor Yellow
    exit 1
}

# Attente Frontend
Write-Host "`nAttente frontend..." -ForegroundColor Cyan
$frontendUrl = "https://israelgrowthventure.com/"
$try = 0
$frontendReady = $false

do {
    $try++
    Write-Host "   Tentative $try/$maxTries..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host " Frontend pret!" -ForegroundColor Green
            $frontendReady = $true
            break
        } else {
            Write-Host " Frontend pas pret" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " Frontend non joignable" -ForegroundColor Yellow
    }
    
    if ($try -lt $maxTries) {
        Start-Sleep -Seconds 30
    }
} while ($try -lt $maxTries)

if (-not $frontendReady) {
    Write-Host "`nFrontend non disponible apres 10 minutes" -ForegroundColor Red
    Write-Host "Verifiez les logs Render" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nBackend et Frontend deployes avec succes!" -ForegroundColor Green

# Initialisation Admin + Pages CMS
Write-Host "`nInitialisation Admin + Pages CMS..." -ForegroundColor Yellow

# Demander MONGO_URL si pas definie
if (-not $env:MONGO_URL) {
    Write-Host "`nVariable MONGO_URL non definie" -ForegroundColor Yellow
    Write-Host "Veuillez entrer l'URL MongoDB de production:" -ForegroundColor Yellow
    Write-Host "(Format: mongodb+srv://user:password@cluster.mongodb.net/database)" -ForegroundColor Gray
    $mongoUrl = Read-Host "MONGO_URL"
    
    if ([string]::IsNullOrWhiteSpace($mongoUrl)) {
        Write-Host "`nMONGO_URL requise pour continuer" -ForegroundColor Red
        exit 1
    }
    
    $env:MONGO_URL = $mongoUrl
}

# Executer le script d'init
cd "$workspaceRoot\backend"
Write-Host "`nExecution init_admin_prod_once.py..." -ForegroundColor Cyan

python init_admin_prod_once.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nErreur lors de l'initialisation" -ForegroundColor Red
    exit 1
}

# Tests endpoints
Write-Host "`nTests endpoints production..." -ForegroundColor Yellow

$allTestsPassed = $true

# Test 1: Health check
Write-Host "`n1. Test health check..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/health" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " 200 OK" -ForegroundColor Green
    } else {
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Page Etude 360
Write-Host "2. Test page etude-implantation-360..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-360" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " 200 OK" -ForegroundColor Green
    } else {
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Page Merci
Write-Host "3. Test page etude-implantation-merci..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-merci" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " 200 OK" -ForegroundColor Green
    } else {
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Login admin
Write-Host "4. Test login admin..." -NoNewline
try {
    $loginData = @{
        email = "postmaster@israelgrowthventure.com"
        password = "Admin@igv2025#"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    if ($response.access_token) {
        Write-Host " 200 OK (token recu)" -ForegroundColor Green
        $global:adminToken = $response.access_token
    } else {
        Write-Host " Pas de token recu" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 5: Frontend home
Write-Host "5. Test frontend home..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://israelgrowthventure.com/" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " 200 OK" -ForegroundColor Green
    } else {
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 6: Frontend admin
Write-Host "6. Test frontend /admin..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://israelgrowthventure.com/admin" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " 200 OK" -ForegroundColor Green
    } else {
        Write-Host " Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Resume
Write-Host "`n============================================" -ForegroundColor Cyan
if ($allTestsPassed) {
    Write-Host "TOUS LES TESTS SONT PASSES" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "`nCredentials admin:" -ForegroundColor Yellow
    Write-Host "   Email: postmaster@israelgrowthventure.com" -ForegroundColor White
    Write-Host "   Mot de passe: Admin@igv2025#" -ForegroundColor White
    Write-Host "`nURLs:" -ForegroundColor Yellow
    Write-Host "   Admin: https://israelgrowthventure.com/admin" -ForegroundColor White
    Write-Host "   Etude 360: https://israelgrowthventure.com/etude-implantation-360" -ForegroundColor White
    exit 0
} else {
    Write-Host "CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "`nVeuillez verifier les logs ci-dessus" -ForegroundColor Yellow
    exit 1
}
