# Mission Déploiement IGV Site V3 - RESET COMPLET

**RESET du 14/12/2025 – Reprise intégrale par Copilot autonome**

**Date de Reset** : 2024-12-14 UTC  
**Repo** : israelgrowthventure-cloud/igv-site  
**Agent** : Copilot/Claude Sonnet 4.5 (autonome)  
**Objectif** : Table rase → Injection V3 → Déploiement PROD → Tests → Succès réel

---

## Phase 0 : TABLE RASE (SÉCURISÉE) ⏳

### 0.1 Sécurité pré-purge
- [ ] Vérifier root Git : `C:/Users/PC/Desktop/IGV/igv site/igv-site`
- [ ] Vérifier remote : `israelgrowthventure-cloud/igv-site`
- [ ] Créer `scripts/safety_guard.ps1` + `.sh`
- [ ] Guard validé : opérations autorisées uniquement dans le repo

### 0.2 Purge repo
- [ ] Conservation : `.git/`, `.github/`, `INTEGRATION_PLAN.md`
- [ ] Suppression : tout le reste (archives, backups, frontend legacy, backend legacy, etc.)
- [ ] État final : repo minimal et propre

---

## Phase 1 : RÉINJECTION BASE SAINE V3 ⏳

### 1.1 Clone source V3
- [ ] Source officielle : https://github.com/igvcontact/v3
- [ ] Clone shallow (depth=1) dans `.tmp_v3_source/`
- [ ] Copie `frontend/` + `backend/` V3
- [ ] Suppression clone temporaire

### 1.2 Fichiers de configuration créés
- [ ] `render.yaml` : services frontend + backend (Node 20.x, Python 3.11)
- [ ] `ENV_TEMPLATE.md` : NOMS de variables uniquement (pas de secrets)
- [ ] `task.md` : ce fichier (RESET complet)

---

## Phase 2 : BACKEND - HEALTH + ALIAS ENV ⏳

### 2.1 Endpoint /api/health (obligatoire)
- [ ] Route `/api/health` qui répond 200 JSON stable
- [ ] Si MongoDB absent : `{"status":"ok","mongodb":"not_configured"}` (mais 200)
- [ ] Si MongoDB présent : `{"status":"ok","mongodb":"connected","db":"<nom>"}`

### 2.2 Alias environnement (compatibilité Render)
- [ ] Supporter `MONGO_URL` OU `MONGODB_URI`
- [ ] Supporter `CORS_ORIGINS` OU `CORS_ALLOWED_ORIGINS`
- [ ] Logique : `mongo_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL")`
- [ ] Aucun secret dans les logs

### 2.3 Dependencies
- [ ] Vérifier `requirements.txt` (FastAPI, Motor, PyJWT, etc.)
- [ ] Tester import locaux avant commit

---

## Phase 3 : FRONTEND - BUILD STABLE SUR RENDER ⏳

### 3.1 Build déterministe
- [ ] Node LTS 20.x fixé dans `render.yaml`
- [ ] Utiliser `npm ci` (lockfile strict)
- [ ] Interdiction `--legacy-peer-deps` / `--force` (solution temporaire)

### 3.2 React 19 + dépendances
- [ ] Vérifier `package.json` : React 19 + TypeScript compatible
- [ ] Si conflit peer deps : résoudre proprement (ajuster versions)
- [ ] Build local test : `npm ci && npm run build` (doit PASS)

### 3.3 Routes & environnement
- [ ] `REACT_APP_API_URL=https://igv-cms-backend.onrender.com`
- [ ] Routing client-side (rewrite `/* → /index.html`)
- [ ] Headers sécurité (X-Frame-Options, Cache-Control, etc.)

---

## Phase 4 : CMS + CRM + MONETICO + I18N + SEO ⏳

### 4.1 i18n (FR/EN/HE)
- [ ] i18next configuré partout (frontend + backend)
- [ ] Fallback obligatoire : `cms?.heroTitle?.[locale] || t('home.hero.title')`
- [ ] Détection langue navigateur + sélecteur manuel

### 4.2 Géolocalisation + Pricing
- [ ] Timeout 1s, fallback Europe
- [ ] 4 zones : EU, US/CA, IL, ASIA/Africa
- [ ] Devise locale (€, $, ₪)
- [ ] ZoneSelector visible et fonctionnel

### 4.3 CMS (Drag&Drop)
- [ ] Route éditeur GrapesJS protégée (JWT)
- [ ] Champs multi-langues (textes + images)
- [ ] Upload S3 pour images
- [ ] Endpoint GET/POST `/api/cms/content`

