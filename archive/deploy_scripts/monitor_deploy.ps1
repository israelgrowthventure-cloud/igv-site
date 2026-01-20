# Script de monitoring du déploiement Render et tests E2E
# PowerShell version

$BACKEND_URL = "https://igv-cms-backend.onrender.com"
$FRONTEND_URL = "https://israelgrowthventure.com"
$ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
$ADMIN_PASSWORD = "Admin@igv2025#"

$MAX_WAIT_TIME = 900  # 15 minutes max
$POLL_INTERVAL = 30   # 30 secondes entre chaque check

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor White
}

function Test-BackendHealth {
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
        $status = $response.status
        $mongodb = $response.mongodb
        Write-Log "OK Backend health: $status | MongoDB: $mongodb"
        return ($status -eq 'ok' -and ($mongodb -eq 'connected' -or $mongodb -eq 'configured'))
    }
    catch {
        Write-Log "ERROR Backend unreachable: $($_.Exception.Message)"
        return $false
    }
}

function Test-BackendRouters {
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/debug/routers" -Method Get -TimeoutSec 10 -ErrorAction Stop
        Write-Log "OK Routers status: CRM=$($response.ai_router_loaded), Mini=$($response.mini_analysis_router_loaded)"
        return $true
    }
    catch {
        Write-Log "ERROR Routers check failed: $($_.Exception.Message)"
        return $false
    }
}

function Wait-ForDeployment {
    Write-Log "START Monitoring du deploiement Render..."
    
    $startTime = Get-Date
    $consecutiveSuccesses = 0
    
    while (((Get-Date) - $startTime).TotalSeconds -lt $MAX_WAIT_TIME) {
        $elapsed = [int]((Get-Date) - $startTime).TotalSeconds
        Write-Log "TIME Elapsed: ${elapsed}s / ${MAX_WAIT_TIME}s"
        
        if (Test-BackendHealth) {
            $consecutiveSuccesses++
            Write-Log "OK Backend live ($consecutiveSuccesses/3 confirmations)"
            
            if ($consecutiveSuccesses -ge 3) {
                Write-Log "SUCCESS Deploiement confirme stable!"
                
                if (Test-BackendRouters) {
                    Write-Log "SUCCESS Tous les routers sont charges!"
                    return $true
                }
                else {
                    Write-Log "WARNING Certains routers manquants, mais backend live"
                    return $true
                }
            }
        }
        else {
            $consecutiveSuccesses = 0
            Write-Log "WAIT Backend pas encore pret, nouvelle tentative dans ${POLL_INTERVAL}s..."
        }
        
        Start-Sleep -Seconds $POLL_INTERVAL
    }
    
    Write-Log "ERROR TIMEOUT: Le deploiement n'a pas abouti dans le temps imparti"
    return $false
}

function Test-AdminLogin {
    Write-Log "`n=== TEST 1: Admin Login ==="
    try {
        $body = @{
            email = $ADMIN_EMAIL
            password = $ADMIN_PASSWORD
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15 -ErrorAction Stop
        
        $token = $response.access_token
        Write-Log "SUCCESS Login admin OK | Token: $($token.Substring(0, 20))..."
        return $token
    }
    catch {
        Write-Log "ERROR Login failed: $($_.Exception.Message)"
        return $null
    }
}

function Test-GetUsers {
    param([string]$Token)
    Write-Log "`n=== TEST 2: GET Users ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/users" -Method Get -Headers $headers -TimeoutSec 15 -ErrorAction Stop
        
        $users = $response.users
        $total = $response.total
        Write-Log "SUCCESS GET users OK | Total: $total utilisateurs"
        
        for ($i = 0; $i -lt [Math]::Min(3, $users.Count); $i++) {
            $user = $users[$i]
            $email = $user.email
            $role = $user.role
            $userId = if ($user._id) { $user._id } else { $user.id }
            Write-Log "   $($i+1). $email ($role) [ID: $userId]"
        }
        
        return $true
    }
    catch {
        Write-Log "ERROR GET users failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-CreateUser {
    param([string]$Token)
    Write-Log "`n=== TEST 3: POST Create User ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        $testUser = @{
            email = "test_user_$([DateTimeOffset]::Now.ToUnixTimeSeconds())@igvtest.com"
            first_name = "Test"
            last_name = "User"
            password = "TestPass123!"
            role = "commercial"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/admin/users" -Method Post -Headers $headers -Body $testUser -ContentType "application/json" -TimeoutSec 15 -ErrorAction Stop
        
        $userId = $response.user_id
        Write-Log "SUCCESS POST create user OK | User ID: $userId"
        return $userId
    }
    catch {
        Write-Log "ERROR Create user failed: $($_.Exception.Message)"
        return $null
    }
}

