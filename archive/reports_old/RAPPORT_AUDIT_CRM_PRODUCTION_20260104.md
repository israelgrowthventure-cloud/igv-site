# 📋 RAPPORT AUDIT CRM PRODUCTION - ENVIRONNEMENT TEST
**Date**: 2026-01-04 16:00:39  
**Environnement**: Production (TEST autorisé)  
**API_BASE**: `https://igv-cms-backend.onrender.com/api`  
**Frontend**: `https://israelgrowthventure.com/admin`

---

## 1) IDENTIFICATION API_BASE

### PREUVE 1.1 - Login endpoint test
**URL testée**: `https://igv-cms-backend.onrender.com/api/admin/login`  
**Status**: 200  
**API_BASE confirmé**: `https://igv-cms-backend.onrender.com/api`

---

## 2) TESTS API DIRECTS (PREUVES BRUTES)

### 2.A) GET OpenAPI JSON

**Endpoint**: `GET https://igv-cms-backend.onrender.com/api/openapi.json`  
**Status**: 404  
**Response**:
```json
{"detail":"Not Found"}
```

**Conclusion**: Endpoint OpenAPI non disponible (non critique)

### 2.B) POST Admin Login

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/admin/login`  
**Payload**:
```json
{
  "email": "postmaster@israelgrowthventure.com",
  "password": "Admin@igv2025#"
}
```

**Status**: 200  
**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "admin"
}
```

**Conclusion**: ✅ Login fonctionnel

---

## 3) BATTERIE DE TESTS CRM (PREUVES BRUTES)

### 3.A) USERS - Tests complets

#### 3.A.1) List Users (AVANT création)

**Endpoint**: `GET https://igv-cms-backend.onrender.com/api/admin/users`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response**:
```json
{
  "users": [
    {
      "_id": "74440eba-5f4c-41d8-8d29-8d2915feecf5",
      "id": "74440eba-5f4c-41d8-8d29-8d2915feecf5",
      "email": "postmaster@israelgrowthventure.com",
      "first_name": "mickael",
      "last_name": "benmoussa",
      "role": "admin",
      "is_active": true,
      "assigned_leads": [],
      "created_at": "2026-01-04T05:50:08.535000",
      "last_login": null
    }
  ],
  "total": 1
}
```

**Conclusion**: ✅ 1 user existant

#### 3.A.2) Create User (commercial)

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/admin/users`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "email": "test_user_commercial_1_1767535245@igvtest.com",
  "first_name": "TestCommercial",
  "last_name": "User1",
  "password": "TestPass123!",
  "role": "commercial"
}
```

**Status**: 201  
**Response**:
```json
{
  "success": true,
  "user_id": "b6fdd034-8f84-4bf3-ad01-7a40feaba847",
  "user": {
    "id": "b6fdd034-8f84-4bf3-ad01-7a40feaba847",
    "_id": "b6fdd034-8f84-4bf3-ad01-7a40feaba847",
    "email": "test_user_commercial_1_1767535245@igvtest.com",
    "first_name": "TestCommercial",
    "last_name": "User1",
    "role": "commercial"
  },
  "message": "User created successfully"
}
```

**Conclusion**: ✅ User commercial créé

#### 3.A.3) Create User (admin)

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/admin/users`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "email": "test_user_admin_2_1767535247@igvtest.com",
  "first_name": "TestAdmin",
  "last_name": "User2",
  "password": "TestPass123!",
  "role": "admin"
}
```

**Status**: 201  
**Response**:
```json
{
  "success": true,
  "user_id": "aa680fe3-b0aa-4824-8fff-abe3cb3c3bb4",
  "user": {
    "id": "aa680fe3-b0aa-4824-8fff-abe3cb3c3bb4",
    "_id": "aa680fe3-b0aa-4824-8fff-abe3cb3c3bb4",
    "email": "test_user_admin_2_1767535247@igvtest.com",
    "first_name": "TestAdmin",
    "last_name": "User2",
    "role": "admin"
  },
  "message": "User created successfully"
}
```

**Conclusion**: ✅ User admin créé

#### 3.A.4) Update User

**Endpoint**: `PUT https://igv-cms-backend.onrender.com/api/admin/users/b6fdd034-8f84-4bf3-ad01-7a40feaba847`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "first_name": "UpdatedFirst",
  "last_name": "UpdatedLast"
}
```

**Status**: 200  
**Response**:
```json
{"success":true,"message":"User updated successfully"}
```

**Conclusion**: ✅ User modifié

#### 3.A.5) Delete User (commercial)

**Endpoint**: `DELETE https://igv-cms-backend.onrender.com/api/admin/users/b6fdd034-8f84-4bf3-ad01-7a40feaba847`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response**:
```json
{"success":true,"message":"User deleted successfully"}
```

