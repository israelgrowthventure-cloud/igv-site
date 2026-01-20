# IGV Frontend - React Application

Configuration pour le déploiement séparé du frontend.

## Structure du repo

```
igv-frontend/
├── .env.development
├── .env.example
├── .env.production
├── .gitignore
├── .nvmrc
├── components.json
├── craco.config.js
├── jsconfig.json
├── package.json
├── package-lock.json
├── plugins/
├── postcss.config.js
├── public/
├── README.md
├── render.yaml
├── server.js
├── src/
└── tailwind.config.js
```

## Variables d'environnement requises

| Variable | Valeur |
|----------|--------|
| `REACT_APP_API_URL` | `https://igv-cms-backend.onrender.com` |
| `NODE_VERSION` | `20.18.3` |
| `GENERATE_SOURCEMAP` | `false` |
| `CI` | `false` |

## Commandes

```bash
# Installation
npm ci

# Développement local
npm run dev

# Build production
npm run build

# Servir le build
npm start
```

## Déploiement Render

Le service `igv-frontend` est configuré comme un site statique (Static Site).
Le build est automatique à chaque push sur `main`.
