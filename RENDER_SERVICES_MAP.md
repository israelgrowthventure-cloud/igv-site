# RENDER SERVICES MAP - IGV (Israel Growth Venture)

## Services Actifs

### 1. igv-cms-backend (Python/FastAPI)
- **URL**: https://igv-cms-backend.onrender.com
- **Runtime**: Python 3
- **Region**: Oregon
- **Status**: ✅ Deployed
- **Responsabilités**:
  - API Authentication (JWT)
  - Mini-Analysis avec Gemini AI
  - CRM complet (leads, contacts, pipeline, tasks)
  - PDF Generation
  - Email sending (SMTP)
  - Monetico payments integration
  - Invoices management
  - GDPR compliance
  - Tracking & analytics

**Endpoints principaux**:
- `/health` - Health check
- `/api/admin/login` - Auth
- `/api/mini-analysis` - AI Analysis
- `/api/crm/*` - CRM routes
- `/api/pdf/generate` - PDF
- `/api/email/send-pdf` - Email
- `/api/monetico/*` - Payments
- `/api/invoices/*` - Invoices

### 2. igv-site-web (Node/React)
- **URL**: https://israelgrowthventure.com
- **Runtime**: Node
- **Region**: Frankfurt
- **Status**: ✅ Deployed
- **Responsabilités**:
  - Frontend React SPA
  - Admin Dashboard
  - CRM Interface
  - Mini-Analysis Form
  - Multilingual (FR/EN/HE)
  - RTL support (Hebrew)

**Routes principales**:
- `/` - Homepage
- `/mini-analysis` - Free analysis
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/crm` - CRM complet

## Dépendances

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                  israelgrowthventure.com                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS API Calls
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI)                            │
│              igv-cms-backend.onrender.com                    │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Gemini AI  │  MongoDB     │    SMTP      │   Monetico    │
│   (Google)   │  (Atlas)     │  (Gmail)     │   (Payments)  │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

## Variables d'Environnement Backend

| Variable | Description | Status |
|----------|-------------|--------|
| MONGODB_URI | MongoDB Atlas connection | ✅ Configured |
| JWT_SECRET | JWT signing key | ✅ Configured |
| GEMINI_API_KEY | Google AI API | ✅ Configured |
| SMTP_HOST | Email server | ✅ Configured |
| SMTP_USER | Email user | ✅ Configured |
| SMTP_PASSWORD | Email password | ✅ Configured |
| MONETICO_TPE | Payment terminal | ⏳ Pending CIC |
| MONETICO_KEY | Payment key | ⏳ Pending CIC |

## Variables d'Environnement Frontend

| Variable | Description | Value |
|----------|-------------|-------|
| REACT_APP_API_URL | Backend URL | https://igv-cms-backend.onrender.com |
| NODE_ENV | Environment | production |

---
*Generated: 2025-12-29*
