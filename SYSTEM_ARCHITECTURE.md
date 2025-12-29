# SYSTEM ARCHITECTURE - IGV (Israel Growth Venture)

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEURS                                │
│                     (FR / EN / HE - avec RTL support)                   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                              │
│                      israelgrowthventure.com                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Homepage  │  │ Mini-Analyse│  │    Admin    │  │     CRM     │    │
│  │             │  │   Form      │  │  Dashboard  │  │   Complet   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  Technologies: React 19, TailwindCSS, i18next, react-router              │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  │ REST API (HTTPS)
                                  │ Authorization: Bearer JWT
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI Python)                            │
│                    igv-cms-backend.onrender.com                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API ROUTERS                                │   │
│  ├──────────────┬──────────────┬──────────────┬─────────────────────┤   │
│  │ admin_routes │ crm_complete │ mini_analysis│  invoice_routes     │   │
│  │              │    _routes   │   _routes    │                     │   │
│  ├──────────────┼──────────────┼──────────────┼─────────────────────┤   │
│  │extended_route│  gdpr_routes │ monetico_rout│  tracking_routes    │   │
│  │    (PDF)     │              │     es       │                     │   │
│  └──────────────┴──────────────┴──────────────┴─────────────────────┘   │
│                                                                          │
│  Authentication: JWT (HS256)                                             │
│  Validation: Pydantic v2                                                 │
└──────────┬─────────────┬─────────────┬──────────────┬───────────────────┘
           │             │             │              │
           ▼             ▼             ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐
│   MongoDB    │ │  Gemini AI  │ │    SMTP      │ │   Monetico     │
│   Atlas      │ │  (Google)   │ │   (Gmail)    │ │   (Payments)   │
│              │ │             │ │              │ │                │
│ Collections: │ │ Model:      │ │ Sender:      │ │ Mode: TEST     │
│ - users      │ │ gemini-2.5  │ │ israel.growth│ │ (en attente    │
│ - leads      │ │ -flash      │ │ .venture@    │ │  credentials   │
│ - contacts   │ │             │ │ gmail.com    │ │  CIC)          │
│ - analyses   │ │ Features:   │ │              │ │                │
│ - invoices   │ │ - FR/EN/HE  │ │ Features:    │ │ Features:      │
│ - pipeline   │ │ - Brand     │ │ - PDF attach │ │ - TPE virtual  │
│ - tasks      │ │   analysis  │ │ - Multipart  │ │ - 3D Secure    │
│              │ │ - Market    │ │ - HTML/Text  │ │ - Callbacks    │
│              │ │   insights  │ │              │ │                │
└──────────────┘ └─────────────┘ └──────────────┘ └────────────────┘
```

## Flux de données

### 1. Mini-Analyse (Fonctionnel ✅)

```
Utilisateur                 Frontend                    Backend                 Gemini AI
    │                          │                           │                        │
    │── Remplit formulaire ───▶│                           │                        │
    │                          │── POST /api/mini-analysis▶│                        │
    │                          │                           │── generate_content() ─▶│
    │                          │                           │◀── Analysis text ──────│
    │                          │                           │                        │
    │                          │                           │── Generate PDF ───────▶│
    │                          │                           │── Save to MongoDB ────▶│
    │                          │                           │── Send email (SMTP) ──▶│
    │                          │◀── {analysis, pdf_base64}│                        │
    │◀── Affiche résultat ─────│                           │                        │
```

### 2. CRM (Fonctionnel ✅)

```
Admin                       Frontend                    Backend                 MongoDB
    │                          │                           │                        │
    │── Login ────────────────▶│                           │                        │
    │                          │── POST /api/admin/login ─▶│                        │
    │                          │◀── JWT Token ─────────────│                        │
    │                          │                           │                        │
    │── View Leads ───────────▶│                           │                        │
    │                          │── GET /api/crm/leads ────▶│                        │
    │                          │   (Auth: Bearer JWT)      │── Query leads ────────▶│
    │                          │◀── Leads list ────────────│◀── Results ────────────│
    │◀── Affiche liste ────────│                           │                        │
```

### 3. Paiements Monetico (En attente credentials CIC)

```
Client                      Frontend                    Backend                 Monetico
    │                          │                           │                        │
    │── Choisit pack ─────────▶│                           │                        │
    │                          │── POST /api/monetico/init▶│                        │
    │                          │◀── Payment URL ───────────│                        │
    │── Redirect Monetico ────▶│                           │                        │
    │                          │                           │                        │
    │── Paiement 3D Secure ───────────────────────────────────────────────────────▶│
    │                          │                           │◀── Callback (IPG) ────│
    │                          │                           │── Update status ──────▶│
    │◀── Confirmation ─────────│                           │                        │
```

## Sécurité

| Couche | Mécanisme | Status |
|--------|-----------|--------|
| Transport | HTTPS/TLS | ✅ |
| Authentication | JWT HS256 | ✅ |
| Authorization | Role-based (admin/user) | ✅ |
| CORS | Whitelist domain | ✅ |
| Input Validation | Pydantic v2 | ✅ |
| Rate Limiting | Gemini quota | ✅ |
| GDPR | Consent tracking | ✅ |

## Multilingual Support

| Langue | Code | RTL | Status |
|--------|------|-----|--------|
| Français | fr | Non | ✅ |
| English | en | Non | ✅ |
| עברית | he | Oui | ✅ |

## PDF Generation

- **Library**: ReportLab
- **Header**: assets/entete_igv.pdf
- **Features**:
  - Branded header
  - RTL support for Hebrew
  - Multi-page support
  - Base64 encoding for API response

---
*Generated: 2025-12-29*
