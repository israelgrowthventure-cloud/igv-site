# CHECKLIST IMPLÉMENTATION — SITE + CRM IGV

**Date démarrage** : 2026-01-02  
**Bundle actuel** : main.6ad9e69a.js  
**Backend** : igv-cms-backend.onrender.com  

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

### Bloc 4.1 — Rôle Admin (full access)
- **Statut** : TODO

### Bloc 4.2 — Rôle Commercial (restricted)
- **Statut** : TODO

---

## Phase 5 — Emails CRM

### Bloc 5.1 — Templates emails en base
- **Statut** : TODO

### Bloc 5.2 — Envoi depuis fiche
- **Statut** : TODO

### Bloc 5.3 — Historique emails
- **Statut** : TODO

---

## Phase 6 — Paiement CIC

### Bloc 6.1 — EN ATTENTE validation CIC
- **Statut** : ⏸️ BLOQUÉ (externe) - Redirection vers demande rappel DÉJÀ FAIT

---

**BLOCS BLOQUÉS (à reprendre fin de mission)** : Aucun pour l'instant
