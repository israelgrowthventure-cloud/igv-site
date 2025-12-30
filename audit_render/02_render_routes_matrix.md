# MATRICE DES ROUTES/ENDPOINTS - AUDIT FACTUEL
## Date: 30 décembre 2025

---

## RÉCAPITULATIF PAR DOMAINE

### 1. ENDPOINTS PUBLICS (No Auth)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/` | GET | server.py | 130 | Root - message status |
| `/health` | GET | server.py | 127 | Health check (no DB) |
| `/api/health` | GET | server.py | 255 | Health check (with MongoDB) |
| `/api/` | GET | server.py | 436 | API root message |
| `/api/contact` | POST | server.py | 441 | Contact form submission |
| `/api/contacts` | GET | server.py | 502 | List contacts (public?) |
| `/api/cart` | POST | server.py | 514 | Add to cart |
| `/api/cart` | GET | server.py | 524 | Get cart items |
| `/api/detect-location` | GET | server.py | 533 | IP geolocation |
| `/api/diag-gemini` | GET | mini_analysis_routes.py | 67 | Gemini API diagnostic |
| `/api/mini-analysis` | POST | mini_analysis_routes.py | 690 | Generate mini-analysis |
| `/api/mini-analysis/debug` | GET | mini_analysis_routes.py | 562 | Debug info |

### 2. ENDPOINTS CRM (Auth JWT Required)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/crm/debug` | GET | crm_complete_routes.py | 213 | Debug CRM connection |
| `/api/crm/dashboard/stats` | GET | crm_complete_routes.py | 252 | Dashboard KPIs |
| `/api/crm/leads` | GET | crm_complete_routes.py | 325 | List leads (paginated) |
| `/api/crm/leads/{lead_id}` | GET | crm_complete_routes.py | 379 | Get single lead |
| `/api/crm/leads` | POST | crm_complete_routes.py | 414 | Create lead |
| `/api/crm/leads/{lead_id}` | PUT | crm_complete_routes.py | 461 | Update lead |
| `/api/crm/leads/{lead_id}/notes` | POST | crm_complete_routes.py | 502 | Add note to lead |
| `/api/crm/leads/{lead_id}/convert-to-contact` | POST | crm_complete_routes.py | 523 | Convert lead to contact |
| `/api/crm/leads/export/csv` | GET | crm_complete_routes.py | 586 | Export leads CSV |
| `/api/crm/pipeline` | GET | crm_complete_routes.py | 640 | Get pipeline/opportunities |
| `/api/crm/opportunities` | POST | crm_complete_routes.py | 679 | Create opportunity |
| `/api/crm/opportunities/{opp_id}` | PUT | crm_complete_routes.py | 709 | Update opportunity |
| `/api/crm/contacts` | GET | crm_complete_routes.py | 760 | List contacts |
| `/api/crm/contacts/{contact_id}` | GET | crm_complete_routes.py | 796 | Get single contact |
| `/api/crm/contacts` | POST | crm_complete_routes.py | 828 | Create contact |
| `/api/crm/contacts/{contact_id}` | PUT | crm_complete_routes.py | 854 | Update contact |
| `/api/crm/settings/users` | GET | crm_complete_routes.py | 884 | List CRM users |
| `/api/crm/settings/users` | POST | crm_complete_routes.py | 904 | Create CRM user |
| `/api/crm/settings/users/{user_id}` | PUT | crm_complete_routes.py | 952 | Update CRM user |
| `/api/crm/settings/tags` | GET | crm_complete_routes.py | 992 | List tags |
| `/api/crm/settings/tags` | POST | crm_complete_routes.py | 1005 | Create tag |
| `/api/crm/settings/pipeline-stages` | GET | crm_complete_routes.py | 1023 | List pipeline stages |
| `/api/crm/tasks` | GET | crm_complete_routes.py | 1049 | List tasks |
| `/api/crm/tasks` | POST | crm_complete_routes.py | 1108 | Create task |
| `/api/crm/tasks/{task_id}` | GET | crm_complete_routes.py | 1150 | Get single task |
| `/api/crm/tasks/{task_id}` | PATCH | crm_complete_routes.py | 1170 | Update task |
| `/api/crm/tasks/{task_id}` | DELETE | crm_complete_routes.py | 1218 | Delete task |
| `/api/crm/tasks/export/csv` | GET | crm_complete_routes.py | 1238 | Export tasks CSV |

### 3. ENDPOINTS ADMIN (Auth JWT Required)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/admin/bootstrap` | POST | server.py | 666 | Bootstrap admin account |
| `/api/admin/login` | POST | server.py | 695 | Admin login (returns JWT) |
| `/api/admin/verify` | GET | server.py | 715 | Verify JWT token |
| `/api/admin/contacts` | GET | server.py | 723 | List all contacts |
| `/api/admin/stats` | GET | server.py | 738 | Dashboard statistics |
| `/api/admin/users` | POST | server.py | 775 | Create admin user |
| `/api/admin/users` | GET | server.py | 808 | List admin users |
| `/api/admin/users/{email}` | DELETE | server.py | 826 | Deactivate user |
| `/api/admin/stats/visits` | GET | admin_routes.py | 36 | Visit statistics |
| `/api/admin/stats/leads` | GET | admin_routes.py | 125 | Lead statistics |
| `/api/admin/process-pending` | POST | admin_routes.py | 196 | Process pending analyses |
| `/api/admin/pending-stats` | GET | admin_routes.py | 365 | Pending analyses stats |
| `/api/admin/leads` | GET | crm_routes.py | 130 | Legacy leads endpoint |
| `/api/admin/test-gemini-multilang` | POST | mini_analysis_routes.py | 596 | Test Gemini multilang |

