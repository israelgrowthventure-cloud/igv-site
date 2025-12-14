# 🚀 INSTRUCTIONS RENDER DASHBOARD - DÉPLOIEMENT URGENT

## ⚠️ PROBLÈME ACTUEL
- **Build déployé** : `main.4130aa42.js` (ANCIEN)
- **Build attendu** : `main.43242eee.js` (NOUVEAU)
- **8 commits** ont été poussés mais Render n'a PAS redéployé

## 🎯 ACTIONS REQUISES SUR LE DASHBOARD RENDER

### Étape 1 : Vérifier Auto-Deploy

1. Aller sur : https://dashboard.render.com
2. Sélectionner le service **`igv-site`**
3. Cliquer sur **"Settings"** (dans le menu latéral)
4. Scroll jusqu'à **"Build & Deploy"**
5. Vérifier **"Auto-Deploy"** :
   - ✅ Si **OFF** → **ACTIVER** (toggle sur YES)
   - Branch : `main`
   - ✅ Sauvegarder les changements

### Étape 2 : Vérifier la Configuration Build

Dans **Settings > Build & Deploy**, vérifier :

**Build Command** (doit être) :
```bash
bash .render-build.sh
```
OU si pas de script :
```bash
npm ci && npm run build
```

**Start Command** (doit être) :
```bash
npm start
```

**Root Directory** :
```
frontend
```

### Étape 3 : Forcer un Deploy Manuel avec Clear Cache

1. Retourner à l'onglet **"Events"** ou **"Deploys"**
2. Cliquer sur le bouton **"Manual Deploy"** (en haut à droite)
3. **IMPORTANT** : Cocher **"Clear build cache"** ✅
4. Branch : `main`
5. Cliquer **"Deploy"**

### Étape 4 : Surveiller les Logs

1. Aller dans l'onglet **"Logs"**
2. Attendre que le build commence (1-2 minutes)
3. Vérifier les étapes :
   - ✅ `Installing dependencies...` → npm ci doit réussir
   - ✅ `Building React application...` → react-scripts build doit réussir
   - ✅ `Build hash: 43242eee` → doit afficher le NOUVEAU hash
   - ✅ `Deploy live` → le service doit devenir "Live"

**Durée attendue** : 5-7 minutes (clean build)

### Étape 5 : Vérifier le Déploiement

Une fois "Live" dans les logs :

**Test 1 - URL Render** :
```
https://igv-site.onrender.com/?v=test
```
- Ouvrir la Console Chrome (F12)
- Onglet Network
- Vérifier que le fichier chargé est `main.43242eee.js` (ou plus récent)

**Test 2 - Domaine Custom** :
```
https://israelgrowthventure.com/?v=test
```
- Même vérification
- Si ancien build : **Purger le cache Cloudflare** (voir section suivante)

## 🔧 SI LE BUILD ÉCHOUE

### Erreur possible #1 : `npm ci` fails

**Solution** : Changer Build Command vers :
```bash
rm -rf node_modules && npm install && npm run build
```

### Erreur possible #2 : Permission denied sur .render-build.sh

**Solution** : Build Command :
```bash
chmod +x .render-build.sh && bash .render-build.sh
```

### Erreur possible #3 : Module not found

**Vérifier** : 
- `frontend/package.json` existe
- `frontend/package-lock.json` existe
- Tous les packages sont listés dans dependencies

## 📍 CONFIGURATION DOMAINE CUSTOM

Dans **Settings > Custom Domains** :
- Vérifier que `israelgrowthventure.com` ET `www.israelgrowthventure.com` pointent vers `igv-site`

## 🔥 PURGE CACHE CLOUDFLARE

Si Cloudflare est devant le domaine :

1. Dashboard Cloudflare → Sélectionner `israelgrowthventure.com`
2. **"Caching"** → **"Configuration"**
3. Cliquer **"Purge Everything"**
4. Confirmer
5. Attendre 30 secondes puis retester

## ✅ VÉRIFICATION FINALE

Quand tout est OK :

```bash
# Test Render direct
curl -I https://igv-site.onrender.com/ | grep -i "x-render"

# Test domaine
curl -s https://israelgrowthventure.com/ | grep -o 'main\.[a-z0-9]*\.js' | head -1
```

Doit afficher : `main.43242eee.js` (ou hash plus récent)

## 📊 RÉSUMÉ DES ACTIONS

1. ✅ **Activer Auto-Deploy** sur branche `main`
2. ✅ **Build Command** : `bash .render-build.sh` OU `npm ci && npm run build`
3. ✅ **Manual Deploy** avec **Clear build cache**
4. ✅ **Surveiller logs** jusqu'à "Deploy live"
5. ✅ **Tester les URLs** avec `?v=timestamp`
6. ✅ **Purger Cloudflare** si nécessaire

---

**Dernière mise à jour** : 2025-12-02 16:00
**Commits en attente** : 8 commits depuis le dernier deploy réussi
**Hash attendu** : `main.43242eee.js`
