# 🚀 GUIDE DE DÉPLOIEMENT BACKEND CMS SUR RENDER
## INSTRUCTIONS PRÉCISES ÉTAPE PAR ÉTAPE

---

## ✅ PRÉPARATION

### URLs et Services Existants
- **Frontend déjà déployé** : `https://igv-site.onrender.com` (Static Site)
- **Repository GitHub** : `israelgrowthventure-cloud/igv-site`
- **Branche** : `main`

### Objectif
Déployer le backend CMS comme **NOUVEAU Web Service** sans toucher au frontend.

---

## 📋 ÉTAPE 1 : CRÉER LE WEB SERVICE BACKEND

### 1.1 Accéder au Dashboard Render

1. Allez sur https://dashboard.render.com
2. Connectez-vous avec le compte qui héberge déjà `igv-site`

### 1.2 Créer un nouveau Web Service

1. Cliquez sur le bouton **"New +"** en haut à droite
2. Sélectionnez **"Web Service"**

### 1.3 Connecter le Repository

1. Dans la liste des repositories, trouvez et sélectionnez :
   ```
   israelgrowthventure-cloud/igv-site
   ```
2. Cliquez sur **"Connect"**

---

## ⚙️ ÉTAPE 2 : CONFIGURER LE WEB SERVICE

### 2.1 Configuration Générale

Remplissez les champs **EXACTEMENT** comme suit :

| Champ | Valeur |
|-------|--------|
| **Name** | `igv-backend` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |

### 2.2 Build & Deploy Settings

| Champ | Valeur |
|-------|--------|
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

### 2.3 Plan

