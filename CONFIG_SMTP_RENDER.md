# CONFIGURATION SMTP POUR RENDER
## Instructions pour israel.growth.venture@gmail.com

### OPTION 1: Gmail SMTP (Simple)

**1. Créer App Password Gmail:**
- Aller sur: https://myaccount.google.com/apppasswords
- Connectez-vous avec israel.growth.venture@gmail.com
- Sélectionner "Mail" et "Autre (nom personnalisé)"
- Taper "IGV Website"
- Cliquer "Générer"
- **COPIER le mot de passe de 16 caractères**

**2. Ajouter dans Render:**
```
Dashboard > srv-d4no5dc9c44c73d1opgg > Environment > Add Environment Variable

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=israel.growth.venture@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  (mot de passe app Gmail)
EMAIL_FROM=noreply@israelgrowthventure.com
```

**3. Manual Deploy:**
- Render Dashboard > srv-d4no5dc9c44c73d1opgg
- Cliquer "Manual Deploy" > "Deploy latest commit"
- Attendre status = LIVE (2-3 minutes)

---

### OPTION 2: SendGrid (Production-Ready, Recommandé)

**1. Créer compte SendGrid:**
- Aller sur: https://sendgrid.com/
- S'inscrire (gratuit: 100 emails/jour)
- Créer API Key dans Settings > API Keys

**2. Ajouter dans Render:**
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@israelgrowthventure.com
```

**3. Modifier code backend:**
Dans `extended_routes.py`, ajouter support SendGrid au lieu de SMTP direct

---

### VÉRIFICATION POST-CONFIGURATION

**1. Test endpoint diagnostic:**
```bash
curl https://igv-cms-backend.onrender.com/api/diag/smtp
```

**Réponse attendue:**
```json
{
  "smtp_configured": true,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "israel.growth.venture@gmail.com",
  "smtp_password_set": true,
  "email_from": "noreply@israelgrowthventure.com"
}
```

**2. Test PDF + Email:**
```python
# Générer 1 mini-analyse
POST /api/mini-analysis
{
  "email": "test@example.com",
  "nom_de_marque": "TestEmail2024",
  "secteur": "Services paramédicaux",
  "pays_origine": "France",
  "language": "en"
}

# Générer PDF (email auto-envoyé)
POST /api/pdf/generate
{
  "email": "test@example.com",
  "brandName": "TestEmail2024",
  "sector": "Services paramédicaux",
  "analysisText": "[texte]",
  "language": "en"
}
```

**3. Vérifier logs Render:**
```
✅ EMAIL_SEND_REQUEST to=israel.growth.venture@gmail.com (auto) brand=TestEmail2024 lang=en
✅ EMAIL_SEND_OK to=israel.growth.venture@gmail.com message_id=<xxx@gmail.com>
```

**4. Vérifier inbox:**
- Ouvrir israel.growth.venture@gmail.com
- Chercher email avec sujet "IGV Mini-Analysis PDF — TestEmail2024 — EN"
- Vérifier pièce jointe PDF présente

---

### NOTES IMPORTANTES

**Gmail SMTP Limitations:**
- 500 emails/jour maximum
- Peut être bloqué par Google si volume élevé
- Recommandé uniquement pour tests

**SendGrid Avantages:**
- 100 emails/jour (gratuit)
- Tracking deliverability
- Moins de risque de spam
- Logs détaillés

**Sécurité:**
- NE JAMAIS commit SMTP_PASSWORD dans git
- Utiliser variables d'environnement Render UNIQUEMENT
- App Passwords Gmail peuvent être révoqués à tout moment

