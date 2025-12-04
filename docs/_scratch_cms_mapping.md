# CMS → Pages React : Diagnostic et Mapping

## Date d'analyse
4 décembre 2025

---

## 1. BACKEND - Modèle et API

### Modèle Page (server.py)
```python
class Page(BaseModel):
    id: str
    slug: str  # Identifiant unique URL
    title: Dict[str, str]  # {"fr": "...", "en": "...", "he": "..."}
    content_json: str  # GrapesJS JSON (metadata)
    content_html: str  # HTML généré par GrapesJS
    content_css: str  # CSS généré par GrapesJS
    published: bool  # Visibilité publique
    created_at: datetime
    updated_at: datetime
```

### Routes API Pages
- `GET /api/pages` - Liste toutes les pages
- `GET /api/pages/{slug}` - Récupère une page par slug
- `POST /api/pages` - Crée une page (auth requise)
- `PUT /api/pages/{slug}` - Met à jour une page (auth requise)
- `DELETE /api/pages/{slug}` - Supprime une page (admin)

### Base de données
- MongoDB collection: `pages`
- Stockage: `content_html`, `content_css`, `content_json`, titres multilingues

---

## 2. FRONTEND - Routes et Composants

### Routes Public (App.js)
```javascript
<Route path="/" element={<Home />} />                           // Homepage
<Route path="/about" element={<About />} />                     // À propos
<Route path="/packs" element={<Packs />} />                     // Nos Packs
<Route path="/contact" element={<Contact />} />                 // Contact
<Route path="/le-commerce-de-demain" element={<FutureCommercePage />} />
<Route path="/page/:slug" element={<DynamicPage />} />         // Pages dynamiques CMS
```

### Routes Admin (App.js)
```javascript
<Route path="/admin/pages" element={<PageEditorBuilder />} />
<Route path="/admin/pages/:slug" element={<PageEditorBuilder />} />
```

---

## 3. LIAISON CMS → PAGES PUBLIQUES

### ✅ DynamicPage.jsx - Route catch-all CMS
**Fichier**: `frontend/src/pages/DynamicPage.jsx`

**Fonctionnement actuel**:
```javascript
- Récupère slug depuis URL (ex: /page/home)
- Appelle pagesAPI.getBySlug(slug)
- Affiche page.content_html + page.content_css via dangerouslySetInnerHTML
- Vérifie published status
```

**État**: ✅ Fonctionne MAIS :
- Route `/page/:slug` ne correspond PAS aux routes principales (/, /packs, /about, /contact)
- Les pages Home, Packs, About, Contact sont des composants React codés en dur
- Aucune de ces pages ne lit le CMS actuellement

---

## 4. ANALYSE PAGE PAR PAGE

### Page: HOME (/)
**Slug CMS attendu**: `home`
**Composant React**: `Home.js` (frontend/src/pages/Home.js)

**Contenu actuel**:
- Codé en dur en React
- Utilise i18n pour traductions (t('hero.title'), etc.)
- Sections: Hero, Steps, Packs CTA
- **NE LIT PAS le CMS**

**Problème identifié**:
❌ La page Home visible sur le site est en React codé en dur
❌ L'éditeur CMS `/admin/pages/home` montre seulement un contenu basique (titre + sous-titre + bouton)
❌ Pas de synchronisation entre le composant React et le CMS

**Action requise**:
1. Extraire le HTML complet de Home.js
2. L'injecter dans le CMS (slug `home`)
3. Modifier Home.js pour lire le contenu CMS au lieu d'être codé en dur

---

### Page: PACKS (/packs)
**Slug CMS attendu**: `packs`
**Composant React**: `Packs.js`

**Contenu actuel**:
- Récupère les packs via `packsAPI.getAll()` (liste des produits)
- Affichage React dynamique des cartes de packs
- **NE LIT PAS le contenu CMS pour la mise en page**

**Problème identifié**:
❌ La page Packs est un composant React qui affiche dynamiquement les packs depuis l'API
❌ L'éditeur CMS `/admin/pages/packs` pourrait avoir un contenu différent
❌ Pas de synchronisation entre la logique React et le CMS

