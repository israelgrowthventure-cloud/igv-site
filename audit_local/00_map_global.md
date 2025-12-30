# CARTOGRAPHIE GLOBALE WORKSPACE LOCAL
## Date: 30 décembre 2025

---

## CHEMIN RACINE WORKSPACE

```
c:\Users\PC\Desktop\IGV\igv site\igv-site
```

---

## STRUCTURE PRINCIPALE

```
igv-site/
├── .git/                     # Repository Git
├── .github/                  # GitHub workflows/actions
├── audit_local/              # [CRÉÉ] Dossier audit local
├── audit_render/             # [CRÉÉ] Dossier audit Render
├── archive/                  # Archives anciennes versions
├── backend/                  # ★ BACKEND PYTHON FASTAPI
├── frontend/                 # ★ FRONTEND REACT
├── igv_internal/             # Données internes IGV
├── out_live_pdfs/            # PDFs générés (output)
├── scripts/                  # Scripts utilitaires
├── tools/                    # Outils divers
├── render.yaml               # Config déploiement Render
├── README.md                 # Documentation principale
└── [30+ fichiers .md/.py]    # Rapports, tests, scripts
```

---

## DOSSIER `backend/` (APPLICATION PRINCIPALE)

```
backend/
├── server.py                 # ★ Point d'entrée FastAPI (984 lignes)
├── admin_routes.py           # Routes admin stats (387 lignes)
├── ai_routes.py              # Routes AI insight
├── crm_complete_routes.py    # ★ CRM MVP complet (1308 lignes)
├── crm_routes.py             # CRM legacy (obsolète)
├── extended_routes.py        # PDF, Email, Calendar
├── gdpr_routes.py            # GDPR consent
├── invoice_routes.py         # ★ Facturation (832 lignes)
├── mini_analysis_routes.py   # ★ Mini-analyse Gemini (1105 lignes)
├── monetico_routes.py        # Paiements CIC (452 lignes)
├── quota_queue_routes.py     # Queue analyses
├── tracking_routes.py        # Analytics tracking
├── requirements.txt          # Dépendances Python (80+ packages)
├── .env.example              # Template variables env
├── models/
│   ├── crm_models.py         # Models CRM (552 lignes)
│   ├── invoice_models.py     # Models facturation (219 lignes)
│   └── __init__.py
├── prompts/                  # Prompts Gemini AI
├── assets/                   # Assets backend
└── igv_internal/             # Données business IGV
```

---

## DOSSIER `frontend/` (APPLICATION REACT)

```
frontend/
├── src/
│   ├── App.js                # ★ Routeur principal (104 lignes)
│   ├── index.js              # Point d'entrée React
│   ├── pages/
│   │   ├── Home.js           # Page d'accueil
│   │   ├── MiniAnalysis.js   # Mini-analyse publique
│   │   ├── About.js          # À propos
│   │   ├── Contact.js        # Contact
│   │   ├── Packs.js          # Packs/Pricing
│   │   ├── admin/
│   │   │   ├── Login.js      # ★ Login admin (145 lignes)
│   │   │   ├── Dashboard.js  # Dashboard admin (280 lignes)
│   │   │   └── AdminCRMComplete.js  # ★ CRM complet (300+ lignes)
│   │   ├── AdminInvoices.js  # Gestion factures
│   │   ├── AdminPayments.js  # Gestion paiements
│   │   ├── AdminTasks.js     # Gestion tâches
│   │   └── [autres pages publiques]
│   ├── components/
│   │   ├── Header.js         # Header site
│   │   ├── Footer.js         # Footer site
│   │   ├── PrivateRoute.js   # Route protégée
│   │   ├── crm/
│   │   │   ├── LeadsTab.js   # ★ Onglet Leads (381 lignes)
│   │   │   ├── ContactsTab.js # Onglet Contacts
│   │   │   ├── PipelineTab.js # Onglet Pipeline (174 lignes)
│   │   │   └── SettingsTab.js # Onglet Settings
│   │   └── ui/               # Composants shadcn/ui
│   ├── utils/
│   │   └── api.js            # ★ Client API axios (217 lignes)
│   ├── i18n/                 # Traductions FR/EN/HE
│   └── styles/               # CSS custom
├── public/                   # Assets statiques
├── build/                    # Build production
├── server.js                 # Serveur Node pour Render
├── package.json              # Dépendances NPM
└── [configs: tailwind, craco, postcss, etc.]
```

