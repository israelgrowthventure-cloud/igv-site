# Configuration Domaine Render - ACTION MANUELLE REQUISE

## ❌ PROBLÈME ACTUEL
Le domaine `israelgrowthventure.com` pointe vers le service **igv-site-v2** (static site) qui ne supporte pas le SPA routing.

Résultat : 404 sur toutes les routes React (/admin/login, /packs, /about, etc.)

## ✅ SOLUTION
Configurer le domaine pour pointer vers **igv-site** (web service avec Express)

## 🔧 ÉTAPES SUR RENDER DASHBOARD

### 1. Accéder au Dashboard Render
- URL: https://dashboard.render.com
- Se connecter avec le compte israelgrowthventure

### 2. Supprimer igv-site-v2 (Static Site)
- Aller dans **Services** → **igv-site-v2**
- Cliquer **Settings** → **Delete Service**
- Confirmer la suppression

### 3. Configurer le domaine sur igv-site
- Aller dans **Services** → **igv-site** (web service)
- Cliquer **Settings** → **Custom Domains**
- Ajouter `israelgrowthventure.com` si pas déjà présent
- Vérifier que les DNS pointent vers Render:
  - Type A: `216.24.57.1`
  - Type CNAME (www): `igv-site.onrender.com`

### 4. Forcer un redéploiement
- Dans **igv-site** → **Manual Deploy** → **Deploy latest commit**

## 🧪 VÉRIFICATION
Une fois configuré, tester:
```bash
curl -I https://israelgrowthventure.com/admin/login
# Doit retourner 200 (pas 404)

curl -I https://israelgrowthventure.com/packs
# Doit retourner 200 (pas 404)
```

## 📋 CONFIGURATION ACTUELLE
- ✅ render.yaml : Service **igv-site** actif (web avec Express)
- ✅ server.js : Fallback SPA configuré (`app.get('*')`)
- ✅ Build : Compilation OK
- ❌ Domaine : Pointe encore vers igv-site-v2

## 🚀 APRÈS CONFIGURATION
Toutes les routes fonctionneront:
- ✅ `/` (home)
- ✅ `/packs`
- ✅ `/about`
- ✅ `/contact`
- ✅ `/admin/login`
- ✅ `/admin/*` (toutes pages CMS Emergent)
