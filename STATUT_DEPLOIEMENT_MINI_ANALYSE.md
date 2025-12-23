# 🚀 MINI-ANALYSE IGV - STATUT DÉPLOIEMENT

**Date:** 24 décembre 2025  
**Commits:** 1579f4f → 36d7974 → bc3b98d

---

## ✅ PHASE 1-5 : TERMINÉES

### ✅ Phase 1 : Audit du projet
- Stack identifiée : React 18.3.1 + FastAPI + MongoDB + Render
- Landing page : `frontend/src/pages/NewHome.js`
- Backend API : `backend/server.py` + routes modulaires
- Base MongoDB configurée

### ✅ Phase 2 : Intégration fichiers IGV
- Dossier `igv_internal/` créé
- 3 fichiers créés (format TXT pour parsing simplifié) :
  - `IGV_Types_Emplacements_Activites.txt` (types d'emplacements)
  - `Whitelist_1_Jewish_incl_Mixed.txt` (quartiers juifs/laïcs/religieux)
  - `Whitelist_2_Arabe_incl_Mixed.txt` (quartiers arabes + mixtes)
- Fichiers commités dans le repo (pas de DOCX, conversion en TXT)

### ✅ Phase 3 : Formulaire frontend complet
- Fichier : `frontend/src/pages/NewHome.js`
- Champs implémentés :
  - email (obligatoire)
  - nom_de_marque (obligatoire)
  - secteur (obligatoire) : dropdown 4 options
  - statut_alimentaire (visible si secteur = Restauration/Food) : dropdown 6 options
  - anciennete : dropdown 5 options
  - pays_dorigine : texte libre
  - concept : textarea
  - positionnement : texte libre
  - modele_actuel : texte libre
  - differenciation : textarea
  - objectif_israel : textarea
  - contraintes : textarea
- Validation : email + nom_de_marque + secteur obligatoires
- Si Restauration/Food => statut_alimentaire obligatoire
- Affichage résultats : bloc "Votre Mini-Analyse IGV" + bouton "Copier l'analyse"
- Traduction complète en français

### ✅ Phase 4 : Endpoint /api/mini-analysis
- Fichier : `backend/mini_analysis_routes.py` (279 lignes)
- Framework : FastAPI + Google Generative AI (Gemini)
- Fonctionnalités :
  - Validation champs obligatoires (400 si manque)
  - Normalisation `nom_de_marque` → `brand_slug` (lowercase, sans accents, sans ponctuation)
  - Chargement des 3 fichiers IGV depuis `igv_internal/`
  - Sélection whitelist :
    - Si `statut_alimentaire == "Halal"` → Whitelist_2_Arabe_incl_Mixed
    - Sinon → Whitelist_1_Jewish_incl_Mixed
  - Construction prompt runtime avec :
    - Rôle IGV expert
    - Règles anti-hallucination strictes
    - Document Types d'Emplacements (logique uniquement)
    - Document Whitelist (emplacements autorisés)
    - Données formulaire client
    - Format de sortie imposé (4 sections)
  - Appel Gemini API (modèle configurable via env `GEMINI_MODEL`)
  - Retour JSON : `{"success": true, "analysis": "...", "brand_name": "...", ...}`

### ✅ Phase 5 : Anti-doublon + Persistence MongoDB
- Collection MongoDB : `mini_analyses`
- Schéma :
  ```json
  {
    "brand_slug": "marque normalisee",
    "brand_name": "Marque Originale",
    "email": "client@email.com",
    "payload_form": {...},
    "created_at": "2025-12-24T...",
    "provider": "gemini",
    "model": "gemini-2.0-flash-exp",
    "response_text": "Analyse complète..."
  }
  ```
- Index unique sur `brand_slug`
- Si brand_slug existe déjà → HTTP 409 Conflict + message "Une mini-analyse a déjà été générée pour cette enseigne"
- Normalisation robuste : "Café Parisien" == "café parisien" == "CAFE  PARISIEN"

---

## 📦 FICHIERS MODIFIÉS/CRÉÉS

### Backend
- ✅ `backend/mini_analysis_routes.py` (CRÉÉ - 279 lignes)
- ✅ `backend/server.py` (MODIFIÉ - import mini_analysis_router)
- ✅ `backend/requirements.txt` (MODIFIÉ - ajout `google-generativeai==0.8.3`)

### Frontend
- ✅ `frontend/src/pages/NewHome.js` (MODIFIÉ - 523 lignes, formulaire complet)

### IGV Internal Data
- ✅ `igv_internal/IGV_Types_Emplacements_Activites.txt` (CRÉÉ)
- ✅ `igv_internal/Whitelist_1_Jewish_incl_Mixed.txt` (CRÉÉ)
- ✅ `igv_internal/Whitelist_2_Arabe_incl_Mixed.txt` (CRÉÉ)

### Scripts & Docs
- ✅ `scripts/test_mini_analysis.py` (CRÉÉ - tests 5 scénarios)
- ✅ `RENDER_ENV_VARS.md` (CRÉÉ - guide config env vars)

---

## 🔴 PHASE 6 : EN COURS - DÉPLOIEMENT RENDER

### Statut actuel (24/12/2025)
- **igv-site-web (frontend)** :
  - ❌ Échec déploiement commit 1579f4f (erreur: `anciennetes` déclaré 2 fois)
  - ✅ Correction commit 36d7974
  - ⏳ Déploiement en cours (automatique après push)
  
- **igv-cms-backend** :
  - ⏳ Deploying (d'après capture écran)
  - ⚠️ **GEMINI_API_KEY non configurée** → endpoint /api/mini-analysis échouera

### Actions requises IMMÉDIATEMENT

#### 1️⃣ Configurer GEMINI_API_KEY sur Render (CRITIQUE)
```
Service : igv-cms-backend
Settings > Environment > Add Environment Variable

Nom  : GEMINI_API_KEY
Valeur: <COLLER_ICI_LA_CLÉ_GEMINI>

Nom  : GEMINI_MODEL
Valeur: gemini-2.0-flash-exp
```

**SANS CETTE CLÉ, L'ENDPOINT NE FONCTIONNERA PAS.**

#### 2️⃣ Vérifier que les 3 fichiers igv_internal sont dans le build backend
- Les fichiers sont commités dans le repo
- Render devrait les déployer automatiquement
- Si erreur "MISSING_IGV_FILE" dans les logs → vérifier le chemin

#### 3️⃣ Attendre que les 2 services soient "Live"
- Frontend : igv-site-web
- Backend : igv-cms-backend

---

## 🧪 PHASE 7 : TESTS POST-DÉPLOIEMENT (À FAIRE)

### Test 1 : Health check backend
```bash
curl https://igv-cms-backend.onrender.com/api/health
```
Attendu : `{"status":"ok","mongodb":"connected","db":"igv_production"}`

### Test 2 : Frontend live
```bash
curl https://israelgrowthventure.com
```
Attendu : Page HTML avec "Votre marque est-elle pertinente pour le marché israélien ?"

### Test 3 : Formulaire complet visible
- Aller sur https://israelgrowthventure.com
- Vérifier que le formulaire a 12 champs
- Vérifier que "Statut alimentaire" apparaît si on sélectionne "Restauration / Food"

### Test 4 : Endpoint mini-analyse (requiert GEMINI_API_KEY)
```bash
curl -X POST https://igv-cms-backend.onrender.com/api/mini-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "nom_de_marque": "Test Restaurant",
    "secteur": "Restauration / Food",
    "statut_alimentaire": "Halal"
  }'
```
Attendu : 
```json
{
  "success": true,
  "analysis": "...mini-analyse générée...",
  "brand_name": "Test Restaurant",
  "secteur": "Restauration / Food",
  "statut_alimentaire": "Halal"
}
```

### Test 5 : Anti-doublon
Répéter le Test 4 avec le même `nom_de_marque` → doit retourner HTTP 409

### Test 6 : Scénarios complets (script Python)
```bash
cd scripts
python test_mini_analysis.py
```
Lance les 5 scénarios requis :
1. Restauration Halal → Whitelist 2
2. Restauration Casher → Whitelist 1
3. Retail → Whitelist 1
4. Paramédical → Whitelist 1
5. Anti-doublon → 409

---

## ⚠️ POINTS DE VIGILANCE

### 1. GEMINI_API_KEY
- **CRITIQUE** : Sans cette clé, l'endpoint retournera :
  ```json
  {"detail": "GEMINI_API_KEY non configurée - contactez l'administrateur"}
  ```
- À configurer dans Render Dashboard (backend service)
- Ne JAMAIS commiter cette clé dans le code

### 2. MongoDB
- Collection `mini_analyses` créée automatiquement au 1er insert
- Index unique sur `brand_slug` créé automatiquement par MongoDB
- Si doublon détecté → erreur 409 (comportement souhaité)

### 3. Whitelists
- Les fichiers TXT sont chargés à chaque requête (pas de cache)
- Si fichier manquant → erreur 500 + log "MISSING_IGV_FILE:<path>"
- Vérifier dans les logs Render backend

### 4. Prompt Gemini
- Le prompt est très long (~3000 tokens avec whitelists complètes)
- Modèle Gemini doit supporter ce context window (gemini-2.0-flash-exp = OK)
- Si timeout → augmenter timeout dans frontend (actuellement 60s)

### 5. Frontend build
- Build time ~30-40s sur Render
- Taille bundle : ~127 KB (gzipped)
- Si erreur ESLint → vérifier NewHome.js

---

## 📊 RÉSUMÉ TECHNIQUE

| Composant | Statut | Détails |
|-----------|--------|---------|
| Formulaire frontend | ✅ | 12 champs, validation, français |
| Endpoint /api/mini-analysis | ✅ | FastAPI + Gemini + MongoDB |
| Fichiers IGV | ✅ | 3 fichiers TXT commités |
| Anti-doublon | ✅ | brand_slug unique MongoDB |
| Sélection whitelist | ✅ | Halal → Arabe, autres → Jewish |
| Prompt anti-hallucination | ✅ | Règles strictes emplacements |
| Tests locaux | ✅ | Script Python 5 scénarios |
| Déploiement frontend | ⏳ | En cours (commit 36d7974) |
| Déploiement backend | ⏳ | En cours |
| **GEMINI_API_KEY** | ❌ | **À CONFIGURER DANS RENDER** |

---

## 🎯 PROCHAINES ÉTAPES

1. ⏳ **Attendre fin déploiements Render** (2-3 min)
2. 🔑 **Configurer GEMINI_API_KEY** dans Render Dashboard (backend)
3. ✅ **Tester health check backend** (curl /api/health)
4. ✅ **Tester frontend live** (https://israelgrowthventure.com)
5. ✅ **Tester mini-analyse complète** (formulaire live)
6. ✅ **Vérifier anti-doublon** (soumettre 2x même marque)
7. ✅ **Lancer script test complet** (test_mini_analysis.py)

---

## 🐛 TROUBLESHOOTING

### Erreur "GEMINI_API_KEY non configurée"
→ Configurer dans Render Dashboard (backend service > Environment)

### Erreur "MISSING_IGV_FILE"
→ Vérifier que igv_internal/*.txt sont dans le repo et déployés

### Erreur 409 dès la 1ère demande
→ La marque a déjà été testée, nettoyer MongoDB ou utiliser un autre nom

### Frontend ne charge pas
→ Vérifier les logs Render frontend, probablement erreur build

### Backend timeout
→ Gemini peut prendre 10-20s, vérifier timeout frontend (60s actuellement)

### Analyse ne mentionne que des emplacements génériques
→ Vérifier que les whitelists sont bien chargées (logs backend)

---

**COMMIT ACTUEL:** bc3b98d  
**DÉPLOIEMENT:** ⏳ En cours  
**ACTION IMMÉDIATE:** Configurer GEMINI_API_KEY dans Render Dashboard
