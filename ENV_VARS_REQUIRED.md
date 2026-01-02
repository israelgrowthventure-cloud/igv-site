# 🔐 VARIABLES D'ENVIRONNEMENT REQUISES

## Configuration des nouvelles fonctionnalités CRM

### 📧 SMTP - Envoi d'emails (OBJECTIF #1)

Ces variables sont **OBLIGATOIRES** pour activer l'envoi d'emails depuis le CRM.

```env
# Configuration SMTP (Gmail exemple)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application

# Alternative: SMTP personnalisé
# SMTP_HOST=smtp.votre-domaine.com
# SMTP_PORT=587
# SMTP_USER=noreply@israelgrowthventure.com
# SMTP_PASSWORD=votre-mot-de-passe-securise
```

### 📌 Configuration Gmail App Password

Si vous utilisez Gmail, vous devez créer un "App Password" :

1. Aller sur https://myaccount.google.com/security
2. Activer la vérification en 2 étapes
3. Aller dans "App passwords" (Mots de passe des applications)
4. Créer un nouveau mot de passe pour "Mail"
5. Copier le mot de passe généré dans `SMTP_PASSWORD`

### 🔑 JWT - Authentification (Déjà configuré)

```env
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres
JWT_ALGORITHM=HS256
```

### 🗄️ MongoDB - Base de données (Déjà configuré)

```env
# MongoDB Atlas ou autre
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/igv_production?retryWrites=true&w=majority

# Ou alias Render
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/igv_production?retryWrites=true&w=majority

# Nom de la base de données
DB_NAME=igv_production
```

### 👤 Admin principal (Déjà configuré)

```env
ADMIN_EMAIL=postmaster@israelgrowthventure.com
ADMIN_PASSWORD=Admin@igv2025#
BOOTSTRAP_TOKEN=votre-token-de-bootstrap-optionnel
```

---

## 📋 Fichier .env complet

Créer/modifier le fichier `backend/.env` :

```env
# ==========================================
# MONGODB CONFIGURATION
# ==========================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/igv_production?retryWrites=true&w=majority
DB_NAME=igv_production

# ==========================================
# JWT AUTHENTICATION
# ==========================================
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres-ici
JWT_ALGORITHM=HS256

# ==========================================
# ADMIN PRINCIPAL
# ==========================================
ADMIN_EMAIL=postmaster@israelgrowthventure.com
ADMIN_PASSWORD=Admin@igv2025#
BOOTSTRAP_TOKEN=optionnel-token-bootstrap

# ==========================================
# SMTP - ENVOI D'EMAILS (NOUVEAU)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@israelgrowthventure.com
SMTP_PASSWORD=votre-mot-de-passe-application-gmail

# ==========================================
# GEMINI AI (Déjà configuré)
# ==========================================
GEMINI_API_KEY=votre-clef-api-gemini

# ==========================================
# AUTRES CONFIGURATIONS
# ==========================================
CORS_ORIGINS=https://israelgrowthventure.com,https://www.israelgrowthventure.com,http://localhost:3000
```

---

## 🚀 Configuration sur Render.com

### Étape 1: Accéder aux variables d'environnement
1. Aller sur https://dashboard.render.com
2. Sélectionner votre service backend
3. Cliquer sur "Environment"

### Étape 2: Ajouter les nouvelles variables SMTP

Ajouter ces 4 variables :

| Key | Value | Type |
|-----|-------|------|
| `SMTP_HOST` | `smtp.gmail.com` | Plain Text |
| `SMTP_PORT` | `587` | Plain Text |
| `SMTP_USER` | `noreply@israelgrowthventure.com` | Plain Text |
| `SMTP_PASSWORD` | `votre-mot-de-passe-app` | Secret |

⚠️ **Important**: Marquer `SMTP_PASSWORD` comme "Secret" pour la sécurité.

