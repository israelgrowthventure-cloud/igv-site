# IGV V3 - Complete Integration & Deployment Plan

**Date de création** : 2025-12-14 00:00:00 UTC  
**Objectif** : Table rase + injection frontend V3 + tests production réels + validation anti-régression

---

## PHASE 0 : PRÉPARATION & BASELINE

### Création Infrastructure Task
- [x] Créer task.md avec plan complet (Antigravity)
  - **Preuve** : Fichier créé 2025-12-14 00:00 UTC
- [x] Créer ENV_TEMPLATE.md (variables requises)
  - **Preuve** : Fichier créé avec 164 lignes
- [x] Créer scripts de tests production
  - [x] `scripts/test_production_http.py`
  - [x] `scripts/test_production_browser_playwright.mjs`
  - [x] `scripts/run_production_tests.sh`
  - **Preuve** : 3 fichiers créés
- [ ] Créer scripts déploiement Render automatisés
  - [ ] `scripts/render_deploy.py`
  - [ ] `scripts/render_sync_env.py`

**ÉTAT PHASE 0**
- Dernier commit : 2388bac (corrections backend rescue mode)
- Statut Render : Backend + Frontend Deployed
- Tests PROD HTTP : ✅ 5/5 PASS (2025-12-14 00:05 UTC)
  - Frontend / : 200 ✅
  - Backend /api/health : 200 ✅
  - Backend /api/debug/imports : 200 ✅
  - CMS /api/cms/pages : 401 ✅ (protégé)
  - CRM /api/crm/leads : 401 ✅ (protégé)

---

## PHASE 1 : STABILITÉ & DONNÉES

