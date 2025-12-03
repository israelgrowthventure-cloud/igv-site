# 📋 PLAN D'INTÉGRATION IGV-SITE - ÉTAT ACTUEL

**Date de création**: 2025-12-03  
**Dernière mise à jour**: 2025-12-03  
**Statut global**: ⚠️ Backend déployé, en attente de configuration complète  
**Repo actif**: `igv-website-complete/`

---

## 🎯 OBJECTIF GLOBAL

Stabiliser le projet IGV-site avec:
- Backend FastAPI 100% fonctionnel sur https://igv-cms-backend.onrender.com
- Frontend React intégrant le CMS Emergent
- Ancien CMS (Plasmic, JSON Editor) complètement désactivé
- Variables d'environnement complètes et sécurisées
- Documentation à jour et scripts opérationnels

---

## 📁 ARCHITECTURE ACTUELLE

### Dossiers actifs
```
igv-website-complete/
├── backend/          ✅ ACTIF - API FastAPI + MongoDB
├── frontend/         ✅ ACTIF - React SPA + Express server
└── docs/            📄 Documentation
```

### Dossiers d'archive
```
├── cms-export/       📦 ARCHIVE - Référence uniquement
└── editor-app/       📦 ARCHIVE - Non utilisé
```

**Note**: Voir `README_LOCAL_ARCHITECTURE.md` pour détails complets

---

## 🔧 BACKEND ACTUEL

### Framework & Stack
- **Framework**: FastAPI 0.110.1
- **Database**: MongoDB (Motor 3.3.1 - async)
- **Auth**: JWT (PyJWT 2.10.1) + bcrypt (passlib 1.7.4)
- **Payments**: Stripe
- **Email**: aiosmtplib (Gmail SMTP)

### Fichiers principaux

#### `backend/server.py` (1371 lignes)
Point d'entrée principal de l'API FastAPI.

**Routes implémentées**:
```
Auth & Users:
  POST /api/auth/register      - Créer utilisateur
  POST /api/auth/login         - Connexion JWT
  GET  /api/auth/me            - Infos utilisateur

Pages CMS:
  GET    /api/pages            - Liste pages
  GET    /api/pages/{slug}     - Détails page
  POST   /api/pages            - Créer page (protégé)
  PUT    /api/pages/{slug}     - Modifier page (protégé)
  DELETE /api/pages/{slug}     - Supprimer page (admin)

Packs:
  GET    /api/packs            - Liste packs
  POST   /api/packs            - Créer pack (protégé)
  PUT    /api/packs/{id}       - Modifier pack (protégé)
  DELETE /api/packs/{id}       - Supprimer pack (admin)

Pricing Rules:
  GET    /api/pricing-rules           - Liste règles
  POST   /api/pricing-rules           - Créer règle (protégé)
  PUT    /api/pricing-rules/{id}      - Modifier règle (protégé)
  DELETE /api/pricing-rules/{id}      - Supprimer règle (admin)
  GET    /api/pricing/country/{code}  - Prix par pays

Translations:
  GET /api/translations        - Liste traductions
  POST /api/translations       - Créer traduction (protégé)
  PUT /api/translations/{key}  - Modifier traduction (protégé)

Orders & Payments:
  POST /api/orders/create-payment-intent  - Stripe payment
  POST /api/orders/{id}/confirm          - Confirmer commande
  GET  /api/orders                       - Liste commandes (protégé)

Monitoring:
  GET /                        - Healthcheck root
  GET /api/health              - Healthcheck détaillé
```

