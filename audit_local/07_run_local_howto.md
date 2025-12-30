# COMMENT LANCER EN LOCAL
## Date: 30 décembre 2025

---

## PRÉREQUIS

### Logiciels requis

| Logiciel | Version | Vérification |
|----------|---------|--------------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.x | `git --version` |

### Comptes externes requis

| Service | Obligatoire | Usage |
|---------|-------------|-------|
| MongoDB Atlas | ✅ OUI | Base de données |
| Google AI (Gemini) | ⚠️ Optionnel | Analyses IA |
| SMTP Server | ⚠️ Optionnel | Envoi emails |

---

## 1. CLONER LE REPO

```powershell
# Clone depuis GitHub
git clone https://github.com/israelgrowthventure-cloud/igv-site.git

# Naviguer dans le dossier
cd igv-site
```

---

## 2. CONFIGURATION BACKEND

### 2.1 Créer environnement virtuel

```powershell
# Aller dans le dossier backend
cd backend

# Créer venv
python -m venv venv

# Activer venv (Windows)
.\venv\Scripts\Activate.ps1

# Ou (CMD)
.\venv\Scripts\activate.bat
```

### 2.2 Installer dépendances

```powershell
# Installer depuis requirements.txt
pip install -r requirements.txt
```

### 2.3 Créer fichier .env

Créer `backend/.env` avec:

```env
# === OBLIGATOIRE ===
MONGODB_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/igv_crm_db

# === SÉCURITÉ ===
JWT_SECRET_KEY=votre-cle-secrete-32-chars-minimum

# === OPTIONNEL - Gemini AI ===
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...

# === OPTIONNEL - Email SMTP ===
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
SMTP_FROM=noreply@igv.com

# === OPTIONNEL - Monetico ===
MONETICO_TPE=1234567
MONETICO_SECRET=your-secret
MONETICO_COMPANY=IGV

# === ADMIN INITIAL ===
ADMIN_EMAIL=admin@igv.com
ADMIN_PASSWORD=AdminPassword123!
```

### 2.4 Lancer le backend

```powershell
# Depuis backend/ avec venv activé
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Résultat attendu:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
✅ MongoDB connection established
INFO:     Application startup complete.
```

### 2.5 Tester le backend

```powershell
# Health check
curl http://localhost:8000/api/health

# Réponse attendue
{"status": "healthy", "database": "connected"}
```

---

## 3. CONFIGURATION FRONTEND

### 3.1 Installer dépendances

```powershell
# Aller dans le dossier frontend
cd ../frontend

# Installer npm packages
npm install
```

### 3.2 Créer fichier .env

Créer `frontend/.env` avec:

```env
# URL du backend local
REACT_APP_API_URL=http://localhost:8000

# Optionnel - Analytics
REACT_APP_GA_ID=G-XXXXXXXXXX
```

### 3.3 Lancer le frontend

```powershell
# Depuis frontend/
npm start
```

**Résultat attendu:**
```
Compiled successfully!

You can now view igv-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## 4. ACCÈS LOCAL

### URLs disponibles

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Services | http://localhost:3000/services |
| Contact | http://localhost:3000/contact |
| Admin Login | http://localhost:3000/admin/login |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| CRM | http://localhost:3000/admin/crm |
| API Docs | http://localhost:8000/docs |

### Créer compte admin (première fois)

```powershell
# Via API
curl -X POST http://localhost:8000/api/admin/register `
  -H "Content-Type: application/json" `
  -d '{"email": "admin@igv.com", "password": "AdminPassword123!"}'
```