**Conclusion**: ✅ User commercial supprimé

#### 3.A.6) Delete User (admin)

**Endpoint**: `DELETE https://igv-cms-backend.onrender.com/api/admin/users/aa680fe3-b0aa-4824-8fff-abe3cb3c3bb4`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response**:
```json
{"success":true,"message":"User deleted successfully"}
```

**Conclusion**: ✅ User admin supprimé

#### 3.A.7) List Users (APRÈS suppression)

**Endpoint**: `GET https://igv-cms-backend.onrender.com/api/admin/users`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response**:
```json
{
  "users": [
    {
      "_id": "74440eba-5f4c-41d8-8d29-8d2915feecf5",
      "id": "74440eba-5f4c-41d8-8d29-8d2915feecf5",
      "email": "postmaster@israelgrowthventure.com",
      "first_name": "mickael",
      "last_name": "benmoussa",
      "role": "admin",
      "is_active": true,
      "assigned_leads": [],
      "created_at": "2026-01-04T05:50:08.535000",
      "last_login": null
    }
  ],
  "total": 1
}
```

**Conclusion**: ✅ Users supprimés n'apparaissent plus (soft delete fonctionne)

---

### 3.B) PROSPECTS / CONTACTS

#### 3.B.1) Create Lead

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/crm/leads`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "email": "testlead_1767535257@igvtest.com",
  "brand_name": "Test Brand 1767535257",
  "name": "Test Contact",
  "phone": "+972501234567",
  "language": "fr",
  "sector": "Tech"
}
```

**Status**: 201  
**Response**:
```json
{
  "lead_id": "695a729ac0ae99e54ef61768",
  "message": "Lead created successfully"
}
```

**Conclusion**: ✅ Lead créé

#### 3.B.2) Get Lead (structure complète)

**Endpoint**: `GET https://igv-cms-backend.onrender.com/api/crm/leads/695a729ac0ae99e54ef61768`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response** (extrait):
```json
{
  "_id": "695a729ac0ae99e54ef61768",
  "email": "testlead_1767535257@igvtest.com",
  "brand_name": "Test Brand 1767535257",
  "name": "Test Contact",
  "phone": "+972501234567",
  "sector": "Tech",
  "language": "fr",
  "status": "NEW",
  "stage": "analysis_requested",
  "priority": "B",
  "created_at": "2026-01-04T14:00:58.266000",
  "updated_at": "2026-01-04T14:00:58.266000",
  "request_count": 1,
  "activities": [...]
}
```

**Stockage analyse** (VÉRIFIÉ via code):
- Les analyses mini-analysis sont stockées dans la collection `mini_analyses` (backend/mini_analysis_routes.py:1237-1253)
- Un lead peut référencer une analyse via `mini_analysis_id` (backend/migrate_mini_analyses.py:100)
- Le lead créé manuellement n'a pas d'analyse associée (normal, créé via API CRM, pas via mini-analysis endpoint)

**Conclusion**: ✅ Structure lead récupérée, pas d'analyse associée (création manuelle)

#### 3.B.3) Convert Lead to Contact

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/crm/leads/695a729ac0ae99e54ef61768/convert-to-contact`  
**Headers**: `Authorization: Bearer {token}`  
**Status**: 200  
**Response**:
```json
{
  "contact_id": "695a729dc0ae99e54ef6176a",
  "message": "Lead converted successfully"
}
```

**Vérification lead après conversion** (via API):
**Endpoint**: `GET https://igv-cms-backend.onrender.com/api/crm/leads/695a729ac0ae99e54ef61768`  
**Status**: 200  
**Response** (extrait):
```json
{
  "status": "CONVERTED",
  "converted_to_contact_id": "695a729dc0ae99e54ef6176a",
  "activities": [
    {
      "type": "conversion",
      "subject": "Lead converted to contact",
      "contact_id": "695a729dc0ae99e54ef6176a"
    }
  ]
}
```

**Conclusion**: ✅ Lead converti en contact, status mis à jour à "CONVERTED", `converted_to_contact_id` renseigné, activité de conversion créée

---

### 3.C) OPPORTUNITÉS / PIPELINE

#### 3.C.1) Create Opportunity

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/crm/opportunities`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "name": "Test Opportunity 1767535262",
  "value": 50000,
  "stage": "qualification",
  "probability": 50
}
```

