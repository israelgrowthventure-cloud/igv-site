# 🚨 DÉPLOIEMENT RENDER MANUEL REQUIS

**Date**: 2025-12-14 01:05 UTC  
**Statut**: Frontend V3 prêt mais PAS déployé  
**Impact**: Site en prod = page blanche + bug "Future is not defined"

---

## ❌ PROBLÈME

1. **Frontend V3 build réussi localement**:
   - 145.53 kB JS gzipped
   - 11.57 kB CSS gzipped
   - Commits pushés: `50f3731`, `6187af3`, `0212d23`

2. **Render auto-deploy ne fonctionne PAS**:
   - `render.yaml` présent et commité ✅
   - GitHub webhook non déclenché ❌
   - Service frontend toujours sur ancien build (Last-Modified: 2025-12-13 23:48 GMT)

3. **Prod actuelle**:
   - https://israelgrowthventure.com → 200 mais **3575 bytes** (ancien)
   - Bug: `ReferenceError: Future is not defined`
   - Page blanche (body 0px)

---

## ✅ SOLUTION 1: DÉPLOIEMENT MANUEL DASHBOARD (RAPIDE)

### Étapes:

1. **Ouvrir Dashboard Render**:
   ```
   https://dashboard.render.com
   ```

2. **Trouver service frontend**:
   - Nom: `igv-site-web` ou similaire
   - Type: Web Service (Node.js)

3. **Déclencher déploiement manuel**:
   - Onglet "Manual Deploy"
   - Cliquer "Deploy latest commit"
   - Branch: `main`

4. **Attendre build + deploy**:
   - Durée: 10-15 minutes
   - Logs: surveiller "npm install" + "npm run build" + "Starting server"

5. **Vérifier déploiement réussi**:
   ```bash
   # Test HTTP
   cd "c:\Users\PC\Desktop\IGV\igv site\igv-site"
   python scripts/test_production_http.py
   
   # Test Playwright (bug "Future")
   node scripts/test_production_browser_playwright.mjs
   ```

6. **Résultat attendu**:
   - Frontend: ~150 KB (au lieu de 3.5 KB)
   - Playwright: **5/5 PASS** (pas d'erreur "Future")
   - Page visible (body > 100px)

---

## ✅ SOLUTION 2: API RENDER (AUTOMATIQUE)

### Prérequis:

1. **Obtenir API Key**:
   ```
   https://dashboard.render.com/account/api-keys
   ```

2. **Trouver service IDs**:
   ```powershell
   $env:RENDER_API_KEY = "rnd_VOTRE_CLÉ_ICI"
   python scripts/list_render_services.py
   ```

3. **Mettre à jour script deploy**:
   Éditer `scripts/render_deploy.py` lignes 13-14 avec les bons IDs.

4. **Déclencher déploiement**:
   ```powershell
   python scripts/render_deploy.py
   ```

---

## 📊 ÉTAT ACTUEL DES SERVICES

### Backend ✅ DEPLOYED
- URL: https://igv-cms-backend.onrender.com
- Health: 200 OK
- MongoDB: connected
- Modules: auth/cms/crm/payment all true

### Frontend ❌ NOT DEPLOYED (V3)
- URL: https://israelgrowthventure.com
- Build: ancien (3575 bytes)
- Erreur: "Future is not defined"
- Body: 0px (page blanche)

---

## 🎯 APRÈS DÉPLOIEMENT

### Tests obligatoires:

```bash
# 1. HTTP endpoints
python scripts/test_production_http.py
# Attendu: 5/5 PASS

# 2. Browser + console errors
node scripts/test_production_browser_playwright.mjs
# Attendu: 5/5 PASS (NO "Future" error)
```

### Validation visuelle:

1. Ouvrir https://israelgrowthventure.com
2. Vérifier:
   - ✅ Page visible (pas blanche)
   - ✅ Design V3 intact (images, CSS, structure)
   - ✅ Pas d'erreur console navigateur
   - ✅ Titre: "Israel Growth Venture" (pas "Emergent")
   - ✅ Body height > 100px

---

## 🔧 DIAGNOSTIC AUTO-DEPLOY

### Pourquoi auto-deploy ne fonctionne pas?

**Hypothèses**:

1. **Webhook GitHub non configuré**:
   - Dashboard Render → Service Settings → GitHub
   - Vérifier "Auto-Deploy" activé pour branch `main`

2. **Service IDs incorrects**:
   - Script `render_deploy.py` utilise IDs hardcodés
   - Possibilité: services recréés → nouveaux IDs

3. **Free tier Render**:
   - Spin-down après 15 min inactivité
   - Nécessite parfois trigger manuel

4. **render.yaml pas détecté**:
   - Vérifier presence: `git ls-files | grep render.yaml`
   - Vérifier format YAML valide: `python -c "import yaml; yaml.safe_load(open('render.yaml'))"`

### Correction:

```bash
# Vérifier render.yaml commité
git ls-files render.yaml

# Vérifier dernière commit date
git log -1 --format="%ai" -- render.yaml

# Forcer re-detection (touch + commit)
touch render.yaml
git add render.yaml
git commit -m "chore: Trigger render.yaml re-detection"
git push origin main
```

---

## 📝 PROCHAINES ÉTAPES (APRÈS DÉPLOIEMENT V3)

1. ✅ Site visible + tests PASS
2. Activer CMS editor (`/admin/cms/editor/:page/:lang`)
3. Créer bootstrap admin CRM (endpoint sécurisé)
4. Intégrer Monetico (mode TEST)
5. Implémenter SEO/AIO (meta, JSON-LD, sitemap)
6. Mettre à jour task.md + INTEGRATION_PLAN.md

---

**🚨 URGENT: Déployer frontend V3 MAINTENANT via Dashboard Render (Solution 1)**

