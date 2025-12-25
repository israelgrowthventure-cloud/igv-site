# MISSION PROTOCOL - Les 10 Règles

**Version du Protocole**: 1.0  
**Date de création**: 26 décembre 2025

## Règles Obligatoires

### 1. Interdiction de "Fini" Sans Validation
Interdiction absolue d'annoncer "fini", "livré", "terminé", "mission accomplie" tant que l'utilisateur n'a pas effectué personnellement les 5 actions de validation définies dans `ACCEPTANCE_TESTS.md`.

### 2. Zéro Blabla - Actions + Résultats Observables
Uniquement des actions concrètes et des résultats observables. Pas de rapports, pas de documentation non demandée, pas d'explications inutiles. **Format strict**: Action → Résultat → Preuve.

### 3. Un Changement = Un Test = Une Preuve
Chaque modification doit être testée individuellement. Fournir une preuve observable (URL, screenshot, log, output terminal) pour chaque changement.

### 4. Clés i18n Visibles ou Redirection Home = BUG BLOQUANT
Si des clés de traduction apparaissent dans l'UI (ex: `admin.crm.tabs.dashboard`) au lieu du texte traduit, c'est un **bug bloquant**. Si une route redirige vers home au lieu de la page demandée, c'est un **bug bloquant**. Arrêt immédiat et correction avant toute autre action.

### 5. Pas de Démo Vide - Tout Doit Être Cliquable
Toutes les fonctionnalités CRUD doivent être opérationnelles:
- **Create**: Bouton visible + formulaire fonctionnel + sauvegarde en base
- **Read**: Liste affichée + détails consultables
- **Update**: Modification de champs + sauvegarde effective
- **Delete**: Suppression avec confirmation + disparition de la base

### 6. Toute Modification Sensible Doit Être Explicitée
Modifications sensibles nécessitant validation écrite AVANT exécution:
- Changement d'identifiants admin
- Modification de mots de passe
- Suppression de données en production
- Changement de clés API ou tokens de sécurité
- Modification de configuration SMTP ou domaines

**Interdiction absolue** d'écrire des mots de passe en clair dans le code ou les commits.

### 7. Test Sur Domaine Production Obligatoire
Tous les tests doivent être effectués sur le domaine de production réel:
- Frontend: `https://israelgrowthventure.com`
- Backend: `https://igv-cms-backend.onrender.com`

Les tests en local ne comptent pas comme validation finale.

### 8. Fin de Mission = Bloc Validation + Preuves
À la fin d'une mission, fournir UNIQUEMENT:
1. **Liens à ouvrir** (URLs exactes)
2. **Actions à effectuer** (5 actions d'acceptance tests)
3. **SHA du commit** (si code modifié)

Pas de résumé, pas de rapport, pas de "mission accomplie".

### 9. Échec = Cause + Correctif + Re-test + Preuve
En cas d'échec d'un test:
1. Identifier la cause exacte
2. Appliquer le correctif
3. Re-tester immédiatement
4. Fournir la preuve du succès

Ne jamais passer au test suivant avec un échec non résolu.

### 10. "Terminé" = Tous les Tests Passent
Une mission n'est "terminée" que quand l'utilisateur a validé personnellement:
- ✅ Login admin avec credentials existants
- ✅ Créer un lead depuis l'interface CRM
- ✅ Ouvrir la fiche lead + modifier champs + ajouter note + voir historique
- ✅ Changer stage dans pipeline (drag&drop ou menu)
- ✅ Créer un utilisateur CRM + se déconnecter + se reconnecter avec le nouveau compte
- ✅ Export CSV fonctionnel
- ✅ Switcher FR/EN/HE avec traductions correctes (pas de clés visibles)

## Sanctions

Violation d'une règle = Mission refusée. L'utilisateur arrête la mission et demande correction.

## Application du Protocole

Ce protocole s'applique à **toutes les discussions futures**, même si la conversation recommence de zéro. Le fichier `START_HERE.md` doit toujours être lu en premier.
