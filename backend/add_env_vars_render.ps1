# =====================================================================
# Script d'aide pour configurer les variables d'environnement sur Render
# =====================================================================
# ATTENTION: Ce script affiche les NOMS des variables uniquement
# Les VALEURS sensibles doivent être saisies manuellement sur Render
# =====================================================================

param(
    [string]$SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"
)

$DASHBOARD_URL = "https://dashboard.render.com/web/$SERVICE_ID"

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION VARIABLES D'ENVIRONNEMENT RENDER" -ForegroundColor White
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service ID: $SERVICE_ID" -ForegroundColor Gray
Write-Host ""

# Générer un JWT_SECRET aléatoire pour cette session
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "-------------" -ForegroundColor Yellow
Write-Host "1. Ouvre: $DASHBOARD_URL" -ForegroundColor White
Write-Host "2. Clique sur l'onglet 'Environment'" -ForegroundColor White
Write-Host "3. Pour chaque variable ci-dessous:" -ForegroundColor White
Write-Host "   - Clique 'Add Environment Variable'" -ForegroundColor Gray
Write-Host "   - Copie le NOM" -ForegroundColor Gray
Write-Host "   - Saisis la VALEUR (voir ci-dessous)" -ForegroundColor Gray
Write-Host "4. Clique 'Save Changes' pour redemarrer le service" -ForegroundColor White
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Liste des variables d'environnement REQUISES
# ATTENTION: Les valeurs affichées sont des EXEMPLES ou générées localement
# Ne PAS copier les valeurs sensibles ici - les saisir manuellement sur Render
$vars = [ordered]@{
    "MONGO_URL" = "[A CONFIGURER - URL MongoDB Atlas]"
    "DB_NAME" = "igv_db"
    "JWT_SECRET" = $JWT_SECRET
    "JWT_ALGORITHM" = "HS256"
    "JWT_EXPIRATION_HOURS" = "24"
    "ADMIN_EMAIL" = "[A CONFIGURER - Email admin]"
    "ADMIN_PASSWORD" = "[A CONFIGURER - Password admin]"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = "[A CONFIGURER - Email Gmail]"
    "SMTP_PASSWORD" = "[A CONFIGURER - App Password Gmail]"
    "CONTACT_EMAIL" = "[A CONFIGURER - Email contact]"
    "FRONTEND_URL" = "https://israelgrowthventure.com"
    "CORS_ORIGINS" = "*"
    "STRIPE_SECRET_KEY" = "[A CONFIGURER - Cle Stripe]"
    "STRIPE_PUBLIC_KEY" = "[A CONFIGURER - Cle publique Stripe]"
}

$i = 1
foreach ($key in $vars.Keys) {
    $value = $vars[$key]
    
    Write-Host "Variable $i/$($vars.Count)" -ForegroundColor Gray
    Write-Host "-------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Nom:    " -ForegroundColor White -NoNewline
    Write-Host $key -ForegroundColor Yellow
    
    # Afficher la valeur ou indiquer qu'elle doit être configurée
    if ($value -like "*A CONFIGURER*") {
        Write-Host "  Valeur: " -ForegroundColor White -NoNewline
        Write-Host $value -ForegroundColor Red
    } elseif ($key -eq "JWT_SECRET") {
        Write-Host "  Valeur: " -ForegroundColor White -NoNewline
        Write-Host $value -ForegroundColor Cyan
        Write-Host "          (genere aleatoirement pour cette session)" -ForegroundColor DarkGray
    } else {
        Write-Host "  Valeur: " -ForegroundColor White -NoNewline
        Write-Host $value -ForegroundColor Cyan
    }
    Write-Host ""
    $i++
}

Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTES IMPORTANTES:" -ForegroundColor Yellow
Write-Host "-----------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Variables CRITIQUES a configurer:" -ForegroundColor Red
Write-Host "  - MONGO_URL: URL de votre MongoDB Atlas" -ForegroundColor White
Write-Host "  - ADMIN_EMAIL / ADMIN_PASSWORD: Credentials admin CMS" -ForegroundColor White
Write-Host "  - SMTP_USER / SMTP_PASSWORD: Gmail App Password" -ForegroundColor White
Write-Host "  - STRIPE_SECRET_KEY: Cle API Stripe" -ForegroundColor White
Write-Host ""
Write-Host "Comment obtenir ces valeurs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  MONGO_URL:" -ForegroundColor Yellow
Write-Host "    1. https://cloud.mongodb.com" -ForegroundColor Gray
Write-Host "    2. Cluster -> Connect -> Application" -ForegroundColor Gray
Write-Host "    3. Format: mongodb+srv://user:pass@cluster.mongodb.net/dbname" -ForegroundColor Gray
Write-Host ""
Write-Host "  SMTP_PASSWORD (Gmail App Password):" -ForegroundColor Yellow
Write-Host "    1. https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host "    2. Activer validation en 2 etapes" -ForegroundColor Gray
Write-Host "    3. Creer mot de passe d'application (16 caracteres)" -ForegroundColor Gray
Write-Host ""
Write-Host "  STRIPE_SECRET_KEY:" -ForegroundColor Yellow
Write-Host "    1. https://dashboard.stripe.com" -ForegroundColor Gray
Write-Host "    2. Developers -> API keys" -ForegroundColor Gray
Write-Host "    3. Copier Secret key (sk_test_... ou sk_live_...)" -ForegroundColor Gray
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Sauvegarder la liste des variables dans un fichier texte
$outputFile = Join-Path $PSScriptRoot "env_vars_list.txt"
$content = @"
Variables d'environnement requises pour Render
Service: igv-cms-backend ($SERVICE_ID)
Genere le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Liste des variables (NOMS uniquement):
=====================================================================

"@

foreach ($key in $vars.Keys) {
    $content += "$key`n"
}

$content | Out-File -FilePath $outputFile -Encoding UTF8 -Force
Write-Host "Liste des variables sauvegardee: $outputFile" -ForegroundColor Green
Write-Host ""

# Ouvrir automatiquement le Dashboard Render dans le navigateur
Write-Host "Ouverture du Dashboard Render..." -ForegroundColor Cyan
try {
    Start-Process $DASHBOARD_URL
    Write-Host "Dashboard ouvert dans le navigateur" -ForegroundColor Green
} catch {
    Write-Host "Impossible d'ouvrir automatiquement. URL:" -ForegroundColor Yellow
    Write-Host $DASHBOARD_URL -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "Presse ENTREE une fois toutes les variables configurees..." -ForegroundColor Yellow
Write-Host "=============================================================" -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "Attente du redemarrage du service (30 secondes)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Verification du backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/health" -TimeoutSec 15
    if ($response.status -eq "ok") {
        Write-Host "Backend operationnel!" -ForegroundColor Green
    } else {
        Write-Host "Backend repond mais statut inattendu" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Backend non accessible ou encore en redemarrage" -ForegroundColor Red
    Write-Host "Consulte les logs Render: $DASHBOARD_URL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script termine!" -ForegroundColor Green
Write-Host ""