### 4.4 CRM (Dashboard Admin)
- [ ] Endpoint `/api/admin/bootstrap` (protection `BOOTSTRAP_TOKEN`)
- [ ] Créer admin si absent, sinon "already_initialized"
- [ ] RBAC minimal : admin, editor, viewer
- [ ] Dashboard multilingue (contacts, utilisateurs, stats)

### 4.5 Monetico (Paiement)
- [ ] Mode TEST par défaut (`MONETICO_MODE=TEST`)
- [ ] Pack Analyse : CB Monetico actif
- [ ] Succursales/Franchise : CB désactivé (virement uniquement)
- [ ] Pages success/failure i18n
- [ ] Génération facture PDF (pas de secrets dans logs)

### 4.6 SEO/AIO
- [ ] Meta dynamiques multilingues (title, description, og:*)
- [ ] hreflang (FR/EN/HE)
- [ ] JSON-LD schema.org
- [ ] sitemap.xml dynamique (toutes langues)
- [ ] robots.txt (Allow: /)
- [ ] Alt text toutes images

---

## Phase 5 : DÉPLOIEMENT RENDER + TESTS PROD (AUTONOME) ⏳

### 5.1 Scripts de déploiement
- [ ] Créer `scripts/mission_autonome_prod.py` :
  - Vérifie `RENDER_API_KEY` (présence uniquement)
  - Auto-détecte services Render (frontend + backend)
  - Déclenche deploy via API
  - Attend statut "Deployed"
  - Si "build_failed" : récupère logs, extrait cause, corrige, recommit, redeploy
  - Itère jusqu'à succès ou blocage réel

### 5.2 Tests PROD HTTP
- [ ] Créer `scripts/test_production_http.py` :
  - Frontend : https://israelgrowthventure.com (200, taille > seuil, title attendu)
  - Backend : https://igv-cms-backend.onrender.com/api/health (200 + JSON valide)

### 5.3 Tests PROD Browser (Playwright)
- [ ] Créer `scripts/test_production_browser_playwright.mjs` :
  - Page non blanche (contenu visible)
  - Aucune erreur console bloquante
  - Navigation fonctionnelle

### 5.4 Exécution orchestrateur
- [ ] Lancer `python scripts/mission_autonome_prod.py`
- [ ] Suivre logs en temps réel
- [ ] Itérer automatiquement jusqu'à PASS complet

---

## Phase 6 : DOCUMENTATION + PREUVES PROD ⏳

### 6.1 Mise à jour task.md (ce fichier)
- [ ] Marquer toutes les phases PASS/FAIL
- [ ] Ajouter URLs de preuve :
  - Frontend : https://israelgrowthventure.com (200 OK, page visible)
  - Backend : https://igv-cms-backend.onrender.com/api/health (200 + JSON)
- [ ] Résultats tests Playwright (screenshots si échec)

### 6.2 Mise à jour INTEGRATION_PLAN.md (append-only)
- [ ] Ajouter entrée en bas (FR) :
  - Date/heure UTC
  - Objectif de l'itération
  - Fichiers modifiés
  - Routes impactées
  - Variables d'environnement (NOMS uniquement)
  - Tests PROD (URLs + résultats)
  - État final : OK / Partiel / Bloqué + cause

---

## Conditions de Succès (NON NÉGOCIABLES)

### ✅ Frontend PROD
- [ ] https://israelgrowthventure.com répond 200
- [ ] Page visible (pas page blanche)
- [ ] Pas d'erreurs console bloquantes
- [ ] Playwright PASS

### ✅ Backend PROD
- [ ] https://igv-cms-backend.onrender.com/api/health répond 200
- [ ] JSON valide : `{"status":"ok","mongodb":"..."}`

### ✅ Fonctionnalités intégrées
- [ ] i18n (FR/EN/HE) fonctionnel
- [ ] Géoloc + pricing par zone
- [ ] CMS accessible (éditeur protégé)
- [ ] CRM admin bootstrappé
- [ ] Monetico TEST actif
- [ ] SEO complet (meta, hreflang, sitemap, JSON-LD)

### ✅ Documentation
- [ ] task.md à jour avec preuves
- [ ] INTEGRATION_PLAN.md avec entrée finale

---

## État Actuel : RESET 14/12/2025

**Prochaine étape** : Phase 0 validation → Phase 1 → Phase 2+

---

**Règles rappel** :
- ❌ Ne jamais dire "TERMINÉ" sans preuves PROD URL
- ❌ Ne jamais toucher au design public V3
- ❌ Jamais de secrets en clair (NOMS uniquement)
- ✅ Tout via scripts + API Render (pas de clics manuels)
- ✅ Docs en FR uniquement
- ✅ Docs en FR uniquement
