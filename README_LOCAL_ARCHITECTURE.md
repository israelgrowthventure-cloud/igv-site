# 🏗️ ARCHITECTURE LOCALE DU REPO IGV-SITE

**Date**: 2025-12-03  
**Repo**: `igv-website-complete` (dossier actif principal)

---

## 📁 STRUCTURE DU PROJET

```
igv-website-complete/
├── backend/                 ✅ BACKEND ACTIF (FastAPI)
│   ├── server.py           ← Point d'entrée principal
│   ├── cms_routes.py       ← Routes CMS (Pages, Translations)
│   ├── pricing_config.py   ← Configuration pricing par zone
│   ├── requirements.txt    ← Dépendances Python
│   ├── .env                ← Variables locales (NE PAS COMMITER)
│   └── ...
│
├── frontend/                ✅ FRONTEND ACTIF (React + Express)
│   ├── src/                ← Code React source
│   ├── build/              ← Build production
│   ├── server.js           ← Serveur Express pour production
│   ├── package.json        ← Dépendances Node
│   └── ...
│
├── cms-export/              📦 ARCHIVE (données de référence uniquement)
│   └── *.json              ← Pages CMS exportées (référence)
│
├── editor-app/              📦 ARCHIVE (non utilisé en production)
│   └── ...                 ← Ancien éditeur standalone
│
└── docs/                    📄 DOCUMENTATION
    └── *.md                ← Guides de déploiement
```

---

## ✅ DOSSIERS ACTIFS

### `backend/`
**Rôle**: API Backend FastAPI servant le frontend et le CMS  
**Framework**: FastAPI 0.110.1  
**Base de données**: MongoDB (Motor - async driver)  
**Authentification**: JWT + bcrypt  
**Déploiement**: Render Web Service

**Routes principales**:
- `/api/auth/*` - Authentification JWT
- `/api/pages/*` - Gestion pages CMS
- `/api/packs/*` - Packs de services
- `/api/pricing-rules/*` - Règles de pricing géo
- `/api/translations/*` - Traductions i18n
- `/api/orders/*` - Commandes Stripe
- `/api/health` - Healthcheck

**Fichiers clés**:
- `server.py` - Application FastAPI principale
- `cms_routes.py` - Routes CMS (CRUD pages, traductions)
- `pricing_config.py` - Logique pricing dynamique par zone
- `init_db_production.py` - Script initialisation base production

### `frontend/`
**Rôle**: Site public React (SPA) avec serveur Express  
**Framework**: React 18.x + React Router  
**Serveur**: Express (pour servir build/)  
**Déploiement**: Render Static Site OU Web Service Node

**Pages principales**:
- `/` - Home
- `/packs` - Liste des packs
- `/about` - À propos
- `/contact` - Contact
- `/checkout/:packId` - Checkout Stripe
- `/admin/*` - CMS Emergent (éditeur GrapesJS)

**Fichiers clés**:
- `src/App.js` - Routing principal
- `src/pages/admin/*` - CMS Emergent
- `server.js` - Serveur Express production
- `build/` - Build React optimisé

---

## 📦 DOSSIERS D'ARCHIVE

### `cms-export/`
**Statut**: 🔒 ARCHIVE - RÉFÉRENCE UNIQUEMENT  
**Rôle**: Export JSON des pages CMS depuis V2  
**Usage**: Ne pas modifier, utiliser uniquement comme référence pour récupérer du contenu

### `editor-app/`
**Statut**: 🔒 ARCHIVE - NON UTILISÉ  
**Rôle**: Ancien éditeur CMS standalone (remplacé par CMS Emergent intégré au frontend)  
**Usage**: Ne pas utiliser, conservé pour référence historique

---

## 🚫 ANCIENS SYSTÈMES DÉSACTIVÉS

### Plasmic CMS (SUPPRIMÉ)
❌ `plasmic-init.js` - SUPPRIMÉ  
❌ `@plasmicapp/*` - SUPPRIMÉ des dépendances  
❌ Toutes références à Plasmic dans le code actif

### Ancien JSON Editor (DÉSACTIVÉ)
❌ `frontend/src/pages/Editor.jsx` - NON UTILISÉ  
❌ `frontend/public/content-editable.json` - NON UTILISÉ

**CMS ACTIF UNIQUE**: CMS Emergent (`frontend/src/pages/admin/*`) avec GrapesJS

---

## 🔧 CONFIGURATION DÉPLOIEMENT

### Backend - Render Web Service
**Service ID**: `srv-d4ka5q63jp1c738n6b2g`  
**URL**: https://igv-cms-backend.onrender.com  
**Build Command**: `cd backend && pip install -r requirements.txt`  
**Start Command**: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`  
**Health Check**: `/api/health`

### Frontend - Render Static Site / Web Service
**URL Production**: https://israelgrowthventure.com  
**URL Render**: https://igv-site.onrender.com  
**Build Command**: `npm install && npm run build`  
**Start Command**: `npm start` (server.js Express)

---

## 📝 VARIABLES D'ENVIRONNEMENT

### Backend (Render)
**CRITIQUES**:
- `MONGO_URL` - URL MongoDB Atlas
- `DB_NAME` - Nom base de données
- `JWT_SECRET` - Secret JWT (32+ chars aléatoires)
- `ADMIN_EMAIL` - Email admin CMS
- `ADMIN_PASSWORD` - Password admin CMS

**SMTP (emails)**:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `CONTACT_EMAIL`

**STRIPE (paiements)**:
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`

**CORS**:
- `FRONTEND_URL`, `CORS_ORIGINS`

### Frontend (Render)
- `REACT_APP_API_BASE_URL` - URL backend
- `REACT_APP_CMS_API_URL` - URL API CMS

---

## 🛠️ SCRIPTS UTILITAIRES

### Backend
- `add_env_vars_render.ps1` - Aide ajout variables Render
- `check_prod_endpoints.py` - Tests endpoints production
- `init_db_production.py` - Initialisation base MongoDB

### Déploiement
- `DEPLOY_NOW.ps1` - Déploiement rapide
- `test-production.ps1` - Tests production

---

## ⚠️ RÈGLES IMPORTANTES

1. **NE JAMAIS** importer de code depuis `cms-export/` ou `editor-app/` dans le code actif
2. **NE JAMAIS** référencer `igv-website-v2` ou autres repos externes
3. **NE JAMAIS** commiter les fichiers `.env` avec des valeurs réelles
4. **TOUJOURS** tester sur https://israelgrowthventure.com avant de valider
5. **TOUJOURS** utiliser le CMS Emergent (pas Plasmic ou ancien JSON editor)

---

## 📚 DOCUMENTATION

- `backend/INTEGRATION_PLAN.md` - Plan d'intégration backend détaillé
- `backend/RENDER_DEPLOYMENT.md` - Guide déploiement Render
- `DEPLOY_BACKEND_RENDER.md` - Instructions spécifiques backend
- `RAPPORT_DIAGNOSTIC_404.md` - Historique résolution problèmes

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Backend déployé et fonctionnel sur Render
2. ⏳ Variables d'environnement complètes sur Render
3. ⏳ Tests production tous passants
4. ⏳ CMS Emergent 100% opérationnel

---

**Maintenu par**: Équipe IGV Development  
**Dernière mise à jour**: 2025-12-03
