# 🚀 DÉPLOIEMENT CMS - INSTRUCTIONS EXÉCUTABLES

## ✅ ANALYSE TERMINÉE

Le CMS est **DÉJÀ CODÉ** et fonctionnel :
- ✅ Backend : Routes `/api/admin/save-content` et `/api/admin/save-packs`
- ✅ Frontend : Interface admin dans `/src/pages/Admin.js`
- ✅ Configuration : `API_BASE_URL = https://igv-backend.onrender.com`

---

## 📋 ÉTAPE 1 : CRÉER LE SERVICE BACKEND (Render Dashboard)

### URL : https://dashboard.render.com

**Cliquez : New + → Web Service**

### Configuration EXACTE :

```
Name: igv-backend
Region: Frankfurt (EU Central)
Branch: main
Root Directory: backend
Runtime: Python 3

Build Command:
pip install --upgrade pip && pip install -r requirements.txt

Start Command:
uvicorn server:app --host 0.0.0.0 --port $PORT

Health Check Path: /api/health
```

---

## 🔐 ÉTAPE 2 : VARIABLES D'ENVIRONNEMENT BACKEND

**Dans la section Environment du service igv-backend, ajoutez :**

### OBLIGATOIRES (à remplir) :

```
MONGO_URL
mongodb+srv://[USERNAME]:[PASSWORD]@cluster.mongodb.net/igv_cms_db

STRIPE_SECRET_KEY
sk_test_[VOTRE_CLE] ou sk_live_[VOTRE_CLE]

SMTP_USER
contact@israelgrowthventure.com

SMTP_PASSWORD
[MOT_DE_PASSE_APPLICATION_GMAIL_16_CARACTERES]
```

### OPTIONNELLES (valeurs par défaut correctes) :

```
DB_NAME=igv_cms_db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
CONTACT_EMAIL=israel.growth.venture@gmail.com
FRONTEND_URL=https://igv-site.onrender.com
CALENDAR_EMAIL=israel.growth.venture@gmail.com
```

**Cliquez : Create Web Service**

Attendez le statut **LIVE** (3-5 minutes)

---

## 🔗 ÉTAPE 3 : CONNECTER LE FRONTEND AU BACKEND

### Service : igv-site (Static Site)

**Dashboard Render → igv-site → Environment**

### Ajoutez/Modifiez ces variables :

```
REACT_APP_API_BASE_URL
https://igv-backend.onrender.com

REACT_APP_CMS_API_URL
https://igv-backend.onrender.com/api
```

**Cliquez : Save Changes** (le frontend se redéploie automatiquement)

---

## ✅ ÉTAPE 4 : VÉRIFICATION AUTOMATIQUE

### Test 1 : Backend Health Check
```
https://igv-backend.onrender.com/api/health
```
**Attendu :** `{"status": "ok", "message": "Backend IGV est opérationnel"}`

### Test 2 : Documentation API
```
https://igv-backend.onrender.com/docs
```
**Attendu :** Interface Swagger FastAPI

### Test 3 : Admin Interface
```
https://igv-site.onrender.com/admin
```
**Attendu :** Interface CMS avec onglets (Hero, Packs, About, etc.)

### Test 4 : Sauvegarder du contenu
1. Ouvrez `https://igv-site.onrender.com/admin`
2. Modifiez un texte
3. Cliquez sur "💾 Sauvegarder"
4. Vérifiez le toast : "✅ Contenu sauvegardé avec succès !"

### Test 5 : Routes techniques (ne doivent PAS être cassées)
```
https://igv-site.onrender.com/checkout/analyse
https://igv-site.onrender.com/appointment
https://igv-site.onrender.com/packs
```
**Attendu :** Toutes les pages se chargent normalement

---

## 📊 RÉCAPITULATIF DES URLS

| Service | URL | Statut |
|---------|-----|--------|
| **Backend CMS** | `https://igv-backend.onrender.com` | ✅ À créer |
| **Admin Interface** | `https://igv-site.onrender.com/admin` | ✅ Déjà codé |
| **API Health** | `https://igv-backend.onrender.com/api/health` | ✅ À tester |
| **API Docs** | `https://igv-backend.onrender.com/docs` | ✅ À tester |
| **Site Public** | `https://igv-site.onrender.com` | ✅ Existant |

---

## 🎯 ACTIONS MINIMALES (Copier-Coller)

### 1. Créer le service backend
- Dashboard Render → New + → Web Service
- Repository : `israelgrowthventure-cloud/igv-site`
- Root Directory : `backend`
- Build : `pip install --upgrade pip && pip install -r requirements.txt`
- Start : `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health : `/api/health`

### 2. Ajouter les variables d'environnement
```
MONGO_URL=[Votre URL MongoDB]
STRIPE_SECRET_KEY=[Votre clé Stripe]
SMTP_USER=contact@israelgrowthventure.com
SMTP_PASSWORD=[Mot de passe app Gmail]
```

### 3. Connecter le frontend
Service `igv-site` → Environment :
```
REACT_APP_API_BASE_URL=https://igv-backend.onrender.com
```

### 4. Tester
```
https://igv-backend.onrender.com/api/health
https://igv-site.onrender.com/admin
```

---

## ⚠️ POINTS CRITIQUES

✅ **NE PAS TOUCHER :**
- Le service `igv-site` (Static Site) reste tel quel
- Les routes `/checkout`, `/appointment`, `/packs` continuent de fonctionner
- Le routing hybride est déjà en place

✅ **CMS EXISTANT :**
- Frontend admin : `/src/pages/Admin.js` (489 lignes)
- Backend routes : `/api/admin/save-content`, `/api/admin/save-packs`
- Authentification : `Bearer igv2025` (hardcodé dans le backend)

✅ **CONFIGURATION DÉJÀ PRÊTE :**
- `API_BASE_URL` déjà configuré pour pointer vers `igv-backend.onrender.com`
- Pas de refactoring nécessaire

---

## 🎉 RÉSULTAT FINAL

Une fois déployé :

1. ✅ Backend CMS : `https://igv-backend.onrender.com`
2. ✅ Admin CMS : `https://igv-site.onrender.com/admin`
3. ✅ Site fonctionnel : `https://igv-site.onrender.com`
4. ✅ Paiements Stripe : Continuent de fonctionner
5. ✅ Routes techniques : Intactes

**Temps estimé : 10 minutes**

---

## 🐛 DÉPANNAGE RAPIDE

### Backend ne démarre pas
- Vérifiez que `MONGO_URL` est bien configuré
- Format : `mongodb+srv://user:pass@cluster.mongodb.net/`

### Admin affiche "Sauvegardé localement"
- Le backend n'est pas accessible
- Vérifiez : `https://igv-backend.onrender.com/api/health`

### CORS errors
- Vérifiez que `FRONTEND_URL` contient l'URL du frontend
- Le backend autorise déjà `igv-site.onrender.com`

---

**EXÉCUTEZ MAINTENANT CES ÉTAPES DANS RENDER DASHBOARD.**
