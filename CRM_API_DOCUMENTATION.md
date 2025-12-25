# IGV CRM - API Documentation

## Base URL
Production: `https://igv-cms-backend.onrender.com/api`

## Authentication
All CRM endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## CRM Endpoints

### Dashboard
```
GET /crm/dashboard/stats
Returns: KPIs, lead stats, pipeline value, top sources, stage distribution
```

### Leads

**List Leads**
```
GET /crm/leads?skip=0&limit=50&search=&status=&stage=&language=
Returns: { leads: [], total: number }
```

**Get Single Lead**
```
GET /crm/leads/{lead_id}
Returns: Lead object with activities
```

**Create Lead**
```
POST /crm/leads
Body: {
  email: string (required),
  brand_name: string (required),
  name?: string,
  phone?: string,
  sector?: string,
  language?: string (fr/en/he),
  expansion_type?: string,
  format?: string,
  budget_estimated?: number,
  target_city?: string,
  timeline?: string,
  source?: string,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string
}
```

**Update Lead**
```
PUT /crm/leads/{lead_id}
Body: {
  status?: string,
  stage?: string,
  priority?: string,
  owner_email?: string,
  tags?: string[],
  // ... other fields
}
```

**Add Note**
```
POST /crm/leads/{lead_id}/notes
Body: { content: string }
```

**Convert to Contact**
```
POST /crm/leads/{lead_id}/convert-to-contact
Returns: { contact_id: string }
```

**Export to CSV**
```
GET /crm/leads/export/csv
Returns: { csv: string, count: number }
```

### Pipeline (Opportunities)

**Get Pipeline (Kanban View)**
```
GET /crm/pipeline
Returns: { pipeline: { stage_key: [opportunities] } }
```

**Create Opportunity**
```
POST /crm/opportunities
Body: {
  name: string (required),
  lead_id?: string,
  contact_id?: string,
  value?: number,
  stage?: string,
  probability?: number (0-100),
  expected_close_date?: datetime
}
```

**Update Opportunity**
```
PUT /crm/opportunities/{opp_id}
Body: {
  stage?: string,
  value?: number,
  probability?: number,
  owner_email?: string,
  next_step?: string,
  next_action_date?: datetime
}
```

### Contacts

**List Contacts**
```
GET /crm/contacts?skip=0&limit=50&search=
Returns: { contacts: [], total: number }
```

**Get Single Contact**
```
GET /crm/contacts/{contact_id}
Returns: Contact object with activities
```

**Create Contact**
```
POST /crm/contacts
Body: {
  email: string (required),
  name: string (required),
  phone?: string,
  position?: string,
  language?: string
}
```

**Update Contact**
```
PUT /crm/contacts/{contact_id}
Body: {
  name?: string,
  phone?: string,
  position?: string,
  tags?: string[],
  notes?: string
}
```

### Settings

**List Users (Admin Only)**
```
GET /crm/settings/users
Returns: { users: [], total: number }
```

**Create User (Admin Only - UNLIMITED)**
```
POST /crm/settings/users
Body: {
  email: string (required),
  name: string (required),
  password: string (required),
  role: 'admin' | 'sales' | 'viewer'
}
```

**Update User (Admin Only)**
```
PUT /crm/settings/users/{user_id}
Body: {
  name?: string,
  role?: string,
  is_active?: boolean
}
```

**Get Tags**
```
GET /crm/settings/tags
Returns: { tags: string[] }
```

**Add Tag**
```
POST /crm/settings/tags
Body: { tag: string }
```

**Get Pipeline Stages**
```
GET /crm/settings/pipeline-stages
Returns: { stages: [{ key, label_fr, label_en, label_he }] }
```

## GDPR Endpoints

**Update Consent**
```
POST /gdpr/consent
Body: {
  consent_analytics: boolean,
  consent_marketing: boolean,
  consent_functional: boolean
}
```

**Get Consent**
```
GET /gdpr/consent
Returns: { consent_analytics, consent_marketing, consent_functional }
```

**Track Visit (only if consent given)**
```
POST /gdpr/track/visit
Body: {
  session_id: string,
  page: string,
  referrer?: string,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string,
  language?: string
}
```

**Newsletter Subscribe**
```
POST /gdpr/newsletter/subscribe
Body: {
  email: string (required),
  language: string (fr/en/he),
  consent_marketing: true (required),
  source?: string,
  utm_source?: string,
  utm_campaign?: string
}
```

**Newsletter Unsubscribe**
```
POST /gdpr/newsletter/unsubscribe
Body: { email: string, reason?: string }
```

**Delete Newsletter Data**
```
DELETE /gdpr/newsletter/delete-data
Body: { email: string }
```

**Get My Data (GDPR Right of Access)**
```
GET /gdpr/my-data?email=user@example.com
Returns: All data stored for the email
```

**Delete All Data (GDPR Right to Erasure)**
```
DELETE /gdpr/delete-all-data
Body: { email: string, confirmation: string (must match email) }
```

## Quota Queue Endpoints

**Queue Analysis (automatic when quota exceeded)**
```
POST /quota/queue-analysis
Body: {
  lead_id: string,
  email: string,
  brand_name: string,
  sector?: string,
  language: string
}
Returns: { status: 'queued', queue_id, queue_position, estimated_time }
```

**Get Queue Status**
```
GET /quota/queue-status/{queue_id}
Returns: Queue item with status and position
```

**Get Pending Analyses (Admin)**
```
GET /quota/admin/pending-analyses?skip=0&limit=50&status=pending
Returns: { analyses: [], total: number }
```

**Process Pending Analysis (Admin)**
```
POST /quota/admin/process-pending/{queue_id}
Returns: Processing started
```

**Retry Failed Analyses (Admin)**
```
POST /quota/admin/retry-failed
Returns: { count: number of analyses reset }
```

## Pipeline Stages (IGV Spec)

1. `analysis_requested` - Analyse demandée / Analysis requested / ניתוח התבקש
2. `analysis_sent` - Analyse envoyée / Analysis sent / ניתוח נשלח
3. `call_scheduled` - Appel planifié / Call scheduled / שיחה מתוזמנת
4. `qualification` - Qualification / Qualification / הסמכה
5. `proposal_sent` - Proposition envoyée / Proposal sent / הצעה נשלחה
6. `negotiation` - Négociation / Negotiation / משא ומתן
7. `won` - Signé / Lancement / Signed / Launch / חתום / השקה
8. `lost` - Perdu / Sans suite / Lost / No follow-up / אבד / ללא מעקב

## Lead Statuses

- `NEW` - New lead
- `CONTACTED` - Initial contact made
- `QUALIFIED` - Qualified lead
- `PENDING_QUOTA` - Analysis queued (quota exceeded)
- `CONVERTED` - Converted to contact/opportunity
- `LOST` - Lost/no follow-up

## User Roles

- `admin` - Full access (create users, modify settings)
- `sales` - Create/edit leads, opportunities, contacts
- `viewer` - Read-only access

## Notes

- All timestamps are in UTC ISO 8601 format
- ObjectIds are returned as strings
- Pagination uses `skip` and `limit` parameters
- Search is case-insensitive
- Multilingual support: FR/EN/HE
- UNLIMITED user creation (no hard limits)
- GDPR-compliant (consent-based tracking)
- Quota queue system prevents errors on quota exhaustion