**Status**: 201  
**Response**:
```json
{
  "opportunity_id": "695a729fc0ae99e54ef6176c",
  "message": "Opportunity created successfully"
}
```

**Conclusion**: ✅ Opportunity créée

#### 3.C.2) Update Opportunity Stage

**Endpoint**: `PUT https://igv-cms-backend.onrender.com/api/crm/opportunities/695a729fc0ae99e54ef6176c`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "stage": "proposal"
}
```

**Status**: 200  
**Response**:
```json
{"message":"Opportunity updated successfully"}
```

**Conclusion**: ✅ Stage opportunity mis à jour (pipeline fonctionnel)

---

### 3.D) EMAILS CRM

#### 3.D.1) Create Email Template

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/crm/emails/templates`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "name": "Test Template 1767535266",
  "subject": "Test Email Subject",
  "body": "Hello {name}, this is a test template.",
  "language": "fr"
}
```

**Status**: 500  
**Response**:
```json
{
  "error": "Internal Server Error",
  "message": "name 'require_role' is not defined",
  "error_id": "err_20260104_140107_169330",
  "error_type": "NameError"
}
```

**Conclusion**: ❌ BUG P1 - `require_role` non défini

#### 3.D.2) Send Email

**Endpoint**: `POST https://igv-cms-backend.onrender.com/api/crm/emails/send`  
**Headers**: `Authorization: Bearer {token}`  
**Payload**:
```json
{
  "to_email": "test@example.com",
  "subject": "Test Email from CRM Audit",
  "message": "This is a test email sent from CRM audit script."
}
```

**Status**: 500  
**Response**:
```json
{
  "detail": "Failed to send email: [SMTPRecipientRefused(556, '5.1.10 <test@example.com> <test@example.com>: Recipient address rejected: Domain example.com does not accept mail (nullMX)', 'test@example.com')]"
}
```

