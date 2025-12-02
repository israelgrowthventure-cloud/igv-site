# 🎯 Pipeline de Déploiement IGV Site - Documentation Complète

## 📊 État Actuel (2025-12-02)

**Service Render**: `igv-site` (Static Site)  
**URL Production**: https://israelgrowthventure.com  
**URL Render**: https://igv-site.onrender.com  
**Bundle actuel**: `main.bf9fcd7e.js` ✅

---

## 🏗️ Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│  Développeur                                                │
│    └─> git push origin main                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (render-deploy.yml)                         │
│    ├─> Test API Key Render (validation)                    │
│    ├─> Appel Deploy Hook                                   │
│    └─> Monitoring (15 checks × 30s = 7.5 min max)          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Render.com                                                 │
│    ├─> Pull depuis GitHub (branch main)                    │
│    ├─> cd frontend && npm ci && npm run build              │
│    ├─> Génération bundle main.<hash>.js                    │
│    └─> Deploy sur CDN Static Site                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Production                                                 │
│    ├─> https://igv-site.onrender.com (direct)              │
│    └─> https://israelgrowthventure.com (custom domain)     │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration du Service Render

### Service: igv-site

| Paramètre | Valeur |
|-----------|---------|
| **Type** | Static Site |
| **Repository** | `israelgrowthventure-cloud/igv-site` |
| **Branch** | `main` |
| **Build Command** | `cd frontend && npm ci && npm run build` |
| **Publish Directory** | `frontend/build` |
| **Auto-Deploy** | ✅ Activé |
| **Node Version** | `18.17.0` |

### Variables d'Environnement

```env
NODE_VERSION=18.17.0
REACT_APP_API_BASE_URL=https://igv-cms-backend.onrender.com
REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api
REACT_APP_CALENDAR_EMAIL=israel.growth.venture@gmail.com
VITE_EDITOR_ACCESS_CODE=IGV2025_EDITOR
```

---

## 🚀 Workflow GitHub Actions

### Fichier: `.github/workflows/render-deploy.yml`

#### Déclencheurs

- **Push sur `main`** avec modifications dans:
  - `frontend/**`
  - `.github/workflows/**`
- **Manual trigger** (workflow_dispatch)

#### Étapes

1. **🔑 Test API Key Render**
   - Valide que `RENDER_API_KEY` fonctionne
   - Appel à `/v1/services`
   - Échec si HTTP ≠ 200

2. **🚀 Trigger Deploy Hook**
   - POST vers `RENDER_DEPLOY_HOOK_URL`
   - Déclenche le rebuild sur Render
   - Échec si HTTP ≠ 200/201

3. **⏳ Attente Build**
   - Sleep 60 secondes
   - Laisse Render démarrer le build

4. **🔍 Monitoring**
   - 15 tentatives × 30s = 7.5 min max
   - Détecte changement de bundle hash
   - Succès si hash ≠ `4130aa42` (ancien)

#### Secrets Requis

- `RENDER_API_KEY`: Clé API Render
- `RENDER_DEPLOY_HOOK_URL`: URL Deploy Hook du service

---

## 📝 Gestion du Contenu (CMS)

### Fichier Source

**Emplacement**: `frontend/public/content-editable.json`

Ce fichier contient tout le contenu éditable du site:
- Pages (home, about, contact, packs)
- SEO (titles, descriptions)
- Textes (hero, steps, forms)
- Informations site (nom, email, téléphone)

### Éditeur Web

**URL**: https://israelgrowthventure.com/editor  
**Code d'accès**: `IGV2025_EDITOR`

**Fonctionnalités**:
- Édition visuelle du JSON
- Prévisualisation en temps réel
- Sauvegarde localStorage
- Export JSON

⚠️ **Important**: Les modifications dans l'éditeur sont en **localStorage uniquement**. Pour les déployer en production, suivre le workflow ci-dessous.

### Workflow de Mise à Jour Contenu

#### ✅ Méthode Recommandée: Git Direct

