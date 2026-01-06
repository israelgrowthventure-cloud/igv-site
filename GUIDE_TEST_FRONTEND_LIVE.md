# 🎯 GUIDE DE TEST MANUEL - FRONTEND LIVE

## Date: 6 janvier 2026
## URL: https://israelgrowthventure.com/admin/crm/leads
## Credentials: postmaster@israelgrowthventure.com / Admin@igv2025#

---

## ✅ CHECKLIST DE VALIDATION

### 1. ACCÈS & AUTHENTIFICATION
- [ ] Ouvrir https://israelgrowthventure.com/admin/login
- [ ] Se connecter avec les credentials admin
- [ ] Vérifier redirection vers dashboard
- [ ] Naviguer vers CRM > Prospects

### 2. LISTE DES PROSPECTS
- [ ] Liste affichée correctement
- [ ] Colonnes: Nom, Email, Téléphone, Statut, Source, Actions
- [ ] Boutons d'action visibles (👁️ Voir détails)

### 3. FICHE PROSPECT (VUE DÉTAIL)
- [ ] Cliquer sur un prospect dans la liste
- [ ] **CRITIQUE**: Vérifier que le bouton affiche "← Retour à la liste" (PAS "admin.crm.common.back_to_list")
- [ ] **CRITIQUE**: Vérifier affichage du nom/prénom en titre
- [ ] **CRITIQUE**: Vérifier affichage email sous le titre
- [ ] **CRITIQUE**: Vérifier affichage téléphone sous le titre
- [ ] Vérifier onglets: Informations / Notes / Activités / Emails
- [ ] Vérifier statut affiché (badge coloré)

### 4. NOTES DANS LA FICHE
- [ ] Cliquer sur onglet "Notes"
- [ ] **CRITIQUE**: Vérifier que les notes s'affichent (PAS "Aucune note" si des notes existent)
- [ ] Vérifier format: contenu + date + auteur
- [ ] Tester ajout nouvelle note
- [ ] Vérifier que la nouvelle note apparaît immédiatement

### 5. NAVIGATION MENU PROSPECTS
- [ ] Depuis la fiche prospect ouverte (vue détail)
- [ ] **CRITIQUE**: Cliquer sur "Prospects" dans le menu latéral
- [ ] **ATTENDU**: La fiche doit se fermer et revenir à la liste
- [ ] **BUG SI**: La fiche reste affichée

### 6. BOUTON "RETOUR À LA LISTE"
- [ ] Ouvrir une fiche prospect
- [ ] Cliquer sur le bouton "← Retour à la liste"
- [ ] Vérifier retour à la liste
- [ ] Re-cliquer sur le même prospect
- [ ] Vérifier que la fiche s'ouvre à nouveau

### 7. BOUTON SUPPRIMER
- [ ] Ouvrir une fiche prospect (utiliser un prospect de test)
- [ ] Vérifier présence du bouton "Supprimer" (rouge, icône poubelle)
- [ ] Cliquer sur Supprimer
- [ ] Vérifier modal de confirmation
- [ ] Annuler la suppression
- [ ] Re-tester avec confirmation si vous avez un prospect de test

### 8. CONVERSION EN CONTACT
- [ ] Ouvrir une fiche prospect (statut = NEW ou CONTACTED)
- [ ] Vérifier présence du bouton "Convertir en contact"
- [ ] Cliquer sur le bouton
- [ ] Vérifier modal de confirmation
- [ ] Confirmer la conversion
- [ ] Vérifier que le statut passe à CONVERTED
- [ ] Vérifier notification de succès

### 9. TEMPLATES EMAIL (Nouveau Message)
- [ ] Ouvrir une fiche prospect
- [ ] Cliquer sur bouton "✉️ Nouveau message"
- [ ] Vérifier que le modal s'ouvre
- [ ] Vérifier présence du dropdown "Template"
- [ ] Vérifier que les templates sont chargés
- [ ] Sélectionner un template
- [ ] Vérifier que le sujet et contenu se remplissent automatiquement

### 10. RESPONSIVE & PERFORMANCE
- [ ] Tester sur mobile (ou mode responsive Chrome)
- [ ] Vérifier que le menu latéral se plie
- [ ] Vérifier que la fiche prospect est lisible sur mobile
- [ ] Vérifier temps de chargement < 2 secondes

---

## ❌ BUGS CONNUS RÉSOLUS

1. ✅ "admin.crm.common.back_to_list" affiché → CORRIGÉ (traduction ajoutée)
2. ✅ Clic menu "Prospects" ne ferme pas la fiche → CORRIGÉ (event listener ajouté)
3. ✅ Notes non affichées → CORRIGÉ (compatibilité multi-format)
4. ✅ Nom/email/téléphone non visibles → CORRIGÉ (affichage titre amélioré)

---

## 📊 RÉSULTAT ATTENDU

**100% de ces tests doivent passer pour valider la mission.**

Si un test échoue:
1. Noter précisément ce qui ne fonctionne pas
2. Faire une capture d'écran si possible
3. Vérifier la console navigateur (F12) pour les erreurs JS
4. Rapporter le problème pour correction

---

## 🚀 PROCHAINES ÉTAPES APRÈS VALIDATION

Une fois tous les tests OK:
1. Rapport de validation finale
2. Documentation utilisateur
3. Clôture de la mission PROSPECTS

---

**Testeur**: _________________
**Date du test**: _________________
**Résultat**: ☐ PASS ☐ FAIL (détails ci-dessous)

**Notes**:
