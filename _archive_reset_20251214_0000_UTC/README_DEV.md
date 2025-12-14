# 🧩 PROMPT PERMANENT – MODE D'EXÉCUTION OBLIGATOIRE POUR COPILOT

## 🚀 IGV – Mode d'Exécution Copilot (Permanent et Non Négociable)

Ce document définit les règles **OBLIGATOIRES** que Copilot/Claude doit respecter pour toute modification du site IGV.
Toute mission doit suivre **STRICTEMENT** ces règles, sans exception.

---

## 🔒 1. Interdictions absolues

❌ **Pas de travail local.**

❌ **Pas de commande terminal de l'utilisateur.**

❌ **Pas de clics sur Render par l'utilisateur.**

❌ **Pas de dépendance à l'environnement de l'utilisateur.**

❌ **Pas d'arrêt de mission sans justification technique.**

❌ **Interdiction de déclarer une mission réussie tant que la production n'affiche pas EXACTEMENT le résultat attendu.**

Le travail doit toujours être effectué dans :

- Les dépôts GitHub IGV (`igv-website-complete` et `igv-website-v2`)
- Render (frontend `igv-site-web` et backend `igv-cms-backend`)

---

## 🔁 2. Mode ACC – Auto-Correction Continue (OBLIGATOIRE)

À chaque mission, Copilot active **ACC = Auto-Correction Continue**, impliquant :

### ✔️ Aller jusqu'au bout de la mission

Réaliser la tâche demandée **en entier**, jamais partiellement.

### ✔️ Cycle permanent

Pour chaque modification :

1. **Modifier le code.**
2. `git add` → `git commit` (message clair) → `git push main`.
3. **Déployer sur Render** via scripts ou API.
4. **Attendre la fin effective du déploiement** (`Deployed`, pas `Deploying`).
5. **Lancer les tests en PROD réelle** :
   - Vérifier HTML réel
   - Vérifier JS build (hooks, marqueurs)
   - Vérifier contenu multilingue FR/EN/HE
   - Vérifier images, composants React, SEO, meta, OpenGraph

### ✔️ En cas d'échec d'un test :

Copilot doit **automatiquement** :

- analyser l'erreur,
- corriger le code,
- commit,
- re-déployer,
- re-tester,
- répéter jusqu'à succès.

**Aucune limite stricte de tentatives** : il continue tant qu'une solution existe.

---

## 🎯 3. Condition de réussite

La mission n'est terminée que si :

✅ **La production Render affiche EXACTEMENT le rendu attendu**

✅ **Tous les tests PROD passent à 100 %**

✅ **Le design Emergent, le CMS (textes + images), les langues FR/EN/HE, et Monetico ne sont pas régressés**

✅ **Le build JS contient les hooks nécessaires** (`useCMSContent`, marqueurs)

✅ **Aucun fallback simplifié n'est visible**

Si une étape est impossible techniquement :

- Copilot doit documenter ce blocage dans `INTEGRATION_PLAN.md`
- Expliquer ce qu'il a déjà tenté
- Demander seulement les informations strictement nécessaires

---

## 📝 4. Mise à jour systématique de INTEGRATION_PLAN.md

À la fin de chaque mission (réussie ou non), Copilot ajoute en bas du fichier :

- Date/heure UTC
- Description détaillée de l'objectif
- Liste des fichiers modifiés
- Endpoints impactés
- Variables d'environnement (noms seulement)
- Scripts lancés
- Résultats des tests PROD
- Statut final : OK, partiel, ou blocage expliqué

---

## 📚 5. Respect permanent de la roadmap IGV

Copilot doit garder en mémoire :

- CMS Emergent/GrapesJS
- Nettoyage global front/back
- Page SUCCESS paiement
- Monetico + Virements + Factures
- CRM IGV
- Offre "Étude d'Implantation 360°"
- SEO + AIO complet + metadata + sitemap
- Grille tarifaire validée (packs IGV)

---

## ✅ Copilot NE PEUT PAS conclure une mission tant que :

- le site en production n'a pas le visuel attendu,
- les images/textes du CMS ne s'injectent pas,
- les pages ne matchent pas la version Emergent,
- le multilingue n'est pas fonctionnel,
- aucun test PROD n'a échoué.

---

**Ce document est la référence permanente.**  
**Copilot DOIT l'appliquer automatiquement à chaque mission.**

---

# PROMPT COPILOT – PHASE 6 TER (VERSION LONGUE & COMPLÈTE)

## Restauration du design Emergent + CMS textes & images + i18n + SEO + Build Render distant + Auto-Correction Continue

**Copilot, tu exécutes cette mission en MODE ACC (Auto-Correction Continue), comme défini dans README_DEV.md.**

Tu vas jusqu'à réussite complète en production, sans limite de tentatives, sans jamais exécuter de build local, et sans déclarer la mission terminée avant que la prod réelle soit visuellement et fonctionnellement correcte.

---

## 1️⃣ Objectif Codage – Phase 6 TER (mission complète et non négociable)

Restaurer l'intégralité du design Emergent sur toutes les pages du frontend :

- Home
- About
- Future Commerce
- Contact
- Packs (déjà OK → ne pas toucher au visuel, seulement au texte si nécessaire)

Avec :

### 🎯 CMS complet (textes + images)

- Injection via `structured_content` (MongoDB)
- Support FR / EN / HE pour chaque champ
- Fallback propre : CMS(langue) → CMS(fr) → valeur Emergent

### 🎯 Design Emergent restauré (sections, images, icônes, statistiques)

- Plus jamais de version "texte-only"
- Aucune régression des styles Emergent
- Aucune disparition d'image
- Toutes les sections doivent réapparaître telles qu'avant régression

### 🎯 SEO / AIO intégré dans chaque page

