# Configuration DB_NAME sur Render - Guide Urgent

## 🚨 PROBLÈME IDENTIFIÉ

Le backend `igv-cms-backend` n'utilise **PAS** la base de données `IGV-Cluster`.
Les données admin et pages Étude 360° existent dans `IGV-Cluster` mais le backend consulte une autre base (probablement l'ancienne `igv_database`).

## ✅ SOLUTION

Configurer la variable d'environnement `DB_NAME=IGV-Cluster` sur le service Render backend.

---

## 📋 PROCÉDURE MANUELLE (5 minutes)

### Étape 1 : Se connecter à Render Dashboard
1. Ouvrir https://dashboard.render.com
2. Se connecter avec le compte IGV

### Étape 2 : Accéder au service backend
1. Dans la liste des services, cliquer sur **`igv-cms-backend`**
2. Aller dans l'onglet **Environment**

### Étape 3 : Ajouter/Modifier DB_NAME
**Option A - Si DB_NAME existe déjà:**
1. Trouver la variable `DB_NAME` dans la liste
2. Cliquer sur **Edit**
3. Changer la valeur pour : `IGV-Cluster`
4. Cliquer sur **Save Changes**

**Option B - Si DB_NAME n'existe pas:**
1. Cliquer sur **Add Environment Variable**
2. Key: `DB_NAME`
3. Value: `IGV-Cluster`
4. Cliquer sur **Save Changes**

### Étape 4 : Redémarrage automatique
- Render va automatiquement redémarrer le backend (2-3 minutes)
- Attendre que le statut passe à **Live**

### Étape 5 : Vérification
Après 3 minutes, tester :

```powershell
# Test 1 - Login admin
Invoke-RestMethod -Uri "https://igv-cms-backend.onrender.com/api/auth/login" `
  -Method Post `
  -Body '{"email":"postmaster@israelgrowthventure.com","password":"Admin@igv2025#"}' `
  -ContentType "application/json"

# Test 2 - Page étude-360
Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-360"

# Test 3 - Page merci
Invoke-WebRequest -Uri "https://igv-cms-backend.onrender.com/api/pages/etude-implantation-merci"
```

---

## 🔧 ALTERNATIVE : Via API Render (si clé disponible)

Si vous avez accès à `RENDER_API_KEY`:

```powershell
$env:RENDER_API_KEY = "rnd_..."
cd 'C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\backend'
python fix_render_db_name.py
```

---

## 📊 ÉTAT ACTUEL

### ✅ Données correctes en DB
- Admin `postmaster@israelgrowthventure.com` avec hash bcrypt : **EXISTE** dans `IGV-Cluster`
- Page `etude-implantation-360` : **EXISTE** dans `IGV-Cluster`
- Page `etude-implantation-merci` : **EXISTE** dans `IGV-Cluster`

### ❌ Backend pointe sur mauvaise DB
- API `/api/pages` retourne 5 pages (home, packs, about-us, contact, le-commerce-de-demain)
- API `/api/pages/etude-implantation-360` → 404
- API `/auth/login` (postmaster) → 401

### 🎯 Après correction DB_NAME
- Login admin fonctionnera
- Pages Étude 360° seront accessibles via API
- Phase 1ter sera validée
- Phase 2A (payment/success) pourra démarrer

---

## 🔗 LIENS UTILES

- **Render Dashboard**: https://dashboard.render.com
- **Service Backend**: https://dashboard.render.com/web/srv-cr64m4pu0jms73cnqplg
- **Documentation Render Env Vars**: https://render.com/docs/environment-variables

---

## 📝 NOTE IMPORTANTE

**Sans cette modification, aucun des endpoints Phase 1ter ne fonctionnera.**
Le problème n'est PAS dans le code, mais uniquement dans la configuration Render.

Une fois `DB_NAME=IGV-Cluster` configuré, tous les tests passeront immédiatement.
