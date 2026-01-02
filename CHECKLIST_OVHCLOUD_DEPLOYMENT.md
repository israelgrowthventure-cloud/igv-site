# ✅ CHECKLIST DÉPLOIEMENT OVHCLOUD SMTP

## Configuration OVHcloud SMTP
- ✅ Adresse email: contact@israelgrowthventure.com
- ✅ Host SMTP: mail.israelgrowthventure.com
- ✅ Port: 587 (STARTTLS)
- ✅ Variables d'environnement configurées sur Render.com

---

## 🚀 PROCÉDURE DE DÉPLOIEMENT

### Étape 1: Exécuter le script de déploiement
```powershell
cd "c:\Users\PC\Desktop\IGV\igv site\igv-site"
.\deploy_crm_features.ps1
```

**Durée**: 2-3 minutes  
**Actions**: Commit + Push + Attente déploiement Render

---

### Étape 2: Vérifier le déploiement sur Render.com

#### Backend (igv-cms-backend)
1. Aller sur https://dashboard.render.com
2. Sélectionner le service backend
3. Vérifier les logs de déploiement:
   - ✅ "Build succeeded"
   - ✅ "Deploy succeeded"
   - ✅ "admin_user_routes loaded"

#### Frontend (igv-site-frontend)
1. Sélectionner le service frontend
2. Vérifier les logs de déploiement:
   - ✅ "Build succeeded"
   - ✅ "Deploy succeeded"
   - ✅ "UsersTab.js compiled"

**Durée**: 5-10 minutes (automatique)

---

### Étape 3: Vérifier les variables d'environnement

Sur Render.com (Backend) → Environment:

| Variable | Valeur | Configuré ? |
|----------|--------|-------------|
| `SMTP_HOST` | mail.israelgrowthventure.com | ☐ |
| `SMTP_PORT` | 587 | ☐ |
| `SMTP_USER` | contact@israelgrowthventure.com | ☐ |
| `SMTP_PASSWORD` | [Votre mot de passe OVHcloud] | ☐ |
| `JWT_SECRET` | [Existant] | ☐ |
| `MONGODB_URI` | [Existant] | ☐ |

---

### Étape 4: Tests automatisés
```powershell
.\test_crm_features.ps1
```

**Ce qui sera testé**:
- ☐ API Health Check
- ☐ Authentification JWT
- ☐ Liste des utilisateurs
- ☐ Création d'utilisateur
- ☐ Modification d'utilisateur
- ☐ Suppression d'utilisateur
- ☐ Envoi d'email via SMTP
- ☐ Historique des emails

**Durée**: 2-3 minutes

---

## 🧪 TESTS MANUELS DE L'INTERFACE

### Test 1: Onglet Utilisateurs

1. **Accès**:
   - ☐ Aller sur https://israelgrowthventure.com/admin/crm
   - ☐ Se connecter avec les identifiants admin
   - ☐ Cliquer sur l'onglet "Utilisateurs"

2. **Vérification de l'affichage**:
   - ☐ La liste des utilisateurs s'affiche
   - ☐ Les colonnes sont correctes (Email, Rôle, Statut, Date)
   - ☐ Le bouton "Nouvel utilisateur" est visible
   - ☐ Les statistiques s'affichent (Total, Actifs, Admins)

3. **Création d'utilisateur**:
   - ☐ Cliquer sur "Nouvel utilisateur"
   - ☐ Remplir le formulaire:
     - Email: test.commercial@igv.com
     - Nom: Test Commercial
     - Mot de passe: TestPass123!
     - Rôle: Commercial
   - ☐ Cliquer sur "Créer"
   - ☐ Toast de succès affiché
   - ☐ L'utilisateur apparaît dans la liste

4. **Modification d'utilisateur**:
   - ☐ Cliquer sur le bouton Éditer (icône crayon)
   - ☐ Modifier le nom: "Test Commercial Updated"
   - ☐ Changer le rôle: Admin
   - ☐ Cliquer sur "Mettre à jour"
   - ☐ Toast de succès affiché
   - ☐ Les modifications sont visibles dans la liste

5. **Désactivation d'utilisateur**:
   - ☐ Cliquer sur le bouton Supprimer (icône corbeille)
   - ☐ Confirmer la désactivation
   - ☐ Toast de succès affiché
   - ☐ Le statut passe à "Inactif"

---

### Test 2: Envoi d'email depuis un Lead

1. **Navigation**:
   - ☐ Aller dans l'onglet "Leads"
   - ☐ Sélectionner un lead avec une adresse email

2. **Ouverture du modal**:
   - ☐ Cliquer sur le bouton "Envoyer Email" (violet)
   - ☐ Le modal EmailModal s'ouvre
   - ☐ L'email du destinataire est pré-rempli
   - ☐ Les templates sont disponibles (FR/EN/HE)

3. **Envoi d'email**:
   - ☐ Sélectionner un template (ex: "Bienvenue")
   - ☐ Vérifier que le message est chargé
   - ☐ Modifier si nécessaire
   - ☐ Cliquer sur "Envoyer"
   - ☐ Toast de succès affiché
   - ☐ Le modal se ferme

