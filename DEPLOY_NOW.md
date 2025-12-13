# CHECKLIST DÉPLOIEMENT V3 - TABLE RASE (13/12/2025)

## 📌 ÉTAT D'AVANCEMENT
Dernière mise à jour : 13/12/2025 21:20 UTC

### 1. TABLE RASE & NETTOYAGE
- [x] **Suppression Legacy** : Dossiers `backend`, `frontend`, scripts supprimés.
  - *Preuve* : `ls` montre uniquement les fichiers V3 copiés. ✅
- [x] **Copie V3 Complète** : Frontend + Backend V3 copiés depuis source.
  - *Preuve* : `frontend/server.js` présent, `backend/server.py` (checksum V3). ✅

### 2. DÉPLOIEMENT RENDER
- [x] **Git Push** : Code V3 poussé sur `main`.
  - *Preuve* : Commit `d7b6674` (feat(ALIGN): V3 Table Rase). ✅
- [ ] **Frontend (igv-site-web)** : ❌ **FAILED DEPLOY**
  - *Preuve* : Screenshot utilisateur (Dashboard Render).
  - *Action* : Récupération logs et correction build.
- [/] **Backend (igv-cms-backend)** : 🔄 **DEPLOYING**
  - *Preuve* : Screenshot utilisateur (Dashboard Render).
- [ ] **Pas de "Failed Deploy"** :
  - *Statut* : ❌ Frontend Failed.

### 3. VALIDATION FONCTIONNELLE PROD
- [x] **Frontend URL** (`https://israelgrowthventure.com`)
  - Status: 200 OK ✅
  - Content: React Bundle OK
- [ ] **Backend Health** (`/api/health`)
  - Status: 200 OK ✅
  - Version: 2.0.1 ❌ (Attendu: 3.0)
- [ ] **CMS Endpoints V3** (`/cms/pages`)
  - *Statut* : ❌ 404 (car backend legacy)
- [ ] **CRM Endpoints V3** (`/crm/leads`)
  - *Statut* : ❌ 404 (car backend legacy)

---

## 🧾 PREUVES PROD (LIVE)

### FRONTEND
- **URL** : https://israelgrowthventure.com/
- **Status** : 200 OK
- **Log Monitor** : `Frontend: 200 OK | Size: 2758 bytes`

### BACKEND
- **URL** : https://igv-cms-backend.onrender.com/api/health
- **Status** : 200 OK
- **Payload** : `{"version": "2.0.1", "mongodb": "connected"}` (⚠️ LEGACY)

### ACTION REQUISE
- Le backend V3 est pushé mais Render sert encore la V2.
- **Blocage Infra** : Auto-deploy inactif. Rebuild manuel ou API requis.

---
**NE PAS MODIFIER SANS PREUVE DE TEST**
