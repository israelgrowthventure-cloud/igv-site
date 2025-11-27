# 🚀 Déploiement du Backend CMS sur Render

Ce guide explique comment déployer le backend FastAPI sur Render.com.

## 📋 Prérequis

- Compte Render.com (gratuit ou payant)
- Repository GitHub avec le code backend
- MongoDB Atlas configuré (ou autre base MongoDB)
- Clés API Stripe (pour les paiements)
- Identifiants SMTP Gmail (pour les emails)

## 🔧 Configuration

### 1. Fichiers de configuration créés

Les fichiers suivants ont été créés pour le déploiement :

- `render.yaml` : Configuration Blueprint Render (déploiement automatique)
- `Procfile` : Commande de démarrage
- `runtime.txt` : Version Python
- `requirements.txt` : Dépendances Python

### 2. Variables d'environnement requises

Configurez ces variables dans le dashboard Render :

#### **Obligatoires**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGO_URL` | URL de connexion MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Nom de la base de données | `igv_cms_db` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_...` ou `sk_test_...` |
| `SMTP_USER` | Email Gmail pour l'envoi | `contact@israelgrowthventure.com` |
| `SMTP_PASSWORD` | Mot de passe d'application Gmail | `abcd efgh ijkl mnop` |

#### **Optionnelles**

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | *(vide)* |
| `CONTACT_EMAIL` | Email de destination des contacts | `israel.growth.venture@gmail.com` |
| `FRONTEND_URL` | URL du frontend | `https://israelgrowthventure.com` |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `CALENDAR_EMAIL` | Email Google Calendar | `israel.growth.venture@gmail.com` |

## 🎯 Méthodes de déploiement

### Méthode 1 : Blueprint (Recommandée) ✅

**Avantages** : Configuration versionnée, déploiement reproductible

1. **Connectez votre repository GitHub** :
   - Allez sur [render.com](https://render.com)
   - Cliquez sur "New" → "Blueprint"
   - Sélectionnez votre repository `igv-site`
   - Render détectera automatiquement `backend/render.yaml`

2. **Configurez les secrets** :
   - Render vous demandera les variables marquées `sync: false`
   - Renseignez :
     - `MONGO_URL`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `SMTP_USER`
     - `SMTP_PASSWORD`

3. **Déployez** :
   - Cliquez sur "Apply"
   - Render crée automatiquement le service
   - Le déploiement démarre

### Méthode 2 : Web Service manuel

1. **Créez un nouveau Web Service** :
   - Dashboard Render → "New" → "Web Service"
   - Connectez votre repository GitHub
   - Sélectionnez la branche `main`

2. **Configurez le service** :
   - **Name** : `igv-cms-backend`
   - **Region** : `Frankfurt` (EU) ou `Oregon` (US)
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Ajoutez les variables d'environnement** :
   - Section "Environment" → "Add Environment Variable"
   - Ajoutez toutes les variables listées ci-dessus

4. **Configurez le health check** :
   - **Health Check Path** : `/api/health`

5. **Créez le service** :
   - Cliquez sur "Create Web Service"
   - Le build et le déploiement démarrent automatiquement

## 🔗 MongoDB Atlas Setup

Si vous n'avez pas encore MongoDB :

1. **Créez un compte** sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Créez un cluster** :
   - Choisissez le plan gratuit (M0)
   - Région : Frankfurt (proche de Render EU)

3. **Configurez l'accès** :
   - Database Access → Add New User
   - Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)

4. **Récupérez l'URL de connexion** :
   - Cluster → Connect → Connect your application
   - Copiez l'URL : `mongodb+srv://<user>:<password>@cluster.mongodb.net/`
   - Remplacez `<user>` et `<password>` par vos identifiants

## 📧 Gmail SMTP Setup

1. **Activez la validation en 2 étapes** :
   - Compte Google → Sécurité → Validation en 2 étapes

