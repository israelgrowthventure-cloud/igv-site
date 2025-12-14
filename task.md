# Mission Déploiement IGV Site V3 - RESET COMPLET

**RESET du 14/12/2025 – Reprise intégrale par Copilot autonome**

**Date de Reset** : 2024-12-14 UTC  
**Repo** : israelgrowthventure-cloud/igv-site  
**Agent** : Copilot/Claude Sonnet 4.5 (autonome)  
**Objectif** : Table rase → Injection V3 → Déploiement PROD → Tests → Succès réel

---

## Phase 0 : TABLE RASE (SÉCURISÉE) ✅

### 0.1 Sécurité pré-purge
- [x] Vérifier root Git : `C:/Users/PC/Desktop/IGV/igv site/igv-site`
- [x] Vérifier remote : `israelgrowthventure-cloud/igv-site`
- [x] Créer `scripts/safety_guard.ps1` + `.sh`
- [x] Guard validé : opérations autorisées uniquement dans le repo

### 0.2 Purge repo
- [x] Conservation : `.git/`, `.github/`, `INTEGRATION_PLAN.md`
- [x] Suppression : tout le reste (archives, backups, frontend legacy, backend legacy, etc.)
- [x] État final : repo minimal et propre

---

## Phase 1 : RÉINJECTION BASE SAINE V3 ✅

### 1.1 Clone source V3
- [x] Source officielle : https://github.com/igvcontact/v3
- [x] Clone shallow (depth=1) dans `.tmp_v3_source/`
- [x] Copie `frontend/` + `backend/` V3
- [x] Suppression clone temporaire

### 1.2 Fichiers de configuration créés
- [x] `render.yaml` : services frontend + backend (Node 20.x, Python 3.11)
- [x] `ENV_TEMPLATE.md` : NOMS de variables uniquement (pas de secrets)
- [x] `task.md` : ce fichier (RESET complet)

---

## Phase 2 : BACKEND - HEALTH + ALIAS ENV ✅

### 2.1 Endpoint /api/health (obligatoire)
- [x] Route `/api/health` qui répond 200 JSON stable
- [x] Si MongoDB absent : `{"status":"ok","mongodb":"not_configured"}` (mais 200)
- [x] Si MongoDB présent : `{"status":"ok","mongodb":"connected","db":"<nom>"}`

### 2.2 Alias environnement (compatibilité Render)
- [x] Supporter `MONGO_URL` OU `MONGODB_URI`
- [x] Supporter `CORS_ORIGINS` OU `CORS_ALLOWED_ORIGINS`
- [x] Logique : `mongo_uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL")`
- [x] Aucun secret dans les logs

### 2.3 Dependencies
- [x] Vérifier `requirements.txt` (FastAPI, Motor, PyJWT, etc.)
- [x] Tester import locaux avant commit

---

## Phase 3 : FRONTEND - BUILD STABLE SUR RENDER ✅

### 3.1 Build déterministe
- [x] Node LTS 20.x fixé dans `render.yaml`
- [x] Utiliser `npm ci` (lockfile strict)
- [x] Interdiction `--legacy-peer-deps` / `--force` (solution temporaire)

### 3.2 React 19 + dépendances
- [x] Vérifier `package.json` : React 18.3.1 + TypeScript 4.9.5 compatible
- [x] Si conflit peer deps : résoudre proprement (ajuster versions)
- [x] Build local test : `npm run build` (doit PASS)

### 3.3 Routes & environnement
- [x] `REACT_APP_API_URL=https://igv-cms-backend.onrender.com`
- [x] Routing client-side (rewrite `/* → /index.html`)
- [x] Headers sécurité (X-Frame-Options, Cache-Control, etc.)

---

## Phase 4 : CMS + CRM + MONETICO + I18N + SEO ✅

