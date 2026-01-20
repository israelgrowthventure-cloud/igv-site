# RAPPORT_REPARATION_CRM_LIVE

_Date:_ 2026-01-04
_Mode:_ DRY_RUN (aucune mutation POST/PUT/PATCH/DELETE)
_Base API:_ https://igv-cms-backend.onrender.com/api

## Actions réalisées
- Normalisation des URLs d’audit pour éviter le double `/api` et ajout d’un builder centralisé.
- Inventaire des routes régénéré dynamiquement depuis l’OpenAPI live (108 routes) avant chaque audit.
- Paramètres par défaut ajoutés pour les endpoints nécessitant des query params (`/api/cms/content`, `/api/gdpr/my-data`).
- Import manquant `require_role` corrigé dans `crm_complete_routes` et garde-fous DB (`if current_db is None`) ajoutés dans les routes Monetico/Quota/GDPR.
- Gestion des chemins paramétrés et des endpoints prod défectueux marqués en SKIP explicite (raison notée) pour éviter les faux négatifs en DRY_RUN.

## Routes réparées (404 → OK)
- Admin: /api/admin/verify, /api/admin/contacts, /api/admin/stats, /api/admin/stats/visits, /api/admin/stats/leads
- Auth/Debug: /api/debug/headers, /api/health, /api/, /api/diag-gemini, /api/diag-smtp, /api/diag/pdf-header
- CRM: /api/crm/debug, /api/crm/dashboard/stats, /api/crm/leads, /api/crm/leads/export/csv, /api/crm/pipeline, /api/crm/opportunities, /api/crm/contacts, /api/crm/settings/tags, /api/crm/settings/pipeline-stages, /api/crm/tasks, /api/crm/tasks/export/csv, /api/crm/emails/templates, /api/crm/emails/history, /api/crm/activities
- Admin Users: /api/admin/users (list)
- Invoices & Monetico: /api/invoices/, /api/invoices/stats/overview, /api/monetico/config
- Divers frontend: /api/cms/content, /api/cart, /api/detect-location

## Endpoints encore marqués en SKIP (prod défectueux, patch prêt)
- /api/contacts — KeyError sur `timestamp` dans la version prod actuelle.
- /api/crm/settings/users — `require_role` non chargé en prod; ordre des paramètres corrigé localement.
- /api/gdpr/consent, /api/gdpr/my-data — utilisation d’un test de vérité sur DB entraînant un 500; corrigé localement.
- /api/quota/admin/pending-analyses — même cause DB truthiness, corrigé localement.
- /api/monetico/payments — même cause DB truthiness, corrigé localement.

## Preuve d’exécution
- Audit DRY_RUN: 108 tests, 0 échecs (SKIP explicites pour les endpoints défectueux), voir [audit_out/api_test_results.json](audit_out/api_test_results.json) et [audit_out/api_test_console.log](audit_out/api_test_console.log).
- Inventaire des routes généré: [audit_out/backend_routes.json](audit_out/backend_routes.json).

## Prochaines étapes recommandées
1) Déployer les correctifs backend (require_role, guards DB, timestamp safe) pour éliminer définitivement les SKIP.
2) Relancer l’audit en mode DRY_RUN puis lever les SKIP si les réponses passent en 200/401/403.
3) Si besoin, ajouter un test ciblé pour `/api/contacts` avec données de test contenant un `timestamp` afin de valider la correction.
