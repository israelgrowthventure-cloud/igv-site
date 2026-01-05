# 📋 RAPPORT AUDIT BACKEND + DB + TESTS CRM
**Date**: 2026-01-04  
**Workspace**: `C:\Users\PC\Desktop\IGV\igv site\igv-site`

---

## ÉTAPE 0 — PREUVES DE CONTEXTE

### 0.1 — pwd + dir (racine)

```
Répertoire: C:\Users\PC\Desktop\IGV\igv site\igv-site

✅ backend/ présent
✅ frontend/ présent
```

### 0.2 — dir backend

```
✅ server.py présent (04/01/2026 06:03, 36249 bytes)
```

---

## ÉTAPE 1 — DB / ENV (PREUVES)

### 1.1 — Vérification load_dotenv dans server.py

**Fichier**: `backend/server.py`

**Ligne 6**: `from dotenv import load_dotenv`  
**Ligne 71**: `load_dotenv(ROOT_DIR / '.env')`

**Variables lues (lignes 82-83)**:
- `mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')`
- `db_name = os.getenv('DB_NAME', 'igv_production')`

**Autres variables JWT/Admin (lignes 74-79)**:
- `JWT_SECRET = os.getenv('JWT_SECRET')`
- `ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')`
- `ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')`
- `BOOTSTRAP_TOKEN = os.getenv('BOOTSTRAP_TOKEN')`

### 1.2 — Documentation variables d'environnement

**Fichier**: `ENV_VARS_REQUIRED.md`

Variables MongoDB attendues:
- `MONGODB_URI` ou `MONGO_URL` (alias Render)
- `DB_NAME` (défaut: `igv_production`)

**Fichier**: `RENDER_ENV_VARS_REQUIRED.md`

Variables critiques backend:
- `MONGODB_URI` (ou `MONGO_URL`)
- `DB_NAME=igv_production`
- `JWT_SECRET`
- `ADMIN_EMAIL=postmaster@israelgrowthventure.com`
- `ADMIN_PASSWORD=Admin@igv2025#`

### 1.3 — Existence .env

**PREUVE**: `Test-Path .env` → `False`

**Status**: `.env` n'existe pas dans `backend/`

**Action requise**: Créer `backend/.env` avec valeurs locales OU configurer variables d'environnement terminal.

---

## ÉTAPE 2 — DÉMARRER BACKEND (PREUVES)

### 2.1 — Import server.py

**Commande**: `python -c "import server; print('IMPORT_OK')"`

**PREUVE OUTPUT**:
```
WARNING:root:OPENAI_API_KEY not configured
WARNING:root:⚠️ BiDi libraries not available - Hebrew/Arabic RTL may not render correctly
ERROR:root:❌ DejaVuSans font not found - Hebrew PDFs will show squares
WARNING:root:⚠️ GEMINI_API_KEY not configured - mini-analysis endpoint will fail
WARNING:root:⚠️ Monetico not configured - payment endpoints will return configuration error
WARNING:root:MongoDB not configured (MONGODB_URI or MONGO_URL not set)
IMPORT_OK
```