### Étape 3: Redéployer
1. Cliquer sur "Save Changes"
2. Le service redémarrera automatiquement
3. Vérifier les logs pour confirmer le chargement des variables

---

## ✅ Vérification de la configuration

### Test 1: Vérifier que les variables sont chargées

```bash
curl https://igv-cms-backend.onrender.com/api/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "db": "igv_production"
}
```

### Test 2: Tester l'envoi d'email (sans SMTP configuré)

Si SMTP n'est pas configuré, vous verrez cette erreur :
```json
{
  "detail": "SMTP credentials not configured"
}
```

### Test 3: Tester l'envoi d'email (avec SMTP configuré)

```bash
curl -X POST https://igv-cms-backend.onrender.com/api/crm/emails/send \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "subject": "Test SMTP",
    "message": "Si vous recevez ceci, SMTP fonctionne !"
  }'
```

Réponse attendue (succès):
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🔧 Troubleshooting

### Erreur: "SMTP credentials not configured"

**Cause**: Variables SMTP manquantes  
**Solution**: Vérifier que `SMTP_USER` et `SMTP_PASSWORD` sont définis

```bash
# Vérifier les variables d'environnement (backend)
python -c "import os; print('SMTP_USER:', os.getenv('SMTP_USER')); print('SMTP_PASSWORD:', 'SET' if os.getenv('SMTP_PASSWORD') else 'NOT SET')"
```

### Erreur: "Authentication failed" lors de l'envoi

**Cause**: Mot de passe Gmail incorrect ou App Password non créé  
**Solution**: 
1. Vérifier que vous utilisez un App Password, pas votre mot de passe Gmail principal
2. Recréer un App Password si nécessaire

### Erreur: "Connection timeout"

**Cause**: Port SMTP bloqué ou mauvais host  
**Solution**:
- Vérifier `SMTP_PORT=587` (TLS)
- Essayer `SMTP_PORT=465` (SSL)
- Vérifier que Render.com n'a pas de restrictions réseau

### Emails ne sont pas reçus

**Vérifications**:
1. Vérifier les logs backend pour les erreurs
2. Vérifier le dossier spam
3. Vérifier que l'email destinataire est valide
4. Tester avec un autre email destinataire

---

## 📊 Variables par fonctionnalité

| Fonctionnalité | Variables requises | Status |
|----------------|-------------------|--------|
| **CRM de base** | `MONGODB_URI`, `JWT_SECRET` | ✅ Déjà configuré |
| **Envoi d'emails** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | 🆕 À configurer |
| **Gestion utilisateurs** | `JWT_SECRET` (déjà existant) | ✅ Prêt |
| **AI Gemini** | `GEMINI_API_KEY` | ✅ Déjà configuré |

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais committer** le fichier `.env` dans Git
   - Vérifier que `.env` est dans `.gitignore`

2. **Utiliser des mots de passe forts**
   - Minimum 16 caractères pour `JWT_SECRET`
   - App Password Gmail pour `SMTP_PASSWORD`

3. **Rotation des secrets**
   - Changer `JWT_SECRET` tous les 6 mois
   - Régénérer `SMTP_PASSWORD` en cas de suspicion de compromission

4. **Variables sensibles sur Render**
   - Marquer comme "Secret" : `SMTP_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`

---

## 📝 Template .env

Copier ce template dans `backend/.env` et remplir les valeurs :

```env
# REQUIRED - MongoDB
MONGODB_URI=
DB_NAME=igv_production

# REQUIRED - Authentication
JWT_SECRET=
ADMIN_EMAIL=postmaster@israelgrowthventure.com
ADMIN_PASSWORD=Admin@igv2025#

# REQUIRED - Email sending (NEW)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# OPTIONAL - AI
GEMINI_API_KEY=

# OPTIONAL - CORS
CORS_ORIGINS=https://israelgrowthventure.com,http://localhost:3000
```

---

**✅ Configuration terminée une fois toutes les variables définies !**
