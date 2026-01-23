# 🗺️ MAP CRM IGV - Cartographie Complète

> **Date de création:** 2026-01-23
> **Objectif:** Documenter tous les composants, routes, traductions et chemins du CRM

---

## 📁 Structure des Dossiers

```
igv-site/
├── frontend/                    # igv-frontend (repo Render)
│   └── src/
│       ├── pages/admin/         # Pages CRM
│       ├── components/crm/      # Composants réutilisables CRM
│       ├── layouts/             # AdminLayout
│       └── i18n/locales/        # Traductions (fr, en, he)
│
└── backend/                     # igv-backend (repo Render)
    ├── crm_complete_routes.py   # Routes CRM principales
    ├── crm_routes.py            # Routes CRM complémentaires
    └── server.py                # Point d'entrée API
```

---

## 🎯 PAGES CRM (frontend/src/pages/admin/)

| Fichier | Route | Description |
|---------|-------|-------------|
| `DashboardPage.js` | `/admin/crm/dashboard` | Tableau de bord CRM |
| `LeadsPage.js` | `/admin/crm/leads` | Liste des prospects |
| `LeadDetail.js` | `/admin/crm/leads/:id` | Détail d'un prospect |
| `ContactsPage.js` | `/admin/crm/contacts` | Liste des contacts |
| `ContactDetail.js` | `/admin/crm/contacts/:id` | Détail d'un contact |
| `OpportunitiesPage.js` | `/admin/crm/opportunities` | Opportunités commerciales |
| `Pipeline.js` | `/admin/crm/pipeline` | Vue Pipeline/Kanban |
| `ActivitiesPage.js` | `/admin/crm/activities` | Activités/Tâches |
| `EmailsPage.js` | `/admin/crm/emails` | Historique emails |
| `UsersPage.js` | `/admin/crm/users` | Gestion utilisateurs |
| `SettingsPage.js` | `/admin/crm/settings` | Paramètres CRM |
| `Login.js` | `/admin/login` | Page de connexion |

---

## 🧩 COMPOSANTS CRM (frontend/src/components/crm/)

| Fichier | Utilisé par | Description |
|---------|-------------|-------------|
| `LeadsTab.js` | LeadsPage | Tableau/Liste des leads |
| `ContactsTab.js` | ContactsPage | Tableau/Liste des contacts |
| `OpportunitiesTab.js` | OpportunitiesPage | Tableau opportunités |
| `PipelineTab.js` | Pipeline | Vue Kanban |
| `ActivitiesTab.js` | ActivitiesPage | Liste activités |
| `EmailsTab.js` | EmailsPage | Historique emails |
| `UsersTab.js` | UsersPage | Gestion utilisateurs |
| `SettingsTab.js` | SettingsPage | Formulaires paramètres |
| `EmailModal.js` | Plusieurs | Modal envoi email |
| `Skeleton.js` | Tous | Skeleton loading |

---

## 🔗 ROUTES APP.JS

```javascript
// Routes CRM définies dans App.js
<Route path="/admin/crm" element={<AdminLayout />}>
  <Route index element={<Navigate to="/admin/crm/dashboard" />} />
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="leads" element={<LeadsPage />} />
  <Route path="contacts" element={<ContactsPage />} />
  <Route path="users" element={<UsersPage />} />
  <Route path="opportunities" element={<OpportunitiesPage />} />
  <Route path="pipeline" element={<Pipeline />} />
  <Route path="emails" element={<EmailsPage />} />
  <Route path="activities" element={<ActivitiesPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>
```

---

## 🌐 SIDEBAR NAVIGATION (layouts/AdminLayout.js)

| Label | Route | Clé i18n |
|-------|-------|----------|
| Tableau de bord | `/admin/crm/dashboard` | `crm.nav.dashboard` |
| Prospects | `/admin/crm/leads` | `crm.nav.leads` |
| Contacts | `/admin/crm/contacts` | `crm.nav.contacts` |
| Opportunités | `/admin/crm/opportunities` | `crm.nav.opportunities` |
| Pipeline | `/admin/crm/pipeline` | `crm.nav.pipeline` |
| Activités | `/admin/crm/activities` | `crm.nav.activities` |
| Emails | `/admin/crm/emails` | `crm.nav.emails` |
| Utilisateurs | `/admin/crm/users` | `crm.nav.users` |
| Paramètres | `/admin/crm/settings` | `crm.nav.settings` |

---

## 🔌 API BACKEND (backend/crm_complete_routes.py)

**Préfixe:** `/api/crm`

### Dashboard
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/stats` | Statistiques dashboard |

### Leads
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/leads` | Liste des prospects |
| GET | `/leads/{id}` | Détail d'un prospect |
| POST | `/leads` | Créer un prospect |
| PUT | `/leads/{id}` | Modifier un prospect |
| DELETE | `/leads/{id}` | Supprimer un prospect |
| POST | `/leads/{id}/notes` | Ajouter une note |
| POST | `/leads/{id}/convert-to-contact` | Convertir en contact |
| GET | `/leads/export/csv` | Export CSV |