2. **Créez un mot de passe d'application** :
   - Compte Google → Sécurité → Mots de passe d'application
   - Application : "Mail"
   - Appareil : "Autre" → "IGV Backend"
   - Copiez le mot de passe (16 caractères)

3. **Utilisez dans SMTP_PASSWORD** :
   - Format : `abcd efgh ijkl mnop` (avec espaces)

## 🔐 Stripe Setup

1. **Récupérez vos clés API** :
   - Dashboard Stripe → Developers → API Keys
   - **Test** : `sk_test_...` (pour développement)
   - **Live** : `sk_live_...` (pour production)

2. **Configurez le webhook** (optionnel) :
   - Dashboard Stripe → Developers → Webhooks
   - Add endpoint : `https://YOUR_RENDER_URL/api/webhooks/payment`
   - Événements : `checkout.session.completed`
   - Copiez le secret : `whsec_...`

## ✅ Vérification du déploiement

### 1. Vérifier le health check

```bash
curl https://YOUR_RENDER_URL/api/health
```

Réponse attendue :
```json
{"status": "ok", "message": "Backend IGV est opérationnel"}
```

### 2. Tester la géolocalisation

```bash
curl https://YOUR_RENDER_URL/api/geo
```

### 3. Tester le pricing

```bash
curl "https://YOUR_RENDER_URL/api/pricing?packId=analyse&zone=EU"
```

### 4. Vérifier les logs

- Dashboard Render → Service → Logs
- Recherchez : `Application startup complete`

## 🔄 Mises à jour automatiques

Render redéploie automatiquement à chaque push sur `main` :

1. Modifiez le code backend
2. Commitez et pushez :
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Render détecte le push et redéploie

## 🌐 URL du backend

Votre backend sera accessible à :
```
https://igv-cms-backend.onrender.com
```

**Utilisez cette URL dans** :
- Frontend : `REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api`
- Stripe webhook : `https://igv-cms-backend.onrender.com/api/webhooks/payment`

## 🐛 Dépannage

### Le service ne démarre pas

1. **Vérifiez les logs** : Dashboard Render → Logs
2. **Variables manquantes** : Assurez-vous que `MONGO_URL` est défini
3. **Dépendances** : Vérifiez que `requirements.txt` est correct

### Erreur de connexion MongoDB

- Vérifiez l'URL MongoDB (format : `mongodb+srv://...`)
- Vérifiez que l'IP de Render est autorisée (0.0.0.0/0 dans Atlas)
- Testez la connexion avec MongoDB Compass

### Emails ne s'envoient pas

- Vérifiez `SMTP_USER` et `SMTP_PASSWORD`
- Le mot de passe doit être un "mot de passe d'application" Google (16 caractères)
- Activez la validation en 2 étapes sur le compte Google

### CORS errors

- Ajoutez l'URL frontend dans `server.py` → `CORSMiddleware` → `allow_origins`
- Redéployez après modification

## 📊 Monitoring

### Render Dashboard

- **Status** : Service running/down
- **Metrics** : CPU, RAM, requests
- **Logs** : Temps réel

### Health Check

Render ping automatiquement `/api/health` toutes les 5 minutes.

## 💰 Coûts

### Plan Gratuit
- ✅ Suffisant pour commencer
- ❌ Service s'endort après 15 min d'inactivité (cold start)
- ❌ 750h/mois (≈ 31 jours pour 1 service)

### Plan Starter ($7/mois)
- ✅ Toujours actif (pas de cold start)
- ✅ Plus de ressources (512 MB RAM)
- ✅ Domaine personnalisé

## 🎉 C'est tout !

Votre backend CMS est maintenant déployé et prêt à servir le frontend IGV.

**Next Steps** :
1. ✅ Backend déployé sur Render
2. 🔄 Mettre à jour `REACT_APP_CMS_API_URL` dans le frontend
3. 🚀 Redéployer le frontend sur Render
4. 🧪 Tester le flow complet (checkout, contact, etc.)

---

**Questions ou problèmes ?** Consultez les logs Render ou la [documentation officielle](https://render.com/docs).
