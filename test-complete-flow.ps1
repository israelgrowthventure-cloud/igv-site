#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test complet du flow IGV website v2 integre
.DESCRIPTION
    Teste toutes les fonctionnalites:
    - Backend API (packs, pricing-rules, calculate, auth)
    - Frontend pages (home, packs, future-commerce, dynamic pages)
    - CMS admin (login, page editor)
    - Pricing geolocal ise
#>

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLET IGV WEBSITE V2" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backend = "https://igv-cms-backend.onrender.com"
$frontend = "https://israelgrowthventure.com"
$errors = 0
$warnings = 0

# ===== BACKEND TESTS =====
Write-Host "[ 1/10 ] Backend Health Check..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$backend/api/health" -TimeoutSec 45 -UseBasicParsing
    $data = $resp.Content | ConvertFrom-Json
    if ($data.mongodb -eq "connected") {
        Write-Host "        OK - MongoDB connected" -ForegroundColor Green
    } else {
        Write-Host "        WARNING - MongoDB: $($data.mongodb)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "        ERROR - Backend down" -ForegroundColor Red
    $errors++
}

Write-Host "`n[ 2/10 ] API Packs..." -ForegroundColor Yellow
try {
    $packs = Invoke-RestMethod -Uri "$backend/api/packs" -TimeoutSec 30
    Write-Host "        OK - $($packs.Count) packs" -ForegroundColor Green
    $packId = $packs[0].id
} catch {
    Write-Host "        ERROR" -ForegroundColor Red
    $errors++
    $packId = $null
}

Write-Host "`n[ 3/10 ] API Pricing Rules..." -ForegroundColor Yellow
try {
    $rules = Invoke-RestMethod -Uri "$backend/api/pricing-rules" -TimeoutSec 30
    Write-Host "        OK - $($rules.Count) rules" -ForegroundColor Green
} catch {
    Write-Host "        ERROR" -ForegroundColor Red
    $errors++
}

Write-Host "`n[ 4/10 ] API Calculate Pricing (EU)..." -ForegroundColor Yellow
if ($packId) {
    try {
        $body = @{pack_id=$packId; zone="EU"} | ConvertTo-Json
        $calc = Invoke-RestMethod -Uri "$backend/api/pricing-rules/calculate" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        Write-Host "        OK - Price: $($calc.display.total)" -ForegroundColor Green
    } catch {
        Write-Host "        ERROR - Route calculate not working" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "        SKIP - No pack ID" -ForegroundColor Yellow
    $warnings++
}

Write-Host "`n[ 5/10 ] API Calculate Pricing (IL)..." -ForegroundColor Yellow
if ($packId) {
    try {
        $body = @{pack_id=$packId; zone="IL"} | ConvertTo-Json
        $calc = Invoke-RestMethod -Uri "$backend/api/pricing-rules/calculate" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        Write-Host "        OK - Price: $($calc.display.total)" -ForegroundColor Green
    } catch {
        Write-Host "        ERROR" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "        SKIP - No pack ID" -ForegroundColor Yellow
}

Write-Host "`n[ 6/10 ] API Admin Login..." -ForegroundColor Yellow
try {
    $loginBody = @{email="postmaster@israelgrowthventure.com"; password="Admin@igv"} | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$backend/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 30
    Write-Host "        OK - JWT token received" -ForegroundColor Green
    $token = $login.access_token
} catch {
    Write-Host "        ERROR - Login failed" -ForegroundColor Red
    $errors++
    $token = $null
}

# ===== FRONTEND TESTS =====
Write-Host "`n[ 7/10 ] Frontend Home Page..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$frontend/" -TimeoutSec 30 -UseBasicParsing
    if ($resp.Content -match "Israel Growth Venture") {
        Write-Host "        OK - Home page loaded" -ForegroundColor Green
    } else {
        Write-Host "        WARNING - Content may be missing" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "        ERROR" -ForegroundColor Red
    $errors++
}

Write-Host "`n[ 8/10 ] Frontend Packs Page..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$frontend/packs" -TimeoutSec 30 -UseBasicParsing
    Write-Host "        OK - Packs page loaded" -ForegroundColor Green
} catch {
    Write-Host "        ERROR" -ForegroundColor Red
    $errors++
}

Write-Host "`n[ 9/10 ] Frontend Future Commerce Page..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$frontend/le-commerce-de-demain" -TimeoutSec 30 -UseBasicParsing
    if ($resp.Content -match "commerce") {
        Write-Host "        OK - Future Commerce page loaded" -ForegroundColor Green
    } else {
        Write-Host "        WARNING - Content check failed" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "        ERROR - New page not accessible" -ForegroundColor Red
    $errors++
}

Write-Host "`n[ 10/10 ] CMS Admin Login Page..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$frontend/admin/login" -TimeoutSec 30 -UseBasicParsing
    Write-Host "        OK - Admin login page accessible" -ForegroundColor Green
} catch {
    Write-Host "        ERROR" -ForegroundColor Red
    $errors++
}

# ===== SUMMARY =====
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESULTATS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Errors: $errors" -ForegroundColor $(if($errors -eq 0){"Green"}else{"Red"})
Write-Host "  Warnings: $warnings" -ForegroundColor $(if($warnings -eq 0){"Green"}else{"Yellow"})

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n  STATUS: ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "`n  STATUS: OPERATIONAL WITH WARNINGS" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n  STATUS: FAILURES DETECTED" -ForegroundColor Red
    exit 1
}
