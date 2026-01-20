# ✅ VARIABLES D'ENVIRONNEMENT RENDER - CONFIGURATION COMPLÈTE

## 🎯 FRONTEND (Service Web)

### Obligatoires
```
REACT_APP_BACKEND_URL=https://igv-cms-backend.onrender.com
```

### Optionnelles (avec fallbacks)
```
REACT_APP_CALENDAR_EMAIL=israel.growth.venture@gmail.com
```

---

## 🎯 BACKEND (Service Web)

### 🔴 CRITIQUES (Sans elles, le service ne fonctionne pas)

#### Base de données
```
MONGODB_URI=mongodb+srv://...
DB_NAME=igv_production
```

#### Authentification
```
JWT_SECRET=<secret_fort_minimum_32_caracteres>
ADMIN_EMAIL=postmaster@israelgrowthventure.com
ADMIN_PASSWORD=Admin@igv2025#
BOOTSTRAP_TOKEN=<token_unique_pour_init>
```

#### IA / Gemini (pour mini-analyses)
```
GEMINI_API_KEY=<cle_api_gemini>
GEMINI_MODEL=gemini-2.5-flash
```

### 🟡 IMPORTANTES (Fonctionnalités principales)

#### CORS
```
CORS_ALLOWED_ORIGINS=https://israelgrowthventure.com,https://www.israelgrowthventure.com
```

#### Email (SMTP pour envois)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=israel.growth.venture@gmail.com
SMTP_PASSWORD=<app_password_gmail>
SMTP_FROM_EMAIL=israel.growth.venture@gmail.com
SMTP_FROM_NAME=Israel Growth Venture
CONTACT_EMAIL=israel.growth.venture@gmail.com
```

### 🔵 PAIEMENT - MONETICO ONLY (CIC/CM)

```
MONETICO_TPE=<numero_tpe_cic>
MONETICO_KEY=<cle_securite_cic>
MONETICO_VERSION=3.0
MONETICO_COMPANY_CODE=israelgrowthventure
MONETICO_ENDPOINT=https://p.monetico-services.com/paiement.cgi
MONETICO_RETURN_URL=https://israelgrowthventure.com/payment/return
MONETICO_NOTIFY_URL=https://igv-cms-backend.onrender.com/api/monetico/notify
```

**⚠️ IMPORTANT MONETICO:**
- TPE = Numéro de Terminal de Paiement Électronique fourni par CIC
- KEY = Clé de sécurité (clé HMAC) fournie par CIC lors de l'activation
- Ces valeurs sont critiques pour le paiement en production
- Sans elles, le tunnel de paiement retournera une erreur de configuration

### ⚪ OPTIONNELLES (Stripe désactivé - non requis)

**Stripe n'est PAS utilisé dans cette version. Si des variables Stripe sont demandées, les ignorer ou les définir à vide.**

---

## 📋 CHECKLIST DE VÉRIFICATION

### Backend
- [x] MONGODB_URI configuré et testé
- [x] JWT_SECRET défini (min 32 car)
- [x] ADMIN_EMAIL + ADMIN_PASSWORD définis
- [x] GEMINI_API_KEY présent et valide
- [ ] **MONETICO_TPE + MONETICO_KEY configurés** ← À COMPLÉTER
- [x] SMTP configuré pour envoi emails
- [x] CORS_ALLOWED_ORIGINS inclut le domaine frontend

### Frontend
- [x] REACT_APP_BACKEND_URL pointe vers le bon backend

---

## 🚀 ACTIONS IMMÉDIATES

1. ✅ Vérifier que toutes les variables **CRITIQUES** (🔴) sont présentes dans Render
2. ⚠️ **AJOUTER les variables MONETICO** (TPE + KEY) pour activer le paiement
3. ✅ Vérifier CORS pour éviter les spinners infinis
4. ✅ Tester la connexion MongoDB après déploiement
5. ⚠️ Si Stripe bloque le build, désactiver complètement Stripe du code

---

## 📝 NOTES IMPORTANTES

- **Paiement = MONETICO uniquement** : Stripe est présent dans le code mais NON utilisé
- **Quota mini-analyse** : déjà géré avec messages traduits (FR/EN/HE)
- **CRM** : nécessite JWT_SECRET + MONGODB_URI + ADMIN credentials
- **URLs** : doivent être cohérentes entre FRONTEND et BACKEND

---

## 🔧 ÉTAPES SUIVANTES

1. Scanner Render pour identifier les variables manquantes
2. Ajouter MONETICO_TPE et MONETICO_KEY (valeurs fournies par CIC)
3. Vérifier que CORS_ALLOWED_ORIGINS inclut le domaine exact du frontend
4. Tester en local puis déployer sur Render
5. Validation LIVE après déploiement