Sélectionnez :
- **Free** (pour commencer, cold start après 15 min d'inactivité)
- ou **Starter ($7/mois)** (recommandé, toujours actif)

### 2.4 Health Check Path

Dans la section **Advanced** :
- **Health Check Path** : `/api/health`

---

## 🔐 ÉTAPE 3 : CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### 3.1 Cliquez sur "Add Environment Variable"

Ajoutez **TOUTES** les variables suivantes une par une :

### Variables OBLIGATOIRES à remplir par vous :

#### 1. MONGO_URL
```
Key: MONGO_URL
Value: [À REMPLIR PAR MICKAEL]
```
**Format attendu** : `mongodb+srv://username:password@cluster.mongodb.net/igv_cms_db`

**Comment l'obtenir** :
1. Allez sur https://cloud.mongodb.com
2. Cluster → Connect → Connect your application
3. Copiez l'URL et remplacez `<username>` et `<password>` par vos identifiants
4. Si vous n'avez pas de cluster MongoDB :
   - Créez un compte gratuit MongoDB Atlas
   - Créez un cluster M0 (gratuit) en région Frankfurt
   - Database Access → Add New User (créez un user)
   - Network Access → Add IP Address → `0.0.0.0/0` (Allow from anywhere)

---

#### 2. STRIPE_SECRET_KEY
```
Key: STRIPE_SECRET_KEY
Value: [À REMPLIR PAR MICKAEL]
```
**Format attendu** : `sk_test_...` (mode test) ou `sk_live_...` (mode production)

**Comment l'obtenir** :
1. Allez sur https://dashboard.stripe.com
2. Developers → API keys
3. Copiez la **Secret key** (pas la Publishable key)

---

#### 3. SMTP_USER
```
Key: SMTP_USER
Value: [À REMPLIR PAR MICKAEL]
```
**Format attendu** : `contact@israelgrowthventure.com` (votre email Gmail)

---

#### 4. SMTP_PASSWORD
```
Key: SMTP_PASSWORD
Value: [À REMPLIR PAR MICKAEL]
```
**Format attendu** : `abcd efgh ijkl mnop` (mot de passe d'application Google, 16 caractères)

**Comment l'obtenir** :
1. Allez sur https://myaccount.google.com/apppasswords
2. Activez la validation en 2 étapes si ce n'est pas déjà fait
3. Créez un nouveau mot de passe d'application :
   - Application : "Mail"
   - Appareil : "Autre" → "IGV Backend"
4. Copiez le mot de passe généré (16 caractères avec espaces)

---

### Variables OPTIONNELLES (déjà configurées, mais vous pouvez les modifier) :

#### 5. DB_NAME
```
Key: DB_NAME
Value: igv_cms_db
```

#### 6. SMTP_HOST
```
Key: SMTP_HOST
Value: smtp.gmail.com
```

#### 7. SMTP_PORT
```
Key: SMTP_PORT
Value: 587
```

#### 8. CONTACT_EMAIL
```
Key: CONTACT_EMAIL
Value: israel.growth.venture@gmail.com
```

#### 9. FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://israelgrowthventure.com
```
(ou `https://igv-site.onrender.com` si vous utilisez l'URL Render du frontend)

#### 10. CALENDAR_EMAIL
```
Key: CALENDAR_EMAIL
Value: israel.growth.venture@gmail.com
```

#### 11. STRIPE_WEBHOOK_SECRET (optionnel)
```
Key: STRIPE_WEBHOOK_SECRET
Value: [LAISSER VIDE POUR L'INSTANT]
```
**Note** : À configurer plus tard si vous activez les webhooks Stripe

---

## 🚀 ÉTAPE 4 : DÉPLOYER

1. **Vérifiez** que toutes les variables obligatoires sont remplies
2. Cliquez sur **"Create Web Service"**
3. Le déploiement démarre automatiquement
4. Attendez que le statut passe à **"Live"** (3-5 minutes)

---

## ✅ ÉTAPE 5 : RÉCUPÉRER L'URL DU BACKEND

Une fois le service déployé, Render vous donne une URL publique :

```
https://igv-backend.onrender.com
```

**NOTEZ CETTE URL**, elle servira pour le frontend.

---

## 🧪 ÉTAPE 6 : TESTER LE BACKEND

### Test 1 : Health Check

Ouvrez dans votre navigateur :
```
https://igv-backend.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "message": "Backend IGV est opérationnel"
}
```

### Test 2 : Root Healthcheck

```
https://igv-backend.onrender.com/
```

**Réponse attendue** :
```json
{
  "status": "ok"
}
```

### Test 3 : Documentation API

```
https://igv-backend.onrender.com/docs
```

Devrait afficher l'interface Swagger UI de FastAPI.

### Test 4 : Géolocalisation

```
https://igv-backend.onrender.com/api/geo
```

**Réponse attendue** :
```json
{
  "ip": "XX.XX.XX.XX",
  "country_code": "FR",
  "country_name": "France",
  "zone": "EU"
}
```

### Test 5 : Pricing

```
https://igv-backend.onrender.com/api/pricing?packId=analyse&zone=EU
```

**Réponse attendue** :
```json
{
  "zone": "EU",
  "currency": "eur",
  "currency_symbol": "€",
  "total_price": 3000,
  "monthly_3x": 1000,
  "monthly_12x": 250,
  "display": {
    "total": "3 000 €",
    "three_times": "3 x 1 000 €",
    "twelve_times": "12 x 250 €"
  },
  "message": "Pricing retrieved successfully"
}
```

---

## 🔗 ÉTAPE 7 : METTRE À JOUR LE FRONTEND

### 7.1 Variable d'environnement à configurer

Le frontend utilise **DEUX** variables pour les APIs backend :

#### Variable 1 : REACT_APP_API_BASE_URL (API principale)
```
Key: REACT_APP_API_BASE_URL
Value: https://igv-backend.onrender.com
```

#### Variable 2 : REACT_APP_CMS_API_URL (API CMS)
```
Key: REACT_APP_CMS_API_URL
Value: https://igv-backend.onrender.com/api
```

### 7.2 Comment mettre à jour dans Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur le service **"igv-site"** (votre frontend Static Site)
3. Allez dans **"Environment"**
4. Cherchez ces deux variables et mettez-les à jour avec les valeurs ci-dessus
5. Si elles n'existent pas, cliquez sur **"Add Environment Variable"** pour les créer
6. Cliquez sur **"Save Changes"**
7. Le frontend se redéploiera automatiquement

---

## 📊 RÉCAPITULATIF FINAL

### ✅ URL du Backend Déployé
```
https://igv-backend.onrender.com
```

### ✅ Routes Disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/` | GET | Healthcheck root |
| `/api/health` | GET | Healthcheck détaillé |
| `/docs` | GET | Documentation Swagger |
| `/api/geo` | GET | Détection géolocalisation |
| `/api/pricing` | GET | Prix par zone/pack |
| `/api/checkout` | POST | Créer session Stripe |
| `/api/webhooks/payment` | POST | Webhook Stripe |
| `/api/contact` | POST | Formulaire contact |
| `/api/contacts` | GET | Liste contacts (admin) |

### ✅ Variables d'environnement configurées

#### OBLIGATOIRES (à remplir par vous) :
- ✅ `MONGO_URL` - URL MongoDB Atlas
- ✅ `STRIPE_SECRET_KEY` - Clé API Stripe
- ✅ `SMTP_USER` - Email Gmail
- ✅ `SMTP_PASSWORD` - Mot de passe d'application Gmail

#### OPTIONNELLES (déjà configurées) :
- ✅ `DB_NAME` = `igv_cms_db`
- ✅ `SMTP_HOST` = `smtp.gmail.com`
- ✅ `SMTP_PORT` = `587`
- ✅ `CONTACT_EMAIL` = `israel.growth.venture@gmail.com`
- ✅ `FRONTEND_URL` = `https://israelgrowthventure.com`
- ✅ `CALENDAR_EMAIL` = `israel.growth.venture@gmail.com`

### ✅ Variables Frontend à mettre à jour

Dans le service **igv-site** (Static Site), configurez :

```
REACT_APP_API_BASE_URL=https://igv-backend.onrender.com
REACT_APP_CMS_API_URL=https://igv-backend.onrender.com/api
```

---

## 🎯 ACTIONS MINIMALES À FAIRE MANUELLEMENT

### 1. Créer le Web Service Backend

**Dashboard Render** → **New +** → **Web Service**

**Configuration** :
- Name : `igv-backend`
- Region : `Frankfurt (EU Central)`
- Branch : `main`
- Root Directory : `backend`
- Runtime : `Python 3`
- Build Command : `pip install --upgrade pip && pip install -r requirements.txt`
- Start Command : `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health Check Path : `/api/health`

### 2. Ajouter les variables d'environnement

**Variables à remplir ABSOLUMENT** :
```
MONGO_URL=[Votre URL MongoDB Atlas]
STRIPE_SECRET_KEY=[Votre clé Stripe]
SMTP_USER=[Votre email Gmail]
SMTP_PASSWORD=[Mot de passe d'application Gmail]
```

### 3. Mettre à jour le frontend

**Service igv-site** → **Environment** → Ajouter/Modifier :
```
REACT_APP_API_BASE_URL=https://igv-backend.onrender.com
REACT_APP_CMS_API_URL=https://igv-backend.onrender.com/api
```

---

## 🐛 DÉPANNAGE

### Le service ne démarre pas

1. Vérifiez les logs : **Dashboard** → **igv-backend** → **Logs**
2. Assurez-vous que `MONGO_URL` est bien défini
3. Vérifiez que le format de `MONGO_URL` est correct : `mongodb+srv://...`

### Erreur MongoDB

- Allez dans MongoDB Atlas → Network Access
- Vérifiez que `0.0.0.0/0` est autorisé
- Testez la connexion avec MongoDB Compass

### Emails ne partent pas

- Vérifiez que `SMTP_PASSWORD` est un mot de passe d'application Google (16 caractères)
- Assurez-vous que la validation en 2 étapes est activée sur le compte Google
- Vérifiez les logs pour voir les erreurs SMTP

### CORS errors depuis le frontend

- Vérifiez que `FRONTEND_URL` est correctement défini
- Le backend autorise déjà ces origins :
  - `https://israelgrowthventure.com`
  - `https://www.israelgrowthventure.com`
  - `https://igv-site.onrender.com`

---

## 🎉 C'EST TERMINÉ !

Votre backend CMS est maintenant déployé et prêt à servir le frontend.

**Next Steps** :
1. ✅ Backend déployé : `https://igv-backend.onrender.com`
2. ✅ Variables d'environnement configurées
3. 🔄 Mettre à jour les variables du frontend
4. 🧪 Tester le flow complet (checkout, contact, géolocalisation)

---

**Questions ?** Consultez les logs Render ou la [documentation FastAPI](https://fastapi.tiangolo.com/).