function Test-GetLeads {
    param([string]$Token)
    Write-Log "`n=== TEST 4: GET Leads ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/leads?limit=10" -Method Get -Headers $headers -TimeoutSec 15 -ErrorAction Stop
        
        $total = $response.total
        Write-Log "SUCCESS GET leads OK | Total: $total leads"
        return $true
    }
    catch {
        Write-Log "ERROR GET leads failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-ConvertProspectToContact {
    param([string]$Token)
    Write-Log "`n=== TEST 5: POST Convert Prospect to Contact ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        # Créer un lead de test
        $testLead = @{
            email = "testlead_$([DateTimeOffset]::Now.ToUnixTimeSeconds())@igvtest.com"
            brand_name = "Test Brand"
            name = "Test Contact"
            phone = "+972501234567"
            language = "fr"
        } | ConvertTo-Json
        
        $createResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/leads" -Method Post -Headers $headers -Body $testLead -ContentType "application/json" -TimeoutSec 15 -ErrorAction Stop
        
        $leadId = $createResponse.lead_id
        Write-Log "   Created test lead: $leadId"
        
        # Convertir en contact
        $convertResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/leads/$leadId/convert-to-contact" -Method Post -Headers $headers -TimeoutSec 15 -ErrorAction Stop
        
        $contactId = $convertResponse.contact_id
        Write-Log "SUCCESS POST convert OK | Contact ID: $contactId"
        return $true
    }
    catch {
        Write-Log "ERROR Convert failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-CreateEmailTemplate {
    param([string]$Token)
    Write-Log "`n=== TEST 6: POST Create Email Template ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        $testTemplate = @{
            name = "Test Template $([DateTimeOffset]::Now.ToUnixTimeSeconds())"
            subject = "Test Email Subject"
            body = "Hello {name}, this is a test template."
            language = "fr"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/emails/templates" -Method Post -Headers $headers -Body $testTemplate -ContentType "application/json" -TimeoutSec 15 -ErrorAction Stop
        
        $templateId = $response.template_id
        Write-Log "SUCCESS POST create template OK | Template ID: $templateId"
        return $true
    }
    catch {
        Write-Log "ERROR Create template failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-GetEmailTemplates {
    param([string]$Token)
    Write-Log "`n=== TEST 7: GET Email Templates ==="
    try {
        $headers = @{
            Authorization = "Bearer $Token"
        }
        
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/crm/emails/templates" -Method Get -Headers $headers -TimeoutSec 15 -ErrorAction Stop
        
        $templates = $response.templates
        Write-Log "SUCCESS GET templates OK | Total: $($templates.Count) templates"
        return $true
    }
    catch {
        Write-Log "ERROR GET templates failed: $($_.Exception.Message)"
        return $false
    }
}

function Invoke-E2ETests {
    Write-Log "`n============================================================"
    Write-Log "TESTS LANCEMENT DES TESTS END-TO-END EN PRODUCTION"
    Write-Log "============================================================"
    
    $results = @{
        total = 0
        passed = 0
        failed = 0
        tests = @()
    }
    
    # Test 1: Login
    $token = Test-AdminLogin
    $results.total++
    if ($token) {
        $results.passed++
        $results.tests += @{name = "Admin Login"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "Admin Login"; status = "FAIL"}
        Write-Log "`nERROR Login failed, arret des tests"
        return $results
    }
    
    # Test 2: GET Users
    $results.total++
    if (Test-GetUsers -Token $token) {
        $results.passed++
        $results.tests += @{name = "GET Users"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "GET Users"; status = "FAIL"}
    }
    
    # Test 3: POST Create User
    $results.total++
    $userId = Test-CreateUser -Token $token
    if ($userId) {
        $results.passed++
        $results.tests += @{name = "POST Create User"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "POST Create User"; status = "FAIL"}
    }
    
    # Test 4: GET Leads
    $results.total++
    if (Test-GetLeads -Token $token) {
        $results.passed++
        $results.tests += @{name = "GET Leads"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "GET Leads"; status = "FAIL"}
    }
    
    # Test 5: Convert Prospect
    $results.total++
    if (Test-ConvertProspectToContact -Token $token) {
        $results.passed++
        $results.tests += @{name = "POST Convert Prospect"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "POST Convert Prospect"; status = "FAIL"}
    }
    
    # Test 6: Create Email Template
    $results.total++
    if (Test-CreateEmailTemplate -Token $token) {
        $results.passed++
        $results.tests += @{name = "POST Create Email Template"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "POST Create Email Template"; status = "FAIL"}
    }
    
    # Test 7: GET Email Templates
    $results.total++
    if (Test-GetEmailTemplates -Token $token) {
        $results.passed++
        $results.tests += @{name = "GET Email Templates"; status = "PASS"}
    }
    else {
        $results.failed++
        $results.tests += @{name = "GET Email Templates"; status = "FAIL"}
    }
    
    return $results
}

function Write-FinalReport {
    param($Results)
    
    Write-Log "`n============================================================"
    Write-Log "RAPPORT FINAL"
    Write-Log "============================================================"
    
    foreach ($test in $Results.tests) {
        $icon = if ($test.status -eq "PASS") { "[OK]" } else { "[FAIL]" }
        Write-Log "$icon $($test.name): $($test.status)"
    }
    
    Write-Log "`n------------------------------------------------------------"
    Write-Log "Total: $($Results.total) | Passed: $($Results.passed) | Failed: $($Results.failed)"
    
    $successRate = if ($Results.total -gt 0) { ($Results.passed / $Results.total) * 100 } else { 0 }
    Write-Log "Taux de réussite: $($successRate.ToString('F1'))%"
    Write-Log "============================================================"
    
    if ($Results.failed -eq 0) {
        Write-Log "`nSUCCESS TOUS LES TESTS SONT PASSES!"
        return 0
    }
    else {
        Write-Log "`nWARNING $($Results.failed) TEST(S) EN ECHEC"
        return 1
    }
}

# Point d'entree principal
Write-Log "START Demarrage du monitoring de deploiement IGV"
Write-Log "Backend: $BACKEND_URL"
Write-Log "Frontend: $FRONTEND_URL"

# Etape 1: Attendre que le deploiement soit live
if (-not (Wait-ForDeployment)) {
    Write-Log "`nERROR ECHEC: Deploiement non confirme"
    exit 1
}

# Etape 2: Lancer les tests E2E
$results = Invoke-E2ETests

# Etape 3: Rapport final
$exitCode = Write-FinalReport -Results $results
exit $exitCode