#### `backend/cms_routes.py` (125 lignes)
Routes pour la gestion des pages CMS (utilisé par CMS Emergent).  
**Statut**: Importé dans server.py mais actuellement redondant avec les routes /api/pages/*

#### `backend/pricing_config.py` (159 lignes)
Configuration centralisée du pricing par zone géographique.

**Zones supportées**:
- EU (Europe) - EUR
- US_CA (USA/Canada) - USD
- IL (Israël) - ILS
- ASIA_AFRICA - USD

**Fonctions principales**:
- `get_zone_from_country(code)` - Détection zone par pays
- `get_price_for_pack(pack, zone)` - Prix par pack/zone
- `get_currency_for_zone(zone)` - Devise de la zone
- `to_stripe_amount(amount, currency)` - Conversion Stripe (cents)
- `format_price(amount, currency, lang)` - Formatage localisé

#### `backend/init_db_production.py` (250 lignes)
Script d'initialisation de la base MongoDB production.

**Actions**:
1. Crée utilisateur admin (postmaster@israelgrowthventure.com)
2. Crée 3 packs (Analyse, Succursales, Franchise)
3. Crée 5 règles pricing (EU, US_CA, IL, ASIA_AFRICA, DEFAULT)

**⚠️ ATTENTION**: Utilise l'API backend (pas d'accès direct MongoDB). Idempotent (ne supprime pas de données).

---

## 🌐 VARIABLES D'ENVIRONNEMENT

### Backend (Render Service `srv-d4ka5q63jp1c738n6b2g`)

#### Critiques (DOIVENT être configurées)
```bash
MONGO_URL              # URL MongoDB Atlas (mongodb+srv://...)
DB_NAME                # Nom de la base (igv_db)
JWT_SECRET             # Secret JWT (32+ chars aléatoires)
JWT_ALGORITHM          # Algorithme JWT (HS256)
JWT_EXPIRATION_HOURS   # Expiration tokens (24)
```

#### Authentification Admin
```bash
ADMIN_EMAIL            # Email admin CMS
ADMIN_PASSWORD         # Password admin CMS
```

#### Email (SMTP Gmail)
```bash
SMTP_HOST              # smtp.gmail.com
SMTP_PORT              # 587
SMTP_USER              # Email Gmail complet
SMTP_PASSWORD          # App Password Gmail (16 chars)
CONTACT_EMAIL          # Email destinataire contacts
```

#### Paiements (Stripe)
```bash
STRIPE_SECRET_KEY      # sk_test_... ou sk_live_...
STRIPE_PUBLIC_KEY      # pk_test_... ou pk_live_...
```

#### CORS & Frontend
```bash
FRONTEND_URL           # https://israelgrowthventure.com
CORS_ORIGINS           # * ou liste origins
```

### Frontend (Render Static Site)
```bash
REACT_APP_API_BASE_URL    # https://igv-cms-backend.onrender.com
REACT_APP_CMS_API_URL     # https://igv-cms-backend.onrender.com/api
```

**Note**: Les valeurs sensibles NE DOIVENT JAMAIS être commitées.  
Utiliser le script `backend/add_env_vars_render.ps1` pour aide configuration.

---

## 🛠️ SCRIPTS UTILITAIRES

### Backend

#### `add_env_vars_render.ps1`
Script PowerShell d'aide à la configuration des variables Render.

**Usage**:
```powershell
cd backend
.\add_env_vars_render.ps1
```

**Fonctionnalités**:
- Affiche la liste complète des variables requises
- Génère un JWT_SECRET aléatoire
- Ouvre automatiquement le Dashboard Render
- Sauvegarde la liste dans `env_vars_list.txt`
- Vérifie le backend après configuration

**⚠️ SÉCURITÉ**: N'affiche QUE les noms des variables. Les valeurs sensibles doivent être saisies manuellement sur Render Dashboard.

#### `check_prod_endpoints.py`
Script Python de vérification des endpoints production.

**Usage**:
```bash
cd backend
python check_prod_endpoints.py
```

**Tests effectués** (non-destructifs uniquement):
1. Healthcheck backend (/)
2. Healthcheck API (/api/health)
3. GET /api/packs
4. GET /api/pricing-rules
5. GET /api/pages
6. GET /api/translations
7. POST /api/auth/login (avec credentials admin)
8. GET /api/pricing/country/IL
9. GET /api/pricing/country/US

**Variables d'environnement utilisées**:
- `ADMIN_EMAIL` (défaut: postmaster@israelgrowthventure.com)
- `ADMIN_PASSWORD` (défaut: Admin@igv)

**⚠️ IMPORTANT**: Les routes destructrices (POST/PUT/DELETE) doivent être testées MANUELLEMENT.

#### `init_db_production.py`
Script d'initialisation base de données production.

**Usage**:
```bash
cd backend
python init_db_production.py
```

**⚠️ PRÉREQUIS**: Backend déjà déployé et opérationnel.

---

## 📊 ÉTAT D'AVANCEMENT

### ✅ Complété

- [x] Backend FastAPI avec toutes les routes CRUD
- [x] Authentification JWT + bcrypt
- [x] Modèles Pydantic pour toutes les entités
- [x] Configuration pricing par zone
- [x] Routes Orders + intégration Stripe
- [x] Script d'initialisation DB production
- [x] Script de test endpoints production
- [x] Script d'aide configuration Render
- [x] Documentation architecture locale
- [x] Commentaires détaillés dans le code backend
- [x] Backend déployé sur Render (LIVE mais non configuré)

### ⏳ En cours

- [ ] **Configuration variables d'environnement sur Render** (BLOQUANT)
- [ ] Vérification connexion MongoDB Atlas
- [ ] Tests production tous passants

### ❌ Non démarré

- [ ] Frontend - Suppression complète des références Plasmic
- [ ] Frontend - Vérification intégration CMS Emergent
- [ ] Frontend - Tests flow complet (checkout, contact, etc.)
- [ ] Initialisation base de données production
- [ ] Documentation utilisateur CMS Emergent
- [ ] Tests charge et performance
- [ ] Monitoring et alertes

---

## 🚨 PROBLÈMES CONNUS

### 1. Backend timeout sur tous les endpoints (CRITIQUE)
**Symptôme**: Tous les endpoints retournent timeout après 15s  
**Cause**: Variable `MONGO_URL` manquante sur Render → backend essaie de se connecter à localhost:27017  
**Impact**: Backend déployé mais non-fonctionnel  
**Solution**: Ajouter `MONGO_URL` et toutes les variables manquantes sur Render Dashboard

### 2. API Render retourne 405 sur ajout variables
**Symptôme**: Impossible d'ajouter variables via API programmatique  
**Cause**: Render API ne supporte pas les mises à jour de variables pour services existants  
**Solution**: Ajout manuel via Dashboard uniquement (script `add_env_vars_render.ps1` pour aide)

### 3. Tests automatisés limités
**Cause**: Éviter de polluer la base production avec des données de test  
**Solution**: Script `check_prod_endpoints.py` teste uniquement les routes publiques non-destructives

---

## 🎯 PROCHAINES ÉTAPES CONCRÈTES

### 1. Configuration Render (PRIORITÉ CRITIQUE)
**Action**: Ajouter toutes les variables d'environnement manquantes  
**Où**: https://dashboard.render.com/web/srv-d4ka5q63jp1c738n6b2g → Environment  
**Aide**: Utiliser `backend/add_env_vars_render.ps1`  
**Délai estimé**: 10 minutes

### 2. Vérification backend opérationnel
**Action**: Exécuter `python check_prod_endpoints.py`  
**Résultat attendu**: 8/8 tests passants  
**Si échec**: Vérifier logs Render

### 3. Initialisation base de données
**Action**: Exécuter `python init_db_production.py`  
**Résultat**: Admin + packs + pricing rules créés  
**Vérification**: Se connecter au CMS /admin/login

### 4. Tests manuels CMS Emergent
**Actions**:
- [ ] Login /admin/login (postmaster@israelgrowthventure.com)
- [ ] Créer une page dans /admin/pages
- [ ] Modifier un pack dans /admin/packs
- [ ] Ajuster une règle de pricing dans /admin/pricing
- [ ] Tester traductions dans /admin/translations

### 5. Nettoyage frontend
**Actions**:
- [ ] Grep recherche de "plasmic" dans frontend/src/
- [ ] Grep recherche de "@plasmicapp" dans frontend/package.json
- [ ] Supprimer imports morts et dépendances Plasmic
- [ ] Vérifier routing App.js (pas de catch-all vers CmsPage)

---

## 📚 RÉFÉRENCES DOCUMENTATION

- `README_LOCAL_ARCHITECTURE.md` - Architecture complète du projet
- `backend/RENDER_DEPLOYMENT.md` - Guide déploiement Render
- `DEPLOY_BACKEND_RENDER.md` - Instructions spécifiques backend
- `RAPPORT_DIAGNOSTIC_404.md` - Historique résolution problèmes 404

---

## ⚙️ CONFIGURATION DÉPLOIEMENT RENDER

### Backend - Web Service
**Service ID**: `srv-d4ka5q63jp1c738n6b2g`  
**URL**: https://igv-cms-backend.onrender.com  
**Region**: Frankfurt (EU Central)  
**Runtime**: Python 3  
**Build Command**: `cd backend && pip install -r requirements.txt`  
**Start Command**: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`  
**Health Check Path**: `/api/health`  
**Auto-Deploy**: ✅ Activé (push sur main)

### Frontend - Static Site / Web Service
**URL Production**: https://israelgrowthventure.com  
**URL Render**: https://igv-site.onrender.com  
**Runtime**: Node  
**Root Directory**: `frontend`  
**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start` (Express server)

---

## 🔒 RÈGLES DE SÉCURITÉ

1. **NE JAMAIS** commiter de fichiers `.env` avec valeurs réelles
2. **NE JAMAIS** hardcoder de credentials dans le code source
3. **TOUJOURS** utiliser des variables d'environnement pour les secrets
4. **TOUJOURS** générer un `JWT_SECRET` aléatoire de 32+ caractères
5. **TOUJOURS** utiliser des App Passwords Gmail (pas le mot de passe principal)
6. **TOUJOURS** tester sur https://israelgrowthventure.com avant validation
7. **TOUJOURS** vérifier les logs Render après chaque déploiement

---

## 📞 SUPPORT & RESSOURCES

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Stripe Dashboard**: https://dashboard.stripe.com

---

**Maintenu par**: Équipe IGV Development  
**Dernière révision**: 2025-12-03  
**Version**: 2.1.0
