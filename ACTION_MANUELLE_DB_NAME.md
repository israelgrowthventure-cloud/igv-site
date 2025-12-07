# ⚠️ ACTION MANUELLE REQUISE - Configuration DB_NAME sur Render

## 🚨 PROBLÈME ACTUEL

Le backend `igv-cms-backend` **n'utilise toujours pas** la base de données `IGV-Cluster`.

**Preuve (tests production)** :
```
❌ GET /api/pages/etude-implantation-360 → 404
❌ GET /api/pages/etude-implantation-merci → 404
❌ POST /api/auth/login (postmaster@...) → 401
✅ GET /api/pages → Retourne 5 anciennes pages (home, packs, about-us, contact, le-commerce-de-demain)
```

## ✅ SOLUTION (5 minutes)

### Étape 1 : Accès Render Dashboard
1. Ouvrir https://dashboard.render.com
2. Se connecter avec le compte IGV

### Étape 2 : Accès service backend
1. Cliquer sur le service **`igv-cms-backend`**
2. OU accès direct : https://dashboard.render.com/web/srv-cr64m4pu0jms73cnqplg

### Étape 3 : Configuration DB_NAME
1. Aller dans l'onglet **"Environment"**
2. Chercher la variable `DB_NAME`

**Si DB_NAME existe déjà :**
- Cliquer sur le bouton **Edit** (crayon)
- Remplacer la valeur par : `IGV-Cluster`
- Cliquer **Save Changes**

**Si DB_NAME n'existe pas :**
- Cliquer sur **Add Environment Variable**
- Key: `DB_NAME`
- Value: `IGV-Cluster`
- Cliquer **Add**

### Étape 4 : Attendre le redémarrage
- Render va **automatiquement redéployer** le backend
- Durée : **2-3 minutes**
- Le statut va passer à "Deploying" puis "Live"

### Étape 5 : Validation

Après 3 minutes, exécuter dans PowerShell :

```powershell
cd 'C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\backend'
python test_backend_db.py
```

**Résultat attendu** :
```
✅ Tests réussis: 7/7
🎉 TOUS LES TESTS SONT PASSÉS !
```

## 📊 CE QUI A ÉTÉ PRÉPARÉ

### Code frontend : ✅ PRÊT
- Page `/payment/success` finalisée avec SEO noindex
- Design responsive et multilingue (FR/EN/HE)
- Support Stripe et Monetico (générique)
- Fichier : `frontend/src/pages/PaymentSuccess.js`

### Code backend : ✅ PRÊT
- Server.py lit correctement `DB_NAME` avec fallback `IGV-Cluster`
- Admin et pages créés dans MongoDB `IGV-Cluster`
- Endpoint `/api/admin/change-password` opérationnel

### Tests automatisés : ✅ PRÊT
- Script `backend/test_backend_db.py` teste les 7 endpoints critiques
- Rapport détaillé avec diagnostic automatique

### Base de données : ✅ DONNÉES PRÊTES
```
Collection users :
  - postmaster@israelgrowthventure.com
  - hashed_password: $2b$12$Vk9A6SbNwMIQG...
  - role: admin

Collection pages :
  - etude-implantation-360
  - etude-implantation-merci
```

## 🔴 BLOQUEUR UNIQUE

**Le backend Render n'a pas la variable d'environnement `DB_NAME=IGV-Cluster`.**

Sans cette variable, le backend consulte une ancienne base de données qui contient les 5 pages historiques mais pas :
- L'admin `postmaster@israelgrowthventure.com`
- Les pages Étude 360°

## 🎯 APRÈS CONFIGURATION

Dès que `DB_NAME=IGV-Cluster` sera configuré :

1. **Tous les tests passeront immédiatement** (aucun code à modifier)
2. Phase 1ter C+D sera **100% validée**
3. Nous pourrons documenter dans `INTEGRATION_PLAN.md`

---

## 📞 CONTACT

Si problème d'accès au Dashboard Render :
- Vérifier les credentials du compte team@israelgrowthventure.com
- Ou créer une nouvelle clé API : https://dashboard.render.com/account/api-keys

---

*Document créé le 7 décembre 2025 - Mission Phase 1ter C+D*
