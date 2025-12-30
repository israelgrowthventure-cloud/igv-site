# DATA LAYER - MONGODB ET COLLECTIONS
## Date: 30 décembre 2025

---

## 1. CONFIGURATION CONNEXION

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URL` | URI Atlas complète | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_URI` | Alias (identique) | idem |
| `DATABASE_URL` | Alias (identique) | idem |

### Initialisation (server.py)

```python
# Lignes 95-120
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI") or os.getenv("DATABASE_URL")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.igv_crm_db

# Test connexion au startup
@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        print("✅ MongoDB connection established")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
```

### Driver utilisé

**Motor 3.3.1** - Driver asyncio pour MongoDB

---

## 2. BASE DE DONNÉES

| Paramètre | Valeur |
|-----------|--------|
| Nom DB | `igv_crm_db` |
| Type | MongoDB Atlas |
| Région | Non spécifiée |
| Authentication | Connection string |

---

## 3. COLLECTIONS IDENTIFIÉES

### Vue d'ensemble

| # | Collection | Module | Documents estimés |
|---|------------|--------|-------------------|
| 1 | `users` | Admin Auth | ~10 |
| 2 | `crm_users` | CRM Auth | ~10 |
| 3 | `leads` | CRM | ~100+ |
| 4 | `contacts` | CRM | ~50+ |
| 5 | `opportunities` | CRM | ~30 |
| 6 | `tasks` | CRM | ~50 |
| 7 | `crm_settings` | CRM | 1 |
| 8 | `analyses` | Gemini | ~200+ |
| 9 | `invoices` | Billing | ~20 |
| 10 | `payments` | Billing | ~15 |
| 11 | `tracking_events` | Analytics | ~1000+ |
| 12 | `content` | CMS | ~5 |
| 13 | `email_logs` | Email | ~100 |
| 14 | `geolocation_cache` | Utils | ~50 |
| 15 | `companies` | CRM | ~20 |
| 16 | `activities` | CRM | ~200 |

---

## 4. SCHÉMAS PAR COLLECTION

### 4.1 Collection `users`

```json
{
  "_id": ObjectId("..."),
  "email": "admin@igv.com",
  "password": "$2b$12$...",  // bcrypt hash
  "role": "admin",
  "created_at": ISODate("2025-01-01T00:00:00Z")
}
```

**Indexes:** `email` (unique)

---

### 4.2 Collection `crm_users`

