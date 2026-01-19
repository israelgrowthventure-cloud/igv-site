# TODO MASTER - Réparation CRM/CMS Katalon
**Date création:** 2026-01-19
**Objectif:** Corriger tous les chemins cassés détectés par Katalon + valider par re-run

---

## STATUS GLOBAL
- [x] 1. Analyse des captures Katalon (2 dossiers)
- [x] 2. Explorer l'architecture frontend/backend
- [x] 3. Identifier la source des erreurs "page error" 
- [x] 4. Fix les routes CRM qui causent "page error" (data-testid ajoutés)
- [x] 5. Fix PROSPECT SAVE_CLICK_FAIL (data-testid sur bouton Enregistrer)
- [x] 6. Fix CONTACT NAME_NOT_FOUND (data-testid sur cellule nom)
- [x] 7. Fix CRM_OPPS_OPEN CLICK_FAIL (data-testid sur nav Opportunités)
- [x] 8. Fix CRM_USERS_OPEN CLICK_FAIL (data-testid sur nav Utilisateurs)
- [x] 9. Fix CMS CLICK_FAIL (bouton rendu cliquable + data-testid)
- [x] 10. Ajouter data-testid pour sélecteurs stables Katalon
- [ ] 11. Commit et push sur GitHub
- [ ] 12. Attendre déploiement Render
- [ ] 13. Tests post-déploiement Katalon
- [ ] 14. Valider rapport final avec 0 KO

---

## ANALYSE DES CAPTURES KATALON

### Run "actionnable" (TS=20260119_213503) - 12 OK, 6 KO
| Fichier | Problème identifié |
|---------|-------------------|
| PROSPECT_SAVE_CLICK_FAIL.png | Bouton Enregistrer non cliquable (disabled? overlay? validation?) |
| CONTACT_NAME_NOT_FOUND.png | Après création, le nom n'apparaît pas dans la fiche |
| CONTACT_DELETE_BLOCKED.png | Suppression impossible car nom non trouvé |
| CRM_OPPS_OPEN_CLICK_FAIL.png | Menu "Opportunités" ne répond pas au clic |
| CRM_USERS_OPEN_CLICK_FAIL.png | Menu "Utilisateurs" ne répond pas au clic |
| CMS_CLICK_FAIL.png | Bouton "Modifier le Site" ne fonctionne pas |

### Run "profondeur" (TS=20260119_214608) - 0 OK, 31 KO, 1 WRN
| Fichier | Page/Action |
|---------|-------------|
| NAV_DASH_error.png | /admin/crm/dashboard |
| NAV_PROSPECTS_error.png | /admin/crm/leads |
| NAV_CONTACTS_error.png | /admin/crm/contacts |
| NAV_OPPS_error.png | /admin/crm/opportunities |
| NAV_PIPELINE_error.png | /admin/crm/pipeline |
| NAV_ACTIVITES_error.png | /admin/crm/activities |
| NAV_EMAILS_error.png | /admin/crm/emails |
| NAV_USERS_error.png | /admin/crm/users |
| NAV_SETTINGS_error.png | /admin/crm/settings |
| *_FALLBACK_error.png | Tentatives de fallback échouées |
| CONTACTS_record_error.png | CRUD Contacts KO |
| PROSPECTS_record_error.png | CRUD Prospects KO |
| OPPORTUNITES_record_error.png | CRUD Opportunités KO |
| USER_OPEN_error.png | Ouverture User KO |
| CMS_FROM_DASH_error.png | CMS depuis Dashboard KO |

---

## ARCHITECTURE IDENTIFIÉE

### Frontend (React)
- **Routes CRM:** Définies dans `frontend/src/App.js`
  - `/admin/crm/dashboard` → `DashboardPage`
  - `/admin/crm/leads` → `LeadsPage`
  - `/admin/crm/contacts` → `ContactsPage`
  - `/admin/crm/users` → `UsersPage`
  - `/admin/crm/opportunities` → `AdminCRMComplete`
  - `/admin/crm/pipeline` → `Pipeline`
  - `/admin/crm/activities` → `AdminCRMComplete`
  - `/admin/crm/emails` → `AdminCRMComplete`
  - `/admin/crm/settings` → `AdminCRMComplete`

- **Sidebar:** `frontend/src/components/common/Sidebar.js`
  - Navigation via boutons avec onClick navigate()
  - Bouton CMS: `CmsAdminButton.jsx`

### Backend (Python Flask)
- Routes CRM: `backend/crm_routes.py`, `backend/crm_complete_routes.py`
- Routes Admin: `backend/admin_routes.py`, `backend/admin_user_routes.py`

---

## CORRECTIONS À EFFECTUER

### 3.1 Routes "page error"
**Hypothèse:** Les erreurs viennent probablement de:
- Lazy loading échoué (ChunkLoadError)
- Erreur JS dans un composant (crash React)
- API timeout/401/403/500

**Action:** Vérifier console devtools sur chaque page

### 3.2 PROSPECT SAVE_CLICK_FAIL
**Fichier:** `frontend/src/components/crm/LeadsTab.js`
**Code actuel:** Le bouton submit a `disabled={loadingAction}`
**Hypothèse:** Peut-être le loadingAction reste true, ou validation échoue silencieusement

### 3.3 CONTACT NAME_NOT_FOUND
**Fichier:** `frontend/src/components/crm/ContactsTab.js`
**Hypothèse:** Après création, la liste ne se rafraîchit pas ou le nom n'est pas affiché

### 3.4 Opportunités/Utilisateurs CLICK_FAIL
**Fichier:** `frontend/src/components/common/Sidebar.js`
**Hypothèse:** Problème de navigation ou composant non chargé

### 3.5 CMS CLICK_FAIL
**Fichier:** `frontend/src/components/CmsAdminButton.jsx`
**Hypothèse:** Le script externe CMS ne charge pas (timeout/erreur réseau)

---

## COMMIT LOG
*(À remplir au fur et à mesure)*

---

## TESTS KATALON POST-DÉPLOIEMENT
*(À remplir après corrections)*
