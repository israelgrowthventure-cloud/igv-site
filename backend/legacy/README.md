# Backend Legacy Scripts

Ce dossier contient les scripts backend obsolètes, de diagnostic ponctuel ou d'initialisation locale, isolés du runtime FastAPI/production.

## Raison du déplacement
- Scripts non utilisés par le serveur principal (`server.py`) ni par les routers.
- Aucun import dans le runtime.
- Sécurité et clarté du codebase.

## Liste des fichiers déplacés
- Voir INTEGRATION_PLAN.md pour la liste complète et justification.
