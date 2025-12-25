# START HERE - Protocol Obligatoire

**AVANT TOUTE MISSION**: Lire les fichiers suivants dans cet ordre:
1. `MISSION_PROTOCOL.md` - Les 10 règles de mission
2. `ACCEPTANCE_TESTS.md` - Les 5 tests d'acceptance obligatoires

## Format de Réponse Obligatoire

Toute réponse à une mission DOIT commencer par:

```
✅ PROTOCOL_OK — protocol_version=1.0 — files_read=START_HERE.md, MISSION_PROTOCOL.md, ACCEPTANCE_TESTS.md
```

**Sans cette ligne, la mission est refusée.**

## Vérification du Protocole

Pour vérifier que le protocole est en place:
```bash
python tools/protocol_check.py
```

## Règle de Livraison

- Si tu ne peux pas fournir les preuves demandées, **dis-le clairement**.
- Ne jamais dire "fini" ou "livré" tant que l'utilisateur n'a pas validé les 5 tests d'acceptance.
- Ne JAMAIS modifier les identifiants admin sans validation écrite explicite.
- Ne JAMAIS écrire de mots de passe en clair dans le code ou les commits.

## Validation Finale

Une mission n'est terminée que quand l'utilisateur a personnellement effectué les 5 actions d'acceptance tests sur le domaine de production.
