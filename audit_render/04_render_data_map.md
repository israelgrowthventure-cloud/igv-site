# DATA MAP - BASES DE DONNÉES & COLLECTIONS
## Date: 30 décembre 2025

---

## BASE DE DONNÉES

### Configuration

| Paramètre | Valeur (masquée) |
|-----------|------------------|
| **Type** | MongoDB Atlas (Cloud) |
| **Driver** | `motor` 3.3.1 (async) |
| **Variable** | `MONGODB_URI` ou `MONGO_URL` |
| **Database Name** | `igv_production` (variable `DB_NAME`) |
| **Connection Pool** | maxPoolSize=10, minPoolSize=1 |
| **Timeout** | 5000ms |

**Preuve:** server.py lignes 77-99

---

## COLLECTIONS MONGODB (Prouvées par code)

### 1. Collection `users`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `id` | String (UUID) | ID custom | server.py:308 |
| `email` | EmailStr | Email unique | server.py:306 |
| `password_hash` | String | SHA-256 hash | server.py:307 |
| `role` | String | admin/sales/viewer | server.py:308 |
| `created_at` | datetime | Date création | server.py:309 |
| `is_active` | Boolean | Actif ou non | server.py:310 |

**Utilisation:** Admin login, user management
**Preuve:** server.py lignes 304-310, 677-845

---

### 2. Collection `crm_users`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `email` | EmailStr | Email unique | crm_complete_routes.py:906 |
| `name` | String | Nom complet | crm_complete_routes.py:906 |
| `password_hash` | String | Hash password | crm_complete_routes.py:940 |
| `role` | String | admin/sales/viewer | crm_complete_routes.py:906 |
| `is_active` | Boolean | Actif ou non | crm_complete_routes.py:940 |
| `created_at` | datetime | Date création | crm_complete_routes.py:940 |

**Utilisation:** CRM users (séparé de users admin)
**Preuve:** crm_complete_routes.py lignes 904-950

---

### 3. Collection `leads`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `email` | EmailStr | Email contact | crm_models.py:102 |
| `brand_name` | String | Nom marque | crm_complete_routes.py:101 |
| `name` | String | Nom contact | crm_complete_routes.py:102 |
| `phone` | String | Téléphone | crm_complete_routes.py:103 |
| `sector` | String | Secteur activité | crm_models.py:43-50 |
| `language` | String | fr/en/he | crm_complete_routes.py:105 |
| `expansion_type` | String | franchise/branch/etc | crm_models.py:35-41 |
| `format` | String | flagship/corner/etc | crm_models.py:53-60 |
| `budget_estimated` | Float | Budget estimé | crm_complete_routes.py:108 |
| `target_city` | String | Ville cible | crm_complete_routes.py:109 |
| `timeline` | String | Timeline projet | crm_complete_routes.py:110 |
| `source` | String | Source lead | crm_complete_routes.py:111 |
| `utm_source` | String | UTM tracking | crm_complete_routes.py:112 |
| `utm_medium` | String | UTM tracking | crm_complete_routes.py:113 |
| `utm_campaign` | String | UTM tracking | crm_complete_routes.py:114 |
| `status` | String | NEW/CONTACTED/etc | crm_models.py:16-22 |
| `stage` | String | analysis_requested/etc | crm_models.py:25-33 |
| `priority` | String | A/B/C | crm_models.py:63-66 |
| `tags` | Array[String] | Tags | crm_complete_routes.py:441 |
| `owner_email` | String | Propriétaire lead | crm_complete_routes.py:127 |
| `created_at` | datetime | Date création | crm_complete_routes.py:445 |
| `updated_at` | datetime | Date maj | crm_complete_routes.py:446 |
| `request_count` | Int | Nb demandes | crm_complete_routes.py:447 |
| `activity_count` | Int | Nb activités | crm_complete_routes.py:448 |

**Utilisation:** CRM leads management
**Preuve:** crm_complete_routes.py lignes 97-138, crm_models.py

---

### 4. Collection `contacts`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `id` | String (UUID) | ID custom | server.py:277 |
| `name` | String | Nom contact | server.py:278 |
| `email` | EmailStr | Email | server.py:279 |
| `company` | String | Société | server.py:280 |
| `phone` | String | Téléphone | server.py:281 |
| `message` | String | Message | server.py:282 |
| `language` | String | Langue | server.py:283 |
| `timestamp` | datetime | Date | server.py:284 |
| `position` | String | Position (CRM) | crm_complete_routes.py:161 |
| `tags` | Array[String] | Tags | crm_complete_routes.py:167 |

**Utilisation:** Contact form submissions + CRM contacts
**Preuve:** server.py lignes 273-284, crm_complete_routes.py lignes 157-168

---

