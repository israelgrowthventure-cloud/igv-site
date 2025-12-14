# 🔧 Guide de correction du problème 404 sur Render

## ⚠️ Problème identifié

Sur https://israelgrowthventure.com :
- **Écran blanc**
- **Fichiers `/static/js/*` et `/static/css/*` retournent 404**
- **MIME type `text/plain` au lieu de `application/javascript` et `text/css`**

## ✅ Tests locaux effectués

Le serveur Express (`frontend/server.js`) fonctionne **parfaitement en local** :
- ✓ `http://localhost:3001/` → 200 OK
- ✓ `http://localhost:3001/static/js/main.*.js` → 200 OK + `application/javascript`
- ✓ `http://localhost:3001/static/css/main.*.css` → 200 OK + `text/css`

**Conclusion** : Le code est correct. Le problème est sur la configuration Render.

---

## 🎯 Actions à effectuer sur Render Dashboard

### ÉTAPE 1 : Vérifier quel service a le domaine

1. Aller sur https://dashboard.render.com
2. Vérifier **TOUS les services** du projet IGV :
   - `igv-site` (frontend)
   - `igv-cms-backend` (backend)
   
3. Pour **chaque service**, cliquer dessus puis aller dans l'onglet **"Settings"** → **"Custom Domains"**

4. **Vérifier que** :
   - ✅ **SEUL `igv-site`** doit avoir le domaine `israelgrowthventure.com`
   - ❌ **`igv-cms-backend` NE DOIT PAS** avoir ce domaine

#### 🔴 Si le backend a le domaine :

C'est la cause du problème ! Le backend Python ne sert pas les fichiers statiques React.

**Action** :
- Sur `igv-cms-backend` → Settings → Custom Domains
- **SUPPRIMER** le domaine `israelgrowthventure.com`
- Sur `igv-site` → Settings → Custom Domains
- **AJOUTER** le domaine `israelgrowthventure.com`

---

### ÉTAPE 2 : Vérifier la configuration de `igv-site`

Aller sur le service `igv-site` → Settings → Build & Deploy

#### Configuration attendue :

| Paramètre | Valeur correcte |
|-----------|----------------|
| **Runtime** | `Node` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` OU `node server.js` |
| **Node Version** | `18.17.0` ou supérieur |

#### 🔴 Si la configuration est différente :

**Corriger** :
1. Root Directory : `frontend`
2. Build Command : `npm install && npm run build`
3. Start Command : `npm start`
4. **SAUVEGARDER** les changements

---

### ÉTAPE 3 : Vérifier les logs du dernier build

1. Sur `igv-site` → Onglet **"Logs"** → Section **"Build"**

2. **Chercher dans les logs** :

```
✓ npm install
✓ npm run build
✓ Creating an optimized production build...
✓ Compiled successfully!
✓ File sizes after gzip:
```

3. **Vérifier qu'il n'y a PAS** :
   - ❌ Erreur de compilation
   - ❌ `ENOENT: no such file or directory, open 'build/index.html'`
   - ❌ Build qui skip ou échoue

#### 🔴 Si le build échoue ou est absent :

Le problème est là ! Le dossier `build/` n'est pas créé.

**Actions** :
1. Vérifier que `package.json` contient :
   ```json
   "scripts": {
     "build": "react-scripts build"
   }
   ```
2. Redéployer avec **"Clear build cache & deploy"**

---

### ÉTAPE 4 : Forcer un nouveau déploiement

Une fois la configuration corrigée :

1. Sur `igv-site` → **"Manual Deploy"** → **"Clear build cache & deploy"**
2. Attendre que le build se termine (5-10 minutes)
3. Vérifier les logs que tout est OK

---

### ÉTAPE 5 : Tester après déploiement

Une fois le déploiement terminé, tester ces URLs :

```powershell
# Test 1 : Page d'accueil
curl -I https://israelgrowthventure.com/

# Test 2 : Fichier JS (adapter le nom exact depuis build/static/js/)
curl -I https://israelgrowthventure.com/static/js/main.a9dcbb83.js

# Test 3 : Fichier CSS (adapter le nom exact depuis build/static/css/)
curl -I https://israelgrowthventure.com/static/css/main.6719970f.css
```

**Résultats attendus** :
- ✅ **Status** : `200 OK` (pas 404)
- ✅ **Content-Type JS** : `application/javascript` ou `text/javascript`
- ✅ **Content-Type CSS** : `text/css`

---

## 📋 Checklist finale

- [ ] Le domaine `israelgrowthventure.com` est **uniquement** sur `igv-site`
- [ ] Le domaine `israelgrowthventure.com` est **supprimé** de `igv-cms-backend`
- [ ] `igv-site` a `Root Directory = frontend`
- [ ] `igv-site` a `Build Command = npm install && npm run build`
- [ ] `igv-site` a `Start Command = npm start`
- [ ] Les logs de build montrent `Compiled successfully!`
- [ ] Le déploiement est terminé (status "Live")
- [ ] `https://israelgrowthventure.com/` affiche le site (pas d'écran blanc)
- [ ] `/static/js/...` retourne 200 + `application/javascript`
- [ ] `/static/css/...` retourne 200 + `text/css`

---

## 🔍 Diagnostic supplémentaire si le problème persiste

Si après toutes ces corrections le problème persiste :

### Vérifier que le fichier server.js est bien déployé

Dans les logs **Deploy** de `igv-site`, chercher :
```
Copying files to /opt/render/project/src/frontend/
✓ server.js
✓ build/
✓ build/index.html
✓ build/static/
```

### Vérifier les logs Runtime

Onglet **"Logs"** → Section **"Deploy"**, chercher au démarrage :
```
✅ IGV Site Server running on port 10000
📂 Serving from: /opt/render/project/src/frontend/build
✅ Build directory found
```

Si ces messages n'apparaissent PAS → le serveur ne démarre pas correctement.

---

## 🆘 Si rien ne fonctionne

Envoyer sur le chat :
1. Screenshot de la page Custom Domains de `igv-site`
2. Screenshot de la page Custom Domains de `igv-cms-backend`
3. Les 50 dernières lignes des logs Build de `igv-site`
4. Les 50 dernières lignes des logs Deploy de `igv-site`

Je pourrai alors identifier le problème exact.

---

## ✅ Modifications déjà appliquées

1. ✅ `frontend/src/editor/tsconfig.app.json` : ligne `"types": ["vite/client"]` supprimée
2. ✅ `render.yaml` : `startCommand` changé de `node server.js` à `npm start`
3. ✅ `frontend/server.js` : Déjà correctement configuré avec gestion MIME types

Le code est prêt. Il ne reste plus qu'à corriger la configuration Render.
