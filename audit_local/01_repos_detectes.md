# INVENTAIRE REPOS GIT DÉTECTÉS
## Date: 30 décembre 2025

---

## REPO PRINCIPAL

### Repository: `igv-site`

| Attribut | Valeur |
|----------|--------|
| **Chemin local** | `c:\Users\PC\Desktop\IGV\igv site\igv-site` |
| **Remote origin** | `https://github.com/israelgrowthventure-cloud/igv-site.git` |
| **Branche** | `main` |
| **Type** | Monorepo (backend + frontend) |
| **Dernier commit** | `FIX: Separate admin routes from public routes` |

### Structure Monorepo

```
igv-site/
├── backend/        # Python FastAPI
├── frontend/       # React 19
├── scripts/        # Utilitaires
├── tools/          # Outils
└── render.yaml     # Config déploiement
```

---

## STACK TECHNIQUE

### Backend

| Composant | Version/Technologie |
|-----------|---------------------|
| **Langage** | Python 3.11.4 |
| **Framework** | FastAPI 0.110.1 |
| **Server ASGI** | Uvicorn 0.25.0 |
| **Database Driver** | Motor 3.3.1 (MongoDB async) |
| **AI** | google-genai 0.2.2 (Gemini) |
| **PDF** | reportlab 4.2.5 |
| **Email** | aiosmtplib 5.0.0 |
| **Auth** | PyJWT 2.10.1 |
| **Validation** | Pydantic 2.12.4 |
| **HTTP Client** | httpx 0.28.1 |
| **Cloud Storage** | boto3 1.40.67 (S3) |

**Fichier:** `backend/requirements.txt` (80+ dépendances)

### Frontend

| Composant | Version/Technologie |
|-----------|---------------------|
| **Langage** | JavaScript (ES6+) |
| **Framework** | React 19 |
| **Build Tool** | Create React App + CRACO |
| **Styling** | TailwindCSS |
| **UI Components** | shadcn/ui |
| **Router** | react-router-dom |
| **i18n** | react-i18next (FR/EN/HE) |
| **HTTP Client** | axios |
| **Notifications** | sonner |
| **SEO** | react-helmet-async |
| **Icons** | lucide-react |

**Fichier:** `frontend/package.json`

---

## FICHIERS CLÉS PAR RÔLE

### Configuration

| Fichier | Rôle |
|---------|------|
| `render.yaml` | Déploiement Render (2 services) |
| `backend/.env.example` | Template env backend |
| `frontend/.env.example` | Template env frontend |
| `frontend/craco.config.js` | Config build React |
| `frontend/tailwind.config.js` | Config Tailwind |
| `frontend/postcss.config.js` | Config PostCSS |

### Point d'entrée

| Fichier | Rôle |
|---------|------|
| `backend/server.py` | App FastAPI principale |
| `frontend/src/index.js` | Entry React |
| `frontend/src/App.js` | Router React |
| `frontend/server.js` | Server Node (Render) |

### Modules métier

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `backend/crm_complete_routes.py` | 1308 | CRM complet |
| `backend/mini_analysis_routes.py` | 1105 | Mini-analyse AI |
| `backend/invoice_routes.py` | 832 | Facturation |
| `backend/models/crm_models.py` | 552 | Models CRM |
| `backend/monetico_routes.py` | 452 | Paiements |
| `backend/admin_routes.py` | 387 | Admin stats |

---

## DÉPENDANCES EXTERNES

### Services Cloud

| Service | Usage | Config |
|---------|-------|--------|
| **MongoDB Atlas** | Base de données | `MONGODB_URI` |
| **Google Gemini** | AI génération | `GEMINI_API_KEY` |
| **Gmail SMTP** | Envoi emails | `SMTP_*` |
| **AWS S3** | Stockage fichiers | `S3_*` (optionnel) |
| **Monetico/CIC** | Paiements | `MONETICO_*` |
| **ipapi.co** | Géolocalisation | Gratuit |

### APIs externes appelées

| API | Fichier | Endpoint |
|-----|---------|----------|
| Gemini AI | mini_analysis_routes.py | `genai.Client` |
| ipapi.co | server.py | `https://ipapi.co/{ip}/json/` |
| ip-api.com | server.py | `http://ip-api.com/json/{ip}` (fallback) |
| Monetico | monetico_routes.py | `https://p.monetico-services.com/paiement.cgi` |

---

## AUTRES REPOS/DOSSIERS (Non trouvés)

| Recherche | Résultat |
|-----------|----------|
| Autres repos Git dans workspace | ❌ Non trouvé |
| Dossier CMS séparé | ❌ Non trouvé |
| Dossier admin séparé | ❌ Non trouvé |
| Backend alternatif | ❌ Non trouvé |

**Conclusion:** Un seul repo monorepo `igv-site` contenant tout le projet.

---

## GIT STATUS (Dernier état connu)

```
Branche: main
Remote: https://github.com/israelgrowthventure-cloud/igv-site.git
Auto-deploy Render: Activé
```

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
