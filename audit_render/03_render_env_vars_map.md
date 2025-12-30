# VARIABLES D'ENVIRONNEMENT - MAP (SANS VALEURS)
## Date: 30 décembre 2025

---

## SERVICE 1: `igv-cms-backend` (Python)

### Variables déclarées dans `render.yaml`

| Variable | Source | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `PYTHON_VERSION` | value: 3.11.4 | ✅ | Version Python |
| `MONGODB_URI` | sync: false | ✅ | Connection MongoDB Atlas |
| `MONGO_URL` | sync: false | ⚠️ | Alias pour MONGODB_URI |
| `DB_NAME` | sync: false | ✅ | Nom base de données |
| `JWT_SECRET` | sync: false | ✅ | Secret JWT auth |
| `CORS_ALLOWED_ORIGINS` | value | ✅ | Domaines CORS |
| `CORS_ORIGINS` | value | ✅ | Alias CORS |
| `SMTP_HOST` | sync: false | ⚠️ | Serveur SMTP |
| `SMTP_PORT` | sync: false | ⚠️ | Port SMTP |
| `SMTP_USER` | sync: false | ⚠️ | User SMTP |
| `SMTP_PASSWORD` | sync: false | ⚠️ | Password SMTP |
| `SMTP_FROM` | sync: false | ⚠️ | Email expéditeur |
| `OPENAI_API_KEY` | sync: false | ❌ | Clé OpenAI (non utilisée) |
| `BOOTSTRAP_TOKEN` | generateValue | ✅ | Token bootstrap admin |
| `MONETICO_MODE` | value: TEST | ⚠️ | Mode paiement |
| `MONETICO_TPE` | sync: false | ⚠️ | Numéro TPE CIC |
| `MONETICO_KEY` | sync: false | ⚠️ | Clé sécurité CIC |
| `MONETICO_COMPANY_CODE` | sync: false | ⚠️ | Code société |
| `MONETICO_VERSION` | value: 3.0 | ⚠️ | Version API |
| `S3_BUCKET` | sync: false | ❌ | Bucket S3 (PDF storage) |
| `S3_REGION` | sync: false | ❌ | Région S3 |
| `AWS_ACCESS_KEY_ID` | sync: false | ❌ | Clé AWS |
| `AWS_SECRET_ACCESS_KEY` | sync: false | ❌ | Secret AWS |

### Variables utilisées dans le code (non dans render.yaml)

| Variable | Fichier | Ligne | Obligatoire | Description |
|----------|---------|-------|-------------|-------------|
| `GEMINI_API_KEY` | mini_analysis_routes.py | 42 | ✅ | Clé API Gemini |
| `GEMINI_MODEL` | mini_analysis_routes.py | 44 | ✅ | Modèle Gemini (gemini-2.5-flash) |
| `ADMIN_EMAIL` | server.py | 67 | ✅ | Email admin bootstrap |
| `ADMIN_PASSWORD` | server.py | 68 | ✅ | Password admin bootstrap |
| `SMTP_SERVER` | mini_analysis_routes.py | 96 | ⚠️ | Alias SMTP_HOST |
| `SMTP_USERNAME` | mini_analysis_routes.py | 98 | ⚠️ | Alias SMTP_USER |
| `SMTP_FROM_EMAIL` | mini_analysis_routes.py | 100 | ⚠️ | Alias SMTP_FROM |
| `SMTP_FROM_NAME` | mini_analysis_routes.py | 101 | ⚠️ | Nom expéditeur |
| `MONETICO_ENDPOINT` | monetico_routes.py | 55 | ⚠️ | URL endpoint Monetico |
| `MONETICO_RETURN_URL` | monetico_routes.py | 58 | ⚠️ | URL retour paiement |
| `MONETICO_NOTIFY_URL` | monetico_routes.py | 59 | ⚠️ | URL webhook IPN |
| `CONTACT_EMAIL` | server.py | 499 | ⚠️ | Email réception contacts |

---

## SERVICE 2: `igv-frontend` (Node)

### Variables déclarées dans `render.yaml`

| Variable | Source | Obligatoire | Description |
|----------|--------|-------------|-------------|
| `NODE_VERSION` | value: 20.18.3 | ✅ | Version Node |
| `NODE_ENV` | value: production | ✅ | Environnement |
| `REACT_APP_API_URL` | value | ✅ | URL backend API |
| `GENERATE_SOURCEMAP` | value: false | ✅ | Désactive sourcemaps |
| `CI` | value: false | ✅ | Désactive warnings CI |

### Variables utilisées dans le code frontend

| Variable | Fichier | Description |
|----------|---------|-------------|
| `REACT_APP_BACKEND_URL` | src/utils/api.js | URL backend (alias) |
| `REACT_APP_CALENDAR_EMAIL` | .env.example | Email calendrier |
| `REACT_APP_SITE_URL` | .env.example | URL du site |
| `REACT_APP_API_TIMEOUT` | .env.example | Timeout API |
| `REACT_APP_ENABLE_ANALYTICS` | .env.example | Feature flag |
| `REACT_APP_ENABLE_PDF_DOWNLOAD` | .env.example | Feature flag |
| `REACT_APP_ENABLE_PDF_EMAIL` | .env.example | Feature flag |

---

## RÉSUMÉ CRITICITÉ

### Variables CRITIQUES (Application ne fonctionne pas sans)

| Variable | Service | Raison |
|----------|---------|--------|
| `MONGODB_URI` | Backend | Base de données |
| `DB_NAME` | Backend | Base de données |
| `JWT_SECRET` | Backend | Authentification |
| `GEMINI_API_KEY` | Backend | Mini-analyse IA |
| `ADMIN_EMAIL` | Backend | Bootstrap admin |
| `ADMIN_PASSWORD` | Backend | Bootstrap admin |
| `REACT_APP_API_URL` | Frontend | Connection backend |

### Variables IMPORTANTES (Fonctionnalités dégradées)

| Variable | Service | Raison |
|----------|---------|--------|
| `SMTP_*` | Backend | Envoi emails désactivé |
| `MONETICO_*` | Backend | Paiements désactivés |
| `S3_*` | Backend | Stockage PDF désactivé |

### Variables OPTIONNELLES

| Variable | Service | Raison |
|----------|---------|--------|
| `OPENAI_API_KEY` | Backend | Non utilisé (code Gemini) |
| `REACT_APP_ENABLE_*` | Frontend | Feature flags |

---

## ALIASES DÉTECTÉS (Même fonction, noms différents)

| Alias 1 | Alias 2 | Utilisé dans |
|---------|---------|--------------|
| `MONGODB_URI` | `MONGO_URL` | server.py:77 |
| `SMTP_HOST` | `SMTP_SERVER` | mini_analysis_routes.py:96 |
| `SMTP_USER` | `SMTP_USERNAME` | mini_analysis_routes.py:98 |
| `SMTP_FROM` | `SMTP_FROM_EMAIL` | mini_analysis_routes.py:100 |
| `CORS_ALLOWED_ORIGINS` | `CORS_ORIGINS` | server.py:140 |
| `REACT_APP_API_URL` | `REACT_APP_BACKEND_URL` | api.js:3 |

**Note:** Le code gère les deux noms via `os.getenv('A') or os.getenv('B')`.

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
