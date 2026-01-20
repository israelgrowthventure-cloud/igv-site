# Sitemap Complet - Israel Growth Venture

## Vue d'ensemble du Site

Ce document présente l'architecture complète du site web Israel Growth Venture, incluant toutes les pages publiques, les routes administratives et les points d'accès API.

---

## 1. Pages Publiques (Accessible à tous)

### Page d'accueil
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/` | Page d'accueil principale - Landing page avec présentation de l'entreprise | `src/pages/NewHome.js` |
| `/home` | Ancienne page d'accueil (conservée en backup) | `src/pages/Home.js` |

### Pages de Présentation
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/about` | Page À propos - Présentation de l'entreprise | `src/pages/About.js` |
| `/contact` | Page Contact - Formulaire de contact | `src/pages/Contact.js` |
| `/appointment` | Page Prise de rendez-vous | `src/pages/Appointment.js` |
| `/demande-rappel` | Page Demande de rappel | `src/pages/DemandeRappel.js` |

### Pages Commerciales
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/packs` | Page Tarifs et packs de services (Analyse, Succursales, Franchise) | `src/pages/Packs.js` |
| `/future-commerce` | Page Commerce du futur | `src/pages/FutureCommerce.js` |
| `/mini-analyse` | Page Mini-Analyse de marché (nouvelle version avec i18n) | `src/pages/MiniAnalysis.js` |

### Pages Légales
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/legal` | Conditions générales d'utilisation (CGU) | `src/pages/Terms.js` |
| `/privacy` | Politique de confidentialité (RGPD) | `src/pages/PrivacyPolicy.js` |
| `/cookies` | Politique des cookies | `src/pages/CookiesPolicy.js` |

### Pages de Paiement
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/payment` | Page de paiement | `src/pages/Payment.js` |
| `/payment/return` | Page de retour après paiement | `src/pages/PaymentReturn.js` |
| `/checkout` | Page de checkout | `src/pages/Checkout.js` |
| `/payment-success` | Page de confirmation de paiement | `src/pages/PaymentReturn.js` |

---

## 2. Interface d'Administration

### Zone d'Authentification
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/admin` | Redirige vers `/admin/crm/dashboard` | Configuré dans `App.js` |
| `/admin/login` | Page de connexion administrateur | `src/pages/admin/Login.js` |

### Tableau de Bord Admin
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/admin/dashboard` | Tableau de bord principal admin | `src/pages/admin/Dashboard.js` |
| `/admin/dashboard-page` | Alternative dashboard page | `src/pages/admin/DashboardPage.js` |

### Module CRM Complet
| Route | Description | Onglet actif | Fichier source |
|-------|-------------|--------------|----------------|
| `/admin/crm` | Route parent du CRM (redirect vers dashboard) | - | `src/layouts/AdminLayout.js` |
| `/admin/crm/dashboard` | Dashboard CRM avec statistiques | Dashboard | `src/pages/admin/DashboardPage.js` |
| `/admin/crm/leads` | Gestion des prospects (leads) | Leads | `src/pages/admin/LeadsPage.js` |
| `/admin/crm/contacts` | Gestion des contacts clients | Contacts | `src/pages/admin/ContactsPage.js` |
| `/admin/crm/users` | Gestion des utilisateurs admin | Users | `src/pages/admin/UsersPage.js` |
| `/admin/crm/pipeline` | Visualisation du pipeline de ventes | Pipeline | `src/pages/admin/Pipeline.js` |
| `/admin/crm/opportunities` | Gestion des opportunités | Opportunities | `src/pages/admin/AdminCRMComplete.js` |
| `/admin/crm/emails` | Gestion des emails | Emails | `src/pages/admin/AdminCRMComplete.js` |
| `/admin/crm/activities` | Gestion des activités | Activités | `src/pages/admin/AdminCRMComplete.js` |
| `/admin/crm/settings` | Paramètres CRM (Admin uniquement) | Settings | `src/pages/admin/AdminCRMComplete.js` |

### Pages de Détail CRM
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/admin/crm/leads/:id` | Détail d'un prospect | `src/pages/admin/LeadDetail.js` |
| `/admin/crm/contacts/:id` | Détail d'un contact | `src/pages/admin/ContactDetail.js` |

