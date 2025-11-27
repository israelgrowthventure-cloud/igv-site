# 🚨 ACTION REQUISE : Reconfiguration Render Dashboard

## PROBLÈME ACTUEL
Le service `igv-site` sur Render est configuré comme **Static Site**, mais il doit être un **Web Service Node.js** pour que le routage SPA fonctionne.

**Symptômes** :
- ✅ `https://israelgrowthventure.com/` → 200 OK
- ❌ `https://israelgrowthventure.com/content-editor` → 404 Not Found
- ❌ `https://israelgrowthventure.com/packs` → 404 Not Found
- ❌ Toutes les routes React autres que `/` → 404

**Cause** : Render Static Site ne supporte pas les rewrites pour SPA automatiquement.

---

## SOLUTION : RECONFIGURER LE SERVICE

### 📋 ÉTAPES À SUIVRE SUR RENDER DASHBOARD

1. **Aller sur https://dashboard.render.com**

2. **Sélectionner le service `igv-site`**

3. **Cliquer sur "Settings" dans le menu de gauche**

4. **Vérifier le "Environment"**
   - Si c'est "Static Site" → **C'EST LE PROBLÈME**
   - Il faut créer un nouveau service Node.js

---

## OPTION 1 : CRÉER UN NOUVEAU SERVICE (RECOMMANDÉ)

### Étape 1 : Créer un nouveau Web Service

1. Dashboard Render → **"New +"** → **"Web Service"**

2. **Connecter le repository** : `israelgrowthventure-cloud/igv-site`

3. **Configuration** :
   ```
   Name: igv-site-node
   Region: Frankfurt (EU Central)
   Branch: main
   Runtime: Node
   Build Command: cd frontend && npm install && npm run build
   Start Command: cd frontend && node server.js
   Instance Type: Free
   ```

4. **Variables d'environnement** :
   ```
   NODE_VERSION=18.17.0
   REACT_APP_API_BASE_URL=https://igv-cms-backend.onrender.com
   REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api
   REACT_APP_CALENDAR_EMAIL=israel.growth.venture@gmail.com
   ```

5. **Health Check Path** : `/`

6. **Cliquer sur "Create Web Service"**

### Étape 2 : Configurer le domaine custom

1. Une fois déployé, aller dans **"Settings" → "Custom Domain"**

2. **Ajouter** : `israelgrowthventure.com`

3. **Ajouter** : `www.israelgrowthventure.com`

4. Suivre les instructions DNS (CNAME vers Render)

### Étape 3 : Supprimer l'ancien service Static Site

1. Aller sur l'ancien service `igv-site`

2. **Settings → "Delete Web Service"**

3. Confirmer la suppression

---

## OPTION 2 : FORCER LE REDÉPLOIEMENT AVEC render.yaml

Si Render détecte automatiquement `render.yaml` :

1. Aller sur **Dashboard Render**

2. Service `igv-site` → **"Manual Deploy"**

3. **"Deploy latest commit"** (commit `0217f10`)

4. Attendre 5 minutes

5. **Tester** : `https://israelgrowthventure.com/content-editor`

⚠️ **SI TOUJOURS 404** : Render n'applique pas `render.yaml` automatiquement aux services existants → **Utiliser OPTION 1**

---

## VÉRIFICATION APRÈS DÉPLOIEMENT

Tester TOUTES ces URLs (doivent retourner 200 OK) :

```bash
# Pages CMS
✅ https://israelgrowthventure.com/
✅ https://israelgrowthventure.com/packs
✅ https://israelgrowthventure.com/about
✅ https://israelgrowthventure.com/contact
✅ https://israelgrowthventure.com/future-commerce

# Pages Admin
✅ https://israelgrowthventure.com/content-editor  ← CRITIQUE
✅ https://israelgrowthventure.com/admin

# Pages techniques
✅ https://israelgrowthventure.com/checkout/analyse
✅ https://israelgrowthventure.com/appointment
```

**Commandes de test PowerShell** :
```powershell
$urls = @(
  "https://israelgrowthventure.com/",
  "https://israelgrowthventure.com/content-editor",
  "https://israelgrowthventure.com/packs",
  "https://israelgrowthventure.com/checkout/analyse"
)

foreach ($url in $urls) {
  $status = curl.exe -s -I $url 2>&1 | Select-String "HTTP/" | Select-Object -First 1
  Write-Host "$url → $status"
}
```

---

## 🎯 RÉSULTAT ATTENDU FINAL

Après configuration :

✅ **Backend CMS** : `https://igv-cms-backend.onrender.com/api/health` → 200 OK
✅ **Frontend Node.js** : Toutes les routes → 200 OK
✅ **Content Editor** : `https://israelgrowthventure.com/content-editor` → Interface drag-and-drop visible
✅ **Pas de 404** : Toutes les pages CMS chargent correctement
✅ **Stripe checkout** : `/checkout/:packId` fonctionne
✅ **Calendar** : `/appointment` fonctionne

---

## 📊 ÉTAT ACTUEL DU CODE

**Commits effectués** :
- `f507c57` : Correction `_redirects` 
- `0853881` : Ajout `render.yaml` initial (Static Site)
- `0217f10` : **Correction `render.yaml` pour Node.js** ✅

**Fichiers critiques** :
- ✅ `frontend/server.js` : Serveur Express avec SPA routing (testé localement → 200 OK)
- ✅ `frontend/src/App.js` : Route `/content-editor` définie
- ✅ `frontend/public/_redirects` : Règle SPA `/* /index.html 200`
- ✅ `render.yaml` : Configuration Node.js complète

**Tests locaux** :
- ✅ `http://localhost:3000/content-editor` → 200 OK
- ✅ `http://localhost:3000/packs` → 200 OK
- ✅ Serveur Express fonctionne parfaitement

**Tests production** :
- ❌ `https://israelgrowthventure.com/content-editor` → 404 (service encore Static Site)
- ❌ Toutes routes sauf `/` → 404

---

## ⚡ ACTION IMMÉDIATE

**ALLER SUR RENDER DASHBOARD ET CRÉER UN NOUVEAU WEB SERVICE NODE.JS**

Le code est prêt, il ne reste qu'à configurer Render correctement.

Temps estimé : 10 minutes
Difficulté : Facile (juste de la configuration UI)

---

**Dernière modification** : 27 novembre 2025, 22:40 UTC
**Commits concernés** : `f507c57`, `0853881`, `0217f10`
**Status** : 🟡 En attente d'action manuelle sur Render Dashboard