```json
{
  "_id": ObjectId("..."),
  "email": "sales@igv.com",
  "password": "$2b$12$...",
  "name": "John Doe",
  "role": "sales",  // admin|sales|viewer
  "is_active": true,
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

**Indexes:** `email` (unique)

---

### 4.3 Collection `leads`

```json
{
  "_id": ObjectId("..."),
  "email": "prospect@company.com",
  "name": "Jean Dupont",
  "brand": "Startup XYZ",
  "sector": "SaaS",
  "phone": "+33612345678",
  "status": "NEW",  // NEW|CONTACTED|MEETING_SCHEDULED|CONVERTED|LOST
  "priority": "A",  // A|B|C
  "source": "WEBSITE",  // WEBSITE|REFERRAL|LINKEDIN|COLD_CALL|EVENT|OTHER
  "assigned_to": ObjectId("..."),
  "tags": ["tech", "funding"],
  "notes": [
    {
      "id": "uuid",
      "content": "Note text",
      "created_by": ObjectId("..."),
      "created_at": ISODate("...")
    }
  ],
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

**Indexes:** `email`, `status`, `created_at`

---

### 4.4 Collection `contacts`

```json
{
  "_id": ObjectId("..."),
  "email": "contact@company.com",
  "name": "Marie Martin",
  "phone": "+33698765432",
  "company_name": "Company Inc",
  "position": "CEO",
  "country": "France",
  "city": "Paris",
  "tags": ["vip", "investor"],
  "source_lead_id": ObjectId("..."),  // Si converti depuis lead
  "assigned_to": ObjectId("..."),
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

**Indexes:** `email` (unique), `company_name`

---

### 4.5 Collection `opportunities`

```json
{
  "_id": ObjectId("..."),
  "title": "Deal Startup XYZ",
  "contact_id": ObjectId("..."),
  "company_name": "Startup XYZ",
  "value": 50000.00,
  "currency": "EUR",
  "stage": "PROPOSAL_SENT",  // 8 stages
  "expected_close_date": ISODate("..."),
  "probability": 60,
  "assigned_to": ObjectId("..."),
  "notes": "Pipeline notes",
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

**Stages disponibles:**
- INITIAL_INTEREST
- INFO_REQUESTED
- FIRST_CALL_SCHEDULED
- PITCH_DELIVERED
- PROPOSAL_SENT
- NEGOTIATION
- VERBAL_COMMITMENT
- WON

---

### 4.6 Collection `tasks`

```json
{
  "_id": ObjectId("..."),
  "title": "Follow up call",
  "description": "Call back next week",
  "type": "CALL",  // CALL|EMAIL|MEETING|TODO|FOLLOWUP
  "priority": "HIGH",  // LOW|MEDIUM|HIGH|URGENT
  "status": "PENDING",  // PENDING|IN_PROGRESS|COMPLETED|CANCELLED
  "due_date": ISODate("..."),
  "related_to": {
    "type": "lead",  // lead|contact|opportunity
    "id": ObjectId("...")
  },
  "assigned_to": ObjectId("..."),
  "created_by": ObjectId("..."),
  "created_at": ISODate("..."),
  "completed_at": ISODate("...")
}
```

---

### 4.7 Collection `crm_settings`

```json
{
  "_id": ObjectId("..."),
  "type": "global",
  "lead_statuses": ["NEW", "CONTACTED", "MEETING_SCHEDULED", "CONVERTED", "LOST"],
  "lead_priorities": ["A", "B", "C"],
  "lead_sources": ["WEBSITE", "REFERRAL", "LINKEDIN", "COLD_CALL", "EVENT", "OTHER"],
  "opportunity_stages": [...],
  "task_types": [...],
  "custom_fields": {},
  "updated_at": ISODate("...")
}
```

---

### 4.8 Collection `analyses`

```json
{
  "_id": ObjectId("..."),
  "brand": "Company Name",
  "website": "https://company.com",
  "language": "fr",  // fr|en|he
  "status": "COMPLETED",  // PENDING|PROCESSING|COMPLETED|ERROR
  "analysis_type": "FULL",  // MINI|FULL
  "result": {
    "summary": "...",
    "strengths": [...],
    "weaknesses": [...],
    "opportunities": [...],
    "recommendations": [...]
  },
  "pdf_path": "/analyses/abc123.pdf",
  "created_at": ISODate("..."),
  "completed_at": ISODate("..."),
  "ip_address": "1.2.3.4",
  "user_agent": "..."
}
```

---

### 4.9 Collection `invoices`

```json
{
  "_id": ObjectId("..."),
  "invoice_number": "INV-2025-0001",
  "client": {
    "name": "Client Name",
    "email": "client@email.com",
    "address": "123 Street",
    "country": "France"
  },
  "items": [
    {
      "description": "Service A",
      "quantity": 1,
      "unit_price": 1000.00,
      "total": 1000.00
    }
  ],
  "subtotal": 1000.00,
  "vat_rate": 18,
  "vat_amount": 180.00,
  "total": 1180.00,
  "currency": "EUR",
  "status": "PAID",  // DRAFT|SENT|PAID|CANCELLED|OVERDUE
  "issue_date": ISODate("..."),
  "due_date": ISODate("..."),
  "paid_date": ISODate("..."),
  "pdf_path": "/invoices/INV-2025-0001.pdf",
  "created_at": ISODate("...")
}
```

---

### 4.10 Collection `payments`

```json
{
  "_id": ObjectId("..."),
  "invoice_id": ObjectId("..."),
  "amount": 1180.00,
  "currency": "EUR",
  "method": "CARD",  // CARD|BANK_TRANSFER|CASH
  "status": "COMPLETED",  // PENDING|COMPLETED|FAILED|REFUNDED
  "transaction_id": "monetico_xxx",
  "provider": "monetico",
  "metadata": {
    "card_last_four": "4242"
  },
  "created_at": ISODate("..."),
  "completed_at": ISODate("...")
}
```

---

### 4.11 Collection `tracking_events`

```json
{
  "_id": ObjectId("..."),
  "event_type": "page_view",  // page_view|click|form_submit|scroll
  "page_path": "/services",
  "referrer": "https://google.com",
  "session_id": "uuid",
  "visitor_id": "uuid",
  "ip_address": "1.2.3.4",
  "user_agent": "Mozilla/5.0...",
  "geolocation": {
    "country": "France",
    "city": "Paris",
    "lat": 48.8566,
    "lng": 2.3522
  },
  "metadata": {
    "element_id": "cta-button"
  },
  "created_at": ISODate("...")
}
```

---

### 4.12 Collection `content` (CMS)

```json
{
  "_id": ObjectId("..."),
  "slug": "home",
  "content_type": "page",
  "title": "Home Page",
  "content": "<html>...</html>",
  "metadata": {
    "seo_title": "...",
    "seo_description": "..."
  },
  "status": "published",
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

---

### 4.13 Collection `email_logs`

```json
{
  "_id": ObjectId("..."),
  "to": "recipient@email.com",
  "subject": "Your Invoice",
  "body": "...",
  "attachments": ["invoice.pdf"],
  "status": "SENT",  // PENDING|SENT|FAILED
  "error": null,
  "related_to": {
    "type": "invoice",
    "id": ObjectId("...")
  },
  "created_at": ISODate("..."),
  "sent_at": ISODate("...")
}
```

---

## 5. RELATIONS ENTRE COLLECTIONS

```
users ─────────────────────────────────────────┐
                                               │
crm_users ──┬── assigned_to ──┬── leads        │
            │                 ├── contacts     │
            │                 ├── opportunities│
            │                 └── tasks        │
            │                                  │
            └── created_by ───── activities    │
                                               │
leads ──────── convert ──────── contacts       │
                                   │           │
contacts ───── link ──────── opportunities     │
                                   │           │
opportunities ── link ──────── tasks           │
                                               │
invoices ───── link ──────── payments          │
            │                                  │
            └── email_logs                     │
                                               │
analyses ──── standalone (no FK)               │
tracking_events ── standalone (no FK)          │
content ──── standalone (no FK)                │
geolocation_cache ── standalone (cache)        │
```

---

## 6. ACCÈS DB PAR ROUTE

| Route File | Collections utilisées |
|------------|----------------------|
| server.py | users, analyses |
| crm_complete_routes.py | crm_users, leads, contacts, opportunities, tasks, crm_settings, activities |
| invoice_routes.py | invoices, payments |
| mini_analysis_routes.py | analyses |
| tracking_routes.py | tracking_events |
| cms_routes.py | content |
| email_routes.py | email_logs |

---

## 7. INDEXES RECOMMANDÉS

### Existants (présumés)

| Collection | Index |
|------------|-------|
| users | `email` unique |
| crm_users | `email` unique |
| leads | `email`, `status` |
| contacts | `email` unique |

### À créer pour performance

```javascript
// Recommandations
db.leads.createIndex({ "created_at": -1 })
db.leads.createIndex({ "assigned_to": 1, "status": 1 })
db.tracking_events.createIndex({ "created_at": -1 })
db.tracking_events.createIndex({ "session_id": 1 })
db.analyses.createIndex({ "brand": 1, "created_at": -1 })
db.invoices.createIndex({ "invoice_number": 1 }, { unique: true })
```

---

## 8. SÉCURITÉ DB

| Aspect | Status | Note |
|--------|--------|------|
| Connexion TLS | ✅ | Atlas force TLS |
| Auth | ✅ | Connection string avec credentials |
| IP Whitelist | ⚠️ | À vérifier sur Atlas |
| Backup | ✅ | Atlas automatique |
| Encryption at rest | ✅ | Atlas M10+ |

---

## RÉSUMÉ DATA LAYER

| Métrique | Valeur |
|----------|--------|
| Collections totales | 16 |
| Collections CRM | 8 |
| Collections Analytics | 2 |
| Collections Auth | 2 |
| Collections Billing | 2 |
| Collections CMS | 1 |
| Collections Utils | 1 |

**Driver:** Motor 3.3.1 (asyncio)
**Database:** MongoDB Atlas
**ORM:** Aucun (requêtes Motor directes)

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
