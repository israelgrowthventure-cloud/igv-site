# AUTHENTIFICATION, UTILISATEURS ET RÔLES
## Date: 30 décembre 2025

---

## 1. SYSTÈME D'AUTHENTIFICATION

### Backend - Mécanisme JWT

**Fichier:** `backend/server.py`
**Lignes:** 300-400

### Configuration JWT

```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 heures
```

### Fonctions d'authentification

| Fonction | Lignes | Description |
|----------|--------|-------------|
| `create_access_token()` | 330-340 | Crée token JWT avec expiration |
| `verify_token()` | 342-355 | Vérifie et decode le token |
| `get_current_user()` | 357-385 | Dependency - extrait user du token |

### Structure Token

```python
payload = {
    "sub": str(user_id),          # Subject - user ID
    "email": user["email"],       # Email
    "role": user.get("role", "viewer"),  # Role
    "exp": datetime.utcnow() + timedelta(minutes=expire)  # Expiration
}
```

---

## 2. ENDPOINTS D'AUTHENTIFICATION

### Admin Auth

| Endpoint | Méthode | Fichier | Description |
|----------|---------|---------|-------------|
| `/api/admin/register` | POST | server.py | Créer compte admin |
| `/api/admin/login` | POST | server.py | Login admin → token |
| `/api/admin/me` | GET | server.py | Info user courant |

### Register Admin (server.py ligne 396-445)

**Input:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Processus:**
1. Vérifie email non existant
2. Hash password avec bcrypt (ou SHA256 fallback)
3. Crée document user dans MongoDB
4. Retourne token JWT

**Output:**
```json
{
  "message": "Admin registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@example.com"
}
```

### Login Admin (server.py ligne 447-490)

**Input:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Processus:**
1. Recherche user par email
2. Vérifie password hash
3. Génère access token
4. Retourne token + user info

**Output:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

## 3. COLLECTIONS UTILISATEURS

### Collection: `users` (Admin Backend)

**Base:** MongoDB `igv_crm_db`

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID unique |
| `email` | string | Email (unique) |
| `password` | string | Hash bcrypt |
| `role` | string | "admin" |
| `created_at` | datetime | Date création |

### Collection: `crm_users` (CRM)

**Base:** MongoDB `igv_crm_db`

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID unique |
| `email` | string | Email (unique) |
| `password` | string | Hash bcrypt |
| `name` | string | Nom complet |
| `role` | string | "admin", "sales", "viewer" |
| `is_active` | bool | Compte actif |
| `created_at` | datetime | Date création |
| `updated_at` | datetime | Dernière modif |

---

## 4. RÔLES ET PERMISSIONS

### Rôles définis

| Rôle | Niveau | Description |
|------|--------|-------------|
| `admin` | 100 | Accès complet, gestion users |
| `sales` | 50 | CRM complet, pas Settings |
| `viewer` | 10 | Lecture seule |

### Permissions par fonction (crm_complete_routes.py)

| Endpoint | admin | sales | viewer |
|----------|-------|-------|--------|
| GET /leads | ✅ | ✅ | ✅ |
| POST /leads | ✅ | ✅ | ❌ |
| PUT /leads/{id} | ✅ | ✅ | ❌ |
| DELETE /leads/{id} | ✅ | ❌ | ❌ |
| GET /settings | ✅ | ❌ | ❌ |
| POST /users | ✅ | ❌ | ❌ |
| PUT /users/{id} | ✅ | ❌ | ❌ |

### Vérification des rôles (backend)

```python
# crm_complete_routes.py - ligne 150
async def check_permission(current_user: dict, required_role: str):
    role_levels = {"viewer": 1, "sales": 2, "admin": 3}
    if role_levels.get(current_user.get("role", "viewer"), 0) < role_levels.get(required_role, 0):
        raise HTTPException(status_code=403, detail="Permission denied")
```

---

## 5. FRONTEND AUTH FLOW

### Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `pages/admin/Login.js` | Page login |
| `services/api.js` | Calls API |
| `components/PrivateRoute.js` | Protection routes |

### Login.js Flow

```javascript
// 1. Submit form
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // 2. Call API
    const response = await api.adminLogin({ email, password });
    
    // 3. Store token
    localStorage.setItem('admin_token', response.data.access_token);
    
    // 4. Redirect
    navigate('/admin/dashboard');
  } catch (error) {
    toast.error('Invalid credentials');
  }
};
```

### PrivateRoute.js

```javascript
// Protection des routes admin
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};
```

### api.js - Auth Header

```javascript
// Interceptor ajout token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 6. HASH PASSWORDS

### Méthode principale: bcrypt

```python
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
```

### Fallback: SHA256 (si bcrypt non dispo)

```python
import hashlib

def hash_password_sha256(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
```

---

## 7. VARIABLES D'ENVIRONNEMENT AUTH

| Variable | Usage | Valeur défaut |
|----------|-------|---------------|
| `JWT_SECRET_KEY` | Signature tokens | "your-secret-key" |
| `ADMIN_EMAIL` | Email admin initial | - |
| `ADMIN_PASSWORD` | Password admin initial | - |

**⚠️ WARNING:** `JWT_SECRET_KEY` par défaut est insécure en production.

---

## 8. ENDPOINTS CRM AUTH

### User Management (crm_complete_routes.py)

| Endpoint | Méthode | Auth Required | Admin Only |
|----------|---------|---------------|------------|
| `GET /api/crm/users` | GET | ✅ | ✅ |
| `POST /api/crm/users` | POST | ✅ | ✅ |
| `PUT /api/crm/users/{id}` | PUT | ✅ | ✅ |
| `DELETE /api/crm/users/{id}` | DELETE | ✅ | ✅ |
| `POST /api/crm/auth/login` | POST | ❌ | - |

### CRM Login (crm_complete_routes.py)

```python
@router.post("/auth/login")
async def crm_login(credentials: CRMLoginCredentials):
    user = await db.crm_users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    
    token = create_access_token(data={
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "viewer")
    })
    
    return {"access_token": token, "token_type": "bearer"}
```

---

## 9. DOUBLE SYSTÈME AUTH

### Observation

Il existe **DEUX** systèmes d'authentification:

| Système | Collection | Endpoints | Usage |
|---------|------------|-----------|-------|
| Admin Legacy | `users` | `/api/admin/*` | Dashboard admin |
| CRM Auth | `crm_users` | `/api/crm/auth/*` | CRM module |

### Problème potentiel

- Un user dans `users` n'a pas accès CRM
- Un user dans `crm_users` n'a pas accès admin legacy
- Pas de synchronisation entre les deux

### Recommandation

Unifier les systèmes vers `crm_users` uniquement.

---

## 10. TOKENS ET EXPIRATION

### Configuration actuelle

| Paramètre | Valeur |
|-----------|--------|
| Algorithme | HS256 |
| Expiration | 24 heures |
| Storage | localStorage |

### Structure décodée

```json
{
  "sub": "675e4c2a8f3b2d1a0c9e8b7a",
  "email": "admin@igv.com",
  "role": "admin",
  "exp": 1735545600,
  "iat": 1735459200
}
```

---

## RÉSUMÉ AUTH

| Aspect | Status | Note |
|--------|--------|------|
| JWT Implementation | ✅ OK | Standard |
| Password Hashing | ✅ OK | bcrypt |
| Frontend Protection | ✅ OK | PrivateRoute |
| Role-Based Access | ✅ OK | 3 niveaux |
| Token Storage | ⚠️ | localStorage vulnérable XSS |
| Dual Auth System | ⚠️ | À unifier |
| Secret Key | ⚠️ | Défaut insécure |

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
