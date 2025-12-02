# 📖 Utilisation Quotidienne du Site IGV

## 🎯 Workflow Automatique

Votre site **igv-site** est maintenant complètement automatisé. Voici comment ça fonctionne :

### 1️⃣ Modifier le Contenu du Site

**Option A : Via l'Éditeur Web** ⭐ RECOMMANDÉ
```
1. Allez sur https://israelgrowthventure.com/editor
2. Entrez le code : IGV2025_EDITOR
3. Modifiez le contenu (Home, About, Packs, Contact)
4. Cliquez sur "Exporter le contenu"
5. Copiez le JSON et sauvegardez-le dans frontend/public/content-editable.json
```

**Option B : Modifier Directement le Fichier**
```
Éditez : frontend/public/content-editable.json
```

### 2️⃣ Publier les Modifications

**Dans PowerShell :**
```powershell
cd "c:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\public"
.\publish-cms.ps1
```

**Ce script fait automatiquement :**
- ✅ Commit vos modifications
- ✅ Push vers GitHub
- ✅ Déclenche le workflow "Deploy to Render"
- ✅ Render rebuild et déploie (2-3 minutes)

### 3️⃣ Vérifier la Publication

Attendez 2-3 minutes, puis visitez : https://israelgrowthventure.com

---

## 🔧 Commandes Utiles

### Vérifier l'État du Site
```powershell
# Tester que le site répond
Invoke-WebRequest https://igv-site.onrender.com/api/health

# Tester une route SPA
Invoke-WebRequest https://igv-site.onrender.com/about
```

### Publier du Contenu CMS
```powershell
cd "c:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\public"
.\publish-cms.ps1
```

---

## ⚙️ Architecture Simplifiée

```
Vous modifiez content-editable.json
         ↓
Vous lancez publish-cms.ps1
         ↓
Git commit + push automatique
         ↓
GitHub Actions déclenche "Deploy to Render"
         ↓
Render rebuild le site (npm run build)
         ↓
Nouveau bundle déployé sur israelgrowthventure.com
```

---

## 🚨 En Cas de Problème

### Le site ne se met pas à jour après 5 minutes

1. Vérifiez GitHub Actions : https://github.com/israelgrowthventure-cloud/igv-site/actions
2. Vérifiez Render Dashboard : https://dashboard.render.com
3. Si le workflow est vert mais le site ne change pas, allez sur Render Dashboard → igv-site → Manual Deploy

### Les routes retournent 404

Le fichier `frontend/server.js` gère les routes. Il doit :
- Avoir `/api/health` qui retourne JSON
- Avoir `app.get('*')` en dernier pour servir `index.html`

### Le bundle ne change pas

Render doit exécuter `npm run build` à chaque déploiement. Vérifiez dans les logs Render que le build s'exécute bien.

---

## 📝 Résumé 5 Lignes

1. **Modifiez** `content-editable.json` (ou via /editor)
2. **Lancez** `.\publish-cms.ps1` dans `frontend/public/`
3. **GitHub** reçoit le commit et déclenche le workflow automatiquement
4. **Render** rebuild le site en 2-3 minutes
5. **Visitez** https://israelgrowthventure.com pour voir les changements

✅ **Aucune action manuelle sur Render Dashboard requise !**