- `<Helmet>` complet
- `<meta name="description">`, `<meta property="og:image">`, `<meta property="og:title">`
- JSON-LD Schema.org
- Version traduite de chaque meta selon la langue

### 🎯 Build Render distant UNIQUEMENT

- Aucun `npm run build` local, jamais
- Déploiement Render via API
- Clear cache Render obligatoire

### 🎯 Validation PROD

- Inspecter le fichier JS build (ex : `main.*.js`) pour vérifier présence :
  - `useCMSContent`
  - marqueurs de texte Emergent
  - images CMS injectées
- Vérifier HTML réel de la home + pages secondaires

### 🎯 Mise à jour CMS backend FastAPI

Permettre en base la structure :

```json
structured_content: {
    hero: {
        title: { fr, en, he },
        subtitle: { fr, en, he },
        image: "url"
    },
    sections: […]
}
```

---

## 2️⃣ Fichiers à modifier (ET UNIQUEMENT CEUX-LÀ)

### Frontend (React / igv-website-complete)

- `frontend/src/hooks/useCMSContent.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/About.js`
- `frontend/src/pages/FutureCommercePage.jsx`
- `frontend/src/pages/Contact.js`
- `frontend/src/components/Layout/Navbar.jsx`
- `frontend/src/components/Layout/Footer.jsx`
- `frontend/src/utils/seoHelpers.js`
- `frontend/src/components/SEO/SchemaOrg.js`

### Backend (FastAPI / igv-cms-backend)

- `backend/models/page_model.py`
- `backend/routes/pages_router.py`
- `backend/utils/cms_parser.py`
- `backend/tests/test_cms_fields.py`

### Scripts de tests

- `tests/test_phase6ter_production.py`
- `scripts/wait_for_render_deployment.py`

### Documentation

- `INTEGRATION_PLAN.md`
- `docs/PHASE6_TER_CMS_EMERGENT_DESIGN.md`

**⚠️ NE RIEN TOUCHER D'AUTRE.**

---

## 3️⃣ Logique / Code à appliquer (détaillé)

### 🔧 3.1 Hook useCMSContent (nouvelle version complète)

- Charge JSON CMS par slug
- `getText(key, locale)`
- `getImage(key, locale)`
- Fallback sur Emergent
- Stockage interne par section :
  - `content.hero.title.fr`
  - `content.hero.image`
  - `content.section2.image`

### 🔧 3.2 Pages (Home, About, Future Commerce, Contact)

- Rétablir le design Emergent EXACT (sections, images, icônes)
- Utiliser CMS uniquement pour les textes et images
- Ne jamais afficher une version simplifiée
- Les images CMS remplacent les images Emergent si présentes

### 🔧 3.3 Backend

Étendre `structured_content` dans `page_model.py` :

```python
structured_content: Optional[Dict[str, Any]] = Field(default=None)
```

Garantir dans le router :

- la sérialisation des données
- la validation par section
- les langues FR/EN/HE intégrées

### 🔧 3.4 SEO / AIO

Pour chaque page :

- Helmet structure
- Meta dynamiques selon la langue
- Image OG = image CMS si disponible
- SchemaOrg injecté avec :
  - `@type: WebPage`
  - titre, description, image localisées

---

## 4️⃣ Actions Render post-push – (OBLIGATOIRES)

Après modifications, Copilot doit :

### 1. Git

```bash
git add .
git commit -m "feat(phase6ter): restauration design Emergent + CMS images & textes + SEO + ACC full deployment"
git push origin main
```

### 2. Déploiement Render Distant (pas de build local)

```bash
POST https://api.render.com/v1/services/<FRONTEND_SERVICE_ID>/deploys
{
  "clearCache": true
}
```

Idem pour le backend.

### 3. Attente complète du déploiement

Utiliser `wait_for_render_deployment.py` :

- Vérifier statut Render == "live"
- Vérifier https://igv-cms-backend.onrender.com/api/health == 200
- Vérifier https://israelgrowthventure.com == 200

### 4. Tests prod

Lancer `test_phase6ter_production.py` :

Vérifier :

- présence `useCMSContent` dans `main.*.js`
- présence des images Emergent restaurées
- présence des images CMS si configurées
- textes FR/EN/HE OK
- SEO meta conformes
- aucune version texte-only détectée
- aucune erreur React

**Si un test échoue → ACC :**
corriger → commit → re-deploy → re-test → répéter.

---

## 5️⃣ Mise à jour AUTOMATIQUE INTEGRATION_PLAN.md

À ajouter :

```markdown
## [Phase 6 TER – Restauration complète design Emergent + CMS Texte & Images + Build Render distant + ACC]

### Objectif
Rétablir le design Emergent complet, injecter CMS textes + images + i18n, restaurer SEO, supprimer tout build local, et garantir un déploiement Render validé live.

### Fichiers modifiés
(liste auto-générée)

### Déploiement
Build Render distant → clearCache → déploiement validé.
Tests live en production → 100 % PASS.

### Résultat
Version finale visible sur israelgrowthventure.com
Design complet Emergent restauré
CMS opérationnel pour textes + images
Multilingue OK
SEO OK
```

---

## 6️⃣ Rappel du MODE ACC (à exécuter obligatoirement)

**Copilot :**
tu **NE TERMINES PAS** cette mission tant que :

- la home n'affiche pas le design Emergent complet,
- les images CMS ne fonctionnent pas,
- toutes les langues FR/EN/HE ne s'affichent pas,
- les pages ne matchent pas la version Emergent,
- les tests prod ne sont pas 100% réussis,
- le fichier JS build Render n'inclut pas `useCMSContent`,
- et le site ne reflète pas exactement le rendu attendu.

**Tu continues jusqu'à réussite complète.**  
**Aucune limite de tentatives.**