### Administration Financière
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/admin/invoices` | Gestion des factures | `src/pages/AdminInvoices.js` |
| `/admin/payments` | Gestion des paiements | `src/pages/AdminPayments.js` |
| `/admin/tasks` | Gestion des tâches | `src/pages/AdminTasks.js` |

### Paramètres Système
| Route | Description | Fichier source |
|-------|-------------|----------------|
| `/admin/settings` | Paramètres globaux admin | `src/pages/Settings.js` |

---

## 3. Structure des Composants

### Composants CRM (src/components/crm/)
| Composant | Description |
|-----------|-------------|
| `LeadsTab.js` | Gestion des prospects avec conversion en contacts |
| `ContactsTab.js` | Gestion des contacts avec notes et emails |
| `UsersTab.js` | Administration des utilisateurs |
| `SettingsTab.js` | Paramètres du CRM (Profil, Tags, Étapes) |
| `PipelineTab.js` | Visualisation du pipeline |
| `OpportunitiesTab.js` | Gestion des opportunités |
| `EmailsTab.js` | Éditeur d'emails |
| `ActivitiesTab.js` | Journal des activités |
| `EmailModal.js` | Modal d'envoi d'emails |
| `Skeleton.js` | Composants de chargement |
| `UsersTable.js` | Tableau des utilisateurs |

### Composants d'Interface (src/components/)
| Composant | Description |
|-----------|-------------|
| `Header.js` | En-tête principal du site |
| `Footer.js` | Pied de page |
| `Sidebar.js` | Navigation latérale admin |
| `Topbar.js` | Barre supérieure admin |
| `CookieConsent.js` | Bannière consentement cookies |
| `CookieConsentBanner.js` | Alternative bannière cookies |
| `PrivateRoute.js` | Protection des routes |
| `CmsAdminButton.jsx` | Bouton éditeur WYSIWYG |

### Layouts (src/layouts/)
| Layout | Description |
|--------|-------------|
| `AdminLayout.js` | Layout principal de l'admin avec Sidebar |
| `DefaultLayout.js` | Layout par défaut pour pages publiques |

---

## 4. Routes API Backend

### Authentication
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/admin/login` | POST | Connexion admin |
| `/api/admin/verify` | GET | Vérification token |
| `/api/admin/settings` | GET/PUT | Paramètres admin |

### CRM - Leads (Prospects)
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/leads` | GET | Liste des prospects |
| `/api/crm/leads` | POST | Créer un prospect |
| `/api/crm/leads/:id` | GET | Détail prospect |
| `/api/crm/leads/:id` | PUT | Modifier prospect |
| `/api/crm/leads/:id` | DELETE | Supprimer prospect |
| `/api/crm/leads/:id/convert-to-contact` | POST | Convertir en contact |
| `/api/crm/leads/:id/notes` | POST | Ajouter note |
| `/api/crm/leads/:id/notes` | GET | Liste notes |
| `/api/crm/leads/export` | GET | Export CSV |

### CRM - Contacts
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/contacts` | GET | Liste des contacts |
| `/api/crm/contacts` | POST | Créer contact |
| `/api/crm/contacts/:id` | GET | Détail contact |
| `/api/crm/contacts/:id` | PUT | Modifier contact |
| `/api/crm/contacts/:id` | DELETE | Supprimer contact |
| `/api/crm/contacts/:id/notes` | GET | Notes du contact |
| `/api/crm/contacts/:id/notes` | POST | Ajouter note |
| `/api/crm/contacts/:id/notes/:noteId` | DELETE | Supprimer note |

### CRM - Settings
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/settings/users` | GET | Liste utilisateurs |
| `/api/crm/settings/users` | POST | Créer utilisateur |
| `/api/crm/settings/users/:id` | PUT | Modifier utilisateur |
| `/api/crm/settings/users/:id` | DELETE | Supprimer utilisateur |
| `/api/crm/settings/users/change-password` | POST | Changer mot de passe |
| `/api/crm/settings/tags` | GET | Liste des tags |
| `/api/crm/settings/tags` | POST | Créer tag |
| `/api/crm/settings/pipeline-stages` | GET | Étapes du pipeline |

### CRM - Pipeline & Opportunités
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/pipeline` | GET | Données pipeline |
| `/api/crm/opportunities` | GET | Liste opportunités |
| `/api/crm/opportunities` | POST | Créer opportunité |

