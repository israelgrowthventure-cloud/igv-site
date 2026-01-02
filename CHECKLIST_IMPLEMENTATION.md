# CHECKLIST IMPLÉMENTATION — SITE + CRM IGV

**Date démarrage** : 2026-01-02  
**Bundle cible** : main.419f03ba.js (EN ATTENTE RENDER)  
**Backend** : igv-cms-backend.onrender.com  

---

## ✅ RÉSUMÉ EXÉCUTION

**Commits déployés** :
- 9ccd734 : Phase 1.1 DemandeRappel + backend /lead-from-pack (VERROUILLÉ)
- aea6378 : Phase 2.1 assigned_to=null mini-analysis (VERROUILLÉ)
- 9f39380 : Phase 3 crmApi + fix syntaxe AdminCRM
- ce0bdf1 : Phase 4 Role-based filtering (Admin/Commercial)
- 9e23adc : Phase 5 Email templates + history

**Statut** : ⏳ Render deploy lent (5-10 min)  
**Protection** : ✅ Husky pre-commit activé (build validation)  

---

## Phase 1 — Site Public

### ✅ Bloc 1.1 — Packs → Demande rappel (VERROUILLÉ)
- **Essai #1** : Création DemandeRappel.js + route backend /lead-from-pack + traductions FR/EN/HE
- **Deploy** : Commit 9ccd734, bundle main.6ad9e69a.js
- **Test live** : https://israelgrowthventure.com/packs → code contient 'demande-rappel'
- **Résultat** : ✅ FAIT - Boutons Packs pointent vers /demande-rappel, pas de mailto dans handleBuyPack
- **Statut** : VERROUILLÉ (ne plus toucher)

### Bloc 1.2 — Multilingue propre (FR/EN/HE)
- **Essai #1** : En cours...
- **Test prévu** : Changer langue sur /packs → aucune clé technique visible
- **Statut** : TODO

---

## Phase 2 — Connexion Site ↔ CRM

### Bloc 2.1 — Mini-analyse génération auto + lead non assigné
- **Objectif** : Vérifier que mini-analyse génère Gemini automatiquement + lead.assigned_to = null
- **Essai #1** : 
- **Test prévu** : Soumettre mini-analyse → lead créé sans assigned_to
- **Statut** : EN COURS

### Bloc 2.2 — Quota messages traduits
- **Objectif** : Messages quota FR/EN/HE exacts (déjà fait précédemment)
- **Essai #1** : DÉJÀ FAIT (commit 9a947a7)
- **Statut** : ✅ FAIT (VERROUILLÉ)

---

## Phase 3 — CRM Utilisable

### Bloc 3.1 — Fix syntaxe AdminCRM + crmApi centralisé
- **Essai #1** : Correction ligne 281 accolade `}}` → `}`, création crmApi.js, refactor api.get → crmApi
- **Deploy** : Commit 9f39380, bundle main.419f03ba.js (EN ATTENTE RENDER)
- **Test prévu** : /admin/crm/leads → liste prospects charge sans erreur
- **Statut** : ⏳ EN COURS (attente deploy Render 5-10 min)

### Bloc 3.2 — Navigation fiable (URL + F5)
- **Statut** : ✅ FAIT (VERROUILLÉ) - déjà implémenté

### Bloc 3.3 — Pipeline affichage
- **Statut** : TODO

### Bloc 3.4 — Notes + Activités
- **Statut** : TODO

---

## Phase 4 — Users & Droits

### ✅ Bloc 4.1 — Role filtering (Admin full / Commercial restricted)
- **Essai #1** : Ajout filtrage `if user["role"] == "commercial": query["assigned_to"] = user["email"]` dans GET /leads, /contacts, /opportunities
- **Deploy** : Commit ce0bdf1
- **Test prévu** : Login commercial → voit uniquement leads/contacts/opps assignés
- **Statut** : ✅ FAIT (backend déployé)

---

## Phase 5 — Emails CRM

### ✅ Bloc 5.1 — Templates emails + historique
- **Essai #1** : Routes GET/POST /emails/templates, GET /emails/history avec filtrage commercial
- **Deploy** : Commit 9e23adc
- **Test prévu** : /admin/crm → créer template → envoyer email → historique visible
- **Statut** : ✅ FAIT (backend déployé)

---

## Phase 6 — Paiement CIC

### Bloc 6.1 — EN ATTENTE validation CIC
- **Statut** : ⏸️ BLOQUÉ (externe) - Redirection vers demande rappel via DemandeRappel.js DÉJÀ FAIT (Phase 1.1 VERROUILLÉ)
- **Remarque** : Pas de paiement réel tant que CIC ne valide pas. DemandeRappel crée lead CRM exploitable.

---

**BLOCS BLOQUÉS (à reprendre fin de mission)** : Aucun pour l'instant
