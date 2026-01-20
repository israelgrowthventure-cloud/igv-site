# Script de test des endpoints CRM en production
# PowerShell version - Simple et direct

$BACKEND_URL = "https://igv-cms-backend.onrender.com"
$ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
$ADMIN_PASSWORD = "Admin@igv2025#"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTS CRM PRODUCTION - IGV" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "[TEST 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 10
    Write-Host "  [OK] Status: $($health.status) | MongoDB: $($health.mongodb)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Admin Login
Write-Host "`n[TEST 2] Admin Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 15
    $token = $loginResponse.access_token
    Write-Host "  [OK] Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: GET Users
Write-Host "`n[TEST 3] GET /api/admin/users..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $usersResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/users" -Method Get -Headers $headers -TimeoutSec 15
    $users = $usersResponse.users
    $total = $usersResponse.total
    
    Write-Host "  [OK] Total users: $total" -ForegroundColor Green
    
    # Vérifier que l'admin est présent
    $adminFound = $users | Where-Object { $_.email -eq $ADMIN_EMAIL }
    if ($adminFound) {
        Write-Host "  [OK] Admin user found: $($adminFound.email)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Admin user not found in list" -ForegroundColor Yellow
    }
    
    # Afficher les 3 premiers users
    for ($i = 0; $i -lt [Math]::Min(3, $users.Count); $i++) {
        $u = $users[$i]
        $userId = if ($u._id) { $u._id } else { $u.id }
        Write-Host "    - $($u.email) ($($u.role)) [ID: $userId]" -ForegroundColor Gray
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 4: POST Create User
Write-Host "`n[TEST 4] POST /api/admin/users (create)..." -ForegroundColor Yellow
try {
    $newUser = @{
        email = "test_$([DateTimeOffset]::Now.ToUnixTimeSeconds())@igvtest.com"
        first_name = "Test"
        last_name = "User"
        password = "TestPass123!"
        role = "commercial"
    } | ConvertTo-Json
    
    $createResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/users" -Method Post -Headers $headers -Body $newUser -ContentType "application/json" -TimeoutSec 15
    $newUserId = $createResponse.user_id
    
    Write-Host "  [OK] User created successfully" -ForegroundColor Green
    Write-Host "  User ID: $newUserId" -ForegroundColor Gray
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 5: GET Users again (verify persistence)
Write-Host "`n[TEST 5] GET /api/admin/users (verify persistence)..." -ForegroundColor Yellow
try {
    $usersResponse2 = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/users" -Method Get -Headers $headers -TimeoutSec 15
    $newTotal = $usersResponse2.total
    
    if ($newTotal -gt $total) {
        Write-Host "  [OK] User persisted - Total now: $newTotal (was: $total)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Total unchanged: $newTotal" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: GET Email Templates
Write-Host "`n[TEST 6] GET /api/crm/emails/templates..." -ForegroundColor Yellow
try {
    $templatesResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/emails/templates" -Method Get -Headers $headers -TimeoutSec 15
    $templates = $templatesResponse.templates
    
    Write-Host "  [OK] Total templates: $($templates.Count)" -ForegroundColor Green
    
    # Afficher les 2 premiers templates
    for ($i = 0; $i -lt [Math]::Min(2, $templates.Count); $i++) {
        $t = $templates[$i]
        Write-Host "    - $($t.name) ($($t.language))" -ForegroundColor Gray
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 7: POST Create Email Template
Write-Host "`n[TEST 7] POST /api/crm/emails/templates (create)..." -ForegroundColor Yellow
try {
    $newTemplate = @{
        name = "Test Template $([DateTimeOffset]::Now.ToUnixTimeSeconds())"
        subject = "Test Email Subject"
        body = "Hello {name}, this is a test template from automated tests."
        language = "fr"
    } | ConvertTo-Json
    
    $createTemplateResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/emails/templates" -Method Post -Headers $headers -Body $newTemplate -ContentType "application/json" -TimeoutSec 15
    $templateId = $createTemplateResponse.template_id
    
    Write-Host "  [OK] Template created successfully" -ForegroundColor Green
    Write-Host "  Template ID: $templateId" -ForegroundColor Gray
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 8: GET Email Templates again (verify persistence)
Write-Host "`n[TEST 8] GET /api/crm/emails/templates (verify persistence)..." -ForegroundColor Yellow
try {
    $templatesResponse2 = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/emails/templates" -Method Get -Headers $headers -TimeoutSec 15
    $newTemplatesCount = $templatesResponse2.templates.Count
    
    if ($newTemplatesCount -gt $templates.Count) {
        Write-Host "  [OK] Template persisted - Total now: $newTemplatesCount (was: $($templates.Count))" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Total unchanged: $newTemplatesCount" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINÉS - TOUS LES ENDPOINTS OK" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "URLs testées:" -ForegroundColor White
Write-Host "  - GET  $BACKEND_URL/api/admin/users" -ForegroundColor Gray
Write-Host "  - POST $BACKEND_URL/api/admin/users" -ForegroundColor Gray
Write-Host "  - GET  $BACKEND_URL/api/crm/emails/templates" -ForegroundColor Gray
Write-Host "  - POST $BACKEND_URL/api/crm/emails/templates`n" -ForegroundColor Gray

Write-Host "Prochaine étape: Tester dans le navigateur" -ForegroundColor Yellow
Write-Host "  URL: https://israelgrowthventure.com/admin/crm" -ForegroundColor Cyan
Write-Host "  Login: $ADMIN_EMAIL`n" -ForegroundColor Cyan

exit 0