---

## DOSSIER `scripts/` (UTILITAIRES)

```
scripts/
├── render_inventory.py       # Inventaire services Render
├── list_services.py          # Liste services Render API
├── monitor_render_deploy.py  # Monitoring déploiement
├── test_production_http.py   # Tests production
├── trigger_deploy.py         # Déclencher déploiement
├── keep_alive.py             # Wake up services
└── [20+ autres scripts test/debug]
```

---

## FICHIERS RACINE IMPORTANTS

| Fichier | Type | Description |
|---------|------|-------------|
| `render.yaml` | Config | Définition services Render |
| `README.md` | Doc | Documentation projet |
| `.gitignore` | Config | Fichiers ignorés Git |
| `START_HERE.md` | Doc | Guide démarrage |
| `SYSTEM_ARCHITECTURE.md` | Doc | Architecture technique |
| `CRM_API_DOCUMENTATION.md` | Doc | API CRM |
| `DEPLOYMENT_GUIDE.md` | Doc | Guide déploiement |

---

## RECHERCHE MOTS-CLÉS (Résultats)

### Mot-clé: `crm`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/crm_complete_routes.py` | 50+ |
| `backend/crm_routes.py` | 20+ |
| `backend/models/crm_models.py` | 30+ |
| `frontend/src/components/crm/` | 4 fichiers |
| `frontend/src/pages/admin/AdminCRMComplete.js` | 30+ |
| Documentation `.md` | 10+ fichiers |

### Mot-clé: `admin`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/admin_routes.py` | 20+ |
| `backend/server.py` | 30+ |
| `frontend/src/pages/admin/` | 3 fichiers |
| Routes `/admin/*` | 14 endpoints |

### Mot-clé: `leads`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/crm_complete_routes.py` | 40+ |
| `frontend/src/components/crm/LeadsTab.js` | 50+ |
| Collection MongoDB `leads` | Oui |

### Mot-clé: `contacts`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/crm_complete_routes.py` | 20+ |
| `backend/server.py` | 15+ |
| `frontend/src/components/crm/ContactsTab.js` | 30+ |
| Collection MongoDB `contacts` | Oui |

### Mot-clé: `dashboard`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/crm_complete_routes.py` | 10+ |
| `frontend/src/pages/admin/Dashboard.js` | 30+ |
| `frontend/src/pages/admin/AdminCRMComplete.js` | 10+ |

### Mot-clé: `pipeline`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/crm_complete_routes.py` | 15+ |
| `frontend/src/components/crm/PipelineTab.js` | 30+ |
| Collection MongoDB `opportunities` | Oui |

### Mot-clé: `invoice`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/invoice_routes.py` | 50+ |
| `backend/models/invoice_models.py` | 30+ |
| `frontend/src/pages/AdminInvoices.js` | Existe |
| Collection MongoDB `invoices` | Oui |

### Mot-clé: `auth` / `login`

| Emplacement | Occurrences |
|-------------|-------------|
| `backend/server.py` | 20+ |
| `frontend/src/pages/admin/Login.js` | 30+ |
| JWT implementation | Oui |

---

## STATISTIQUES WORKSPACE

| Métrique | Valeur |
|----------|--------|
| **Fichiers Python backend** | 12 |
| **Fichiers JS frontend** | 40+ |
| **Lignes de code backend** | ~6,500 |
| **Lignes de code frontend** | ~4,000 |
| **Collections MongoDB** | 16 |
| **Endpoints API** | 92 |
| **Pages frontend** | 18 |
| **Composants React** | 20+ |
| **Fichiers documentation** | 30+ |
| **Scripts utilitaires** | 30+ |

---

*Audit généré en mode read-only - AUCUNE modification effectuée*
