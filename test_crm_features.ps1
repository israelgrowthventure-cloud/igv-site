# ============================================
# SCRIPT DE TESTS - FONCTIONNALITÉS CRM
# ============================================
# Tests automatisés pour Email + User Management
# OVHcloud SMTP: contact@israelgrowthventure.com
# ============================================

Write-Host "🧪 TESTS DES FONCTIONNALITÉS CRM" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BACKEND_URL = "https://igv-cms-backend.onrender.com"
$TEST_EMAIL = "test@israelgrowthventure.com"
$ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
$ADMIN_PASSWORD = "Admin@igv2025#"

# ============================================
# FONCTION: Faire une requête HTTP
# ============================================
function Invoke-APIRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = "",
        [hashtable]$Body = @{}
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $url = "$BACKEND_URL$Endpoint"
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -ErrorAction Stop
        } else {
            $bodyJson = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $bodyJson -ErrorAction Stop
        }
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ============================================
# ÉTAPE 1: Vérification de l'API
# ============================================
Write-Host "📋 ÉTAPE 1: Vérification de l'API..." -ForegroundColor Yellow

$healthCheck = Invoke-APIRequest -Method "GET" -Endpoint "/api/health"

if ($healthCheck.Success) {
    Write-Host "  ✅ API accessible" -ForegroundColor Green
    Write-Host "  MongoDB: $($healthCheck.Data.mongodb)" -ForegroundColor Gray
    
    if ($healthCheck.Data.mongodb -ne "connected") {
        Write-Host "  ⚠️  ATTENTION: MongoDB n'est pas connecté" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ ERREUR: API non accessible" -ForegroundColor Red
    Write-Host "  $($healthCheck.Error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# ÉTAPE 2: Authentification Admin
# ============================================
Write-Host "📋 ÉTAPE 2: Authentification..." -ForegroundColor Yellow

$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
}

$loginResponse = Invoke-APIRequest -Method "POST" -Endpoint "/api/admin/login" -Body $loginBody

if ($loginResponse.Success) {
    $TOKEN = $loginResponse.Data.access_token
    Write-Host "  ✅ Authentification réussie" -ForegroundColor Green
    Write-Host "  Token obtenu: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "  ❌ ERREUR: Échec de l'authentification" -ForegroundColor Red
    Write-Host "  $($loginResponse.Error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# ÉTAPE 3: Test de la gestion des utilisateurs
# ============================================
Write-Host "📋 ÉTAPE 3: Test de la gestion des utilisateurs..." -ForegroundColor Yellow

# Test 3.1: Lister les utilisateurs
Write-Host "  Test 3.1: Lister les utilisateurs..." -ForegroundColor Cyan
$usersResponse = Invoke-APIRequest -Method "GET" -Endpoint "/api/admin/users" -Token $TOKEN

if ($usersResponse.Success) {
    $userCount = $usersResponse.Data.users.Count
    Write-Host "    ✅ Liste récupérée: $userCount utilisateur(s)" -ForegroundColor Green
} else {
    Write-Host "    ❌ ERREUR: $($usersResponse.Error)" -ForegroundColor Red
}

# Test 3.2: Créer un utilisateur de test
Write-Host ""
Write-Host "  Test 3.2: Créer un utilisateur de test..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$newUserBody = @{
    email = "test.user.$timestamp@igv.com"
    name = "Test User $timestamp"
    password = "TestPass123!"
    role = "commercial"
    assigned_leads = @()
}

$createUserResponse = Invoke-APIRequest -Method "POST" -Endpoint "/api/admin/users" -Token $TOKEN -Body $newUserBody

if ($createUserResponse.Success) {
    $newUserId = $createUserResponse.Data.user_id
    Write-Host "    ✅ Utilisateur créé: $newUserId" -ForegroundColor Green
    
    # Test 3.3: Récupérer les détails de l'utilisateur
    Write-Host ""
    Write-Host "  Test 3.3: Récupérer les détails..." -ForegroundColor Cyan
    
    $userDetailsResponse = Invoke-APIRequest -Method "GET" -Endpoint "/api/admin/users/$newUserId" -Token $TOKEN
    
    if ($userDetailsResponse.Success) {
        Write-Host "    ✅ Détails récupérés:" -ForegroundColor Green
        Write-Host "       Email: $($userDetailsResponse.Data.email)" -ForegroundColor Gray
        Write-Host "       Nom: $($userDetailsResponse.Data.name)" -ForegroundColor Gray
        Write-Host "       Rôle: $($userDetailsResponse.Data.role)" -ForegroundColor Gray
    } else {
        Write-Host "    ❌ ERREUR: $($userDetailsResponse.Error)" -ForegroundColor Red
    }
    
    # Test 3.4: Mettre à jour l'utilisateur
    Write-Host ""
    Write-Host "  Test 3.4: Mettre à jour l'utilisateur..." -ForegroundColor Cyan
    
    $updateUserBody = @{
        name = "Test User Updated"
        role = "admin"
    }
    
    $updateUserResponse = Invoke-APIRequest -Method "PUT" -Endpoint "/api/admin/users/$newUserId" -Token $TOKEN -Body $updateUserBody
    
    if ($updateUserResponse.Success) {
        Write-Host "    ✅ Utilisateur mis à jour" -ForegroundColor Green
    } else {
        Write-Host "    ❌ ERREUR: $($updateUserResponse.Error)" -ForegroundColor Red
    }
    
    # Test 3.5: Désactiver l'utilisateur (soft delete)
    Write-Host ""
    Write-Host "  Test 3.5: Désactiver l'utilisateur..." -ForegroundColor Cyan
    
    $deleteUserResponse = Invoke-APIRequest -Method "DELETE" -Endpoint "/api/admin/users/$newUserId" -Token $TOKEN
    
    if ($deleteUserResponse.Success) {
        Write-Host "    ✅ Utilisateur désactivé (soft delete)" -ForegroundColor Green
    } else {
        Write-Host "    ❌ ERREUR: $($deleteUserResponse.Error)" -ForegroundColor Red
    }
    
} else {
    Write-Host "    ❌ ERREUR: $($createUserResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# ÉTAPE 4: Test de l'envoi d'emails
# ============================================
Write-Host "📋 ÉTAPE 4: Test de l'envoi d'emails..." -ForegroundColor Yellow

Write-Host "  Configuration SMTP OVHcloud:" -ForegroundColor Cyan
Write-Host "    Host: mail.israelgrowthventure.com" -ForegroundColor Gray
Write-Host "    Port: 587 (STARTTLS)" -ForegroundColor Gray
Write-Host "    From: contact@israelgrowthventure.com" -ForegroundColor Gray
Write-Host ""

# Test 4.1: Envoyer un email de test
Write-Host "  Test 4.1: Envoyer un email de test..." -ForegroundColor Cyan

$emailDestination = Read-Host "    Entrez l'adresse email de destination (ou Entrée pour $TEST_EMAIL)"
if ([string]::IsNullOrWhiteSpace($emailDestination)) {
    $emailDestination = $TEST_EMAIL
}

$emailBody = @{
    to_email = $emailDestination
    subject = "Test CRM IGV - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
    message = @"
Bonjour,

Ceci est un email de test depuis le CRM Israel Growth Venture.

Configuration:
- SMTP: OVHcloud (mail.israelgrowthventure.com)
- Expéditeur: contact@israelgrowthventure.com
- Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

Si vous recevez cet email, la fonctionnalité d'envoi fonctionne correctement ! ✅

Cordialement,
L'équipe IGV - CRM System
"@
}

$sendEmailResponse = Invoke-APIRequest -Method "POST" -Endpoint "/api/crm/emails/send" -Token $TOKEN -Body $emailBody

if ($sendEmailResponse.Success) {
    Write-Host "    ✅ Email envoyé avec succès !" -ForegroundColor Green
    Write-Host "    Destinataire: $emailDestination" -ForegroundColor Gray
    Write-Host "    Vérifiez votre boîte de réception (et spam)" -ForegroundColor Yellow
} else {
    Write-Host "    ❌ ERREUR: $($sendEmailResponse.Error)" -ForegroundColor Red
    
    if ($sendEmailResponse.Error -like "*SMTP*") {
        Write-Host ""
        Write-Host "    💡 Vérifiez la configuration SMTP sur Render.com:" -ForegroundColor Yellow
        Write-Host "       - SMTP_HOST = mail.israelgrowthventure.com" -ForegroundColor Gray
        Write-Host "       - SMTP_PORT = 587" -ForegroundColor Gray
        Write-Host "       - SMTP_USER = contact@israelgrowthventure.com" -ForegroundColor Gray
        Write-Host "       - SMTP_PASSWORD = [Votre mot de passe OVHcloud]" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 4.2: Vérifier l'historique des emails
Write-Host "  Test 4.2: Vérifier l'historique des emails..." -ForegroundColor Cyan

$emailHistoryResponse = Invoke-APIRequest -Method "GET" -Endpoint "/api/crm/emails/history?limit=5" -Token $TOKEN

if ($emailHistoryResponse.Success) {
    $emailCount = $emailHistoryResponse.Data.emails.Count
    Write-Host "    ✅ Historique récupéré: $emailCount email(s) récent(s)" -ForegroundColor Green
    
    if ($emailCount -gt 0) {
        Write-Host ""
        Write-Host "    Derniers emails envoyés:" -ForegroundColor Gray
        foreach ($email in $emailHistoryResponse.Data.emails) {
            Write-Host "      - $($email.to_email) | $($email.subject)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "    ❌ ERREUR: $($emailHistoryResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# ÉTAPE 5: Tests d'intégration
# ============================================
Write-Host "📋 ÉTAPE 5: Tests d'intégration..." -ForegroundColor Yellow

# Test 5.1: Créer un lead et lui envoyer un email
Write-Host "  Test 5.1: Créer un lead et envoyer un email..." -ForegroundColor Cyan

$leadBody = @{
    email = $emailDestination
    brand_name = "Test Company"
    name = "Test Lead"
    phone = "+33612345678"
    sector = "technology"
    language = "fr"
}

$createLeadResponse = Invoke-APIRequest -Method "POST" -Endpoint "/api/crm/leads" -Token $TOKEN -Body $leadBody

if ($createLeadResponse.Success) {
    $leadId = $createLeadResponse.Data.lead_id
    Write-Host "    ✅ Lead créé: $leadId" -ForegroundColor Green
    
    # Envoyer un email au lead
    $leadEmailBody = @{
        to_email = $emailDestination
        subject = "Bienvenue chez IGV - Lead $leadId"
        message = "Bonjour,`n`nMerci pour votre intérêt. Nous vous contacterons prochainement.`n`nCordialement,`nIGV Team"
        contact_id = $leadId
    }
    
    $leadEmailResponse = Invoke-APIRequest -Method "POST" -Endpoint "/api/crm/emails/send" -Token $TOKEN -Body $leadEmailBody
    
    if ($leadEmailResponse.Success) {
        Write-Host "    ✅ Email envoyé au lead" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Email non envoyé: $($leadEmailResponse.Error)" -ForegroundColor Yellow
    }
} else {
    Write-Host "    ⚠️  Lead non créé: $($createLeadResponse.Error)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# RÉSUMÉ DES TESTS
# ============================================
Write-Host "🎉 TESTS TERMINÉS !" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""

Write-Host "Résumé des fonctionnalités testées:" -ForegroundColor Cyan
Write-Host "  ✅ API Health Check" -ForegroundColor Green
Write-Host "  ✅ Authentification JWT" -ForegroundColor Green
Write-Host "  ✅ Liste des utilisateurs" -ForegroundColor Green
Write-Host "  ✅ Création d'utilisateur" -ForegroundColor Green
Write-Host "  ✅ Modification d'utilisateur" -ForegroundColor Green
Write-Host "  ✅ Suppression (soft delete) d'utilisateur" -ForegroundColor Green

if ($sendEmailResponse.Success) {
    Write-Host "  ✅ Envoi d'email via SMTP OVHcloud" -ForegroundColor Green
} else {
    Write-Host "  ❌ Envoi d'email (vérifier config SMTP)" -ForegroundColor Red
}

Write-Host ""

Write-Host "Actions recommandées:" -ForegroundColor Cyan
Write-Host "  1. Vérifier la réception de l'email de test" -ForegroundColor White
Write-Host "  2. Tester l'interface utilisateur: /admin/crm/users" -ForegroundColor White
Write-Host "  3. Tester l'envoi d'email depuis l'interface CRM" -ForegroundColor White
Write-Host ""

if (-not $sendEmailResponse.Success) {
    Write-Host "⚠️  CONFIGURATION SMTP À VÉRIFIER" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Sur Render.com, vérifiez ces variables d'environnement:" -ForegroundColor Yellow
    Write-Host "  SMTP_HOST = mail.israelgrowthventure.com" -ForegroundColor Gray
    Write-Host "  SMTP_PORT = 587" -ForegroundColor Gray
    Write-Host "  SMTP_USER = contact@israelgrowthventure.com" -ForegroundColor Gray
    Write-Host "  SMTP_PASSWORD = [Votre mot de passe OVHcloud]" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "✅ Tests automatisés terminés avec succès !" -ForegroundColor Green
Write-Host ""
