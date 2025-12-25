# IGV Site - Israel Growth Venture

**Version**: 1.0  
**Date**: Décembre 2025

---

## ⚠️ PROTOCOLE OBLIGATOIRE - À LIRE AVANT TOUTE MISSION

**Toute mission commence par:**

```
✅ PROTOCOL_OK — protocol_version=1.0 — files_read=START_HERE.md, MISSION_PROTOCOL.md, ACCEPTANCE_TESTS.md
```

### Fichiers à Lire en Premier

1. **[START_HERE.md](START_HERE.md)** - Instructions de protocole
2. **[MISSION_PROTOCOL.md](MISSION_PROTOCOL.md)** - Les 10 règles obligatoires
3. **[ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md)** - Les 5 tests de validation

### Vérification du Protocole

```bash
python tools/protocol_check.py
```

---

## Architecture

- **Frontend**: React (Render - https://israelgrowthventure.com)
- **Backend**: FastAPI (Render - https://igv-cms-backend.onrender.com)
- **Base de données**: MongoDB
- **Authentification**: JWT
- **i18n**: FR/EN/HE avec i18next

---

## Structure du Projet

```
igv-site/
├── START_HERE.md                    # Point d'entrée - Protocole obligatoire
├── MISSION_PROTOCOL.md              # 10 règles de mission
├── ACCEPTANCE_TESTS.md              # 5 tests de validation
├── backend/                         # API FastAPI
│   ├── server.py                   # Point d'entrée backend
│   ├── crm_routes.py               # Routes CRM
│   ├── admin_routes.py             # Routes admin
│   └── requirements.txt            # Dépendances Python
├── frontend/                        # Application React
│   ├── src/                        
│   │   ├── components/             # Composants React
│   │   ├── i18n/                   # Traductions FR/EN/HE
│   │   └── App.js                  # Point d'entrée frontend
│   ├── public/                     
│   └── package.json                # Dépendances Node.js
└── tools/                           # Scripts utilitaires
    └── protocol_check.py           # Vérification du protocole
```

---

## Installation Locale (Développement)

### Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Déploiement Production

- **Automatique** via GitHub → Render (auto-deploy activé)
- Push sur `main` déclenche le build

---

## Tests d'Acceptance

Avant de valider une mission, exécuter les 5 tests définis dans [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md):

1. ✅ Login admin
2. ✅ Créer un lead
3. ✅ Ouvrir fiche lead + modifier + note
4. ✅ Changer stage pipeline
5. ✅ Créer utilisateur + login avec nouveau compte

---

## Règles de Sécurité

- ❌ **Interdiction** de commiter des mots de passe en clair
- ❌ **Interdiction** de modifier les identifiants admin sans validation écrite
- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ Toute modification sensible nécessite validation explicite

---

## Support

Pour toute mission, **commencer par lire [START_HERE.md](START_HERE.md)**.

Sans la ligne `PROTOCOL_OK`, la mission est refusée.