### Contacts
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/contacts` | Liste des contacts |
| GET | `/contacts/{id}` | Détail d'un contact |
| POST | `/contacts` | Créer un contact |
| PUT | `/contacts/{id}` | Modifier un contact |
| DELETE | `/contacts/{id}` | Supprimer un contact |
| POST | `/contacts/{id}/notes` | Ajouter une note |
| GET | `/contacts/{id}/notes` | Notes d'un contact |

### Opportunités
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/opportunities` | Liste des opportunités |
| POST | `/opportunities` | Créer une opportunité |
| PUT | `/opportunities/{id}` | Modifier une opportunité |
| DELETE | `/opportunities/{id}` | Supprimer une opportunité |

### Pipeline
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/pipeline` | Données pipeline |

### Activités
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/activities` | Liste des activités |
| POST | `/activities` | Créer une activité |
| PUT | `/activities/{id}` | Modifier une activité |
| DELETE | `/activities/{id}` | Supprimer une activité |
| PUT | `/activities/{id}/complete` | Marquer comme complétée |

### Settings
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/settings/users` | Liste des utilisateurs |
| POST | `/settings/users` | Créer un utilisateur |
| PUT | `/settings/users/{id}` | Modifier un utilisateur |
| GET | `/settings/tags` | Liste des tags |
| POST | `/settings/tags` | Créer un tag |
| DELETE | `/settings/tags/{id}` | Supprimer un tag |
| GET | `/settings/stages` | Liste des étapes pipeline |
| POST | `/settings/stages` | Créer une étape |
| PUT | `/settings/stages/{id}` | Modifier une étape |
| DELETE | `/settings/stages/{id}` | Supprimer une étape |

### Emails
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/emails` | Historique emails |
| POST | `/emails/send` | Envoyer un email |
| GET | `/email-templates` | Templates disponibles |
| DELETE | `/emails/{id}` | Supprimer email |

---

## 🌍 CLÉS DE TRADUCTION

### Structure `crm.*` (utilisée par Sidebar et composants principaux)

```json
{
  "crm": {
    "nav": {
      "dashboard": "...",
      "leads": "...",
      "contacts": "...",
      "opportunities": "...",
      "pipeline": "...",
      "activities": "...",
      "emails": "...",
      "users": "...",
      "settings": "..."
    },
    "common": {
      "search": "...",
      "filter": "...",
      "refresh": "...",
      "save": "...",
      "cancel": "...",
      "delete": "...",
      "edit": "..."
    },
    "dashboard": { ... },
    "leads": { ... },
    "contacts": { ... },
    "users": { ... }
  }
}
```

### Structure `admin.crm.*` (utilisée par pages spécifiques)

```json
{
  "admin": {
    "crm": {
      "title": "...",
      "tabs": {
        "dashboard": "...",
        "leads": "...",
        "contacts": "...",
        "pipeline": "...",
        "settings": "..."
      },
      "dashboard": {
        "leads_today": "...",
        "leads_7d": "...",
        "pipeline_value": "...",
        "tasks_overdue": "...",
        "top_sources": "...",
        "stage_distribution": "...",
        "direct": "..."
      },
      "stages": {
        "new": "...",
        "contacted": "...",
        "qualified": "...",
        "proposal": "...",
        "negotiation": "...",
        "won": "...",
        "lost": "..."
      },
      "statuses": { ... },
      "priorities": { ... },
      "opportunities": { ... },
      "settings": { ... },
      "emails": { ... },
      "activities": { ... },
      "leads": { ... },
      "common": { ... },
      "errors": { ... }
    }
  }
}
```

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### 1. Clés de traduction manquantes
- [ ] Vérifier que TOUTES les clés `admin.crm.*` existent dans fr.json, en.json, he.json
- [ ] Vérifier que TOUTES les clés `crm.*` existent dans fr.json, en.json, he.json

### 2. Chemins de navigation cassés
- [ ] `navigate('/admin/crm')` → doit être `/admin/crm/dashboard`
- [ ] `navigate('/admin/crm?tab=leads')` → doit être `/admin/crm/leads`
- [ ] `navigate('/admin/crm?tab=contacts')` → doit être `/admin/crm/contacts`
- [ ] `navigate('/admin/crm?tab=pipeline')` → obsolète, utiliser `/admin/crm/pipeline`

### 3. Pages avec anciens chemins (à corriger)
- `AdminDashboard.js` - utilise `/admin/crm?tab=X`
- `Dashboard.js` - utilise `/admin/crm?tab=X`
- `LeadDetail.js` - utilise `/admin/crm` au lieu de `/admin/crm/leads`
- `AdminCRM.js` - ancienne page monolithique (à archiver?)

---

## 📋 PLAN D'ACTION

1. **Archiver fichiers obsolètes** → `archive/`
2. **Corriger traductions** → Ajouter toutes clés manquantes
3. **Corriger chemins** → Remplacer anciens navigate() par nouveaux
4. **Tester navigation** → Vérifier tous les liens Sidebar
5. **Build & Deploy** → Pousser sur GitHub

---

## ✅ FICHIERS À ARCHIVER

```
# Scripts Python temporaires
add_admin_crm_translations.py
add_missing_translations.py
add_proofs.py
capture_crm_proofs.py
capture_notes_proof.py
capture_proofs_sync.py
capture_visual_proofs.py
complete_crm_translations.py
fix_crm_structure.py
fix_french_translations.py
test_notes_visibility.py
update_leads_page.py
update_mission.py
crm_keys_raw.txt

# Screenshots de preuve
NOTES_PROOF_*.png
visual_proofs/*.png

# Tests/Audit temporaires
audit_out/
test-results/
tests/
```

---

*Dernière mise à jour: 2026-01-23*
