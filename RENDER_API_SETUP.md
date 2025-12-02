# 🔧 Configuration API Render - REQUISE

## ⚠️ PROBLÈME IDENTIFIÉ

Le service `igv-site` a été créé manuellement via le Dashboard Render.  
**Conséquence** : Le fichier `render.yaml` est IGNORÉ et Auto-Deploy est DÉSACTIVÉ par défaut.

---

## ✅ SOLUTION : Recréer le service via Infrastructure as Code (IaC)

### Étape 1 : Obtenir votre API Key Render

1. Allez sur : https://dashboard.render.com/account/api-keys
2. Cliquez sur **"Create API Key"**
3. Nom : `IGV-Site-Deploy`
4. Copiez la clé générée (format : `rnd_xxxxxxxxxxxxx`)

### Étape 2 : Configurer l'API Key localement

```powershell
# Windows PowerShell
$env:RENDER_API_KEY = "rnd_votre_clé_ici"
```

### Étape 3 : Installer le CLI Render

```powershell
npm install -g @render-api/cli
```

### Étape 4 : Vérifier l'installation

```powershell
render --version
render whoami
```

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE

Une fois l'API Key configurée, relancez simplement la commande :

```powershell
cd "c:\Users\PC\Desktop\IGV\igv site\igv-website-complete"
render deploy
```

Le CLI Render va :
- ✅ Lire le `render.yaml`
- ✅ Recréer/mettre à jour le service `igv-site`
- ✅ **Activer Auto-Deploy sur la branche main**
- ✅ Déclencher un build propre avec cache clear
- ✅ Déployer la dernière version (hash 43242eee)

---

## 🔄 ALTERNATIVE : Approche API Pure (sans CLI)

Si vous préférez utiliser l'API REST directement :

### Obtenir l'ID du service

```powershell
$headers = @{
    "Authorization" = "Bearer $env:RENDER_API_KEY"
    "Accept" = "application/json"
}

$services = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers -Method GET
$igvService = $services.services | Where-Object { $_.name -eq "igv-site" }
Write-Host "Service ID: $($igvService.id)"
```

### Activer Auto-Deploy

```powershell
$serviceId = $igvService.id
$body = @{
    autoDeploy = "yes"
    branch = "main"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" `
    -Headers $headers `
    -Method PATCH `
    -Body $body `
    -ContentType "application/json"
```

### Déclencher un déploiement manuel

```powershell
$deployBody = @{
    clearCache = "clear"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
    -Headers $headers `
    -Method POST `
    -Body $deployBody `
    -ContentType "application/json"
```

---

## 📊 VÉRIFICATION

Après déploiement, vérifiez :

```powershell
# Test direct Render
$response = Invoke-WebRequest -Uri "https://igv-site.onrender.com/?v=$(Get-Date -Format 'yyyyMMddHHmmss')" -UseBasicParsing
if ($response.Content -match 'main\.(\w+)\.js') {
    Write-Host "Bundle actuel: main.$($matches[1]).js" -ForegroundColor Green
}

# Test domaine custom
$response2 = Invoke-WebRequest -Uri "https://israelgrowthventure.com/?v=$(Get-Date -Format 'yyyyMMddHHmmss')" -UseBasicParsing
if ($response2.Content -match 'main\.(\w+)\.js') {
    Write-Host "Bundle domaine: main.$($matches[1]).js" -ForegroundColor Green
}
```

---

## 🎯 RÉSULTAT ATTENDU

Après ces étapes :
- ✅ Auto-Deploy actif sur `main`
- ✅ Nouveau build déployé (hash > 4130aa42)
- ✅ `https://israelgrowthventure.com/` affiche la nouvelle version
- ✅ Tous les futurs `git push origin main` déclencheront un rebuild automatique

---

## ⚡ ALTERNATIVE RAPIDE : Dashboard Manuel (1 minute)

Si vous préférez garder la configuration actuelle :

1. https://dashboard.render.com → Service `igv-site`
2. **Manual Deploy** (bouton bleu en haut à droite)
3. ✅ Cocher **"Clear build cache"**
4. Cliquer **"Deploy"**
5. Attendre 5-7 minutes

Puis activer Auto-Deploy pour l'avenir :
1. Settings → Build & Deploy
2. Toggle **"Auto-Deploy"** → YES
3. Branch : `main`
4. Save Changes

---

**📌 Une fois l'API Key configurée, je pourrai exécuter toutes ces actions automatiquement.**
