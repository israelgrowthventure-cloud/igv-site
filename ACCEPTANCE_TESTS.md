# ACCEPTANCE TESTS - Les 5 Actions de Validation

**Version**: 1.0  
**Domaine de test**: https://israelgrowthventure.com

## Prérequis

- Navigateur web (Chrome, Firefox, Safari)
- Connexion internet
- Accès aux identifiants admin (définis par l'utilisateur)

## Test 1: Login Admin

**Objectif**: Vérifier que l'authentification admin fonctionne

**Étapes**:
1. Ouvrir `https://israelgrowthventure.com/admin/login`
2. Entrer les identifiants admin (email + password définis par l'utilisateur)
3. Cliquer sur "Se connecter" ou "Login"

**Succès**:
- ✅ Redirection vers `/admin/dashboard` ou `/admin/crm`
- ✅ Pas de message d'erreur
- ✅ Token stocké (localStorage ou cookie)
- ✅ Interface admin visible avec menu de navigation

**Échec si**:
- ❌ Erreur "Invalid credentials"
- ❌ Redirection vers home au lieu de l'admin
- ❌ Page blanche ou erreur 404
- ❌ Clés i18n visibles au lieu du texte traduit

---

## Test 2: Créer un Lead

**Objectif**: Vérifier que la création de leads fonctionne depuis l'interface

**Étapes**:
1. Depuis `/admin/crm`, aller dans l'onglet "Leads" (ou équivalent)
2. Cliquer sur le bouton "Nouveau lead" ou "New Lead"
3. Remplir le formulaire:
   - Email (obligatoire): `test@example.com`
   - Nom: `Test Lead`
   - Brand: `Test Company`
   - Secteur: `Technology`
   - Téléphone: `+33123456789`
   - Priorité: `A`
4. Cliquer sur "Sauvegarder" ou "Save"

**Succès**:
- ✅ Message de succès ("Lead créé avec succès" ou équivalent)
- ✅ Le lead apparaît dans la liste des leads
- ✅ Les données affichées correspondent à celles entrées
- ✅ Le formulaire se ferme après sauvegarde

**Échec si**:
- ❌ Erreur serveur (500, 400, 401)
- ❌ Le lead n'apparaît pas dans la liste
- ❌ Données incorrectes ou manquantes
- ❌ Formulaire ne se ferme pas

---

## Test 3: Ouvrir Fiche Lead + Modifier + Note

**Objectif**: Vérifier que l'édition de leads est fonctionnelle

**Étapes**:
1. Dans la liste des leads, cliquer sur le lead créé au Test 2
2. La fiche détaillée du lead doit s'ouvrir
3. Modifier un champ (ex: changer le statut de "New" à "Contacted")
4. Ajouter une note: `Appelé le 26 décembre, intéressé`
5. Vérifier que l'historique affiche les modifications

**Succès**:
- ✅ Fiche s'ouvre avec tous les détails du lead
- ✅ Champs modifiables (dropdowns, inputs, textarea)
- ✅ Sauvegarde automatique ou bouton "Sauvegarder" fonctionnel
- ✅ Note ajoutée apparaît dans la section notes/historique
- ✅ Historique affiche les changements (timestamp + user + action)

**Échec si**:
- ❌ Fiche ne s'ouvre pas (reste sur liste)
- ❌ Champs en lecture seule (non modifiables)
- ❌ Sauvegarde échoue (erreur ou modifications perdues)
- ❌ Notes ne s'enregistrent pas
- ❌ Historique vide ou non mis à jour

---

## Test 4: Changer Stage Pipeline

**Objectif**: Vérifier que la gestion du pipeline fonctionne

**Étapes**:
1. Aller dans l'onglet "Pipeline" du CRM
2. Localiser le lead créé au Test 2 dans une colonne (ex: "New Leads")
3. Changer le stage soit par:
   - **Drag & drop**: Glisser le lead vers une autre colonne (ex: "Qualified")
   - **Menu dropdown**: Sélectionner un nouveau stage depuis la fiche du lead
4. Vérifier que le lead apparaît dans la nouvelle colonne

**Succès**:
- ✅ Lead se déplace visuellement vers la nouvelle colonne
- ✅ Changement sauvegardé (refresh page = lead reste dans nouvelle colonne)
- ✅ Historique du lead affiche le changement de stage
- ✅ Pas d'erreur dans la console ou toast d'erreur

**Échec si**:
- ❌ Lead ne se déplace pas
- ❌ Changement non sauvegardé (après refresh, lead retourne à l'ancienne colonne)
- ❌ Erreur serveur lors du drag & drop
- ❌ Onglet Pipeline vide ou non fonctionnel

---

## Test 5: Créer Utilisateur + Login avec Nouveau Compte

**Objectif**: Vérifier la gestion des utilisateurs CRM

**Étapes**:
1. Aller dans l'onglet "Paramètres" ou "Settings" du CRM
2. Section "Utilisateurs" ou "Users"
3. Cliquer sur "Ajouter utilisateur" ou "New User"
4. Remplir:
   - Email: `newuser@test.com`
   - Nom: `New User`
   - Rôle: `Sales` ou `Agent`
   - Mot de passe: `Test@123` (si demandé, sinon généré automatiquement)
5. Sauvegarder l'utilisateur
6. Se déconnecter du compte admin
7. Se connecter avec `newuser@test.com` et le mot de passe défini

**Succès**:
- ✅ Utilisateur créé apparaît dans la liste des users
- ✅ Email de confirmation envoyé (si configuré) ou mot de passe affiché
- ✅ Déconnexion admin fonctionne (retour à `/admin/login`)
- ✅ Login avec nouveau compte réussit
- ✅ Nouveau compte a accès au CRM avec les permissions appropriées au rôle

**Échec si**:
- ❌ Formulaire de création user absent ou non fonctionnel
- ❌ Utilisateur non créé (erreur ou n'apparaît pas dans liste)
- ❌ Impossible de se déconnecter
- ❌ Login avec nouveau compte échoue (credentials invalides)
- ❌ Nouveau compte n'a pas accès au CRM (redirection ou erreur 403)

---

## Tests Supplémentaires (Optionnels mais Recommandés)

### Test 6: Export CSV
1. Dans la liste des leads, cliquer sur "Export CSV" ou "Exporter"
2. Vérifier qu'un fichier CSV se télécharge
3. Ouvrir le CSV et vérifier que les données des leads sont présentes

### Test 7: Traductions FR/EN/HE
1. Vérifier que le switcher de langue est visible (drapeau ou dropdown)
2. Cliquer sur FR → Vérifier texte en français (pas de clés `admin.crm.*`)
3. Cliquer sur EN → Vérifier texte en anglais
4. Cliquer sur HE → Vérifier texte en hébreu + RTL (direction right-to-left)

---

## Critères de Validation Globale

**Mission réussie** si et seulement si:
- ✅ Les 5 tests passent sans erreur
- ✅ Aucune clé i18n visible (ex: `admin.crm.tabs.dashboard`)
- ✅ Aucune redirection vers home depuis les routes `/admin/*`
- ✅ Toutes les actions CRUD fonctionnent
- ✅ Base de données mise à jour correctement (vérifiable via re-login ou refresh)

**Mission échouée** si:
- ❌ Au moins 1 test échoue
- ❌ Clés i18n visibles au lieu des traductions
- ❌ Routes `/admin/*` redirigent vers home
- ❌ Erreurs console ou serveur non résolues
