# REPO AUDIT IGV (Phase 1)

| Fonctionnalité | Fichiers principaux | Route frontend | Route backend | Dépendances clés | Statut initial |
| --- | --- | --- | --- | --- | --- |
| Santé service (health root + /api/health) | backend/server.py | n/a | /health, /api/health | FastAPI | NON VALIDÉ |
| Détection géoloc/pricing | backend/server.py (/api/detect-location), frontend/src/utils/api.js, frontend/src/utils/pricing.js | / (Home), /packs | /api/detect-location | httpx, Mongo optionnel | NON VALIDÉ |
| Formulaire contact + email | backend/server.py (/api/contact), frontend/src/pages/Contact.js | /contact | /api/contact | SMTP (aiosmtplib), Mongo | NON VALIDÉ |
| Tracking visites + consentement | backend/tracking_routes.py | hook tracking (frontend components) | /api/track/visit, /api/track/stats | Mongo | NON VALIDÉ |
| Mini-analyse AI (soumission + lead) | backend/mini_analysis_routes.py, backend/prompts/*, backend/igv_internal/*, frontend/src/pages/MiniAnalysis.js | /mini-analyse | /api/mini-analysis (+ /diag-gemini) | GEMINI_API_KEY, Mongo, reportlab (PDF), SMTP | NON VALIDÉ |
| Mini-analyse PDF/email/CTA | backend/extended_routes.py | /mini-analyse (boutons PDF/email), /appointment | /api/pdf/generate, /api/email/send-pdf, /api/contact-expert, /api/calendar/create-event | reportlab, SMTP, Google Calendar | NON VALIDÉ |
| Admin authentification JWT | backend/server.py (admin endpoints), frontend/src/pages/admin/Login.js, frontend/src/pages/AdminLogin.js | /admin/login | /api/admin/login, /api/admin/verify, /api/admin/bootstrap, /api/admin/users | JWT_SECRET, Mongo | NON VALIDÉ |
| Admin dashboard (statistiques) | backend/server.py (/api/admin/stats, /api/admin/contacts), frontend/src/pages/admin/Dashboard.js | /admin/dashboard | /api/admin/stats, /api/admin/contacts | JWT, Mongo | NON VALIDÉ |
| CRM complet (leads/contacts/pipeline/settings) | backend/crm_complete_routes.py, frontend/src/pages/admin/AdminCRMComplete.js, frontend/src/pages/AdminCRM.js, components/crm/* | /admin/crm | /api/crm/* (dashboard/stats, leads CRUD, contacts CRUD, pipeline, settings users/tags/stages, tasks) | Mongo, JWT | NON VALIDÉ |
| Tâches CRM | backend/crm_complete_routes.py (tasks), frontend/src/pages/AdminTasks.js | /admin/tasks | /api/crm/tasks (GET/POST/PATCH/DELETE) | Mongo, JWT | NON VALIDÉ |
| Facturation (invoices) | backend/invoice_routes.py, backend/models/invoice_models.py, frontend/src/pages/AdminInvoices.js | /admin/invoices | /api/invoices/* (list, create, detail, generate-pdf, send, update, stats) | Mongo, JWT, reportlab, SMTP | NON VALIDÉ |
| Paiements Monetico | backend/monetico_routes.py, frontend/src/pages/AdminPayments.js, frontend/src/pages/PaymentReturn.js | /payment/return, /admin/payments | /api/monetico/config, /api/monetico/init, /api/monetico/notify, /api/monetico/payment/{id}, /api/monetico/payments | MONETICO_* env, Mongo, JWT | NON VALIDÉ |
| Pages marketing (Home, Packs, About, Contact, Terms, Privacy, Cookies) + i18n Footer | frontend/src/App.js, frontend/src/pages/Home.js, frontend/src/pages/Packs.js, frontend/src/components/Footer.js, frontend/src/i18n/* | /, /packs, /about, /contact, /terms, /privacy, /cookies | Consomme /api/detect-location, /api/contact | i18next, axios | NON VALIDÉ |
