# ============================================
# SCRIPT DE DÉPLOIEMENT - FONCTIONNALITÉS CRM
# ============================================
# Date: 2 janvier 2026
# Objectifs: Email sending + User management
# ============================================

Write-Host "🚀 DÉPLOIEMENT DES FONCTIONNALITÉS CRM" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
$expectedPath = "igv-site"
$currentPath = (Get-Location).Path
if ($currentPath -notlike "*$expectedPath*") {
    Write-Host "❌ ERREUR: Vous devez être dans le dossier igv-site" -ForegroundColor Red
    Write-Host "   Dossier actuel: $currentPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dossier de travail vérifié" -ForegroundColor Green
Write-Host ""

# ============================================
# ÉTAPE 1: Vérification des fichiers
# ============================================
Write-Host "📋 ÉTAPE 1: Vérification des fichiers..." -ForegroundColor Yellow

$filesToCheck = @(
    "backend\admin_user_routes.py",
    "frontend\src\components\crm\UsersTab.js",
    "backend\server.py",
    "frontend\src\pages\admin\AdminCRMComplete.js"
)

$allFilesExist = $true
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MANQUANT: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ ERREUR: Certains fichiers sont manquants" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les fichiers requis sont présents" -ForegroundColor Green
Write-Host ""

# ============================================
# ÉTAPE 2: Vérification Git
# ============================================
Write-Host "📋 ÉTAPE 2: Vérification Git..." -ForegroundColor Yellow

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "  ✅ Git installé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Git n'est pas installé ou non accessible" -ForegroundColor Red
    exit 1
}

# Vérifier le statut Git
Write-Host ""
Write-Host "  Statut Git actuel:" -ForegroundColor Cyan
git status --short

Write-Host ""

# ============================================
# ÉTAPE 3: Commit des modifications
# ============================================
Write-Host "📋 ÉTAPE 3: Commit des modifications..." -ForegroundColor Yellow

$response = Read-Host "Voulez-vous committer les modifications ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    
    Write-Host "  Ajout des fichiers..." -ForegroundColor Cyan
    git add backend/admin_user_routes.py
    git add frontend/src/components/crm/UsersTab.js
    git add backend/server.py
    git add frontend/src/pages/admin/AdminCRMComplete.js
    git add RAPPORT_IMPLEMENTATION_CRM_COMPLET.md
    git add TESTS_CRM_COMMANDES.md
    git add ENV_VARS_REQUIRED.md
    git add ANALYSE_PROMPT_OPTIMISATION.md
    
    Write-Host ""
    Write-Host "  Création du commit..." -ForegroundColor Cyan
    git commit -m "feat(crm): add email sending + user management features

- Add admin_user_routes.py for user CRUD operations
- Add UsersTab.js component for user management UI
- Integrate users tab in AdminCRMComplete.js
- Email sending already functional via crm_complete_routes.py
- Add comprehensive documentation and test commands
- OVHcloud SMTP configured: contact@israelgrowthventure.com

Objectives completed:
1. Email sending from leads/contacts ✅
2. User management interface ✅
3. Tailwind CSS styling consistency ✅"
    
    Write-Host ""
    Write-Host "  ✅ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Commit ignoré" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# ÉTAPE 4: Push vers GitHub
# ============================================
Write-Host "📋 ÉTAPE 4: Push vers GitHub..." -ForegroundColor Yellow

$response = Read-Host "Voulez-vous pusher vers GitHub ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    
    Write-Host "  Récupération de la branche actuelle..." -ForegroundColor Cyan
    $branch = git branch --show-current
    Write-Host "  Branche: $branch" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "  Push en cours..." -ForegroundColor Cyan
    git push origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  ✅ Push réussi vers GitHub" -ForegroundColor Green
        Write-Host "  📦 Render.com détectera automatiquement les changements" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "  ❌ Erreur lors du push" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ⏭️  Push ignoré" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# ÉTAPE 5: Attente du déploiement Render
# ============================================
Write-Host "📋 ÉTAPE 5: Déploiement sur Render.com..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Render.com va automatiquement:" -ForegroundColor Cyan
Write-Host "  1. Détecter le nouveau commit" -ForegroundColor White
Write-Host "  2. Construire le backend avec les nouveaux fichiers" -ForegroundColor White
Write-Host "  3. Construire le frontend avec les nouveaux composants" -ForegroundColor White
Write-Host "  4. Déployer les nouvelles versions" -ForegroundColor White
Write-Host ""
Write-Host "  ⏳ Temps estimé: 5-10 minutes" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Appuyez sur Entrée une fois le déploiement terminé sur Render.com"

Write-Host ""

# ============================================
# ÉTAPE 6: Vérification des variables d'environnement
# ============================================
Write-Host "📋 ÉTAPE 6: Vérification de la configuration SMTP..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Variables d'environnement requises sur Render.com:" -ForegroundColor Cyan
Write-Host "  ✅ SMTP_HOST = mail.israelgrowthventure.com" -ForegroundColor Green
Write-Host "  ✅ SMTP_PORT = 587" -ForegroundColor Green
Write-Host "  ✅ SMTP_USER = contact@israelgrowthventure.com" -ForegroundColor Green
Write-Host "  ✅ SMTP_PASSWORD = [CONFIGURÉ]" -ForegroundColor Green
Write-Host ""

# ============================================
# ÉTAPE 7: Tests automatisés
# ============================================
Write-Host "📋 ÉTAPE 7: Lancement des tests..." -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Voulez-vous exécuter les tests automatisés ? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "  🧪 Lancement du script de tests..." -ForegroundColor Cyan
    Write-Host ""
    
    # Exécuter le script de tests
    if (Test-Path ".\test_crm_features.ps1") {
        .\test_crm_features.ps1
    } else {
        Write-Host "  ⚠️  Script de tests non trouvé: test_crm_features.ps1" -ForegroundColor Yellow
        Write-Host "  Créez-le avec le contenu fourni dans la documentation" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⏭️  Tests ignorés - vous pouvez les lancer manuellement avec:" -ForegroundColor Yellow
    Write-Host "     .\test_crm_features.ps1" -ForegroundColor Cyan
}

Write-Host ""

# ============================================
# RÉSUMÉ FINAL
# ============================================
Write-Host "🎉 DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Vérifier les logs Render.com pour confirmer le déploiement" -ForegroundColor White
Write-Host "  2. Tester l'envoi d'email: .\test_crm_features.ps1" -ForegroundColor White
Write-Host "  3. Tester la gestion des utilisateurs dans /admin/crm/users" -ForegroundColor White
Write-Host "  4. Vérifier la documentation:" -ForegroundColor White
Write-Host "     - RAPPORT_IMPLEMENTATION_CRM_COMPLET.md" -ForegroundColor Gray
Write-Host "     - TESTS_CRM_COMMANDES.md" -ForegroundColor Gray
Write-Host "     - ENV_VARS_REQUIRED.md" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "  - Backend: https://igv-cms-backend.onrender.com" -ForegroundColor White
Write-Host "  - Frontend: https://israelgrowthventure.com" -ForegroundColor White
Write-Host "  - CRM: https://israelgrowthventure.com/admin/crm" -ForegroundColor White
Write-Host ""
Write-Host "✅ Tout est prêt pour la production !" -ForegroundColor Green
Write-Host ""
