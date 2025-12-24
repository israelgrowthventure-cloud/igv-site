# ⚙️ VARIABLES D'ENVIRONNEMENT RENDER - CONFIGURATION POST-DÉPLOIEMENT

**Service Backend**: srv-d4no5dc9c44c73d1opgg  
**Date**: 24 décembre 2025

---

## 🔴 OBLIGATOIRES (pour PDF Email)

Aller dans Render Dashboard > igv-cms-backend > Environment > Add Environment Variable

### SMTP Configuration (SendGrid recommandé)
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<VOTRE_SENDGRID_API_KEY>
EMAIL_FROM=noreply@israelgrowthventure.com
```

**Comment obtenir SendGrid API Key :**
1. Créer compte gratuit : https://sendgrid.com/
2. Settings > API Keys > Create API Key
3. Permissions : Full Access (ou Mail Send uniquement)
4. Copier la clé (elle ne s'affiche qu'une fois)

---

## 🟡 OPTIONNELLES (fonctionnalités avancées)

### Google Calendar API
```
GOOGLE_CALENDAR_API_KEY=<VOTRE_GOOGLE_CALENDAR_KEY>
CALENDAR_EMAIL=israel.growth.venture@gmail.com
```

**Note** : Si non configuré, le système envoie un email de notification à la place (fallback automatique).

### CORS (déjà configuré normalement)
```
CORS_ALLOWED_ORIGINS=https://israelgrowthventure.com,https://www.israelgrowthventure.com
```

---

## ✅ DÉJÀ CONFIGURÉES (vérifier qu'elles existent)

Ces variables doivent déjà être présentes sur Render :

```
MONGODB_URI=<votre-mongodb-uri>
DB_NAME=igv_production
GEMINI_API_KEY=<votre-gemini-key>
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=<votre-jwt-secret>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
```

---

## 🧪 TESTER APRÈS CONFIGURATION

1. **Test Email PDF** :
   - Aller sur https://israelgrowthventure.com/mini-analyse
   - Générer une mini-analyse
   - Cliquer "Recevoir par email"
   - Vérifier réception email

2. **Test Contact Expert** :
   - Après mini-analyse, cliquer "Prendre contact avec l'un de nos experts"
   - Vérifier email notification reçu à israel.growth.venture@gmail.com

3. **Vérifier logs backend** :
   - Render Dashboard > igv-cms-backend > Logs
   - Chercher : "PDF email sent to", "Calendar notification sent"

---

## 🚨 EN CAS DE PROBLÈME

### Email ne fonctionne pas
1. Vérifier que `SMTP_PASSWORD` est bien la clé SendGrid (commence par "SG.")
2. Vérifier logs Render pour erreurs SMTP
3. Tester avec SendGrid Activity Feed

### PDF ne se génère pas
1. Vérifier que `reportlab` est dans requirements.txt (✅ déjà présent)
2. Vérifier logs backend pour erreurs PDF
3. Tester endpoint directement : `POST /api/pdf/generate`

### Calendar ne fonctionne pas
1. C'est normal si `GOOGLE_CALENDAR_API_KEY` n'est pas configuré
2. Le fallback email doit fonctionner automatiquement
3. Vérifier email notification à israel.growth.venture@gmail.com

---

## 📝 COMMANDES UTILES

### Vérifier variables env (depuis terminal local)
```bash
cd scripts
python get_render_env.py srv-d4no5dc9c44c73d1opgg
```

### Vérifier logs en temps réel
```bash
python get_render_logs.py srv-d4no5dc9c44c73d1opgg
```

### Tester backend directement
```bash
curl -X POST https://igv-cms-backend.onrender.com/api/contact-expert \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","brandName":"Test","sector":"Retail","language":"fr","source":"test"}'
```

---

## ✅ CHECKLIST FINALE

- [ ] SMTP configuré (SendGrid)
- [ ] Email FROM configuré
- [ ] Test mini-analyse → PDF → Email reçu
- [ ] Test Contact Expert → Email notification reçu
- [ ] Logs backend OK (pas d'erreurs SMTP)
- [ ] Site accessible : https://israelgrowthventure.com
- [ ] i18n fonctionne (FR/EN/HE + RTL)
- [ ] PDF download fonctionne
- [ ] Validation script : `powershell scripts/validate-site.ps1`

---

**Une fois tout configuré, le site est PRÊT POUR PRODUCTION ! 🎉**
