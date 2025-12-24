# CRM ACCESS - Guide d'Accès et de Gestion

## 🔗 URL D'ACCÈS CRM

**Production**: https://israelgrowthventure.com/admin
- Login: https://israelgrowthventure.com/admin/login  
- Dashboard: https://israelgrowthventure.com/admin/dashboard

**Backend Direct**: https://igv-cms-backend.onrender.com/api

---

## 🔐 COMPTE ADMINISTRATEUR INITIAL

**Email**: postmaster@israelgrowthventure.com
**Role**: Admin (full access)
**Status**: Bootstrap account - À UTILISER UNIQUEMENT POUR CRÉER D'AUTRES COMPTES

⚠️ **IMPORTANT**: Ne PAS utiliser ce compte au quotidien. Créer des comptes individuels.

---

## 👥 RÔLES ET PERMISSIONS

### Admin
- **Permissions**: Accès complet
- **Peut**:
  - Voir tous les leads, contacts, statistiques
  - Créer/modifier/supprimer des utilisateurs
  - Accéder aux paramètres système
  
### Sales
- **Permissions**: Consultation et gestion des leads
- **Peut**:
  - Voir tous les leads et contacts
  - Consulter les statistiques
  - Exporter les données

### Viewer
- **Permissions**: Lecture seule
- **Peut**:
  - Voir les statistiques globales
  - Consulter les leads (sans modification)

---

## 🛠️ PROCÉDURES D'ADMINISTRATION

### 1. Créer un Nouvel Utilisateur

**Via API** (avec token admin):
```bash
curl -X POST https://igv-cms-backend.onrender.com/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@israelgrowthventure.com",
    "password": "MotDePasseSecurise123!",
    "role": "sales"
  }'
```

**Via Dashboard**:
1. Se connecter à `/admin/dashboard` avec compte admin
2. Aller dans l'onglet "Users"
3. Cliquer sur "Create User"
4. Remplir email, mot de passe, rôle
5. Valider

---

### 2. Réinitialiser un Mot de Passe

**Option 1 - Via Admin** (recommandé):
```bash
curl -X POST https://igv-cms-backend.onrender.com/api/admin/users/{email}/reset-password \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "NouveauMotDePasse123!"
  }'
```

**Option 2 - Via Bootstrap** (si admin perdu):
1. Se connecter avec le compte bootstrap (postmaster@israelgrowthventure.com)
2. Créer un nouveau compte admin temporaire
3. Supprimer l'ancien compte
4. Recréer le compte avec nouveau mot de passe

---

### 3. Désactiver/Réactiver un Utilisateur

**Désactiver** (soft delete):
```bash
curl -X DELETE https://igv-cms-backend.onrender.com/api/admin/users/{email} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Le compte est désactivé (is_active=false) mais pas supprimé.

**Réactiver**:
```bash
curl -X PATCH https://igv-cms-backend.onrender.com/api/admin/users/{email}/reactivate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 4. Lister Tous les Utilisateurs

```bash
curl -X GET https://igv-cms-backend.onrender.com/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "sales",
      "created_at": "2025-12-25T...",
      "is_active": true
    }
  ]
}
```

---

## 🔒 SÉCURITÉ

### Rotation du Mot de Passe Bootstrap

**À faire tous les 3 mois**:

1. Se connecter avec compte bootstrap
2. Créer un compte admin temporaire
3. Se connecter avec le compte temporaire
4. Modifier le mot de passe bootstrap via MongoDB:

```javascript
// Connexion MongoDB
db.users.updateOne(
  { email: "postmaster@israelgrowthventure.com" },
  { $set: { password_hash: "<nouveau_hash>" } }
)
```

Ou via script Python:
```python
from backend.server import hash_password
new_hash = hash_password("NouveauMotDePasseBootstrap456!")
# Puis update MongoDB
```

### Audit des Connexions

Toutes les connexions admin sont loggées:
```bash
# Vérifier les logs Render
curl https://api.render.com/v1/services/srv-d4ka5q63jp1c738n6b2g/logs \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  | grep "admin_login"
```

---

## 📊 ENDPOINTS API DISPONIBLES

### Authentification
- `POST /api/admin/login` - Connexion
- `GET /api/admin/verify` - Vérifier token (avec header Authorization)

### Dashboard
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/leads?limit=10` - Liste des leads
- `GET /api/admin/contacts` - Liste des contacts

### User Management (Admin only)
- `POST /api/admin/users` - Créer utilisateur
- `GET /api/admin/users` - Lister utilisateurs
- `DELETE /api/admin/users/{email}` - Désactiver utilisateur

### CRM Health
- `GET /api/health/crm` - Status CRM + DB connection

---

## 🌍 SUPPORT MULTILINGUE

Le dashboard admin supporte FR/EN/HE via le sélecteur en haut à droite.

**Langue par défaut**: Français
**Langues disponibles**:
- 🇫🇷 Français
- 🇬🇧 English  
- 🇮🇱 עברית (RTL support)

---

## 🚨 EN CAS DE PROBLÈME

### Login échoue (401)
1. Vérifier que l'email existe dans la DB
2. Vérifier que is_active=true
3. Tester avec compte bootstrap

### Dashboard vide (503)
1. Vérifier MongoDB connection: `GET /api/health/crm`
2. Vérifier variables d'env Render: MONGODB_URI, DB_NAME
3. Consulter logs backend

### Accès /admin page blanche
1. Vérifier déploiement frontend terminé
2. Vérifier routes React (App.js)
3. Clear cache navigateur
4. Tester URL directe: `/admin/login`

---

## 📞 SUPPORT TECHNIQUE

**Logs Backend**: https://dashboard.render.com/web/srv-d4ka5q63jp1c738n6b2g/logs
**Logs Frontend**: https://dashboard.render.com/static/srv-d4no5dc9c44c73d1opgg/logs

**MongoDB Atlas**: Vérifier connexions actives + slow queries

---

## ✅ CHECKLIST POST-INSTALLATION

- [ ] Compte bootstrap accessible
- [ ] Créer 2-3 comptes admin individuels
- [ ] Créer comptes sales pour l'équipe commerciale
- [ ] Tester login FR/EN/HE
- [ ] Vérifier statistiques dashboard (leads, contacts)
- [ ] Documenter mots de passe dans vault sécurisé
- [ ] Configurer rotation mdp bootstrap (calendrier 3 mois)
- [ ] Former équipe sur utilisation dashboard

---

**Dernière mise à jour**: 25 décembre 2025
**Version CRM**: 1.0.0
**Commit**: 6e3074e
