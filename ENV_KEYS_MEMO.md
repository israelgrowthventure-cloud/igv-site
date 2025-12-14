# ENV_KEYS_MEMO.md

**Mémo Clés Environnement IGV Site V3**  
Dernière mise à jour: 2025-12-14 UTC

---

## 🔑 Clés API

### RENDER_API_KEY
- **Source**: Render Dashboard > Account Settings > API Keys
- **Utilisation**: Scripts trigger_deploy.py, render_inventory.py
- **Stockage**: Variables d'environnement Render **uniquement**
- ⚠️ **INTERDICTION** de stocker dans `.env` local ou commit Git

### Fallback
Si `RENDER_API_KEY` absent, scripts cherchent `RENDER_API_TOKEN` (ancien nom, déprécié).

---

## 🎯 Services Render

### RENDER_FRONTEND_SERVICE_ID
- Valeur attendue: `srv-d4no5dc9c44c73d1opgg` (igv-site-web)
- Utilisation: trigger_deploy.py pour forcer redéploiement frontend
- Domaines: `israelgrowthventure.com`, `www.israelgrowthventure.com`, `igv-site-web.onrender.com`

### RENDER_BACKEND_SERVICE_ID
- Valeur attendue: `srv-XXXXXXXXXXXXXXX` (igv-cms-backend)
- Utilisation: Deploy backend API Python/FastAPI
- Domaine: `igv-cms-backend.onrender.com`

---

## 👤 Admin Bootstrap

### Identifiants Admin
- **Email**: `postmaster@israelgrowthventure.com`
- **Mot de passe**: `Adminigv@2025#` *(à changer en production après bootstrap)*

### Variables Backend
- `ADMIN_EMAIL`: Email administrateur (fallback vers valeur ci-dessus si absent)
- `ADMIN_PASSWORD`: Mot de passe admin (fallback vers valeur ci-dessus si absent)
- `BOOTSTRAP_TOKEN`: Token unique pour `/api/admin/bootstrap` (généré aléatoirement si absent)

⚠️ **Le mot de passe NE DOIT JAMAIS être loggé dans les scripts.**

---

## 🚫 Clés NON Utilisées

### Stripe
- ❌ **AUCUNE** intégration Stripe dans IGV V3
- Paiements: **Monetico UNIQUEMENT** (CM-CIC)
- Variables Stripe à SUPPRIMER si présentes: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, etc.

---

## 📦 MongoDB

### Variables
- `MONGO_URL` ou `MONGODB_URI`: Connexion MongoDB Atlas
- Backend lit les deux noms (alias), préfère `MONGO_URL` si les deux présents

---

## ✅ Vérification Présence Clés

Exécuter: `python scripts/check_env_render_key.py`  
Résultat attendu: `✓ RENDER_API_KEY: PRESENT (length: XX chars)`

---

## 🔒 Sécurité

1. **JAMAIS** de commit `.env` avec secrets réels
2. **JAMAIS** de log des valeurs complètes (seulement longueur/présence)
3. Clés Render stockées uniquement dans Render Environment Variables
4. Clés backend (MongoDB, JWT, Monetico) stockées dans Render service backend
5. Frontend: `REACT_APP_API_URL` pointe vers backend Render (pas de secrets frontend)

---

**Source of Truth**: Ce fichier documente les noms/sources, PAS les valeurs.