### 4. ENDPOINTS INVOICES (Auth JWT Required)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/invoices/` | GET | invoice_routes.py | 457 | List invoices |
| `/api/invoices/` | POST | invoice_routes.py | 488 | Create invoice |
| `/api/invoices/{invoice_id}` | GET | invoice_routes.py | 563 | Get invoice details |
| `/api/invoices/{invoice_id}/generate-pdf` | POST | invoice_routes.py | 585 | Generate PDF |
| `/api/invoices/{invoice_id}/send` | POST | invoice_routes.py | 639 | Send invoice email |
| `/api/invoices/{invoice_id}` | PATCH | invoice_routes.py | 714 | Update invoice |
| `/api/invoices/{invoice_id}` | DELETE | invoice_routes.py | 758 | Delete invoice |
| `/api/invoices/stats/overview` | GET | invoice_routes.py | 789 | Invoice statistics |

### 5. ENDPOINTS MONETICO/PAYMENT

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/monetico/config` | GET | monetico_routes.py | 164 | Payment config status |
| `/api/monetico/init` | POST | monetico_routes.py | 176 | Init payment |
| `/api/monetico/notify` | POST | monetico_routes.py | 272 | Webhook IPN |
| `/api/monetico/payment/{payment_id}` | GET | monetico_routes.py | 403 | Get payment status |
| `/api/monetico/payments` | GET | monetico_routes.py | 423 | List payments |
| `/api/monetico/init-payment` | POST | server.py | 854 | Legacy payment init |
| `/api/monetico/callback` | POST | server.py | 899 | Legacy callback |

### 6. ENDPOINTS TRACKING & GDPR

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/track/visit` | POST | tracking_routes.py | 47 | Track page visit |
| `/api/track/stats` | GET | tracking_routes.py | 103 | Visit statistics |
| `/api/consent` | POST | gdpr_routes.py | 71 | Save consent |
| `/api/consent` | GET | gdpr_routes.py | 122 | Get consent status |
| `/api/track/visit` | POST | gdpr_routes.py | 155 | GDPR-compliant visit |
| `/api/newsletter/subscribe` | POST | gdpr_routes.py | 231 | Newsletter signup |
| `/api/newsletter/unsubscribe` | POST | gdpr_routes.py | 307 | Unsubscribe |
| `/api/newsletter/delete-data` | DELETE | gdpr_routes.py | 343 | Delete data |
| `/api/my-data` | GET | gdpr_routes.py | 366 | Export my data |
| `/api/delete-all-data` | DELETE | gdpr_routes.py | 402 | Delete all data |

### 7. ENDPOINTS EXTENDED (PDF, Email, Calendar)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/diag/pdf-header` | GET | extended_routes.py | 232 | PDF header diagnostic |
| `/api/diag/smtp` | GET | extended_routes.py | 268 | SMTP diagnostic |
| `/api/contact-expert` | POST | extended_routes.py | 285 | Contact expert form |
| `/api/pdf/generate` | POST | extended_routes.py | 355 | Generate PDF |
| `/api/email/send-pdf` | POST | extended_routes.py | 584 | Email PDF |
| `/api/calendar/create-event` | POST | extended_routes.py | 646 | Create calendar event |

### 8. ENDPOINTS QUOTA QUEUE

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/queue-analysis` | POST | quota_queue_routes.py | 52 | Queue analysis |
| `/api/queue-status/{queue_id}` | GET | quota_queue_routes.py | 146 | Queue status |
| `/api/admin/pending-analyses` | GET | quota_queue_routes.py | 172 | List pending |
| `/api/admin/process-pending/{queue_id}` | POST | quota_queue_routes.py | 211 | Process single |
| `/api/admin/retry-failed` | POST | quota_queue_routes.py | 257 | Retry failed |

### 9. ENDPOINTS AI/INSIGHT

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/generate-insight` | POST | ai_routes.py | 205 | Generate AI insight |

### 10. ENDPOINTS DEBUG/DIAG

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/debug/routers` | GET | server.py | 110 | Check router status |
| `/api/debug/headers` | GET | server.py | 239 | Show request headers |
| `/api/health/crm` | GET | crm_routes.py | 158 | CRM health check |

---

## RÉSUMÉ COMPTAGE ENDPOINTS

| Catégorie | Nombre d'endpoints |
|-----------|-------------------|
| Publics (no auth) | 12 |
| CRM (auth JWT) | 26 |
| Admin (auth JWT) | 14 |
| Invoices (auth JWT) | 8 |
| Monetico/Payment | 7 |
| Tracking/GDPR | 10 |
| Extended (PDF/Email) | 6 |
| Quota Queue | 5 |
| AI/Insight | 1 |
| Debug/Diag | 3 |
| **TOTAL** | **92 endpoints** |

---

## ROUTES CMS (Content Management)

| Route | Méthode | Fichier | Ligne | Description |
|-------|---------|---------|-------|-------------|
| `/api/cms/content` | GET | server.py | 617 | Get CMS content |
| `/api/cms/content` | POST | server.py | 632 | Save CMS content |

**Note:** Ces endpoints existent mais le CMS est **basique** (stockage JSON GrapesJS).

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
