# SERVICE CARDS RENDER - DÉTAIL PAR SERVICE
## Date: 30 décembre 2025

---

## SERVICE 1: `igv-cms-backend`

### Configuration Deployment

| Paramètre | Valeur |
|-----------|--------|
| **Repo Git** | `https://github.com/israelgrowthventure-cloud/igv-site.git` |
| **Branche** | `main` |
| **Root Directory** | `backend/` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Auto Deploy** | ON (`autoDeploy: true`) |
| **Health Check Path** | `/health` |
| **Plan** | Free Tier |
| **Runtime** | Python 3.11.4 |

### Fichier Principal d'Entrée

**`backend/server.py`** (984 lignes)
- Framework: **FastAPI**
- Driver MongoDB: **motor** (async)
- Auth: **JWT** via `PyJWT`
- Build timestamp dans code: `2025-12-29T17:20:00Z`

### Dépendances (requirements.txt)

```
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1 (MongoDB async)
google-genai==0.2.2 (Gemini AI)
reportlab==4.2.5 (PDF)
aiosmtplib==5.0.0 (Email)
PyJWT==2.10.1 (Auth)
pydantic==2.12.4
httpx==0.28.1
boto3==1.40.67 (S3)
```

### Routers Chargés (Preuve: server.py lignes 31-61, 929-952)

| Router | Fichier | Préfixe | Status |
|--------|---------|---------|--------|
| `api_router` | server.py | `/api` | ✅ Chargé |
| `ai_router` | ai_routes.py | `/api` | ✅ Chargé |
| `mini_analysis_router` | mini_analysis_routes.py | `/api` | ✅ Chargé |
| `extended_router` | extended_routes.py | `/api` | ✅ Chargé |
| `crm_router` | crm_routes.py | `/api` | ✅ Chargé |
| `crm_complete_router` | crm_complete_routes.py | `/api/crm` | ✅ Chargé |
| `gdpr_router` | gdpr_routes.py | `/api` | ✅ Chargé |
| `quota_router` | quota_queue_routes.py | `/api` | ✅ Chargé |
| `tracking_router` | tracking_routes.py | `/api/track` | ✅ Chargé |
| `admin_router` | admin_routes.py | `/api/admin` | ✅ Chargé |
| `invoice_router` | invoice_routes.py | `/api/invoices` | ⚠️ Conditionnel |
| `monetico_router` | monetico_routes.py | `/api/monetico` | ⚠️ Conditionnel |

### Health Check Endpoints

| Endpoint | Fichier | Description |
|----------|---------|-------------|
| `GET /health` | server.py:127 | Ultra-fast (no DB check) |
| `GET /api/health` | server.py:255 | With MongoDB ping |

### Headers/Rewrites

- CORS configuré pour: `israelgrowthventure.com`, `www.israelgrowthventure.com`, `localhost:3000`
- Exception handlers avec CORS headers sur erreurs

---

## SERVICE 2: `igv-frontend`

### Configuration Deployment

| Paramètre | Valeur |
|-----------|--------|
| **Repo Git** | `https://github.com/israelgrowthventure-cloud/igv-site.git` |
| **Branche** | `main` |
| **Root Directory** | `frontend/` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node server.js` |
| **Auto Deploy** | ON (`autoDeploy: true`) |
| **Runtime** | Node 20.18.3 |
| **Custom Domains** | `israelgrowthventure.com`, `www.israelgrowthventure.com` |

### Stack Frontend

| Composant | Version/Tech |
|-----------|--------------|
| **Framework** | React 19 (déduit de package.json) |
| **CSS** | TailwindCSS |
| **UI Components** | shadcn/ui |
| **Bundler** | Create React App (via craco) |
| **i18n** | react-i18next (FR/EN/HE) |
| **Router** | react-router-dom |
| **HTTP Client** | axios |

### Fichier Principal d'Entrée

**`frontend/src/App.js`** (104 lignes)
- Build trigger comment: `2025-12-26-routing-fix-v2`

### Pages Déclarées (App.js)

| Route | Composant | Fichier |
|-------|-----------|---------|
| `/` | Home | pages/Home.js |
| `/mini-analyse` | MiniAnalysis | pages/MiniAnalysis.js |
| `/about` | About | pages/About.js |
| `/contact` | Contact | pages/Contact.js |
| `/packs` | Packs | pages/Packs.js |
| `/future-commerce` | FutureCommerce | pages/FutureCommerce.js |
| `/privacy` | PrivacyPolicy | pages/PrivacyPolicy.js |
| `/cookies` | CookiesPolicy | pages/CookiesPolicy.js |
| `/terms` | Terms | pages/Terms.js |
| `/appointment` | Appointment | pages/Appointment.js |
| `/payment/return` | PaymentReturn | pages/PaymentReturn.js |

### Pages Admin (Protégées)

| Route | Composant | Fichier |
|-------|-----------|---------|
| `/admin/login` | AdminLogin | pages/admin/Login.js |
| `/admin/dashboard` | AdminDashboard | pages/admin/Dashboard.js |
| `/admin/crm` | AdminCRMComplete | pages/admin/AdminCRMComplete.js |
| `/admin/invoices` | AdminInvoices | pages/AdminInvoices.js |
| `/admin/payments` | AdminPayments | pages/AdminPayments.js |
| `/admin/tasks` | AdminTasks | pages/AdminTasks.js |

### Server.js (SSR/Static serving)

**`frontend/server.js`** sert le build React statique.

---

## RÉSUMÉ ÉTAT DES SERVICES

| Service | État Code | Dernière Mise à Jour Code | Production Ready |
|---------|-----------|---------------------------|------------------|
| igv-cms-backend | ✅ Complet | 2025-12-29T17:20:00Z | OUI |
| igv-frontend | ✅ Complet | 2025-12-26 | OUI |

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
