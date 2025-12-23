# Configuration des variables d'environnement Render
# À configurer dans le Dashboard Render (Settings > Environment)

## BACKEND SERVICE (igv-cms-backend)

### Gemini API Configuration (REQUIS pour mini-analyse)
GEMINI_API_KEY=<VOTRE_CLÉ_GEMINI_ICI>
GEMINI_MODEL=gemini-2.0-flash-exp

### MongoDB (déjà configuré normalement)
MONGODB_URI=<DÉJÀ_CONFIGURÉ>
DB_NAME=igv_production

### Autres variables existantes
JWT_SECRET=<DÉJÀ_CONFIGURÉ>
ADMIN_EMAIL=<DÉJÀ_CONFIGURÉ>
ADMIN_PASSWORD=<DÉJÀ_CONFIGURÉ>
CORS_ALLOWED_ORIGINS=<DÉJÀ_CONFIGURÉ>

---

## FRONTEND SERVICE (igv-site-web)

Aucune variable supplémentaire requise pour le frontend.
Le formulaire appelle directement /api/mini-analysis sur le backend.

---

## INSTRUCTIONS DE CONFIGURATION

1. **Aller sur Render Dashboard** : https://dashboard.render.com
2. **Sélectionner le service backend** : igv-cms-backend
3. **Aller dans "Environment"**
4. **Ajouter ces variables :**
   - Nom: `GEMINI_API_KEY`
     Valeur: <CLÉ_API_GEMINI>
   - Nom: `GEMINI_MODEL`
     Valeur: `gemini-2.0-flash-exp`

5. **Sauvegarder** (déclenchera un redéploiement automatique)

---

## VÉRIFICATION POST-DÉPLOIEMENT

### Test 1: Health check backend
```bash
curl https://igv-cms-backend.onrender.com/api/health
```
Doit retourner `{"status":"ok","mongodb":"connected"}`

### Test 2: Frontend live
```bash
curl https://israelgrowthventure.com
```
Doit afficher la nouvelle landing page avec formulaire

### Test 3: Endpoint mini-analyse (après config GEMINI_API_KEY)
```bash
curl -X POST https://igv-cms-backend.onrender.com/api/mini-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "nom_de_marque": "Test Marque",
    "secteur": "Retail (hors food)"
  }'
```
Doit retourner une analyse IA (si GEMINI_API_KEY configurée)

---

## NOTES IMPORTANTES

- **GEMINI_API_KEY** : Sans cette clé, l'endpoint /api/mini-analysis retournera une erreur 500
- **Anti-doublon** : Une fois qu'une marque est analysée (brand_slug), toute nouvelle demande pour la même marque = 409 Conflict
- **Whitelists** : Les fichiers igv_internal/*.txt sont commités dans le repo et chargés au runtime par le backend
- **MongoDB** : La collection `mini_analyses` stocke toutes les analyses générées

---

## TROUBLESHOOTING

### Erreur "GEMINI_API_KEY non configurée"
→ Configurer la variable dans Render Dashboard (backend service)

### Erreur "MISSING_IGV_FILE"
→ Vérifier que les 3 fichiers igv_internal/*.txt sont bien dans le repo

### Build frontend failed
→ Vérifier les logs Render, probablement erreur ESLint ou syntax

### Backend ne démarre pas
→ Vérifier requirements.txt contient `google-generativeai==0.8.3`