Ou utiliser les variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` du .env.

---

## 5. COMMANDES UTILES

### Backend

| Commande | Description |
|----------|-------------|
| `uvicorn server:app --reload` | Dev avec hot reload |
| `uvicorn server:app` | Production mode |
| `pip freeze > requirements.txt` | Exporter dépendances |
| `python -m pytest` | Lancer tests |

### Frontend

| Commande | Description |
|----------|-------------|
| `npm start` | Dev server |
| `npm run build` | Build production |
| `npm test` | Lancer tests |
| `npm run lint` | Vérifier code |

---

## 6. STRUCTURE FICHIERS LOCAUX

```
igv-site/
├── backend/
│   ├── .env                    # ⚠️ À créer
│   ├── venv/                   # ⚠️ À créer
│   ├── requirements.txt
│   ├── server.py               # Point d'entrée
│   ├── *_routes.py             # Routes API
│   └── models/                 # Modèles Pydantic
│
├── frontend/
│   ├── .env                    # ⚠️ À créer
│   ├── node_modules/           # ⚠️ npm install
│   ├── package.json
│   ├── src/
│   │   ├── App.js              # Router
│   │   ├── pages/              # Pages
│   │   ├── components/         # Composants
│   │   └── services/           # API calls
│   └── public/
│
└── render.yaml                 # Config Render (ignoré local)
```

---

## 7. TROUBLESHOOTING

### Backend ne démarre pas

| Erreur | Solution |
|--------|----------|
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| `MongoDB connection failed` | Vérifier MONGODB_URL dans .env |
| `Port 8000 already in use` | Tuer le process ou changer port |

### Frontend ne démarre pas

| Erreur | Solution |
|--------|----------|
| `npm ERR!` | Supprimer node_modules, `npm install` |
| `ENOENT: no such file` | Vérifier qu'on est dans frontend/ |
| `Port 3000 already in use` | Changer port ou tuer process |

### CORS errors

Si erreurs CORS dans le browser:

1. Vérifier que backend tourne sur port 8000
2. Vérifier `REACT_APP_API_URL=http://localhost:8000`
3. Backend CORS est configuré pour localhost:3000

---

## 8. LANCER LES DEUX EN PARALLÈLE

### Option A: Deux terminaux

```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn server:app --reload

# Terminal 2 - Frontend
cd frontend
npm start
```

### Option B: Script PowerShell

Créer `run_local.ps1`:

```powershell
# run_local.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn server:app --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

Exécuter:
```powershell
.\run_local.ps1
```

---

## 9. VARIABLES D'ENVIRONNEMENT COMPLÈTES

### Backend (.env)

```env
# Database (OBLIGATOIRE)
MONGODB_URL=mongodb+srv://...

# Security (OBLIGATOIRE)
JWT_SECRET_KEY=change-this-in-production-min-32-chars

# Gemini AI (optionnel)
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...

# Email SMTP (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=app-password
SMTP_FROM=noreply@igv.com

# Monetico Payment (optionnel)
MONETICO_TPE=1234567
MONETICO_SECRET=secret
MONETICO_COMPANY=IGV
MONETICO_URL_OK=http://localhost:3000/payment/success
MONETICO_URL_KO=http://localhost:3000/payment/failure

# Admin bootstrap (optionnel)
ADMIN_EMAIL=admin@igv.com
ADMIN_PASSWORD=AdminPassword123!

# Environment
ENVIRONMENT=development
DEBUG=true
```

### Frontend (.env)

```env
# API Backend
REACT_APP_API_URL=http://localhost:8000

# Analytics (optionnel)
REACT_APP_GA_ID=

# Environment
REACT_APP_ENV=development
```

---

## CHECKLIST DÉMARRAGE

- [ ] Python 3.11+ installé
- [ ] Node.js 18+ installé
- [ ] Repo cloné
- [ ] `backend/.env` créé avec MONGODB_URL
- [ ] `backend/venv` créé et activé
- [ ] `pip install -r requirements.txt` OK
- [ ] `frontend/.env` créé
- [ ] `npm install` dans frontend/ OK
- [ ] Backend tourne sur :8000
- [ ] Frontend tourne sur :3000
- [ ] http://localhost:3000 affiche la home
- [ ] http://localhost:8000/docs affiche Swagger

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
