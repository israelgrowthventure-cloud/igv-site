# Template des Variables d'Environnement - IGV Site V3

⚠️ **CE FICHIER NE CONTIENT QUE DES NOMS DE VARIABLES (JAMAIS DE VALEURS)**

## Backend (Python FastAPI)

### MongoDB (OBLIGATOIRE pour CMS/CRM)
```
MONGODB_URI=mongodb+srv://...
MONGO_URL=mongodb+srv://...  # Alias de MONGODB_URI (supporté pour rétrocompatibilité)
DB_NAME=igv_production
```

### Authentification & Sécurité
```
JWT_SECRET=<généré_aléatoirement>
BOOTSTRAP_TOKEN=<généré_aléatoirement>  # Protection de /api/admin/bootstrap
ADMIN_EMAIL=admin@israelgrowthventure.com
ADMIN_PASSWORD=<généré_aléatoirement>
```

### CORS
```
CORS_ALLOWED_ORIGINS=https://israelgrowthventure.com
CORS_ORIGINS=https://israelgrowthventure.com  # Alias (supporté)
```

### SMTP (Emails de contact)
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@israelgrowthventure.com
SMTP_PASSWORD=<secret>
SMTP_FROM=noreply@israelgrowthventure.com
```

### Paiement Monetico (CMS: E-Ticaret)
```
MONETICO_MODE=TEST  # ou PRODUCTION
MONETICO_TPE=<numéro_terminal>
MONETICO_KEY=<clé_secrète>
MONETICO_COMPANY_CODE=<code_société>
MONETICO_VERSION=3.0
```

### Stripe (Paiements)
```
STRIPE_SECRET_KEY=sk_test_...  # ou sk_live_...
STRIPE_PUBLIC_KEY=pk_test_...  # ou pk_live_...
```

### S3 (Upload images CMS)
```
S3_BUCKET=igv-cms-uploads
S3_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<access_key>
AWS_SECRET_ACCESS_KEY=<secret_key>
```

## Frontend (React 18.3.1)

### API Backend
```
REACT_APP_API_URL=https://igv-cms-backend.onrender.com
```

### Stripe (paiements)
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...  # ou pk_live_...
```

### Build
```
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
```

## Notes
- **Backend** : Si MongoDB absent, `/api/health` doit quand même répondre 200 avec `{"status":"ok","mongodb":"not_configured"}`
- **Alias supportés** : `MONGO_URL` = `MONGODB_URI`, `CORS_ORIGINS` = `CORS_ALLOWED_ORIGINS`
- **Render** : Configurer les variables dans Render Dashboard (Render.com > Service > Environment)