4. **Vérification de la réception**:
   - ☐ Vérifier la boîte de réception du destinataire
   - ☐ Email reçu (vérifier spam si nécessaire)
   - ☐ Expéditeur: contact@israelgrowthventure.com
   - ☐ Contenu correct

---

### Test 3: Envoi d'email depuis un Contact

1. **Navigation**:
   - ☐ Aller dans l'onglet "Contacts"
   - ☐ Sélectionner un contact

2. **Ouverture du modal**:
   - ☐ Cliquer sur le bouton d'envoi d'email
   - ☐ Le modal s'ouvre
   - ☐ L'email est pré-rempli

3. **Envoi**:
   - ☐ Composer un message personnalisé
   - ☐ Envoyer
   - ☐ Vérifier la réception

---

### Test 4: Historique des emails

1. **Vérification backend**:
```powershell
# Récupérer le token
$token = "VOTRE_TOKEN_JWT"

# Vérifier l'historique
curl -X GET "https://igv-cms-backend.onrender.com/api/crm/emails/history?limit=10" `
  -H "Authorization: Bearer $token"
```

2. **Vérifications**:
   - ☐ Les emails envoyés apparaissent dans l'historique
   - ☐ Les informations sont correctes (destinataire, sujet, date)
   - ☐ L'activité est bien enregistrée

---

## 🔐 TESTS DE SÉCURITÉ

### Test 1: Protection des routes admin
```powershell
# Sans token - doit échouer avec 401
curl -X GET "https://igv-cms-backend.onrender.com/api/admin/users"
```
- ☐ Erreur 401 (Unauthorized)

### Test 2: Protection par rôle
```powershell
# Avec token commercial (pas admin) - doit échouer avec 403
# (Créer un commercial d'abord et obtenir son token)
curl -X GET "https://igv-cms-backend.onrender.com/api/admin/users" `
  -H "Authorization: Bearer $COMMERCIAL_TOKEN"
```
- ☐ Erreur 403 (Forbidden)

### Test 3: Validation des données
```powershell
# Email invalide - doit échouer avec 422
curl -X POST "https://igv-cms-backend.onrender.com/api/admin/users" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"email": "invalid-email", "name": "Test", "password": "Pass123!", "role": "commercial"}'
```
- ☐ Erreur 422 (Validation Error)

---

## 📊 MÉTRIQUES DE SUCCÈS

### Backend
- ☐ Tous les endpoints répondent en < 500ms
- ☐ Aucune erreur 500 dans les logs
- ☐ Les emails sont bien envoyés via SMTP OVHcloud
- ☐ Les logs d'activité sont enregistrés

### Frontend
- ☐ L'onglet Users charge en < 2s
- ☐ Aucune erreur console JavaScript
- ☐ Les composants sont responsive (mobile/desktop)
- ☐ Les modals s'ouvrent/ferment correctement

### Fonctionnel
- ☐ Création d'utilisateur fonctionne
- ☐ Modification d'utilisateur fonctionne
- ☐ Désactivation d'utilisateur fonctionne
- ☐ Envoi d'email depuis Leads fonctionne
- ☐ Envoi d'email depuis Contacts fonctionne
- ☐ Templates d'emails disponibles
- ☐ Historique des emails accessible

---

## 🐛 TROUBLESHOOTING

### Problème: "SMTP credentials not configured"
**Solution**:
1. Vérifier sur Render.com → Backend → Environment
2. Ajouter/vérifier:
   - SMTP_HOST = mail.israelgrowthventure.com
   - SMTP_PORT = 587
   - SMTP_USER = contact@israelgrowthventure.com
   - SMTP_PASSWORD = [mot de passe OVHcloud]
3. Redémarrer le service backend

### Problème: "User not found" lors de l'auth
**Solution**:
1. Vérifier que l'utilisateur existe dans MongoDB
2. Vérifier que JWT_SECRET est bien configuré
3. Vérifier que le token n'est pas expiré (24h)

### Problème: Onglet Users ne s'affiche pas
**Solution**:
1. Vérifier que vous êtes connecté en tant qu'admin
2. Vérifier la console browser pour les erreurs
3. Vérifier que UsersTab.js est bien déployé

### Problème: Emails non reçus
**Solutions**:
1. Vérifier le dossier spam
2. Vérifier les logs backend pour les erreurs SMTP
3. Tester avec un autre email destinataire
4. Vérifier les paramètres SMTP sur OVHcloud

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés:

- ☐ Créer un compte rendu de validation
- ☐ Informer l'équipe du déploiement
- ☐ Former les utilisateurs sur les nouvelles fonctionnalités
- ☐ Monitorer les logs pendant 24h

---

## 📝 NOTES

**Date de validation**: _______________  
**Validé par**: _______________  
**Environnement**: Production (Render.com)  
**Version**: v3.1.0 (Email + User Management)

**Observations**:
_____________________________________________
_____________________________________________
_____________________________________________

---

**🎉 Checklist terminée - Système en production !**