### 5. Collection `opportunities`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `name` | String | Nom opportunité | crm_complete_routes.py:141 |
| `lead_id` | String | Lien lead | crm_complete_routes.py:142 |
| `contact_id` | String | Lien contact | crm_complete_routes.py:143 |
| `value` | Float | Valeur estimée | crm_complete_routes.py:144 |
| `stage` | String | Stage pipeline | crm_complete_routes.py:145 |
| `probability` | Int | Probabilité % | crm_complete_routes.py:146 |
| `expected_close_date` | datetime | Date clôture prévue | crm_complete_routes.py:147 |
| `is_closed` | Boolean | Fermé | crm_complete_routes.py:271 |
| `is_won` | Boolean | Gagné | crm_complete_routes.py:272 |
| `owner_email` | String | Propriétaire | crm_complete_routes.py:153 |
| `next_step` | String | Prochaine action | crm_complete_routes.py:154 |
| `next_action_date` | datetime | Date prochaine action | crm_complete_routes.py:155 |

**Utilisation:** Pipeline commercial
**Preuve:** crm_complete_routes.py lignes 140-155, 679-755

---

### 6. Collection `tasks`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `title` | String | Titre tâche | crm_complete_routes.py:171 |
| `description` | String | Description | crm_complete_routes.py:172 |
| `assigned_to_email` | String | Assigné à | crm_complete_routes.py:173 |
| `lead_id` | String | Lien lead | crm_complete_routes.py:174 |
| `contact_id` | String | Lien contact | crm_complete_routes.py:175 |
| `opportunity_id` | String | Lien opportunité | crm_complete_routes.py:176 |
| `due_date` | datetime | Date échéance | crm_complete_routes.py:177 |
| `priority` | String | A/B/C | crm_complete_routes.py:178 |
| `is_completed` | Boolean | Terminé | crm_complete_routes.py:185 |
| `created_at` | datetime | Date création | implicite |

**Utilisation:** Task management CRM
**Preuve:** crm_complete_routes.py lignes 170-186, 1049-1285

---

### 7. Collection `activities`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `type` | String | note/call/email/etc | crm_models.py:76-86 |
| `subject` | String | Sujet | crm_complete_routes.py:455 |
| `description` | String | Description | crm_complete_routes.py:456 |
| `lead_id` | String | Lien lead | crm_complete_routes.py:457 |
| `user_id` | String | User créateur | crm_complete_routes.py:458 |
| `user_email` | String | Email créateur | crm_complete_routes.py:459 |
| `metadata` | Dict | Données extra | crm_complete_routes.py:460 |
| `created_at` | datetime | Date | crm_complete_routes.py:461 |

**Utilisation:** Timeline/Activity log
**Preuve:** crm_complete_routes.py lignes 453-462

---

### 8. Collection `mini_analyses`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `email` | EmailStr | Email demandeur | mini_analysis_routes.py |
| `brand_name` | String | Nom marque | mini_analysis_routes.py |
| `sector` | String | Secteur | mini_analysis_routes.py |
| `language` | String | fr/en/he | mini_analysis_routes.py |
| `analysis_text` | String | Texte généré | mini_analysis_routes.py |
| `pdf_base64` | String | PDF encodé | mini_analysis_routes.py |
| `created_at` | datetime | Date création | mini_analysis_routes.py |
| `status` | String | pending/completed | mini_analysis_routes.py |
| `gemini_model` | String | Modèle utilisé | mini_analysis_routes.py |

**Utilisation:** Stockage mini-analyses générées
**Preuve:** mini_analysis_routes.py, admin_routes.py

---

### 9. Collection `invoices`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `invoice_number` | String | INV-2025-00001 | invoice_models.py:58 |
| `invoice_date` | datetime | Date facture | invoice_models.py:59 |
| `due_date` | datetime | Date échéance | invoice_models.py:60 |
| `client_email` | EmailStr | Email client | invoice_models.py:63 |
| `client_name` | String | Nom client | invoice_models.py:64 |
| `client_company` | String | Société | invoice_models.py:65 |
| `client_address` | String | Adresse | invoice_models.py:66 |
| `items` | Array | Lignes facture | invoice_models.py:75 |
| `subtotal` | Float | Sous-total HT | invoice_models.py:78 |
| `tax_rate` | Float | TVA 18% | invoice_models.py:79 |
| `tax_amount` | Float | Montant TVA | invoice_models.py:80 |
| `total_amount` | Float | Total TTC | invoice_models.py:82 |
| `currency` | String | USD/EUR/ILS | invoice_models.py:85 |
| `status` | String | DRAFT/SENT/PAID | invoice_models.py:88 |
| `paid_amount` | Float | Montant payé | invoice_models.py:91 |
| `payment_method` | String | Méthode paiement | invoice_models.py:92 |
| `contact_id` | String | Lien contact | invoice_models.py:71 |
| `lead_id` | String | Lien lead | invoice_models.py:72 |
| `opportunity_id` | String | Lien opportunité | invoice_models.py:73 |

**Utilisation:** Facturation
**Preuve:** invoice_models.py, invoice_routes.py

---

### 10. Collection `payments`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `payment_id` | String | PAY-... | monetico_routes.py:193 |
| `invoice_id` | String | Lien facture | monetico_routes.py |
| `amount` | Float | Montant | monetico_routes.py |
| `currency` | String | Devise | monetico_routes.py |
| `status` | String | INITIATED/PAID/etc | invoice_models.py:20-26 |
| `client_email` | EmailStr | Email client | monetico_routes.py |
| `monetico_reference` | String | Ref Monetico | monetico_routes.py |
| `created_at` | datetime | Date | monetico_routes.py |
| `completed_at` | datetime | Date paiement | monetico_routes.py |