### Dashboard & Stats
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/dashboard/stats` | GET | Statistiques dashboard |

### Emails
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/crm/emails/templates` | GET | Modèles d'emails |
| `/api/crm/emails/send` | POST | Envoyer email |

---

## 5. Navigation Principale

### Header Public
```
├── Logo IGV
├── Accueil (/home)
├── À propos (/about)
├── Packs (/packs)
├── Mini-Analyse (/mini-analyse)
├── Commerce du futur (/future-commerce)
├── Contact (/contact)
└── [Bouton: Se connecter / Mon compte]
```

### Sidebar Admin (CRM)
```
├── Logo IGV
├── │
├── ├── 📊 Tableau de bord (/admin/crm/dashboard)
├── ├── 👥 Prospects (/admin/crm/leads)
├── ├── ✓ Contacts (/admin/crm/contacts)
├── ├── 🎯 Opportunités (/admin/crm/opportunities)
├── ├── 📈 Pipeline (/admin/crm/pipeline)
├── ├── 📧 Emails (/admin/crm/emails)
├── ├── 📋 Activités (/admin/crm/activities)
├── ├── 👤 Utilisateurs (/admin/crm/users) [Admin only]
├── ├── ⚙️ Paramètres (/admin/crm/settings) [Admin only]
├── │
├── └── [Bouton: Modifier le Site (WYSIWYG)]
└── └── [Bouton: Réduire/Développer]
```

---

## 6. Structure des Données

### Modèles de Données CRM

#### Lead (Prospect)
```json
{
  "lead_id": "uuid",
  "email": "email@exemple.com",
  "contact_name": "Nom complet",
  "brand_name": "Nom de l'entreprise",
  "sector": "Secteur d'activité",
  "phone": "+33123456789",
  "status": "NEW | CONTACTED | QUALIFIED | CONVERTED | LOST | PENDING_QUOTA",
  "priority": "A | B | C",
  "tags": ["tag1", "tag2"],
  "notes": [],
  "activities": [],
  "analysis": "Contenu mini-analyse",
  "analysis_language": "fr",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Contact
```json
{
  "contact_id": "uuid",
  "name": "Nom complet",
  "email": "email@exemple.com",
  "phone": "+33123456789",
  "position": "Fonction",
  "company_name": "Entreprise",
  "location": "Localisation",
  "tags": ["tag1", "tag2"],
  "notes": [],
  "activities": [],
  "converted_from_lead_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### User (Admin)
```json
{
  "id": "uuid",
  "email": "admin@exemple.com",
  "name": "Nom complet",
  "first_name": "Prénom",
  "last_name": "Nom",
  "role": "admin | commercial | support",
  "is_active": true,
  "assigned_leads": [],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Pipeline Stage
```json
{
  "key": "qualification",
  "display_name": "Qualification",
  "label_fr": "Qualification",
  "order": 1
}
```

---

## 7. Multilingue (i18n)

### Langues Supportées
| Code | Langue | Direction |
|------|--------|-----------|
| `fr` | Français | LTR |
| `en` | English | LTR |
| `he` | עברית | RTL |

### Fichiers de Traduction
```
src/i18n/
├── config.js          # Configuration i18n
├── locales/
│   ├── fr/translation.json
│   ├── en/translation.json
│   └── he/translation.json
```

---

## 8. Services Externes

### APIs et Scripts Tiers
| Service | Usage |
|---------|-------|
| Render | Hébergement Backend et Frontend |
| Google Analytics | Tracking |
| Stripe/Monetico | Paiements |
| minimax.io/livecms.js | Éditeur WYSIWYG embeddable |

---

## 9. Notes de Navigation

### Accès Rapide
- **Admin CRM** : https://israelgrowthventure.com/admin/crm
- **Paramètres Admin** : https://israelgrowthventure.com/admin/crm/settings
- **Page d'accueil** : https://israelgrowthventure.com/
- **Packs** : https://israelgrowthventure.com/packs
- **Mini-Analyse** : https://israelgrowthventure.com/mini-analyse

### Règles d'Accès
- Pages publiques : Accès libre
- Routes `/admin/*` : Authentification requise
- Routes `/admin/crm/users` et `/admin/crm/settings` : Rôle `admin` requis uniquement

---

*Document généré le 2026-01-12*
*Pour Israel Growth Venture CRM*
