# 🚀 GUIDE CONFIGURATION RENDER - Phase 4

**Date**: 03/01/2026  
**Commit déployé**: `80b9197`  
**Objectif**: Configurer variables ENV OVH + installer police hébreu

---

## ⚙️ ÉTAPE 1: Variables d'environnement Render Backend

### 🔴 CRITIQUES - À configurer immédiatement

Accéder à: `https://dashboard.render.com/web/srv-XXX` (Backend: igv-cms-backend)  
Section: **Environment** → **Environment Variables**

#### SMTP OVH (contact@israelgrowthventure.com)

**SUPPRIMER/MODIFIER ces variables Gmail**:
```bash
# Ancienne config Gmail (à remplacer)
SMTP_HOST=smtp.gmail.com              # ❌ Supprimer
SMTP_PORT=587                         # ❌ Supprimer
SMTP_USER=israel.growth.venture@gmail.com  # ❌ Supprimer
SMTP_PASSWORD=[Gmail App Password]    # ❌ Supprimer
```

**AJOUTER nouvelle config OVH**:
```bash
# Nouvelle config OVH SSL/TLS
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=contact@israelgrowthventure.com
SMTP_PASSWORD=[Mot de passe OVH contact@israelgrowthventure.com]
SMTP_FROM=contact@israelgrowthventure.com
SMTP_FROM_NAME=Israel Growth Venture
```

### ✅ Validation

Après modification des ENV vars:
1. Render redéploiera automatiquement le backend (5-8 min)
2. Vérifier logs backend: `✅ SMTP configured: ssl0.ovh.net:465`
3. Tester envoi email depuis: `https://igv-cms-backend.onrender.com/api/diag-smtp`

---

## 📦 ÉTAPE 2: Installer police hébreu (Noto Sans Hebrew)

### Option A: Via Render Shell (recommandé)

1. **Télécharger la police**:
   ```bash
   # Se connecter au shell Render (Dashboard → Connect → Shell)
   cd /opt/render/project/src/backend/fonts
   
   # Télécharger Noto Sans Hebrew
   curl -L -o NotoSansHebrew-Regular.ttf "https://github.com/notofonts/noto-fonts/raw/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf"
   
   # Vérifier installation
   ls -lh NotoSansHebrew-Regular.ttf
   ```

2. **Redémarrer le service** (Dashboard → Manual Deploy)

### Option B: Ajouter au build (permanent)

Modifier `backend/requirements.txt` pour inclure la police dans le build:

**Créer script de post-build** `backend/download_fonts.sh`:
```bash
#!/bin/bash
# Download Hebrew font for PDF generation
mkdir -p /opt/render/project/src/backend/fonts
cd /opt/render/project/src/backend/fonts

curl -L -o NotoSansHebrew-Regular.ttf \
  "https://github.com/notofonts/noto-fonts/raw/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf"

echo "✅ Hebrew font installed"
```

**Modifier `render.yaml`** (ou Render Dashboard):
```yaml
services:
  - type: web
    name: igv-cms-backend
    buildCommand: |
      pip install --upgrade pip && 
      pip install -r requirements.txt &&
      bash download_fonts.sh
```

### ✅ Validation police hébreu

Test après installation:
```bash
# 1. Vérifier présence fichier
ls -lh /opt/render/project/src/backend/fonts/NotoSansHebrew-Regular.ttf

# 2. Générer PDF HE test
curl -X POST https://igv-cms-backend.onrender.com/api/mini-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "nom_de_marque": "TestHebrew",
    "email": "test@example.com",
    "secteur": "Restauration",
    "statut_alimentaire": "Halal",
    "language": "he"
  }'

# 3. Télécharger PDF et vérifier texte lisible (pas de carrés □)
```

---

## 🧪 ÉTAPE 3: Tests post-déploiement

### Test 1: Email CRM OVH
```bash
# Endpoint CRM send email
curl -X POST https://igv-cms-backend.onrender.com/api/crm/emails/send \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "israel.growth.venture@gmail.com",
    "subject": "Test SMTP OVH",
    "message": "Email envoyé depuis contact@israelgrowthventure.com",
    "contact_id": null
  }'

# Vérifier dans boîte de réception:
# - From: contact@israelgrowthventure.com
# - Reply-To: contact@israelgrowthventure.com
# - Classement: INBOX (pas SPAM)
```

### Test 2: PDF EN sans codes WHITELIST_*
```bash
# Générer 3 PDF EN consécutifs
for i in {1..3}; do
  curl -X POST https://igv-cms-backend.onrender.com/api/mini-analysis \
    -H "Content-Type: application/json" \
    -d "{
      \"nom_de_marque\": \"TestEN$i\",
      \"email\": \"test$i@example.com\",
      \"secteur\": \"Restauration\",
      \"statut_alimentaire\": \"Halal\",
      \"language\": \"en\"
    }"
  
  # Télécharger PDF et rechercher "WHITELIST_" → doit retourner 0 occurrence
done
```

### Test 3: PDF HE avec texte lisible
```bash
# Générer PDF HE
curl -X POST https://igv-cms-backend.onrender.com/api/mini-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "nom_de_marque": "מותג-בדיקה",
    "email": "test@example.com",
    "secteur": "Restauration",
    "statut_alimentaire": "Kosher",
    "language": "he"
  }'

# Ouvrir PDF et vérifier:
# ✅ Texte hébreu lisible (pas de carrés □)
# ✅ Alignement droite→gauche (RTL)
# ✅ Date, titre, sections correctement affichés
```

---

## 📊 Checklist validation Phase 4

- [ ] Variables ENV OVH configurées sur Render Backend
- [ ] Backend redéployé (5-8 min) avec nouveau commit `80b9197`
- [ ] Police Noto Sans Hebrew installée dans `backend/fonts/`
- [ ] Test email CRM: From=contact@israelgrowthventure.com ✅
- [ ] Test PDF EN: 0 occurrence "WHITELIST_" dans 3 générations ✅
- [ ] Test PDF HE: Texte lisible + RTL ✅
- [ ] Logs backend: aucune erreur SMTP ou font

---

## 🚨 Dépannage

### Problème: SMTP connection refused
```
Erreur: [Errno 111] Connection refused
```
**Solution**: Vérifier firewall Render autorise connexion sortante port 465 vers ssl0.ovh.net

### Problème: PDF HE affiche toujours des carrés
```
⚠️ Hebrew font not found at /opt/render/project/src/backend/fonts/NotoSansHebrew-Regular.ttf
```
**Solutions**:
1. Vérifier chemin fichier exact
2. Permissions lecture fichier: `chmod 644 NotoSansHebrew-Regular.ttf`
3. Redémarrer backend après installation police

### Problème: Email classé en SPAM
**Diagnostics**:
- Vérifier SPF/DKIM/DMARC pour domaine israelgrowthventure.com
- Analyser headers email reçu (voir Phase 4 Délivrabilité)
- Ajouter multipart text+HTML (déjà implémenté)

---

**Next Step**: Après validation Phase 4 → Phase 5 (Validation finale + Rapport)
