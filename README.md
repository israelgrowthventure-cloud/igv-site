# Israel Growth Venture - Site Web Complet

Site web multilingue (FR/EN/HE) pour Israel Growth Venture, spécialiste de l'expansion de marques en Israël.

## 🚀 Fonctionnalités

- ✅ **Multilingue** : FR / EN / HE avec support RTL pour hébreu
- ✅ **Prix dynamiques** : Adaptation automatique par région (géolocalisation IP)
- ✅ **SEO optimisé** : Meta tags, Open Graph, Schema.org, sitemap.xml
- ✅ **Formulaire contact** : Gmail SMTP
- ✅ **Rendez-vous** : Intégration Google Calendar
- ✅ **Responsive** : Mobile-first design

## 📁 Structure du Projet

```
/
├── backend/              # Backend FastAPI
│   ├── server.py        # Serveur principal
│   ├── requirements.txt # Dépendances Python
│   └── .env.example     # Configuration exemple
│
├── frontend/            # Frontend React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages du site
│   │   ├── i18n/        # Traductions FR/EN/HE
│   │   └── utils/       # Utilitaires (pricing, API, calendar)
│   ├── public/
│   │   ├── sitemap.xml
│   │   └── robots.txt
│   └── package.json
│
└── README.md
```

## 🛠️ Installation

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt

# Copier et configurer .env
cp .env.example .env
# Éditer .env avec vos credentials

# Lancer le serveur
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend (React)

```bash
cd frontend
yarn install

# Copier et configurer .env
cp .env.example .env
# Éditer .env avec votre URL backend

# Lancer le dev server
yarn start

# Build production
yarn build
```

## ⚙️ Configuration

### 1. Gmail SMTP (`backend/.env`)

```env
SMTP_USER=contact@israelgrowthventure.com
SMTP_PASSWORD=votre_mot_de_passe_application_gmail
CONTACT_EMAIL=israel.growth.venture@gmail.com
```

**Comment obtenir un mot de passe d'application Gmail :**
1. Aller sur https://myaccount.google.com/security
2. Activer la validation en 2 étapes
3. Générer un mot de passe d'application

### 2. Prix par Région (`frontend/src/utils/pricing.js`)

Les prix sont configurables dans le fichier `pricing.js`

### 3. Traductions (`frontend/src/i18n/locales/`)

Modifier les fichiers :
- `fr.json` : Textes français
- `en.json` : Textes anglais
- `he.json` : Textes hébreux

## 🌍 Pages Disponibles

- Accueil : `/`
- Qui sommes-nous : `/about`
- Nos Packs : `/packs`
- Commerce de Demain : `/future-commerce`
- Contact : `/contact`
- Rendez-vous : `/appointment`
- CGUV : `/terms`

## 🚀 Déploiement

### Build Production

```bash
cd frontend
yarn build
```

Le dossier `build/` contient les fichiers prêts pour l'hébergement.

---

© 2025 Israel Growth Venture. Tous droits réservés.
