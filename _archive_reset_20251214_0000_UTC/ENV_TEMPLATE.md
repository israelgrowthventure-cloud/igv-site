# Variables d'Environnement Requises - IGV V3

**Date de création** : 2025-12-14  
**Objectif** : Référence complète des variables d'environnement sans valeurs sensibles

⚠️ **ATTENTION** : Ce fichier contient uniquement les NOMS des variables.  
Les valeurs doivent être configurées dans Render ou dans un fichier `.env` local (JAMAIS commité).

---

## Backend (FastAPI)

### Base & Runtime
```env
ENV=production
PORT=8001
HOST=0.0.0.0
```

### Database (MongoDB)
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
DB_NAME=igv_db
```

### Authentication & Security
```env
JWT_SECRET=your-secret-key-256-bits-minimum
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=480
COOKIE_SECRET=your-cookie-secret
```

### CORS
```env
CORS_ORIGINS=https://israelgrowthventure.com,http://localhost:3000
CORS_ALLOWED_ORIGINS=https://israelgrowthventure.com
```

### Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
CONTACT_EMAIL=israel.growth.venture@gmail.com
```

### Payment (Monetico)
```env
MONETICO_TPE=your-tpe-number
MONETICO_KEY=your-monetico-key
MONETICO_COMPANY_CODE=your-company-code
MONETICO_SUCCESS_URL=https://israelgrowthventure.com/payment/success
MONETICO_FAILURE_URL=https://israelgrowthventure.com/payment/failure
```

### CMS (GrapesJS + Emergent)
```env
CMS_ADMIN_EMAIL=admin@israelgrowthventure.com
CMS_ADMIN_PASSWORD=secure-hashed-password
CMS_JWT_SECRET=cms-specific-secret-if-separated
GRAPESJS_STORAGE_PROVIDER=mongodb
```

### CMS Upload Provider (choisir un)
#### Option S3
```env
UPLOAD_PROVIDER=s3
S3_BUCKET=igv-cms-uploads
S3_REGION=eu-west-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

#### Option Cloudinary
```env
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### CRM (Admin Bootstrap + RBAC)
```env
CRM_ADMIN_EMAIL=admin@israelgrowthventure.com
CRM_ADMIN_PASSWORD=secure-password-hashed
CRM_ADMIN_NAME=Administrator
BOOTSTRAP_TOKEN=one-time-bootstrap-secret-token
RBAC_ENABLED=true
BOOTSTRAP_ENABLED=false
```

### Rescue Mode (Optionnel)
```env
RESCUE_MODE=false
```

---

## Frontend (React)

### Build & Runtime
```env
NODE_ENV=production
REACT_APP_ENV=production
```

### Backend API
```env
REACT_APP_BACKEND_URL=https://igv-cms-backend.onrender.com
REACT_APP_API_URL=https://igv-cms-backend.onrender.com/api
```

### i18n
```env
REACT_APP_DEFAULT_LANGUAGE=fr
REACT_APP_SUPPORTED_LANGUAGES=fr,en,he
```

### Analytics (Optionnel)
```env
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Render (Déploiement Automatisé)

### API Render
```env
RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxxxx
RENDER_FRONTEND_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx
RENDER_BACKEND_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx
```

---

## Validation des Variables

### Critiques (Backend ne démarre pas sans)
- `MONGODB_URI` ou `MONGO_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`

### Importantes (Fonctionnalités dégradées sans)
- `SMTP_USER` + `SMTP_PASSWORD` (emails désactivés)
- `CMS_ADMIN_EMAIL` + `CMS_ADMIN_PASSWORD` (CMS non accessible)
- `MONETICO_*` (paiements désactivés)

### Optionnelles (Fallback gracieux)
- `CONTACT_EMAIL` (fallback : `israel.growth.venture@gmail.com`)
- `DB_NAME` (fallback : `igv_db`)
- `PORT` (fallback : `8001`)

---

## Sécurité

### Mots de passe
- **JAMAIS en clair dans le code**
- Utiliser bcrypt/argon2 pour hashing (backend)
- Minimum 12 caractères, complexité élevée

### Tokens & Secrets
- Générer avec `openssl rand -hex 32` ou équivalent
- Minimum 256 bits (32 bytes hex)
- Rotation régulière (JWT_SECRET, BOOTSTRAP_TOKEN)

### Bootstrap Token
- Utilisé une seule fois pour créer l'admin initial
- Désactiver après premier usage (`BOOTSTRAP_ENABLED=false`)
- Ne jamais exposer dans logs/réponses API

---

## Notes

- Les variables `MONGO_URL` et `MONGODB_URI` sont synonymes (support legacy)
- `CORS_ORIGINS` et `CORS_ALLOWED_ORIGINS` : même fonction, support compatibilité
- Backend V3 supporte mode "graceful degradation" : si MongoDB absent, routes DB retournent 503 au lieu de crasher