**Utilisation:** Paiements Monetico
**Preuve:** monetico_routes.py, invoice_models.py

---

### 11. Collection `visits`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `page` | String | Page visitée | tracking_routes.py:41 |
| `referrer` | String | Referrer | tracking_routes.py:42 |
| `language` | String | Langue | tracking_routes.py:43 |
| `utm_source` | String | UTM source | tracking_routes.py:44 |
| `utm_medium` | String | UTM medium | tracking_routes.py:45 |
| `utm_campaign` | String | UTM campaign | tracking_routes.py:46 |
| `ip_address` | String | IP visiteur | tracking_routes.py:80 |
| `user_agent` | String | User agent | tracking_routes.py:81 |
| `timestamp` | datetime | Date visite | tracking_routes.py:82 |

**Utilisation:** Analytics/Tracking
**Preuve:** tracking_routes.py lignes 40-82

---

### 12. Collection `cart`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `id` | String (UUID) | ID custom | server.py:289 |
| `pack_name` | String | Nom pack | server.py:290 |
| `pack_type` | String | Type pack | server.py:291 |
| `price` | Float | Prix | server.py:292 |
| `currency` | String | Devise | server.py:293 |
| `region` | String | Région | server.py:294 |
| `timestamp` | datetime | Date | server.py:295 |

**Utilisation:** Panier (temporaire)
**Preuve:** server.py lignes 287-295

---

### 13. Collection `cms_content`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `id` | String (UUID) | ID custom | server.py:299 |
| `page` | String | Nom page | server.py:300 |
| `language` | String | fr/en/he | server.py:301 |
| `content` | Dict | JSON GrapesJS | server.py:302 |
| `updated_by` | String | Email éditeur | server.py:303 |
| `updated_at` | datetime | Date maj | server.py:304 |

**Utilisation:** CMS basique (stockage contenu)
**Preuve:** server.py lignes 297-304

---

### 14. Collection `consents`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `email` | String | Email user | gdpr_routes.py |
| `analytics` | Boolean | Consent analytics | gdpr_routes.py |
| `marketing` | Boolean | Consent marketing | gdpr_routes.py |
| `functional` | Boolean | Consent functional | gdpr_routes.py |
| `created_at` | datetime | Date | gdpr_routes.py |
| `updated_at` | datetime | Date maj | gdpr_routes.py |

**Utilisation:** GDPR Consent tracking
**Preuve:** gdpr_routes.py

---

### 15. Collection `newsletter_subscribers`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `email` | EmailStr | Email | gdpr_routes.py:231 |
| `language` | String | Langue | gdpr_routes.py |
| `subscribed_at` | datetime | Date inscription | gdpr_routes.py |
| `is_active` | Boolean | Actif | gdpr_routes.py |

**Utilisation:** Newsletter
**Preuve:** gdpr_routes.py lignes 231-340

---

### 16. Collection `analysis_queue`

| Champ | Type | Description | Preuve |
|-------|------|-------------|--------|
| `_id` | ObjectId | ID MongoDB | implicite |
| `queue_id` | String | ID queue | quota_queue_routes.py |
| `email` | EmailStr | Email demandeur | quota_queue_routes.py |
| `brand_name` | String | Marque | quota_queue_routes.py |
| `status` | String | pending/processing/completed | quota_queue_routes.py |
| `created_at` | datetime | Date | quota_queue_routes.py |
| `processed_at` | datetime | Date traitement | quota_queue_routes.py |
| `error` | String | Message erreur | quota_queue_routes.py |

**Utilisation:** Queue analyses Gemini (quota)
**Preuve:** quota_queue_routes.py

---

## RÉSUMÉ COLLECTIONS

| # | Collection | Documents estimés | Critique |
|---|------------|-------------------|----------|
| 1 | `users` | Faible (<100) | ✅ Oui |
| 2 | `crm_users` | Faible (<50) | ✅ Oui |
| 3 | `leads` | Moyen (100-1000) | ✅ Oui |
| 4 | `contacts` | Moyen (100-1000) | ✅ Oui |
| 5 | `opportunities` | Faible (<100) | ⚠️ Important |
| 6 | `tasks` | Moyen (<500) | ⚠️ Important |
| 7 | `activities` | Élevé (1000+) | ⚠️ Important |
| 8 | `mini_analyses` | Moyen (100-500) | ✅ Oui |
| 9 | `invoices` | Faible (<100) | ⚠️ Important |
| 10 | `payments` | Faible (<50) | ⚠️ Important |
| 11 | `visits` | Élevé (10000+) | ❌ Non-critique |
| 12 | `cart` | Variable | ❌ Non-critique |
| 13 | `cms_content` | Très faible (<20) | ⚠️ Important |
| 14 | `consents` | Moyen | ❌ Non-critique |
| 15 | `newsletter_subscribers` | Variable | ❌ Non-critique |
| 16 | `analysis_queue` | Variable | ⚠️ Important |

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
