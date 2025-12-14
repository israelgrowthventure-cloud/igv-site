# IGV V3 — Checklist Production

Dernière mise à jour : 2025-12-14 UTC

## Phase 0 — Reset complet
- [x] Archive de sauvegarde _archive_reset_20251214_0000_UTC (tout sauf .git/.github/task.md/INTEGRATION_PLAN.md/render.yaml).
- [x] Clonage igvcontact/v3 et synchro backend/frontend propres.
- [x] render.yaml régénéré (backend FastAPI python3.11, frontend static React build `npm install && npm run build`, Node 20.17.0).
- [x] Endpoint backend /api/health ajouté.
- [x] Scripts tests prod : scripts/test_production_http.py, scripts/test_production_browser_playwright.mjs, runners .sh/.ps1.
- [x] ENV_TEMPLATE.md recréé (variables noms uniquement).
- [x] Générer lockfile (npm install) et vérifier build local (`npm run build` OK avec DISABLE_ESLINT_PLUGIN=true).
- [ ] Exécuter tests prod (HTTP + Playwright) après config env.

## Phase 1 — Baseline prod (pas de page blanche)
- [ ] Configurer variables Render (NOMS) + clé API dans environnement.
- [ ] Déployer backend + frontend via Render API (sans dashboard).
- [ ] Valider https://israelgrowthventure.com → 200 + titre attendu (pas de page blanche).
- [ ] Valider https://igv-cms-backend.onrender.com/api/health → 200 + JSON stable.
- [ ] Capturer résultats tests scripts/run_production_tests.* dans logs/outputs.
- Blocage actuel : MONGODB_URI absent côté Render + autres env CMS/CRM/Monetico absentes (cf. scripts/check_env_vars.py via Render API).

## Phase 2 — Métier (i18n/geo/pricing/CMS/CRM)
- [ ] Timeout géoloc 1s + fallback EU + mapping 4 zones + devises.
- [ ] Fallback i18n cms?.heroTitle?.[locale] || t('home.hero.title') sur tout le front.
- [ ] Packs/pricing cohérents avec ancien site (descriptions importées).
- [ ] CMS drag&drop sécurisé (GrapesJS) + route editor protégée.
- [ ] Endpoint CRM bootstrap admin + RBAC minimal.

## Phase 3 — Paiement Monetico + SEO
- [ ] Intégration Monetico TEST (HMAC) + pages success/failure.
- [ ] SEO complet : meta multilingue, hreflang, JSON-LD, sitemap, robots, alt images.
- [ ] Aucune régression design V3.

## Phase 4 — Déploiement autonome + validation
- [ ] Orchestrateur scripts/mission_autonome_prod.py (env check → commit/push → deploy Render API → tests prod en boucle).
- [ ] Déploiements Render (frontend+backend) attendus = Deployed.
- [ ] Playwright PROD PASS, pas d'erreurs console.
- [ ] Documentation à jour (task.md + append INTEGRATION_PLAN.md) avec preuves URLs.

## Preuves attendues
- URLs: front 200 avec contenu visible, backend /api/health 200 JSON {"status":"ok"}.
- Résultats scripts tests (JSON) conservés.
- Aucun secret en clair; uniquement noms de variables d’environnement.