**Conclusion**: ⚠️ Échec attendu (test@example.com n'accepte pas les emails), SMTP fonctionne mais email rejeté par le domaine

---

## 4) RAPPORT FINAL

### A) TABLE BUGS (P0/P1/P2)

| Bug | Preuve (fichier:ligne + endpoint + payload + status + sortie/log) | Repro | Cause |
|-----|-------------------------------------------------------------------|-------|-------|
| **P1 - Create Email Template Error** | **Fichier**: `backend/crm_complete_routes.py:1458`<br>**Endpoint**: `POST /api/crm/emails/templates`<br>**Payload**: `{"name": "Test Template", "subject": "Test", "body": "Hello {name}", "language": "fr"}`<br>**Status attendu**: 201<br>**Status obtenu**: 500<br>**Response brute**: `{"error":"Internal Server Error","message":"name 'require_role' is not defined","error_id":"err_20260104_140107_169330","error_type":"NameError"}` | 1. POST `/api/crm/emails/templates` avec payload valide<br>2. Status 500 retourné<br>3. Error: NameError - `require_role` not defined | **VÉRIFIÉ**: `require_role` est utilisé ligne 1458 mais n'est pas importé. Les autres endpoints (lignes 973, 993, 1041, 1140) utilisent aussi `require_role` mais importent depuis `auth_middleware`. Ligne 1458 manque l'import. |
| **P2 - OpenAPI JSON 404** | **Endpoint**: `GET /api/openapi.json`<br>**Status**: 404<br>**Response**: `{"detail":"Not Found"}` | GET `/api/openapi.json` retourne 404 | **NON VÉRIFIÉ** - Endpoint peut être à `/openapi.json` (sans /api) ou simplement non exposé (non critique) |

### B) TABLE INCOHÉRENCES API (FRONTEND vs BACKEND)

| Appel Frontend | Route Backend | Diff | Impact |
|----------------|---------------|------|--------|
| `frontend/src/components/crm/UsersTab.js:33`<br>`GET /api/admin/users` | `backend/admin_user_routes.py:52`<br>`GET /admin/users` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/UsersTab.js:69`<br>`POST /api/admin/users` | `backend/admin_user_routes.py:91`<br>`POST /admin/users` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/UsersTab.js:65`<br>`PUT /api/admin/users/${id}` | `backend/admin_user_routes.py:160`<br>`PUT /admin/users/{user_id}` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/UsersTab.js:93`<br>`DELETE /api/admin/users/${userId}` | `backend/admin_user_routes.py:228`<br>`DELETE /admin/users/{user_id}` | ✅ Cohérent | Aucun |
| `frontend/src/components/crm/SettingsTab.js:34`<br>`DELETE /api/crm/settings/users/${userId}` | `backend/crm_complete_routes.py:970-1075`<br>Routes: GET, POST, PUT, change-password<br>**PAS DE DELETE** | **INCOHÉRENCE CONFIRMÉE**: Frontend appelle DELETE mais backend n'a pas cette route | **IMPACT P1**: DELETE user depuis SettingsTab échouera (404 Not Found). Solution: Utiliser `/api/admin/users/{user_id}` (DELETE existe) ou ajouter DELETE dans crm_complete_routes.py |
| `frontend/src/components/crm/EmailsTab.js:47`<br>`POST /api/crm/emails/templates` | `backend/crm_complete_routes.py:1456`<br>`POST /crm/emails/templates` | ✅ Cohérent (mais bug backend) | **IMPACT P1**: Création template échouera (500 Error) |

### C) CHECKLIST TESTS MANUELS PROD

1. **Login Admin**
   - **Action**: Ouvrir `https://israelgrowthventure.com/admin/login`, entrer `postmaster@israelgrowthventure.com` / `Admin@igv2025#`
   - **Résultat attendu**: ✅ Redirection vers dashboard, token stocké dans localStorage

2. **List Users (CRM Settings)**
   - **Action**: Aller dans CRM → Settings → Users
   - **Résultat attendu**: ✅ Liste des utilisateurs CRM affichée (1 user: postmaster@israelgrowthventure.com)

3. **Create User**
   - **Action**: Clic "Ajouter utilisateur", remplir formulaire (email, nom, rôle, password), clic "Créer"
   - **Résultat attendu**: ✅ User créé, liste mise à jour, message succès

4. **Update User**
   - **Action**: Clic "Modifier" sur un user, changer nom/prénom, clic "Sauvegarder"
   - **Résultat attendu**: ✅ User modifié, liste mise à jour

5. **Delete User**
   - **Action**: Clic "Supprimer" sur un user (pas soi-même), confirmer
   - **Résultat attendu**: ✅ User supprimé (soft delete), disparaît de la liste

6. **Create Lead**
   - **Action**: CRM → Leads → "Ajouter lead", remplir formulaire, sauvegarder
   - **Résultat attendu**: ✅ Lead créé avec status "NEW", stage "analysis_requested"

7. **Convert Lead to Contact**
   - **Action**: Dans Leads, ouvrir un lead, clic "Convertir en contact"
   - **Résultat attendu**: ✅ Contact créé, lead status "CONVERTED", `converted_to_contact_id` renseigné

8. **Create Opportunity**
   - **Action**: CRM → Opportunities → "Ajouter opportunité", remplir formulaire, sauvegarder
   - **Résultat attendu**: ✅ Opportunity créée avec stage initial

9. **Update Opportunity Stage (Pipeline)**
   - **Action**: Pipeline view, déplacer card opportunity vers autre stage
   - **Résultat attendu**: ✅ Stage mis à jour (ex: qualification → proposal)

10. **Create Email Template**
    - **Action**: CRM → Emails → Templates → "Créer template", remplir formulaire, sauvegarder
    - **Résultat attendu**: ❌ **BUG** - Status 500, error "require_role not defined"

11. **Send Email**
    - **Action**: Dans Contacts, sélectionner contact, clic "Envoyer email", remplir sujet/message, envoyer
    - **Résultat attendu**: ⚠️ Email envoyé si destinataire valide (sinon erreur SMTP attendue)

---

## RÉSUMÉ EXÉCUTIF

### ✅ Tests réussis (14/17)
- Login admin
- Users CRUD (create, update, delete, list)
- Leads (create, get, convert to contact)
- Opportunities (create, update stage)

### ❌ Bugs identifiés (2)
- **P1**: Create Email Template - `require_role` not defined (backend/crm_complete_routes.py:1458)
- **P2**: OpenAPI JSON endpoint 404 (non critique)

### ⚠️ Incohérences API (1)
- DELETE `/api/crm/settings/users/{user_id}` n'existe pas (utiliser `/api/admin/users/{user_id}`)

### 📊 Statistiques
- **Total tests**: 17
- **Passed**: 14
- **Failed**: 3 (1 bug P1, 1 bug P2, 1 SMTP rejection attendue)
- **API_BASE**: `https://igv-cms-backend.onrender.com/api`

---

**Rapport généré le**: 2026-01-04 16:00:39  
**Script de test**: `test_crm_production_audit.py`  
**Résultats JSON**: `crm_audit_results.json`

