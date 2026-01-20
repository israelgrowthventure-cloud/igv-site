# MISSION MASTER - Analyse, Nettoyage et Suivi Complet
**Date création:** 2026-01-20  
**Dernière mise à jour:** 2026-01-20  
**Statut global:** 🟡 EN COURS

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Pages publiques du site](#2-pages-publiques-du-site)
3. [Pages Admin/CRM](#3-pages-admincrm)
4. [Points cassés identifiés](#4-points-cassés-identifiés)
5. [Inventaire des fichiers inutiles](#5-inventaire-des-fichiers-inutiles)
6. [Nettoyage effectué](#6-nettoyage-effectué)
7. [Retour arrière](#7-retour-arrière)
8. [Validation build et déploiement](#8-validation-build-et-déploiement)
9. [Checklist finale](#9-checklist-finale)

---

## 1. Vue d'ensemble du projet

### Architecture
```
igv-site/
├── frontend/         # React 18 + Tailwind (rendu sur Render static)
├── backend/          # Python FastAPI + MongoDB (rendu sur Render web service)
├── tests/            # Tests Playwright
├── audit_out/        # Résultats d'audits précédents
├── test-results/     # Résultats tests Playwright
└── [fichiers racine] # Scripts, rapports, configs
```

### Environnements
| Env | URL Frontend | URL Backend |
|-----|--------------|-------------|
| Production | https://israelgrowthventure.com | https://igv-cms-backend.onrender.com |
| Local | http://localhost:3000 | http://localhost:8000 |

### Technos principales
- **Frontend:** React 18, Tailwind CSS, React Router, i18next, Radix UI
- **Backend:** Python FastAPI, MongoDB (Motor), JWT auth, SMTP
- **Deploy:** Render (frontend static + backend web service)

---

## 2. Pages publiques du site

### Pages principales
| Route | Description | Fichier |
|-------|-------------|---------|
| `/` | Page d'accueil | `src/pages/Home.js` |
| `/mini-analyse` | Mini-analyse de marché (i18n) | `src/pages/MiniAnalysis.js` |
| `/about` | À propos | `src/pages/About.js` |
| `/contact` | Formulaire contact | `src/pages/Contact.js` |
| `/contact-expert` | Contact expert (High-Ticket) | `src/pages/ContactExpert.js` |
| `/packs` | Tarifs et packs | `src/pages/Packs.js` |
| `/future-commerce` | Commerce du futur | `src/pages/FutureCommerce.js` |
| `/appointment` | Prise de rendez-vous | `src/pages/Appointment.js` |
| `/demande-rappel` | Demande de rappel | `src/pages/DemandeRappel.js` |

### Pages légales
| Route | Description | Fichier |
|-------|-------------|---------|
| `/legal`, `/terms` | CGU | `src/pages/Terms.js` |
| `/privacy` | Politique confidentialité | `src/pages/PrivacyPolicy.js` |
| `/cookies` | Politique cookies | `src/pages/CookiesPolicy.js` |

### Pages paiement
| Route | Description | Fichier |
|-------|-------------|---------|
| `/checkout` | Checkout | `src/pages/Checkout.js` |
| `/payment` | Paiement | `src/pages/Payment.js` |
| `/payment/return` | Retour paiement | `src/pages/PaymentReturn.js` |
| `/payment-success` | Succès paiement | `src/pages/PaymentReturn.js` |

### SEO
| Route | Description | Fichier |
|-------|-------------|---------|
| `/sitemap-igv` | Sitemap visuel | `src/pages/SitemapView.js` |

---

## 3. Pages Admin/CRM

### Authentification
| Route | Description | Fichier |
|-------|-------------|---------|
| `/admin/login` | Connexion admin | `src/pages/admin/Login.js` |
| `/admin/forgot-password` | Mot de passe oublié | `src/pages/ForgotPassword.js` |
| `/reset-password` | Réinitialisation | `src/pages/ResetPassword.js` |

### CRM (protected routes)
| Route | Description | Fichier |
|-------|-------------|---------|
| `/admin/crm/dashboard` | Dashboard CRM | `src/pages/admin/DashboardPage.js` |
| `/admin/crm/leads` | Gestion prospects | `src/pages/admin/LeadsPage.js` |
| `/admin/crm/leads/:id` | Détail prospect | `src/pages/admin/LeadDetail.js` |
| `/admin/crm/contacts` | Gestion contacts | `src/pages/admin/ContactsPage.js` |
| `/admin/crm/contacts/:id` | Détail contact | `src/pages/admin/ContactDetail.js` |
| `/admin/crm/users` | Gestion utilisateurs | `src/pages/admin/UsersPage.js` |
| `/admin/crm/opportunities` | Opportunités | `src/pages/admin/OpportunitiesPage.js` |
| `/admin/crm/pipeline` | Pipeline ventes | `src/pages/admin/Pipeline.js` |
| `/admin/crm/emails` | Gestion emails | `src/pages/admin/EmailsPage.js` |
| `/admin/crm/activities` | Activités | `src/pages/admin/ActivitiesPage.js` |
| `/admin/crm/settings` | Paramètres CRM | `src/pages/admin/SettingsPage.js` |

### Administration autre
| Route | Description | Fichier |
|-------|-------------|---------|
| `/admin/invoices` | Factures | `src/pages/AdminInvoices.js` |
| `/admin/payments` | Paiements | `src/pages/AdminPayments.js` |
| `/admin/tasks` | Tâches | `src/pages/AdminTasks.js` |
| `/admin/media` | Médiathèque | `src/pages/admin/MediaLibrary.js` |

---

## 4. Points cassés identifiés

### À vérifier (d'après audits précédents)
| Élément | Status | Notes |
|---------|--------|-------|
| Toutes les pages CRM | ✅ | data-testid ajoutés récemment |
| Bouton CMS | ✅ | Corrigé récemment |
| Sauvegarde prospects | ✅ | Corrigé récemment |

### Tests à effectuer
- [ ] Vérifier que toutes les pages publiques chargent
- [ ] Vérifier que le login admin fonctionne
- [ ] Vérifier navigation CRM complète
- [ ] Vérifier mini-analyse (génération PDF)

---

## 5. Inventaire des fichiers inutiles

### 📁 À la racine - Scripts de test obsolètes (35 fichiers Python)
Ces fichiers sont des scripts de tests/diagnostics ponctuels qui ne sont pas référencés dans le projet :

```
test_backend_simple.py
test_bugs_production_live.py
test_complet_prospects_templates.py
test_conversion.py
test_corrections_prospects.py
test_create_delete_complete.py
test_create_then_delete.py
test_crm_email_final.py
test_crm_email_send.py
test_crm_local_audit.py
test_crm_production_audit.py
test_delete_force.py
test_delete_old_user.py
test_delete_user_bug.py
test_delete_user_final_proof.py
test_delete_user_proof_final.py
test_final_prospects.py
test_full_crm_live.py
test_id_format.py
test_integration_complete.py
test_live_complete_validation.py
test_login_prod.py
test_minianalyse_he_complete_prod.py
test_minianalyse_he_END_TO_END.py
test_minianalyse_he_prod.py
test_pdf_long_he.py
test_prospect_to_contact.py
test_prospects_audit.py
test_reel_prospects_complet.py
test_smtp_diagnostic.py
test_templates_notes.py
test_validation_post_correction.py
analyze_pdf_content.py
check_deploy_status.py
create_email_templates.py
diagnostic_delete_user.py
diagnostic_old_users.py
wait_render_deploy.py
```

### 📁 À la racine - Scripts de test JavaScript (4 fichiers)
```
check_admin_role.js
test_crm_diagnostic.js
test_diagnosis.js
test_final_diagnosis.js
test_phase1_complete.js
```

### 📁 À la racine - Fichiers de résultats JSON (5 fichiers)
```
crm_audit_results.json
test_complet_prospects_templates.json
test_full_crm_results.json
test_prospects_audit_results.json
test_reel_prospects_results.json
```

### 📁 À la racine - PDFs de test (4 fichiers)
```
mini_analyse_he_prod_1767500474.pdf
mini_analyse_he_REEL_1767500870.pdf
PREUVE_PDF_HE_DOWNLOAD.pdf
test_pdf_long_he.pdf
```

### 📁 À la racine - Rapports Markdown obsolètes (15 fichiers)
Ces rapports sont des snapshots d'audits passés, remplacés par MISSION_MASTER.md :
```
CRM_AUDIT.md
ENV_VARS_REQUIRED.md
GUIDE_TEST_FRONTEND_LIVE.md
MENAGE_IGV.md
MISSION_PROSPECTS_COMPLETE.md
MISSION_STATUS.md
MISSION_SUMMARY.txt
PHASE1_4_VALIDATION_REPORT.md
RAPPORT_AUDIT_BACKEND_CRM_20260104.md
RAPPORT_AUDIT_CRM_FULL_20260104.md
RAPPORT_AUDIT_CRM_PRODUCTION_20260104.md
RAPPORT_REPARATION_CRM_LIVE.md
RAPPORT_VALIDATION_FINALE_20260104.md
RENDER_ENV_VARS_REQUIRED.md
REPORT_MIDWAY_CMD.md
SITEMAP_COMPLET.md
TODO_MASTER.md
```

### 📁 À la racine - Scripts shell/PowerShell
```
deploy.ps1
deploy.sh
monitor_deploy.ps1
monitor_deploy.py
test_crm_production.ps1
```

### 📁 Dossier audit_out/ - À archiver entièrement
Contient des résultats d'audits passés, scripts de génération :
```
audit_out/
├── api_test_console.log
├── api_test_results.json
├── api_test_results.prev.json
├── backend_routes.json
├── context_console.txt
├── DIFF_GIT.txt
├── frontend_calls.json
├── generate_final_report.py
├── generate_matching.py
├── inventory_backend_routes.py
├── inventory_frontend_calls.py
├── matching_table.json
├── playwright-report/
├── PROGRESS_REPAIR.md
├── RAPPORT_AUDIT_CRM_FULL_LIVE.md
├── RAPPORT_FINAL_REPARATION_CRM.md
├── README.md
├── step0_context.md
├── test-results.json
├── test_crm_full_audit.py
├── ui_manual_steps.md
├── UI_TEST_RESULTS.md
└── __pycache__/
```

### 📁 Dossier test-results/ - À archiver
Résultats de tests Playwright passés.

### 📁 Fichiers utiles à conserver à la racine
```
README.md                 # Documentation principale
render.yaml               # Configuration déploiement Render
package.json              # Config npm racine (Playwright)
package-lock.json         # Lock file npm
playwright.config.js      # Config Playwright
.gitignore                # Git ignore
MISSION_MASTER.md         # CE FICHIER (source de vérité)
```

---

## 6. Nettoyage effectué

### Branche de sauvegarde créée
- [ ] Branche: `backup/pre-cleanup-20260120`
- [ ] Tag: `v1.0.0-pre-cleanup`

### Dossier /archive créé
- [ ] Création de `/archive`
- [ ] Déplacement des fichiers inutiles

### Fichiers déplacés vers /archive
| Fichier/Dossier | Raison |
|-----------------|--------|
| (à remplir) | |

### Fichiers supprimés
| Fichier | Raison |
|---------|--------|
| (à remplir) | |

---

## 7. Retour arrière

### En cas de problème

#### Option 1: Restaurer depuis la branche de sauvegarde
```bash
git checkout backup/pre-cleanup-20260120
```

#### Option 2: Restaurer depuis le tag
```bash
git checkout v1.0.0-pre-cleanup
```

#### Option 3: Annuler le dernier commit
```bash
git revert HEAD
```

---

## 8. Validation build et déploiement

### Build local frontend
- [ ] `npm ci` réussi
- [ ] `npm run build` réussi sans erreurs
- [ ] Taille du build: ___

### Build local backend
- [ ] `pip install -r requirements.txt` réussi
- [ ] `uvicorn server:app --reload` démarre sans erreurs
- [ ] Health check `/health` répond OK

### Validation live
- [ ] Site public accessible: https://israelgrowthventure.com
- [ ] Backend accessible: https://igv-cms-backend.onrender.com/health
- [ ] Login admin fonctionne
- [ ] Navigation CRM complète
- [ ] Mini-analyse génère un PDF

---

## 9. Checklist finale

### Préparation
- [x] Créer MISSION_MASTER.md
- [x] Scanner structure complète
- [x] Identifier fichiers inutiles
- [ ] Créer branche sauvegarde + tag Git

### Nettoyage
- [ ] Créer dossier /archive
- [ ] Déplacer fichiers inutiles vers /archive
- [ ] Mettre à jour .gitignore si nécessaire

### Validation
- [ ] Build frontend OK
- [ ] Build backend OK
- [ ] Commit et push
- [ ] Déploiement Render réussi
- [ ] Tests live passent

### Finalisation
- [ ] Mettre à jour ce fichier avec preuves
- [ ] Marquer statut global ✅ TERMINÉ

---

## 📝 Journal des modifications

| Date | Action | Résultat |
|------|--------|----------|
| 2026-01-20 | Création MISSION_MASTER.md | ✅ |
| 2026-01-20 | Analyse structure complète | ✅ |
| 2026-01-20 | Inventaire fichiers inutiles | ✅ |

---

## 🔗 Références

- Repo GitHub: https://github.com/israelgrowthventure-cloud/igv-site
- Production: https://israelgrowthventure.com
- Backend: https://igv-cms-backend.onrender.com
- Render Dashboard: (accès admin requis)