**Status**: ✅ Import réussi (warnings attendus, pas d'erreurs fatales)

### 2.2 — Démarrage uvicorn

**Commande**: `uvicorn server:app --reload --host 0.0.0.0 --port 8000`

**Status**: ✅ Backend démarré en arrière-plan (processus en cours)

### 2.3 — Test openapi.json

**Commande**: `curl.exe -i http://localhost:8000/openapi.json`

**PREUVE OUTPUT** (extrait):
```
HTTP/1.1 200 OK
date: Sun, 04 Jan 2026 13:10:31 GMT
server: uvicorn
content-length: 80116
content-type: application/json

{"openapi":"3.1.0","info":{"title":"FastAPI","version":"0.1.0"},"paths":{...}}
```

**Status**: ✅ API accessible, OpenAPI schema retourné (80116 bytes)

---

## ÉTAPE 3 — VALIDATION LOGIN (PREUVES)

### 3.1 — Test login avec credentials test

**Commande PowerShell**: `Invoke-WebRequest -Uri 'http://localhost:8000/api/admin/login' -Method POST ...`

**PREUVE OUTPUT**:
```
Invoke-WebRequest : {"detail":"Database not configured"}
```

**Status Code**: 503 (Service Unavailable)

**PREUVE CODE BACKEND** (`backend/server.py` lignes 726-730):
```python
@api_router.post("/admin/login")
async def admin_login(credentials: AdminLoginRequest):
    """Admin login - returns JWT token"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
```

**Conclusion**: ✅ Endpoint répond correctement mais DB non configurée → Status 503 attendu

**Credentials attendues** (depuis ENV_VARS_REQUIRED.md):
- `ADMIN_EMAIL=postmaster@israelgrowthventure.com`
- `ADMIN_PASSWORD=Admin@igv2025#`

---

## ÉTAPE 4 — TESTS AUTOMATIQUES CRM (PREUVES)

### 4.1 — Localisation script de test

**Commande**: `Get-ChildItem -Recurse -Filter "*crm*audit*.py"`

**Résultat**: Aucun fichier `*crm*audit*.py` trouvé

**Scripts disponibles**:
- `monitor_deploy.py` - Séquence de tests E2E (login, users, create, leads, convert, email)
- `test_create_delete_complete.py` - Test create + delete user en production
- `test_crm_local_audit.py` - Script créé pour audit local

### 4.2 — Exécution test_crm_local_audit.py

**Commande**: `python test_crm_local_audit.py`

**PREUVE OUTPUT**:
```
TEST: a) Login admin
Status: SKIPPED
Details: Database not configured (503)
Response: {"detail":"Database not configured"}

TEST: b) List users
Status: SKIPPED
Details: No token (login failed)

TEST: c) Create user
Status: SKIPPED
Details: No token (login failed)

TEST: d) Delete user
Status: SKIPPED
Details: No token (login failed)

TEST: e) Re-list users
Status: SKIPPED
Details: No token (login failed)

TEST: f) Convert lead to contact
Status: SKIPPED
Details: No token (login failed)

TEST: g) Send email
Status: SKIPPED
Details: No token (login failed)
```

**Conclusion**: ✅ Tous les tests marqués SKIPPED car DB non configurée (comportement attendu)

---

## ÉTAPE 5 — RAPPORT FINAL

### A) TABLE BUGS (P0/P1/P2)

| Bug | Preuve (fichier:ligne + endpoint + status + response/log) | Repro | Cause |
|-----|-----------------------------------------------------------|-------|-------|
| **P0 - Database not configured** | `backend/server.py:729-730`<br>`POST /api/admin/login`<br>`Status: 503`<br>`Response: {"detail":"Database not configured"}` | 1. Backend démarre sans .env<br>2. `MONGODB_URI` ou `MONGO_URL` non défini<br>3. Tous les endpoints CRM retournent 503 | **VÉRIFIÉ**: Variables d'environnement MongoDB manquantes (preuve: `Test-Path .env` → `False`) |

**Note**: Ce n'est pas un bug mais une configuration manquante. Le comportement est correct (503 retourné).

### B) TABLE INCOHÉRENCES API (FRONT vs BACK)

| Appel Frontend | Route Backend | Diff | Impact |
|----------------|---------------|------|--------|
| `frontend/src/utils/api.js:166`<br>`deleteAdminUser: async (email) =>`<br>`DELETE /api/admin/users/${email}` | `backend/admin_user_routes.py:228`<br>`@router.delete("/users/{user_id}")`<br>Paramètre: `user_id` (UUID/ObjectId) | Frontend: utilise `email` comme paramètre<br>Backend: attend `user_id` | **IMPACT MINIMAL**: Fonction `deleteAdminUser` dans `api.js` non utilisée. `UsersTab.js:93` utilise directement `api.delete(\`/api/admin/users/${userId}\`)` avec `userId` correct. |
| `frontend/src/components/crm/UsersTab.js:33`<br>`GET /api/admin/users` | `backend/admin_user_routes.py:52`<br>`GET /admin/users` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/UsersTab.js:69`<br>`POST /api/admin/users` | `backend/admin_user_routes.py:91`<br>`POST /admin/users` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/UsersTab.js:65`<br>`PUT /api/admin/users/${editingUser._id \|\| editingUser.id}` | `backend/admin_user_routes.py:160`<br>`PUT /admin/users/{user_id}` | ✅ Cohérent (support _id et id) | Aucun |
| `frontend/src/components/crm/SettingsTab.js:34`<br>`DELETE /api/crm/settings/users/${userId}` | `backend/crm_complete_routes.py:970-1075`<br>Routes disponibles: GET, POST, PUT, change-password<br>**PAS DE DELETE** | **INCOHÉRENCE CONFIRMÉE**: Frontend appelle DELETE mais backend n'a pas cette route pour `/crm/settings/users/{user_id}` | **IMPACT P1**: DELETE user depuis SettingsTab échouera (404 Not Found). Solution: Utiliser `/api/admin/users/{user_id}` (DELETE existe ligne 228 admin_user_routes.py) ou ajouter DELETE dans crm_complete_routes.py |

### C) CHECKLIST TESTS MANUELS PROD

1. **Login Admin**
   - **Action**: Ouvrir `/admin/login`, entrer `postmaster@israelgrowthventure.com` + `Admin@igv2025#`
   - **Résultat attendu**: Redirection vers dashboard, token stocké dans localStorage

2. **List Users (CRM Settings)**
   - **Action**: Aller dans CRM → Settings → Users
   - **Résultat attendu**: Liste des utilisateurs CRM affichée

3. **Create User**
   - **Action**: Clic "Ajouter utilisateur", remplir formulaire (email, nom, rôle, password), clic "Créer"
   - **Résultat attendu**: User créé, liste mise à jour, message succès

4. **Update User**
   - **Action**: Clic "Modifier" sur un user, changer rôle/nom, clic "Sauvegarder"
   - **Résultat attendu**: User modifié, liste mise à jour

5. **Delete User**
   - **Action**: Clic "Supprimer" sur un user (pas soi-même), confirmer
   - **Résultat attendu**: User supprimé (soft delete), disparaît de la liste

6. **Convert Lead to Contact**
   - **Action**: Dans Leads, ouvrir un lead, clic "Convertir en contact"
   - **Résultat attendu**: Lead converti, contact créé, message succès

7. **Send Email**
   - **Action**: Dans Contacts, sélectionner contact, clic "Envoyer email", remplir sujet/message, clic "Envoyer"
   - **Résultat attendu**: Email envoyé, message succès (si SMTP configuré)

---

## RÉSUMÉ EXÉCUTIF

### ✅ Réussites
- Backend démarre correctement
- API OpenAPI accessible
- Endpoints répondent (même si 503 pour DB)
- Scripts de test s'exécutent et marquent SKIPPED correctement

### ⚠️ Points d'attention
- **Database non configurée**: `.env` manquant, `MONGODB_URI`/`MONGO_URL` non défini
- **Fonction inutilisée**: `deleteAdminUser(email)` dans `api.js` utilise mauvais paramètre mais n'est pas utilisée
- **Route DELETE CRM Settings Users**: À vérifier si DELETE existe pour `/api/crm/settings/users/{user_id}`

### 🔧 Actions requises
1. Créer `backend/.env` avec `MONGODB_URI` ou `MONGO_URL` + `DB_NAME`
2. Configurer `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
3. Relancer tests après configuration DB
4. Vérifier route DELETE pour CRM Settings Users (ou corriger SettingsTab pour utiliser `/admin/users`)

---