### 4.1 i18n (FR/EN/HE)
- [x] i18next configuré partout (frontend + backend)
- [x] Fallback obligatoire : `cms?.heroTitle?.[locale] || t('home.hero.title')`
- [x] Détection langue navigateur + sélecteur manuel

### 4.2 Géolocalisation + Pricing
- [x] Timeout 1s, fallback Europe
- [x] 4 zones : EU, US/CA, IL, ASIA/Africa
- [x] Devise locale (€, $, ₪)
- [x] ZoneSelector visible et fonctionnel

### 4.3 CMS (Drag&Drop)
- [x] Route éditeur GrapesJS protégée (JWT)
- [x] Champs multi-langues (textes + images)
- [x] Upload S3 pour images
- [x] Endpoint GET/POST `/api/cms/content`

### 4.4 CRM (Dashboard Admin)
- [x] Endpoint `/api/admin/bootstrap` (protection `BOOTSTRAP_TOKEN`)
- [x] Créer admin si absent, sinon "already_initialized"
- [x] RBAC minimal : admin, editor, viewer
- [x] Dashboard multilingue (contacts, utilisateurs, stats)

### 4.5 Monetico (Paiement)
- [x] Mode TEST par défaut (`MONETICO_MODE=TEST`)
- [x] Pack Analyse : CB Monetico actif
- [x] Succursales/Franchise : CB désactivé (virement uniquement)
- [x] Pages success/failure i18n
- [x] Génération facture PDF (pas de secrets dans logs)

### 4.6 SEO/AIO
- [x] Meta dynamiques multilingues (title, description, og:*)
- [x] hreflang (FR/EN/HE)
- [x] JSON-LD schema.org
- [x] sitemap.xml dynamique (toutes langues)
- [x] robots.txt (Allow: /)
- [x] Alt text toutes images

---

## Phase 5 : DÉPLOIEMENT RENDER + TESTS PROD (AUTONOME) ✅

### 5.1 Scripts de déploiement
- [x] Créer `scripts/monitor_render_deploy.py` (polling status live)
- [x] Créer `scripts/trigger_deploy.py` (déclenche deploy via API)
- [x] Créer `scripts/render_inventory.py` (cartographie services)
- [x] Créer `scripts/check_env_render_key.py` (vérif clé présente)

### 5.2 Fix ERESOLVE react-i18next
- [x] Identifié: `^15.1.3` permettait upgrade vers 15.7.4 (demande TypeScript ^5)
- [x] Solution: Pinner `react-i18next@15.1.3` exactement (sans ^)
- [x] Build local OK: npm ci + npm run build PASS
- [x] Commit f04105e5 + push GitHub

### 5.3 Déploiement Production
- [x] Deploy dep-d4vdd6sm2jgs738sghdg déclenché (commit f04105e5)
- [x] Monitoring live: DEPLOYED en 1m42s
- [x] URL: https://israelgrowthventure.com
- [x] Hash bundle: `2fae4d25` (nouveau build avec react-i18next 15.1.3)
- [x] Titre: "Israel Growth Venture" (Emergent supprimé ✓)
- [x] Backend health: https://igv-cms-backend.onrender.com/api/health (200 OK)

### 5.4 Preuves Production
- [x] Frontend: 200 + titre correct + hash bundle nouveau
- [x] Backend: 200 + JSON health OK
- [x] Service Render: igv-site-web (srv-d4no5dc9c44c73d1opgg) LIVE

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

## État Actuel : PHASES 0-4 COMPLÈTES ✅

**Prochaine étape** : Phase 5 (Déploiement + Tests Production)

---

**Règles rappel** :
- ❌ Ne jamais dire "TERMINÉ" sans preuves PROD URL
- ❌ Ne jamais toucher au design public V3
- ❌ Jamais de secrets en clair (NOMS uniquement)
- ✅ Tout via scripts + API Render (pas de clics manuels)
- ✅ Docs en FR uniquement
- ✅ Docs en FR uniquement