**Action requise**:
1. Décider si la page Packs doit être:
   - Option A: Entièrement CMS (HTML statique avec placeholder pour liste packs)
   - Option B: Hybride (Hero CMS + liste packs dynamique React)
2. Pour l'instant: extraire le layout/hero de Packs.js, l'injecter dans le CMS
3. Modifier Packs.js pour lire le contenu CMS pour la partie éditoriale

---

### Page: ABOUT (/about)
**Slug CMS attendu**: `about` ou `about-us`
**Composant React**: `About.js`

**Contenu actuel**:
- Page statique codée en React
- Textes via i18n
- **NE LIT PAS le CMS**

**Problème identifié**:
❌ Contenu codé en dur dans le composant React
❌ L'éditeur CMS `/admin/pages/about-us` (ou about) pourrait avoir un contenu différent

**Action requise**:
1. Extraire le HTML de About.js
2. L'injecter dans le CMS (slug `about-us`)
3. Modifier About.js pour lire le CMS

---

### Page: CONTACT (/contact)
**Slug CMS attendu**: `contact`
**Composant React**: `Contact.js`

**Contenu actuel**:
- Formulaire de contact React avec logique d'envoi
- **NE LIT PAS le CMS**

**Problème identifié**:
❌ Formulaire codé en dur
❌ L'éditeur CMS `/admin/pages/contact` pourrait avoir un contenu différent

**Action requise**:
1. Conserver la logique React du formulaire (validation, envoi API)
2. Extraire le layout/textes de Contact.js
3. Injecter dans le CMS (slug `contact`)
4. Modifier Contact.js pour lire le contenu CMS tout en gardant le formulaire fonctionnel

---

### Page: FUTURE COMMERCE (/le-commerce-de-demain)
**Slug CMS attendu**: `future-commerce` ou `le-commerce-de-demain`
**Composant React**: `FutureCommercePage.jsx`

**Contenu actuel**:
- Grande page marketing codée en React
- Nombreuses sections, animations
- **NE LIT PAS le CMS**

**Problème identifié**:
❌ Contenu entièrement codé en dur

**Action requise**:
1. Extraire le HTML complet
2. Injecter dans le CMS (slug `le-commerce-de-demain`)
3. Modifier pour lire le CMS

---

## 5. ADMIN CMS - GrapesJS

### Composant Éditeur
**Fichier**: `frontend/src/pages/admin/PageEditorBuilder.jsx`

**Configuration actuelle**:
```javascript
- GrapesJS v0.22.14
- Preset: grapesjs-preset-webpage
- Canvas: Tailwind CSS chargé via CDN
- Blocs personnalisés IGV (Hero, 2 Colonnes, 3 Cartes, CTA)
- Storage: API backend /api/pages
```

**Fonctionnement**:
1. Charge la page via `pagesAPI.getBySlug(slug)`
2. Initialise GrapesJS avec `content_html` et `content_css`
3. Permet édition drag & drop
4. Sauvegarde via `pagesAPI.update(slug, { content_html, content_css, content_json })`

**Problème identifié**:
❌ L'éditeur charge seulement le contenu CMS existant (souvent basique)
❌ Il n'affiche PAS le contenu réel visible sur le site public (qui est en React codé en dur)
❌ Les styles du site ne sont pas tous chargés dans le canvas (seulement Tailwind CDN)

**Action requise**:
1. Charger les VRAIS styles du site public dans `canvas.styles`
2. S'assurer que le HTML initial dans le CMS correspond au site réel
3. Ajouter les CSS du bundle frontend dans l'éditeur pour preview réaliste

---

## 6. RÉCAPITULATIF - État Actuel

### Pages utilisant le CMS
✅ **DynamicPage** (`/page/:slug`) - Lit le CMS correctement

### Pages NE lisant PAS le CMS
❌ **Home** (`/`)
❌ **Packs** (`/packs`)
❌ **About** (`/about`)
❌ **Contact** (`/contact`)
❌ **FutureCommerce** (`/le-commerce-de-demain`)

