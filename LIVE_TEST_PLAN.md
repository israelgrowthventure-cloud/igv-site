# LIVE TEST PLAN IGV (Phase 2)

## Frontend (prod target: https://israelgrowthventure.com)
- / (Home)
  - Expect: page renders, hero CTA visible, location badge shown; footer translated via i18n.
  - Verify tracking consent banner appears; network: no 404 assets.
- /mini-analyse
  - Form submit (FR/EN/HE): POST backend /api/mini-analysis with required fields; expect 200 JSON {success:true, analysis:text}.
  - Quota path: simulate 429 response displays quota message; scroll to results section.
  - Buttons: Download PDF triggers /api/pdf/generate; Email PDF triggers /api/email/send-pdf; Contact expert triggers /api/contact-expert.
- /packs
  - Pricing shows unified price across Analyse/Succursales/Franchise; region label shows detected country or fallback International.
- /contact
  - Submit form -> backend /api/contact; expect 200 with id + timestamp; email notification sent.
- /admin/login
  - Page loads; login with admin credentials hits /api/admin/login; expect 200 JWT stored; redirect to /admin/dashboard.
- /admin/dashboard
  - Requires JWT; stats cards populated via /api/admin/stats; recent leads via /api/admin/leads.
- /admin/crm
  - Requires JWT; tabs Dashboard/Leads/Pipeline/Contacts/Settings; data from /api/crm/* endpoints.
- /admin/invoices
  - Requires JWT; list invoices from /api/invoices/; actions generate-pdf (/api/invoices/{id}/generate-pdf) and send (/api/invoices/{id}/send).
- /admin/payments
  - Requires JWT; list payments via /api/monetico/payments.
- /admin/tasks
  - Requires JWT; list/create/update/delete via /api/crm/tasks endpoints.
- /payment/return
  - Monetico return page renders status param; no console errors.

## Backend (prod target: https://igv-backend.onrender.com)
- GET /health
  - Expect 200 {status:"ok", service:"igv-backend", version, no DB dependency}.
- GET /api/health
  - Expect 200 {status:"ok", mongodb:"connected"|"configured"} within 3s.
- GET /api/detect-location
  - Expect region/country/currency fields; uses IP headers.
- POST /api/contact
  - Payload: {name, email, company?, phone?, message, language}; Expect 200 ContactResponse with id/timestamp; Mongo insert; email sent to CONTACT_EMAIL.
- POST /api/track/visit
  - Payload: {page, referrer?, language, utm_source?, utm_medium?, utm_campaign?, consent_analytics:true}; Expect 200 tracked with visit_id.
- GET /api/track/stats?range=7d|30d|90d
  - Expect aggregated stats counts.
- POST /api/mini-analysis
  - Payload: {email, nom_de_marque or brand_name/company_name, secteur, language, autres champs}; Expect 200 {success:true, analysis:text, lead_id?, contact_id?}. Reject 409 duplicate; 429 quota path with error_code GEMINI_QUOTA_DAILY.
- GET /api/diag-gemini
  - Expect ok:true when GEMINI_API_KEY set.
- POST /api/pdf/generate
  - Payload: {email, brandName, sector, analysis, language}; Expect 200 with pdfBase64 or pdfUrl.
- POST /api/email/send-pdf
  - Payload: {email, brandName, sector, analysis, language}; Expect 200 success true; email sent.
- POST /api/contact-expert
  - Payload: {email, brandName, sector, country?, language, source}; Expect 200 success.
- POST /api/calendar/create-event
  - Payload: {email, brandName, sector, language, date/time}; Expect 200 calendar event created.

### Admin/Auth
- POST /api/admin/login
  - Payload: {email, password}; Expect 200 access_token, role.
- GET /api/admin/verify (Authorization: Bearer)
  - Expect 200 {email, role}.
- POST /api/admin/bootstrap (token)
  - Payload: {token:BOOTSTRAP_TOKEN}; Expect 200 admin created/updated.
- GET /api/admin/stats (Bearer)
  - Expect totals counts.
- GET /api/admin/contacts (Bearer)
  - Expect list contacts sorted desc.
- POST /api/admin/users (Bearer admin)
  - Payload: {email, password, role}; Expect 200 user created.
- DELETE /api/admin/users/{email} (Bearer admin)
  - Expect 200 deactivated.

### CRM Complete (/api/crm, Bearer required)
- GET /api/crm/dashboard/stats
  - Expect KPIs: leads today/7d/30d, pipeline_value, tasks.overdue, top_sources, stage_distribution.
- GET /api/crm/leads?skip&limit&status&stage&owner&search&language
  - Expect pagination object {leads,total,skip,limit}; dates iso.
- GET /api/crm/leads/{id}
  - Expect lead + activities.
- POST /api/crm/leads
  - Payload: LeadCreate {email, brand_name, …}; Expect 201 with lead_id; duplicates 400.
- PATCH /api/crm/leads/{id}
  - Payload: LeadUpdate fields; Expect 200.
- GET /api/crm/contacts?search&limit
  - Expect contacts array.
- POST /api/crm/contacts
  - Payload: ContactCreate {email,name,phone?,position?,language}; Expect 201 contact_id.
- PATCH /api/crm/contacts/{id}
  - Payload: ContactUpdate; Expect 200.
- GET /api/crm/pipeline
  - Expect pipeline aggregation by stage with totals.
- POST /api/crm/opportunities
  - Payload: OpportunityCreate {name, lead_id/contact_id?, value?, stage, probability, expected_close_date?}; Expect 201.
- PATCH /api/crm/opportunities/{id}
  - Payload: OpportunityUpdate; Expect 200.
- GET /api/crm/tasks?status=open|done (optional)
  - Expect tasks list.
- POST /api/crm/tasks
  - Payload: TaskCreate {title, description?, assigned_to_email?, lead_id?, contact_id?, opportunity_id?, due_date?, priority}; Expect 201 task_id.
- PATCH /api/crm/tasks/{id}
  - Payload: TaskUpdate {title?, description?, assigned_to_email?, due_date?, priority?, is_completed?}; Expect 200.
- DELETE /api/crm/tasks/{id}
  - Expect 200.
- GET /api/crm/settings/users|tags|pipeline-stages
  - Expect respective config lists.

### Invoicing (/api/invoices, Bearer required)
- GET /api/invoices/?status=&skip=&limit=
  - Expect {invoices,total,skip,limit}.
- POST /api/invoices/
  - Payload: InvoiceCreate {client_email, client_name, items:[{description,quantity,unit_price,discount_percent?,tax_rate?}], currency, language, due_days?, notes?, contact_id?, lead_id?, opportunity_id?}; Expect 200 invoice with invoice_number INV-YYYY-xxxxx.
- GET /api/invoices/{id}
  - Expect invoice details.
- POST /api/invoices/{id}/generate-pdf
  - Expect {success:true, pdf_base64, invoice_number}; PDF contains TVA 18% and totals.
- POST /api/invoices/{id}/send
  - Expect {success:true} and email sent; status becomes SENT, email_events logged.
- PATCH /api/invoices/{id}
  - Payload: InvoiceUpdate {status?, paid_amount?, payment_method?, notes?}; Expect 200; if status PAID sets payment_date.
- DELETE /api/invoices/{id}
  - Expect status set to CANCELED.
- GET /api/invoices/stats/overview
  - Expect totals by status and amounts.

### Monetico (/api/monetico, Bearer for init/list/payment)
- GET /api/monetico/config (public)
  - Expect {configured:boolean, tpe?, endpoint?, version, message}.
- POST /api/monetico/init (Bearer)
  - Payload: PaymentInitRequest {amount, currency, reference, description, client_email, client_name, invoice_id?, contact_id?, opportunity_id?, language}; Expect 200 {payment_id, monetico_endpoint, form_data{TPE,date,montant,reference,MAC,...}}; DB insert payments + timeline.
- POST /api/monetico/notify (Monetico webhook)
  - Form-data from Monetico incl MAC; Expect MAC verified, updates payment status, invoice status to PAID, timeline events; returns version=2\ncdr=0.
- GET /api/monetico/payment/{payment_id} (Bearer)
  - Expect payment object with status.
- GET /api/monetico/payments?status&skip&limit (Bearer)
  - Expect paginated payments list.

### Other legacy monetico endpoints (server.py)
- POST /api/monetico/init-payment
  - Payload: {pack_type:'analyse', amount, currency, customer_email, customer_name, language}; Expect form_data with MAC; used by legacy flow.
- POST /api/monetico/callback
  - Expect acknowledgment {version:"3.0", cdr:"0"} after processing.

## Validation Notes
- Use prod URLs unless instructed otherwise; ensure Authorization Bearer token from /api/admin/login for protected routes.
- For PDF/email tests, verify email deliverability via SMTP logs or inbox; PDF base64 decodes correctly.
- For Monetico notify, simulate with correct MAC to verify PAID status propagation to invoices.
- For mini-analysis, verify lead/contact creation in Mongo (collections: leads, contacts, mini_analyses, email_events, timeline_events, tasks, invoices, payments, visits).
- For i18n, verify FR/EN/HE texts and RTL on /mini-analyse and admin.
