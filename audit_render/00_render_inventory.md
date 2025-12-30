# INVENTAIRE SERVICES RENDER - AUDIT FACTUEL
## Date: 30 décembre 2025

---

## SERVICES DÉCLARÉS DANS `render.yaml`

### 1. SERVICE BACKEND: `igv-cms-backend`

| Attribut | Valeur |
|----------|--------|
| **Type** | `web` (Web Service) |
| **Runtime** | `python` |
| **Plan** | `free` |
| **Root Directory** | `backend/` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |
| **Auto Deploy** | `true` |
| **URL Publique attendue** | `https://igv-cms-backend.onrender.com` |

**Preuve:** render.yaml lignes 1-51

---

### 2. SERVICE FRONTEND: `igv-frontend`

| Attribut | Valeur |
|----------|--------|
| **Type** | `web` (Web Service - Node) |
| **Runtime** | `node` |
| **Plan** | `free` |
| **Root Directory** | `frontend/` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node server.js` |
| **Auto Deploy** | `true` |
| **Custom Domains** | `israelgrowthventure.com`, `www.israelgrowthventure.com` |
| **URL Publique Render** | `https://igv-frontend.onrender.com` |

**Preuve:** render.yaml lignes 52-72

---

## RÉSUMÉ INVENTAIRE

| # | Service | Type | Runtime | Plan | URL Render |
|---|---------|------|---------|------|------------|
| 1 | `igv-cms-backend` | web | Python 3.11 | free | `https://igv-cms-backend.onrender.com` |
| 2 | `igv-frontend` | web | Node 20 | free | `https://igv-frontend.onrender.com` |

---

## INFORMATIONS GIT

| Attribut | Valeur |
|----------|--------|
| **Remote Origin** | `https://github.com/israelgrowthventure-cloud/igv-site.git` |
| **Branche principale** | `main` (par défaut Render) |
| **Monorepo** | OUI (`backend/` + `frontend/` dans le même repo) |

**Preuve:** Commande `git remote -v` exécutée

---

## SERVICES NON PRÉSENTS DANS RENDER.YAML

Les éléments suivants ne sont **PAS** déclarés comme services Render séparés:
- ❌ Base de données (MongoDB hébergé externalement sur Atlas)
- ❌ Background Workers
- ❌ Cron Jobs
- ❌ Redis/Cache

**Note:** MongoDB est hébergé sur MongoDB Atlas, pas sur Render. La connexion est faite via `MONGODB_URI`.

---

## STATUS CONFIRMÉS (PREUVES)

1. **Backend expose `/health`** → Confirmé dans `server.py` ligne 127-129
2. **Frontend utilise `node server.js`** → Présence du fichier `frontend/server.js`
3. **Auto-deploy activé** → `autoDeploy: true` dans render.yaml pour les 2 services

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