### Conséquence
🔴 **Divergence totale** entre:
- Ce que l'utilisateur voit sur le site public (React codé en dur)
- Ce que l'admin voit/édite dans l'éditeur CMS (contenu basique)

---

## 7. PLAN D'ACTION - Prochaines Étapes

### Étape A: Faire lire le CMS par les pages publiques
Pour chaque page (Home, Packs, About, Contact, FutureCommerce):

1. **Vérifier si la page existe dans le CMS** (GET /api/pages/{slug})
2. **Si oui**: Modifier le composant React pour:
   ```javascript
   const [cmsContent, setCmsContent] = useState(null);
   
   useEffect(() => {
     pagesAPI.getBySlug('home').then(res => {
       if (res.data && res.data.published) {
         setCmsContent(res.data);
       }
     });
   }, []);
   
   if (cmsContent) {
     return (
       <>
         <Header />
         <style dangerouslySetInnerHTML={{ __html: cmsContent.content_css }} />
         <div dangerouslySetInnerHTML={{ __html: cmsContent.content_html }} />
         <Footer />
       </>
     );
   }
   ```

3. **Si non**: Créer la page dans le CMS avec le contenu React actuel converti en HTML

### Étape B: Injecter le contenu complet dans le CMS
Pour chaque page, créer/mettre à jour le CMS avec:
- `slug`: slug correspondant à la route React
- `content_html`: HTML complet du composant React (sans Header/Footer)
- `content_css`: Styles spécifiques à la page
- `published`: true
- `title`: {"fr": "...", "en": "...", "he": "..."}

### Étape C: Adapter l'éditeur GrapesJS
1. **Charger les vrais styles** dans `canvas.styles`:
   ```javascript
   canvas: {
     styles: [
       'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
       '/assets/index.css',  // CSS du bundle Vite
       // Ou récupérer dynamiquement les styles depuis le site
     ]
   }
   ```

2. **Assurer que le HTML chargé est complet** (pas juste un placeholder)

3. **Tester le round-trip**:
   - Éditer dans /admin/pages/home
   - Enregistrer
   - Recharger /
   - Vérifier que le changement apparaît

---

## 8. PAGES EXISTANTES DANS LE CMS (à vérifier en prod)

Via `GET /api/pages`, vérifier quelles pages existent déjà:
- [ ] `home`
- [ ] `packs`
- [ ] `about` ou `about-us`
- [ ] `contact`
- [ ] `le-commerce-de-demain` ou `future-commerce`

Pour chaque page manquante, la créer via script Python ou manuellement dans l'admin.

---

## 9. NOTES TECHNIQUES

### Gestion Header/Footer
**Option choisie**: Les conserver dans les composants React (pas dans le CMS)
- Raison: Ils contiennent de la logique (navigation, langue, etc.)
- Dans les composants React, wraper le contenu CMS avec Header/Footer
- Dans l'éditeur, ne montrer que le corps de la page (sans Header/Footer)

### Gestion des formulaires dynamiques
Pour Contact (et autres formulaires):
- Le HTML CMS contient le layout du formulaire
- Le composant React hydrate le formulaire avec la logique d'envoi
- Ou: utiliser un placeholder dans le CMS et injecter le formulaire React dynamiquement

### Styles dans l'éditeur
Pour un rendu réaliste dans GrapesJS:
- Charger Tailwind CSS (déjà fait)
- Charger le CSS du bundle Vite (à ajouter)
- Éventuellement charger Google Fonts si utilisées sur le site

---

## CONCLUSION

**État actuel**: Divergence complète entre le site public (React) et le CMS (contenu basique).

**Objectif de la mission**: Synchroniser le CMS avec le site public pour que:
1. Toutes les pages publiques lisent leur contenu depuis le CMS
2. L'éditeur CMS affiche le contenu complet et réaliste (comme sur le site)
3. Toute modification dans l'admin se reflète immédiatement sur le site public

**Prochaine étape**: Étape A - Faire lire le CMS par Home, puis Packs, About, Contact, FutureCommerce.
