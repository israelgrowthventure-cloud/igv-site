# Phase 1ter-bis - Déploiement robuste avec attente
# ===================================================
# 
# Ce script:
# 1. Commit et push les changements
# 2. Attend que backend et frontend soient déployés (max 10 min)
# 3. Exécute le script d'init admin + pages CMS
# 4. Teste tous les endpoints

Write-Host "=" -ForegroundColor Cyan
Write-Host "=== PHASE 1ter-bis: Déploiement robuste ===" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan

$workspaceRoot = "C:\Users\PC\Desktop\IGV\igv site\igv-website-complete"
cd $workspaceRoot

# ============================================================
# 1. Git Push (déjà fait normalement)
# ============================================================
Write-Host "`n📤 Vérification Git status..." -ForegroundColor Yellow
git status --short

# ============================================================
# 2. Attente Backend + Frontend
# ============================================================
Write-Host "`n⏳ Attente déploiement Render (max 10 minutes)..." -ForegroundColor Yellow

# Attente Backend
Write-Host "`n🔧 Attente backend..." -ForegroundColor Cyan
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
            Write-Host " ✅ Backend prêt!" -ForegroundColor Green
            $backendReady = $true
            break
        } else {
            Write-Host " ⏳ Backend pas prêt (status: $($content.status))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⏳ Backend non joignable" -ForegroundColor Yellow
    }
    
    if ($try -lt $maxTries) {
        Start-Sleep -Seconds 30
    }
} while ($try -lt $maxTries)

if (-not $backendReady) {
    Write-Host "`n❌ Backend non disponible après 10 minutes" -ForegroundColor Red
    Write-Host "   Vérifiez les logs Render: https://dashboard.render.com" -ForegroundColor Yellow
    exit 1
}

# Attente Frontend
Write-Host "`n🌐 Attente frontend..." -ForegroundColor Cyan
$frontendUrl = "https://israelgrowthventure.com/"
$try = 0
$frontendReady = $false

do {
    $try++
    Write-Host "   Tentative $try/$maxTries..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ Frontend prêt!" -ForegroundColor Green
            $frontendReady = $true
            break
        } else {
            Write-Host " ⏳ Frontend pas prêt (status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⏳ Frontend non joignable" -ForegroundColor Yellow
    }
    
    if ($try -lt $maxTries) {
        Start-Sleep -Seconds 30
    }
} while ($try -lt $maxTries)

if (-not $frontendReady) {
    Write-Host "`n❌ Frontend non disponible après 10 minutes" -ForegroundColor Red
    Write-Host "   Vérifiez les logs Render: https://dashboard.render.com" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Backend et Frontend déployés avec succès!" -ForegroundColor Green

# ============================================================
# 3. Initialisation Admin + Pages CMS
# ============================================================
Write-Host "`n🔧 Initialisation Admin + Pages CMS..." -ForegroundColor Yellow

# Demander MONGO_URL si pas définie
if (-not $env:MONGO_URL) {
    Write-Host "`n⚠️  Variable MONGO_URL non définie" -ForegroundColor Yellow
    Write-Host "   Veuillez entrer l'URL MongoDB de production:" -ForegroundColor Yellow
    Write-Host "   (Format: mongodb+srv://user:password@cluster.mongodb.net/database)" -ForegroundColor Gray
    $mongoUrl = Read-Host "   MONGO_URL"
    
    if ([string]::IsNullOrWhiteSpace($mongoUrl)) {
        Write-Host "`n❌ MONGO_URL requise pour continuer" -ForegroundColor Red
        exit 1
    }
    
    $env:MONGO_URL = $mongoUrl
}

# Exécuter le script d'init
cd "$workspaceRoot\backend"
Write-Host "`n📦 Exécution init_admin_prod_once.py..." -ForegroundColor Cyan

python init_admin_prod_once.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Erreur lors de l'initialisation" -ForegroundColor Red
    exit 1
}

# ============================================================
# 4. Tests endpoints
# ============================================================
Write-Host "`n🧪 Tests endpoints production..." -ForegroundColor Yellow

$allTestsPassed = $true

# Test 1: Health check
Write-Host "`n1️⃣  Test health check..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/health" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ 200 OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Page Étude 360
Write-Host "2️⃣  Test page etude-implantation-360..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-360" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ 200 OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Page Merci
Write-Host "3️⃣  Test page etude-implantation-merci..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-merci" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ 200 OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Login admin
Write-Host "4️⃣  Test login admin..." -NoNewline
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
        Write-Host " ✅ 200 OK (token reçu)" -ForegroundColor Green
        $global:adminToken = $response.access_token
    } else {
        Write-Host " ❌ Pas de token reçu" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 5: Frontend home
Write-Host "5️⃣  Test frontend home..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://israelgrowthventure.com/" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ 200 OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 6: Frontend admin
Write-Host "6️⃣  Test frontend /admin..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://israelgrowthventure.com/admin" -UseBasicParsing -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ 200 OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# ============================================================
# Résumé
# ============================================================
Write-Host "`n" -NoNewline
Write-Host "=" -ForegroundColor Cyan
if ($allTestsPassed) {
    Write-Host "=== ✅ TOUS LES TESTS SONT PASSÉS ===" -ForegroundColor Green
    Write-Host "=" -ForegroundColor Cyan
    Write-Host "`n📋 Credentials admin:" -ForegroundColor Yellow
    Write-Host "   Email: postmaster@israelgrowthventure.com" -ForegroundColor White
    Write-Host "   Mot de passe: Admin@igv2025#" -ForegroundColor White
    Write-Host "`n🌐 URLs:" -ForegroundColor Yellow
    Write-Host "   Admin: https://israelgrowthventure.com/admin" -ForegroundColor White
    Write-Host "   Étude 360: https://israelgrowthventure.com/etude-implantation-360" -ForegroundColor White
    exit 0
} else {
    Write-Host "=== ❌ CERTAINS TESTS ONT ÉCHOUÉ ===" -ForegroundColor Red
    Write-Host "=" -ForegroundColor Cyan
    Write-Host "`nVeuillez vérifier les logs ci-dessus et les logs Render" -ForegroundColor Yellow
    exit 1
}
