# Notes Techniques - Refonte CMS Admin UI

## Architecture Existante Analysée

### Backend (FastAPI)
- **Routes Pages** : `/api/pages` (GET/POST), `/api/pages/{slug}` (GET/PUT/DELETE)
- **Modèle Page** :
  - `slug` : identifiant unique URL
  - `title` : dict multilangue {fr, en, he}
  - `content_html` : HTML GrapesJS
  - `content_css` : CSS GrapesJS
  - `content_json` : metadata GrapesJS
  - `published` : boolean
  - `created_at`, `updated_at` : timestamps
- **Base de données** : MongoDB, collection `pages`

### Frontend Admin Existant
- **PagesList.jsx** : Grille de cartes, badges langues, statut publié
- **PageEditorModern.jsx** : Éditeur GrapesJS avec template de départ, charge content_html/css correctement
- **Dashboard.jsx** : Stats et navigation, déjà stylisé IGV

### Routing CMS ↔ Front Public
- **Admin** : `/admin/pages/:slug` → édition
- **Public** : `/page/:slug` → DynamicPage.jsx lit `pagesAPI.getBySlug(slug)` et injecte content_html/css
- **Connexion** : Via slug. Exemple : page admin "home" peut être accessible via `/page/home` en front public
- **Routes principales** : `/` (Home), `/packs`, `/about`, `/contact` sont des composants React directs (pas CMS pour l'instant)

### Palette IGV
- **Bleu primaire** : `#0052CC`
- **Bleu foncé** : `#003D99`
- **Bleu clair** : `#0065FF`
- **Gradients** : `linear-gradient(135deg, #0052CC 0%, #003D99 100%)`
- **Fond clair** : `#F7FAFC`, `#F9FAFB`
- **Boutons** : arrondis (50px radius), ombre douce, hover scale

### Points à Améliorer
1. **Navigation gauche** : Créer colonne avec arborescence pages (actuellement liste cartes)
2. **Layout 3 zones** : NAV gauche | Canvas central pleine page | Panneau propriétés droite
3. **Modale création page** : Remplacer formulaire par cartes types (Page, Landing, Blog, Contact)
4. **Style GrapesJS** : Remplacer thème marron par IGV clair (blanc, bleu, ombre douce)
5. **Connexion routes** : Clarifier mapping slug CMS → URL publique (actuellement `/page/:slug` pour CMS dynamiques)

## Objectif Squarespace-Style
- **Référence Screen 1** : Navigation gauche élégante, canvas plein centre, modale cartes création
- **Éliminer** : Fond marron, barre sombre GrapesJS, formulaires bruts
- **Adopter** : Blanc/gris clair, bordures fines, ombres légères, boutons modernes arrondis