### Codebase Cleaning & Analysis
- [x] Cloner repo V3 (https://github.com/igvcontact/v3) dans workspace temporaire
  - **Preuve** : Cloné dans `c:\Users\PC\Desktop\IGV\igv site\v3`
- [x] Analyser structure V3 frontend
  - **Preuve** : Structure identifiée - React + Radix UI + Tailwind
- [x] Identifier fichiers obsolètes dans igv-site actuel
  - [x] Documents doublons (RAPPORT_*.md, MISSION_*.md, etc.)
  - [x] Scripts legacy non utilisés
  - [x] Artefacts rescue mode
  - **Preuve** : 25 .md + 17 .py + 4 txt identifiés
- [x] Supprimer fichiers obsolètes (BACKUP avant suppression)
  - **Preuve** : Déplacés vers `_archive/` (47 fichiers)
- [x] Vérifier encodage UTF-8 de tous fichiers texte
  - **Preuve** : Scripts Python UTF-8, Markdown vérifiés
- [ ] Corriger anomalies d'encodage si détectées
- [ ] Nettoyer dépendances non utilisées backend
- [ ] Nettoyer dépendances non utilisées frontend

**Preuves :** Build backend OK + Build frontend OK (local puis Render)

### Injection Frontend V3
- [x] Backup frontend actuel → `frontend_backup/`
  - **Preuve** : Copie créée
- [x] Copier frontend V3 → `frontend/`
  - **Preuve** : Copié depuis `v3/frontend`
- [x] Adapter variables d'environnement
  - [x] `REACT_APP_BACKEND_URL`
  - [x] `REACT_APP_ENV`
  - **Preuve** : .env.production créé
- [x] Adapter routage API vers backend
  - **Preuve** : REACT_APP_BACKEND_URL=https://igv-cms-backend.onrender.com
- [ ] Vérifier i18n FR/EN/HE avec fallbacks
  - [ ] Format: `cms?.heroTitle?.[locale] || t('home.hero.title')`
- [x] Tester build local : `npm run build`
  - **Preuve** : Build réussi (CI=false), 145.53 kB JS, 11.57 kB CSS
  - **Date** : 2025-12-14 00:25 UTC
- [ ] Vérifier aucune modification design (images/CSS/structure)

**Preuves :** Build réussi + Assets générés + Aucune erreur console locale

### Geolocation & Pricing
- [ ] Implémenter timeout 1s pour géolocalisation
- [ ] Configurer fallback zone Europe (EU)
- [ ] Extraire descriptions packs depuis ancien igv-site
- [ ] Intégrer données packs dans backend V3
- [ ] Implémenter mapping prix 4 zones (EU, US/CA, IL, ASIA/Africa)
- [ ] Configurer devises par zone
- [ ] Intégrer composant ZoneSelector dans V3

**Preuves :** GET /api/pricing → 200 + données zones correctes (PROD)

**ÉTAT PHASE 1**
- Dernier commit : -
- Statut Render Frontend : -
- Statut Render Backend : -
- Tests PROD :
  - Frontend (/) : -
  - Backend (/api/health) : -
  - Playwright (console errors) : -

---

## PHASE 2 : UI/UX & SEO

### SEO Improvement
- [ ] Ajouter table des matières + ancres sur "Le Commerce de Demain"
- [ ] Implémenter meta tags dynamiques
- [ ] Générer sitemap.xml
- [ ] Ajouter attributs alt sur toutes images
- [ ] Vérifier éléments AIO SEO

**Preuves :** Lighthouse SEO score ≥ 90 (PROD)

**ÉTAT PHASE 2**
- Dernier commit : -
- Tests PROD : -

---

## PHASE 3 : SERVICES AVANCÉS

### CMS Integration
- [ ] Finaliser intégration CMS Drag & Drop (GrapesJS)
- [ ] Créer interface édition visuelle
- [ ] Tester fonctionnalité CMS
  - [ ] GET /api/cms/pages → 200 ou 401 (protégé)
  - [ ] Route editor accessible : `/admin/cms/editor/:page/:lang`
  - [ ] Chargement GrapesJS sans erreur

**Preuves PROD :**
- Endpoint CMS : -
- Route editor : -
- Console errors : -

### CRM Integration (HIGH PRIORITY)
- [ ] Configurer connexion MongoDB pour Leads/Orders
- [ ] Implémenter backend dashboard CRM
- [ ] Configurer multi-accès avec gestion rôles
  - [ ] Rôle admin : full access
  - [ ] Rôle editor : édition limitée
  - [ ] Rôle viewer : lecture seule
- [ ] Ajouter traduction dashboard (FR, EN, HE)
- [ ] Implémenter bootstrap admin sécurisé
  - [ ] Endpoint `POST /api/crm/bootstrap-admin`
  - [ ] Protection par `X-Bootstrap-Token`
  - [ ] Idempotence (ne recrée pas si admin existe)
  - [ ] Hash password (bcrypt/argon2)
- [ ] Tester fonctionnalité CRM

**Preuves PROD :**
- GET /api/crm/leads (sans auth) : 401/403 attendu → -
- POST /api/crm/bootstrap-admin (sans token) : 401/403 → -
- Dashboard accessible après auth : -

### Payment Integration
- [ ] Créer page succès paiement
- [ ] Créer page échec paiement
- [ ] Finaliser intégration Monetico avec sécurité HMAC
- [ ] Intégrer paiement dans page Packs
- [ ] Tester flux paiement

**Preuves PROD :**
- POST /api/payment/monetico/init → 200 ou 503 (si env manquante) → -

**ÉTAT PHASE 3**
- Dernier commit : -
- Tests PROD CMS : -
- Tests PROD CRM : -
- Tests PROD Payment : -

---

## PHASE 4 : SÉCURITÉ & DÉPLOIEMENT

### Security Configuration
- [ ] Configurer redirects HTTP → HTTPS
- [ ] Configurer headers sécurité (HSTS, CSP, X-Frame-Options)
- [ ] Revoir et tester mesures sécurité

**Preuves PROD :**
- Headers sécurité présents : -
- Redirect HTTPS : -

### Déploiement Render Automatisé
- [ ] Script déploiement backend
- [ ] Script déploiement frontend
- [ ] Attente statut "Deployed" automatique
- [ ] Validation santé post-déploiement

**ÉTAT PHASE 4**
- Dernier commit : -
- Render Frontend : -
- Render Backend : -
- Tests PROD : -

---

## PHASE 5 : VALIDATION PRODUCTION (CRITIQUE)

### Tests HTTP Production
- [ ] GET https://israelgrowthventure.com → 200
  - **Résultat** : -
  - **HTML contient** : `<title>` attendu → -
- [ ] GET https://igv-cms-backend.onrender.com/api/health → 200
  - **Résultat** : -
  - **JSON** : `{"status": "ok"}` → -

### Tests Navigateur Production (Playwright)
- [ ] Page charge sans blanc
  - **Résultat** : -
- [ ] Aucune erreur console
  - **"Future is not defined"** : ✅ ÉLIMINÉ / ❌ PRÉSENT → -
  - **Autres erreurs** : -
- [ ] Assets chargés (JS/CSS)
  - **Résultat** : -

### Validation Endpoints Métier
- [ ] CMS : GET /api/cms/pages → 200 ou 401
  - **Résultat** : -
- [ ] CRM : GET /api/crm/leads → 401 ou 403 (protégé)
  - **Résultat** : -
- [ ] Auth : POST /api/auth/login → 200 ou 401
  - **Résultat** : -

**ÉTAT FINAL PHASE 5**
- ✅ / ❌ Frontend accessible : -
- ✅ / ❌ Backend health OK : -
- ✅ / ❌ Bug "Future" éliminé : -
- ✅ / ❌ CMS actif : -
- ✅ / ❌ CRM actif : -

---

## DOCUMENTATION & AUDIT

### INTEGRATION_PLAN.md
- [ ] Ajout entrée avec :
  - Date/heure UTC
  - Objectif (table rase + injection V3)
  - Fichiers modifiés
  - Routes impactées
  - Variables env (NOMS uniquement)
  - Tests exécutés (URLs + résultats)
  - État final

---

## STATUT GLOBAL

**MISSION RÉUSSIE SI ET SEULEMENT SI :**
1. ✅ Render Frontend + Backend = "Deployed"
2. ✅ https://israelgrowthventure.com charge sans page blanche
3. ✅ Aucune erreur console (notamment "Future is not defined")
4. ✅ Backend /api/health = 200 + JSON valide
5. ✅ Documentation complète dans INTEGRATION_PLAN.md
6. ✅ Tests PROD tous en PASS

**ÉTAT ACTUEL :** 🔴 EN COURS

---

## NOTES CRITIQUES

⚠️ **INTERDICTIONS ABSOLUES**
- Modifier design V3 (Home, images, CSS, structure)
- Commit secrets en clair
- Tests uniquement localhost (production OBLIGATOIRE)
- Déclarer "terminé" sans preuves PROD

🔒 **SÉCURITÉ**
- Secrets : NOMS uniquement dans doc
- Passwords : HASH uniquement (bcrypt/argon2)
- Bootstrap admin : idempotent + token protégé

📊 **PREUVES REQUISES**
- Chaque case cochée [x] = URL + status + résultat
- Playwright : capture erreurs console
- HTTP : status code + payload preview
