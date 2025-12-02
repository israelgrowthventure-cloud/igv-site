# PLAN D'INTÉGRATION CMS EMERGENT V2 → IGV-SITE V1

## 🎯 OBJECTIF
Intégrer le CMS Emergent complet de igv-website-v2 dans igv-site, nettoyer tous les anciens CMS, tester en production.

---

## 📊 ÉTAT DES LIEUX

### Anciens CMS à SUPPRIMER dans igv-site:
1. ❌ **Plasmic** (`plasmic-init.js`, imports `@plasmicapp`)
2. ❌ **CmsPage.js + CmsPageRenderer.jsx** (Simple JSON CMS)
3. ❌ **Editor.jsx** (Éditeur JSON local avec localStorage)
4. ❌ **cms-builder/** (Dossier entier)
5. ❌ **cms-export/** (Dossier de migration, plus nécessaire)
6. ❌ **editor-app/** (Application séparée, non utilisée)
7. ❌ Tous les fichiers de doc CMS (`CMS_*.md`, `IMPLEMENTATION_SUMMARY.md`, etc.)

### CMS Emergent à INTÉGRER depuis v2:
1. ✅ **PageEditor.jsx** (GrapesJS drag & drop) - `/admin/pages`
2. ✅ **Dashboard.jsx** - `/admin`
3. ✅ **PacksAdmin.jsx** - `/admin/packs`
4. ✅ **PricingAdmin.jsx** - `/admin/pricing`
5. ✅ **TranslationsAdmin.jsx** - `/admin/translations`
6. ✅ **LoginPage.jsx** - `/admin/login`

---

## 🗂️ STRUCTURE CIBLE FINALE

```
igv-site/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js          (Pages React normales)
│   │   │   ├── Packs.js
│   │   │   ├── About.js
│   │   │   ├── Contact.js
│   │   │   ├── FutureCommerce.js
│   │   │   ├── Checkout.js
│   │   │   ├── Appointment.js
│   │   │   ├── Terms.js
│   │   │   │
│   │   │   └── admin/           (CMS Emergent UNIQUEMENT)
│   │   │       ├── LoginPage.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── PageEditor.jsx
│   │   │       ├── PacksAdmin.jsx
│   │   │       ├── PricingAdmin.jsx
│   │   │       └── TranslationsAdmin.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   └── ... (autres composants)
│   │   │
│   │   ├── utils/
│   │   │   └── api.js           (API functions)
│   │   │
│   │   ├── config/
│   │   │   └── apiConfig.js
│   │   │
│   │   ├── context/
│   │   │   └── GeoContext.js
│   │   │
│   │   ├── i18n/
│   │   │   └── locales/
│   │   │
│   │   └── App.js               (Routing)
│   │
│   └── package.json
│
└── backend/                     (Backend existant)
```

---

## 🧹 ÉTAPE 1 - NETTOYAGE

### Fichiers à SUPPRIMER :

#### Dossiers entiers :
- [ ] `frontend/src/cms-builder/`
- [ ] `frontend/src/lib/` (si Plasmic uniquement)
- [ ] `frontend/src/pages/demo/`
- [ ] `cms-export/`
- [ ] `editor-app/`

#### Fichiers individuels :
- [ ] `frontend/src/plasmic-init.js`
- [ ] `frontend/src/pages/CmsPage.js`
- [ ] `frontend/src/pages/Editor.jsx` (ancien JSON editor)
- [ ] `frontend/src/pages/EditorAccess.jsx`
- [ ] `frontend/src/components/cms/CmsPageRenderer.jsx`
- [ ] `frontend/src/utils/cms/cmsApi.js`
- [ ] `frontend/src/hooks/usePricing.js` (si non utilisé ailleurs)
- [ ] `frontend/src/utils/businessLogic.js` (si non utilisé ailleurs)
- [ ] `frontend/public/content-editable.json`

#### Fichiers de documentation à SUPPRIMER :
- [ ] `CMS_ACTIVATION_REPORT.md`
- [ ] `CMS_BLOCKS_REFERENCE.md`
- [ ] `CMS_DEPLOYMENT_GUIDE.md`
- [ ] `CMS_EDITOR_DEPLOYED.md`
- [ ] `CMS_INTEGRATION.md`
- [ ] `CMS_PAGES_INITIALIZED.md`
- [ ] `IMPLEMENTATION_SUMMARY.md`
- [ ] `EDITOR_INTEGRATION_COMPLETE.md`
- [ ] `FIX_APPLIED.md`
- [ ] `SOLUTION_RAPIDE.md`

#### Dépendances à RETIRER de package.json :
- [ ] `@plasmicapp/loader-react`
- [ ] `@plasmicapp/react-web`
- [ ] Tout package lié à Plasmic

---

## 📥 ÉTAPE 2 - INTÉGRATION CMS EMERGENT

### Créer la structure admin/ :
- [ ] `frontend/src/pages/admin/` (dossier)

### Copier depuis igv-website-v2 :
- [ ] `LoginPage.jsx`
- [ ] `Dashboard.jsx`
- [ ] `PageEditor.jsx`
- [ ] `PacksAdmin.jsx`
- [ ] `PricingAdmin.jsx`
- [ ] `TranslationsAdmin.jsx`

### Adapter les imports :
- [ ] Remplacer `@/` par chemins relatifs (`../../`)
- [ ] Vérifier tous les imports de composants
- [ ] Vérifier imports d'icônes (lucide-react)

---

## 🔌 ÉTAPE 3 - API & ROUTING

### Vérifier api.js contient :
- [ ] `pagesAPI` (getAll, getBySlug, create, update, delete)
- [ ] `packsAPI` (getAll, getById, create, update, delete)
- [ ] `pricingAPI` (getRules, calculatePrice)
- [ ] `translationsAPI` (getAll, update)
- [ ] `authAPI` (login, register, getMe)
- [ ] `ordersAPI` (si nécessaire)

### Mettre à jour App.js :
- [ ] Ajouter routes admin :
  - `/admin/login` → LoginPage
  - `/admin` → Dashboard
  - `/admin/pages` → PageEditor (liste)
  - `/admin/pages/:slug` → PageEditor (édition)
  - `/admin/packs` → PacksAdmin
  - `/admin/pricing` → PricingAdmin
  - `/admin/translations` → TranslationsAdmin

### Supprimer de App.js :
- [ ] Import de `CmsPage`
- [ ] Import de `PlasmicRootProvider`
- [ ] Route catch-all `<Route path="*" element={<CmsPage />} />`

---

## 🔧 ÉTAPE 4 - CONFIGURATION

### Variables d'environnement :
- [ ] Vérifier `REACT_APP_BACKEND_URL` ou équivalent
- [ ] Pointer vers : `https://igv-backend.onrender.com`

### Dépendances à ajouter :
- [ ] `grapesjs` (déjà installé)
- [ ] `grapesjs-preset-webpage` (déjà installé)
- [ ] `sonner` (toast notifications - si absent)

---

## ✅ ÉTAPE 5 - BUILD & TEST

- [ ] `npm install` (nettoyer node_modules)
- [ ] `npm run build`
- [ ] Corriger toutes les erreurs
- [ ] Vérifier aucun import manquant

---

## 📤 ÉTAPE 6 - DÉPLOIEMENT

- [ ] `git add -A`
- [ ] `git commit -m "Integrate Emergent CMS, remove old CMS systems"`
- [ ] `git push origin main`

---

## 🧪 ÉTAPE 7 - TESTS PRODUCTION

### Tester sur https://israelgrowthventure.com :

#### Pages publiques :
- [ ] `/` - Home
- [ ] `/packs` - Packs avec pricing dynamique
- [ ] `/about` - About
- [ ] `/contact` - Contact
- [ ] `/future-commerce` - Future Commerce
- [ ] `/checkout/:packId` - Checkout
- [ ] `/appointment` - Appointment

#### Pages admin (CMS Emergent) :
- [ ] `/admin/login` - Login (admin@igv.co.il / admin123)
- [ ] `/admin` - Dashboard
- [ ] `/admin/pages` - Liste des pages
- [ ] `/admin/pages/home` - Éditeur GrapesJS
- [ ] `/admin/packs` - Gestion packs
- [ ] `/admin/pricing` - Gestion pricing
- [ ] `/admin/translations` - Gestion traductions

#### Fonctionnalités CMS :
- [ ] Créer une page avec GrapesJS
- [ ] Modifier une page existante
- [ ] Publier/dépublier une page
- [ ] Modifier un pack (nom, prix, features)
- [ ] Modifier une règle de pricing
- [ ] Modifier une traduction
- [ ] Sauvegarder les modifications

---

## ✅ CRITÈRES DE SUCCÈS

1. ✅ Code propre (aucun ancien CMS)
2. ✅ CMS Emergent 100% fonctionnel
3. ✅ Toutes les pages publiques OK
4. ✅ Backend API connecté correctement
5. ✅ Build sans erreurs
6. ✅ Tests production validés

---

## 📝 NOTES

- **Ne jamais créer un nouveau CMS**
- **Utiliser UNIQUEMENT le CMS Emergent de v2**
- **Tester en DIRECT sur israelgrowthventure.com**
- **Corriger immédiatement si problème**

