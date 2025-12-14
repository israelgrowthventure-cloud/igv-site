# 🚀 Guide de Migration vers igv-site-v2 (Static Site)

## 📋 Contexte

L'ancien service `igv-site` (Web Service avec Express) présente des problèmes de cache/déploiement.  
**Solution** : Nouveau service Static Site propre = `igv-site-v2`

---

## ✅ A. Vérification Pre-Migration (FAIT)

- [x] Build local vérifié : `npm ci && npm run build` fonctionne
- [x] Bundle généré : `main.a4c77b61.js` (≠ ancien `main.4130aa42.js`)
- [x] Configuration `render.yaml` mise à jour avec service `igv-site-v2`
- [x] Type de service : **Static Site** (optimisé pour SPA React)

---

## 📝 B. Création du Service Render (ACTION REQUISE - 2 min)

### Instructions Dashboard Render

1. **Aller sur** : https://dashboard.render.com

2. **Cliquer** : `New +` → `Static Site`

3. **Configuration** :
   - **Repository** : `israelgrowthventure-cloud/igv-site`
   - **Branch** : `main`
   - **Name** : `igv-site-v2`
   - **Build Command** : `cd frontend && npm ci && npm run build`
   - **Publish Directory** : `frontend/build`
   - **Auto-Deploy** : `Yes` ✅

4. **Variables d'environnement** (optionnel mais recommandé) :
   ```
   NODE_VERSION = 18.17.0
   REACT_APP_API_BASE_URL = https://igv-cms-backend.onrender.com
   REACT_APP_CMS_API_URL = https://igv-cms-backend.onrender.com/api
   REACT_APP_CALENDAR_EMAIL = israel.growth.venture@gmail.com
   VITE_EDITOR_ACCESS_CODE = IGV2025_EDITOR
   ```

5. **Créer** le service

6. **Attendre** ~3-5 minutes que le premier build se termine

---

## 🔍 C. Vérification Post-Création

Une fois le service créé, l'URL sera : `https://igv-site-v2.onrender.com`

### Test automatique du bundle

```powershell
# Exécuter ce script PowerShell
$url = "https://igv-site-v2.onrender.com/?v=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
if ($response.Content -match 'main\.(\w+)\.js') {
    $hash = $matches[1]
    Write-Host "Bundle détecté: main.$hash.js" -ForegroundColor Cyan
    if ($hash -ne '4130aa42') {
        Write-Host "✅ SUCCÈS: Nouveau bundle déployé!" -ForegroundColor Green
    } else {
        Write-Host "❌ ÉCHEC: Ancien bundle toujours présent" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Aucun bundle détecté" -ForegroundColor Red
}
```

**Résultat attendu** : `main.a4c77b61.js` ou un hash similaire (≠ `4130aa42`)

---

## 🌐 D. Bascule du Domaine israelgrowthventure.com

### Étapes Dashboard Render (3 min)

1. **Sur le nouveau service `igv-site-v2`** :
   - Settings → Custom Domains
   - Add Custom Domain : `israelgrowthventure.com`
   - Confirmer

2. **Sur l'ancien service `igv-site`** :
   - Settings → Custom Domains
   - Supprimer `israelgrowthventure.com`

3. **Attendre** : 2-5 minutes (propagation DNS)

4. **Vérifier** :
   ```powershell
   $response = Invoke-WebRequest -Uri "https://israelgrowthventure.com/?v=$(Get-Random)" -UseBasicParsing
   if ($response.Content -match 'main\.(\w+)\.js') {
       Write-Host "Bundle sur domaine: main.$($matches[1]).js" -ForegroundColor Cyan
   }
   ```

---

## 🔧 E. Mise à Jour GitHub Actions (FAIT)

Le workflow `.github/workflows/render-deploy.yml` doit pointer vers le nouveau service.

### Si vous avez un Deploy Hook pour igv-site-v2

1. Créer Deploy Hook sur Render : Service `igv-site-v2` → Settings → Deploy Hook
2. Copier l'URL : `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`
3. Ajouter dans GitHub Secrets : `RENDER_DEPLOY_HOOK_URL_V2`
4. Mettre à jour le workflow pour utiliser `RENDER_DEPLOY_HOOK_URL_V2`

**OU** : Laisser Auto-Deploy gérer les déploiements (plus simple)

---

## 📊 Résumé des Avantages

| Aspect | Ancien (igv-site) | Nouveau (igv-site-v2) |
|--------|-------------------|----------------------|
| Type | Web Service (Express) | Static Site |
| Build | Parfois bloqué | Propre |
| Cache | Problématique | Optimisé |
| Performance | Serveur Node.js | CDN Render |
| Auto-Deploy | OFF | ON |
| Bundle | main.4130aa42.js | main.a4c77b61.js+ |

---

## 🧹 F. Nettoyage (Optionnel - Plus tard)

Une fois `igv-site-v2` stable en production (1-2 semaines) :

1. Supprimer l'ancien service `igv-site` du Dashboard Render
2. Nettoyer les anciennes références dans le code si nécessaire

---

## 📞 Support

- **Logs Render** : https://dashboard.render.com/static/srv-xxxxx (votre igv-site-v2)
- **Repo GitHub** : https://github.com/israelgrowthventure-cloud/igv-site
- **Actions GitHub** : https://github.com/israelgrowthventure-cloud/igv-site/actions

---

**Dernière mise à jour** : 2025-12-02T16:50:00Z  
**Status** : Configuration prête, création service requise