```bash
# 1. Éditer le fichier localement
cd frontend/public
code content-editable.json  # ou vim, nano, etc.

# 2. Commiter
git add content-editable.json
git commit -m "content: Update homepage hero section"

# 3. Pousser (déclenche auto-deploy)
git push origin main

# 4. Suivre le déploiement
# https://github.com/israelgrowthventure-cloud/igv-site/actions
```

**Durée**: 5-8 minutes (build + deploy)

#### 🌐 Méthode Alternative: Éditeur Web + Export

```bash
# 1. Éditer sur https://israelgrowthventure.com/editor
# 2. Cliquer "Export JSON"
# 3. Sauvegarder le fichier exporté
# 4. Remplacer le fichier local
mv ~/Downloads/content-editable.json frontend/public/

# 5. Suivre workflow Git (étapes 2-4 ci-dessus)
```

---

## 🔧 Opérations de Maintenance

### Forcer un Redéploiement

#### Via GitHub UI

1. Aller sur https://github.com/israelgrowthventure-cloud/igv-site/actions/workflows/render-deploy.yml
2. Cliquer **"Run workflow"**
3. Branch: `main`
4. Cliquer **"Run workflow"** (confirmer)

#### Via Git

```bash
git commit --allow-empty -m "deploy: Force rebuild"
git push origin main
```

### Vérifier le Bundle en Production

#### PowerShell

```powershell
$response = Invoke-WebRequest "https://igv-site.onrender.com/?v=$(Get-Random)" -UseBasicParsing
if ($response.Content -match 'main\.(\w+)\.js') {
    Write-Host "Bundle actuel: main.$($matches[1]).js" -ForegroundColor Cyan
}
```

#### Bash/Linux

```bash
curl -s "https://igv-site.onrender.com/?v=$RANDOM" | grep -oP 'main\.\w+\.js' | head -1
```

#### Comparaison Render vs Domain

```powershell
$render = (Invoke-WebRequest "https://igv-site.onrender.com/?v=$(Get-Random)" -UseBasicParsing).Content
$domain = (Invoke-WebRequest "https://israelgrowthventure.com/?v=$(Get-Random)" -UseBasicParsing).Content

$renderHash = if ($render -match 'main\.(\w+)\.js') { $matches[1] } else { "N/A" }
$domainHash = if ($domain -match 'main\.(\w+)\.js') { $matches[1] } else { "N/A" }

Write-Host "Render: main.$renderHash.js" -ForegroundColor $(if ($renderHash -eq "N/A") { "Red" } else { "Green" })
Write-Host "Domain: main.$domainHash.js" -ForegroundColor $(if ($domainHash -eq "N/A") { "Red" } else { "Green" })

if ($renderHash -eq $domainHash -and $renderHash -ne "N/A") {
    Write-Host "✅ Render et domaine sont synchronisés" -ForegroundColor Green
} else {
    Write-Host "⚠️ Différence détectée - purger cache Cloudflare si nécessaire" -ForegroundColor Yellow
}
```

### Consulter les Logs

- **GitHub Actions**: https://github.com/israelgrowthventure-cloud/igv-site/actions
- **Render Dashboard**: https://dashboard.render.com/static/igv-site
- **Logs de build**: Dans le Dashboard Render → onglet "Events"

---

## 📈 Monitoring et Santé du Système

### Indicateurs de Santé

| Indicateur | Valeur OK | Action si NOK |
|------------|-----------|---------------|
| **Bundle Hash** | Change à chaque deploy | Vérifier build command |
| **Deploy Time** | < 8 minutes | Vérifier logs Render |
| **GitHub Actions** | ✅ Success | Voir logs workflow |
| **Render Status** | Deployed | Voir Dashboard Render |
| **Domain Sync** | Render = Domain | Purger cache Cloudflare |

### Tests de Santé

```powershell
# Test complet
Write-Host "🔍 Health Check - IGV Site`n" -ForegroundColor Cyan

# 1. Test service Render
$render = Invoke-WebRequest "https://igv-site.onrender.com" -UseBasicParsing
$renderHash = if ($render.Content -match 'main\.(\w+)\.js') { $matches[1] } else { "ERROR" }
Write-Host "Render: main.$renderHash.js - Status $($render.StatusCode)" -ForegroundColor $(if ($render.StatusCode -eq 200) { "Green" } else { "Red" })

