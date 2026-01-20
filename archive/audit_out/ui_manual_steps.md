# ÉTAPE 5 — TESTS UI MANUELS

**IMPORTANT**: Ces tests doivent être exécutés manuellement dans le navigateur sur https://israelgrowthventure.com/admin

## Prérequis
- Ouvrir https://israelgrowthventure.com/admin
- Se connecter avec postmaster@israelgrowthventure.com / Admin@igv2025#
- Ouvrir DevTools (F12) → Network tab et Console tab

---

## 1. LOGIN ADMIN

**Action**: 
- URL: https://israelgrowthventure.com/admin/login
- Entrer email: postmaster@israelgrowthventure.com
- Entrer password: Admin@igv2025#
- Clic "Se connecter"

**Attendu**: 
- Redirection vers /admin/dashboard
- Token stocké dans localStorage (key: admin_token)

**Vérifier**:
- Network tab: POST /api/admin/login → Status 200
- Console: Pas d'erreurs
- localStorage.getItem('admin_token') → Token présent

---

## 2. LIST USERS (CRM Settings)

**Action**:
- URL: https://israelgrowthventure.com/admin/crm/settings (ou navigation via menu)
- Onglet "Users"

**Attendu**:
- Liste des users affichée

**Vérifier**:
- Network tab: GET /api/crm/settings/users ou GET /api/admin/users → Status 200
- Response contient array "users"

---

## 3. CREATE USER

**Action**:
- Dans Users tab, clic "Ajouter utilisateur" ou "+"
- Remplir formulaire:
  - Email: TEST_AUDIT_{timestamp}@igvtest.com
  - First name: TestAudit
  - Last name: User
  - Password: TestPass123!
  - Role: commercial (ou admin)
- Clic "Créer" ou "Save"

**Attendu**:
- User créé, message succès
- User apparaît dans la liste

**Vérifier**:
- Network tab: POST /api/admin/users ou POST /api/crm/settings/users → Status 201
- Response contient user_id
- User visible dans liste GET

---

## 4. UPDATE USER

**Action**:
- Clic "Modifier" ou "Edit" sur un user (pas soi-même)
- Changer first_name et last_name
- Clic "Sauvegarder"

**Attendu**:
- User modifié, message succès
- Changements visibles dans liste

**Vérifier**:
- Network tab: PUT /api/admin/users/{user_id} → Status 200
- Response: success: true
- Liste mise à jour

---

## 5. DELETE USER

**Action**:
- Clic "Supprimer" ou "Delete" sur un user test (pas soi-même)
- Confirmer suppression

**Attendu**:
- User supprimé, message succès
- User disparaît de la liste

**Vérifier**:
- Network tab: DELETE /api/admin/users/{user_id} → Status 200
- User absent de liste GET

---

## 6. CREATE LEAD

**Action**:
- URL: /admin/crm/leads
- Clic "Ajouter lead" ou "+"
- Remplir formulaire:
  - Email: TEST_AUDIT_LEAD_{timestamp}@igvtest.com
  - Brand name: Test Brand
  - Name: Test Contact
  - Phone: +972501234567
  - Sector: Tech
- Sauvegarder

**Attendu**:
- Lead créé, message succès
- Lead visible dans liste

**Vérifier**:
- Network tab: POST /api/crm/leads → Status 201
- Response contient lead_id

---

## 7. VIEW LEAD (vérifier analyse liée)

**Action**:
- Clic sur un lead dans la liste
- Ouvrir détails

**Attendu**:
- Détails lead affichés
- Si analyse liée: affichage ou lien vers analyse

**Vérifier**:
- Network tab: GET /api/crm/leads/{lead_id} → Status 200
- Response contient structure lead complète
- Chercher champs: mini_analysis_id, analysis_text, ou similaire

---

## 8. CONVERT LEAD TO CONTACT

**Action**:
- Dans détails lead, clic "Convertir en contact" ou "Convert to Contact"

**Attendu**:
- Contact créé, message succès
- Lead status → CONVERTED
- Redirection vers contact ou message de succès

**Vérifier**:
- Network tab: POST /api/crm/leads/{lead_id}/convert-to-contact → Status 200
- Response contient contact_id
- GET /api/crm/leads/{lead_id} → status: "CONVERTED"
- GET /api/crm/contacts/{contact_id} → contact existe

---

## 9. CREATE OPPORTUNITY

**Action**:
- URL: /admin/crm/opportunities
- Clic "Ajouter opportunité" ou "+"
- Remplir:
  - Name: Test Opportunity
  - Value: 50000
  - Stage: qualification
- Sauvegarder

**Attendu**:
- Opportunity créée, message succès

**Vérifier**:
- Network tab: POST /api/crm/opportunities → Status 201
- Response contient opportunity_id

---

## 10. UPDATE OPPORTUNITY STAGE (Pipeline)

**Action**:
- URL: /admin/crm/pipeline (vue Kanban)
- Glisser card opportunity vers autre stage (ex: qualification → proposal)
- OU clic sur opportunity → modifier stage → sauvegarder

**Attendu**:
- Stage mis à jour, card déplacée

**Vérifier**:
- Network tab: PUT /api/crm/opportunities/{opp_id} ou PUT /api/crm/pipeline/opportunities/{opp_id} → Status 200
- Pipeline mis à jour

---

## 11. CREATE EMAIL TEMPLATE

**Action**:
- URL: /admin/crm/emails ou /admin/crm/settings
- Onglet "Templates" ou "Email Templates"
- Clic "Créer template" ou "+"
- Remplir:
  - Name: Test Template
  - Subject: Test Subject
  - Body: Hello {name}, test message
  - Language: fr
- Sauvegarder

**Attendu**:
- Template créé, message succès
- Template visible dans liste

**Vérifier**:
- Network tab: POST /api/crm/emails/templates → Status 201 (ou 200)
- Si 500: Vérifier erreur (bug require_role attendu)

---

## 12. SEND EMAIL

**Action**:
- Dans Contacts, sélectionner un contact
- Clic "Envoyer email" ou "Send Email"
- OU dans détails contact, clic "Send Email"
- Remplir:
  - To: email du contact (pré-rempli)
  - Subject: Test Email
  - Message: Test message
- Clic "Envoyer"

**Attendu**:
- Email envoyé, message succès

**Vérifier**:
- Network tab: POST /api/crm/emails/send → Status 200
- Response: success: true
- Si erreur SMTP: vérifier message erreur

---

## NOTES POUR EXÉCUTION MANUELLE

Pour chaque action, noter:
1. URL de la page
2. Appel Network (endpoint, method, status, response)
3. Erreurs console (si présentes)
4. Comportement UI (attendu vs obtenu)
5. Screenshots si bugs visuels

**Fichier à compléter**: Documenter résultats réels dans ce fichier après exécution manuelle.