# 2. Test domaine
$domain = Invoke-WebRequest "https://israelgrowthventure.com" -UseBasicParsing
$domainHash = if ($domain.Content -match 'main\.(\w+)\.js') { $matches[1] } else { "ERROR" }
Write-Host "Domain: main.$domainHash.js - Status $($domain.StatusCode)" -ForegroundColor $(if ($domain.StatusCode -eq 200) { "Green" } else { "Red" })

# 3. Test routes
$routes = @("/", "/about", "/packs", "/contact", "/editor")
Write-Host "`nRoutes:" -ForegroundColor Yellow
foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest "https://israelgrowthventure.com$route" -UseBasicParsing
        Write-Host "  ✅ $route → $($r.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $route → Error" -ForegroundColor Red
    }
}
```

---

## 🐛 Troubleshooting

### Bundle ne change pas après deploy

**Symptômes**: Le hash reste identique après plusieurs commits

**Causes possibles**:
1. ❌ Auto-Deploy OFF sur Render
2. ❌ Deploy Hook incorrect
3. ❌ Build cache bloqué

**Solutions**:
```bash
# 1. Forcer clear cache via commit significatif
cd frontend/src
# Modifier App.js (ajouter un commentaire avec timestamp)
git add App.js
git commit -m "build: Force new hash with timestamp"
git push origin main

# 2. Vérifier Auto-Deploy
# Dashboard Render → Settings → Auto-Deploy = Yes

# 3. Manual Deploy avec Clear Cache
# Dashboard Render → Manual Deploy → ✅ Clear build cache
```

### GitHub Actions timeout

**Symptômes**: Workflow échoue avec "Deployment monitoring timeout"

**Causes possibles**:
1. ⏳ Build Render prend > 7.5 minutes
2. ❌ Service Render down
3. 🔄 Build en erreur

**Solutions**:
```bash
# 1. Vérifier logs Render
# https://dashboard.render.com/static/igv-site → Events

# 2. Augmenter timeout dans workflow
# Éditer .github/workflows/render-deploy.yml
# Ligne "MAX_ATTEMPTS=15" → "MAX_ATTEMPTS=20"

# 3. Tester build localement
cd frontend
npm ci
npm run build
# Si échec, corriger les erreurs avant de pousser
```

### Domaine sert ancien bundle

**Symptômes**: `igv-site.onrender.com` OK mais `israelgrowthventure.com` ancien

**Cause**: Cache Cloudflare

**Solution**:
1. Aller sur Cloudflare Dashboard
2. Cliquer sur `israelgrowthventure.com`
3. Onglet **Caching**
4. **Purge Everything**
5. Attendre 30-60 secondes
6. Tester avec `?v=<timestamp>` pour bypass cache

---

## 🔐 Sécurité

### Secrets GitHub

**Emplacement**: https://github.com/israelgrowthventure-cloud/igv-site/settings/secrets/actions

| Secret | Description | Rotation |
|--------|-------------|----------|
| `RENDER_API_KEY` | Clé API Render | Tous les 6 mois |
| `RENDER_DEPLOY_HOOK_URL` | Deploy Hook igv-site | Si compromis |

### Accès Éditeur CMS

- **Code actuel**: `IGV2025_EDITOR`
- **Stockage**: Variable d'environnement `VITE_EDITOR_ACCESS_CODE`
- **Changement**: Modifier dans Render Dashboard → Environment

---

## 📚 Ressources

- **Repository**: https://github.com/israelgrowthventure-cloud/igv-site
- **Actions GitHub**: https://github.com/israelgrowthventure-cloud/igv-site/actions
- **Render Dashboard**: https://dashboard.render.com/static/igv-site
- **Docs Render Static Sites**: https://render.com/docs/static-sites
- **Create React App Docs**: https://create-react-app.dev/docs/deployment

---

**Dernière mise à jour**: 2025-12-02T17:45:00Z  
**Responsable maintenance**: Équipe IGV  
**Status système**: ✅ Opérationnel  
**Prochain review**: 2025-01-02
