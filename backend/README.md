# Backend CMS - Israel Growth Venture

Backend FastAPI pour le site IGV avec support de :
- 🔐 Authentification et sécurité
- 💳 Paiements Stripe (1x, 3x, 12x)
- 🌍 Pricing multi-zones (EU, US/CA, IL, Asie/Afrique)
- 📧 Emails SMTP via Gmail
- 📝 Formulaire de contact
- 🛒 Gestion du panier
- 📅 Intégration Google Calendar

## 🚀 Déploiement sur Render

**Voir [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) pour le guide complet**

### Quick Start

1. **Connectez ce repo à Render via Blueprint** :
   - render.com → New → Blueprint
   - Sélectionnez `igv-site` repository
   - Render détecte `backend/render.yaml`

2. **Configurez les secrets** :
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
   STRIPE_SECRET_KEY=sk_test_...
   SMTP_USER=contact@israelgrowthventure.com
   SMTP_PASSWORD=your-app-password
   ```

3. **Déployez** :
   - Cliquez sur "Apply"
   - URL : `https://igv-cms-backend.onrender.com`

## 🛠️ Développement local

### Installation

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Configuration

Créez `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Remplissez les variables :
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="igv_cms_db"
STRIPE_SECRET_KEY="sk_test_..."
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Démarrage

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

API accessible à : `http://localhost:8000`

## 📡 Endpoints

### Health Check
- `GET /` - Healthcheck
- `GET /api/health` - Health check détaillé

### Géolocalisation & Pricing
- `GET /api/geo` - Détecte zone géographique via IP
- `GET /api/pricing?packId=analyse&zone=EU` - Prix pour un pack

### E-commerce
- `POST /api/checkout` - Crée session Stripe
- `POST /api/webhooks/payment` - Webhook Stripe

### Contact & Cart
- `POST /api/contact` - Soumet formulaire contact
- `GET /api/contacts` - Liste contacts (admin)
- `POST /api/cart` - Ajoute au panier
- `GET /api/cart` - Récupère panier

### Admin
- `POST /api/admin/save-content` - Sauvegarde content.json
- `POST /api/admin/save-packs` - Sauvegarde packs-data.json

## 🌍 Configuration Pricing

### Zones supportées
- **EU** : Europe (EUR €)
- **US_CA** : USA/Canada (USD $)
- **IL** : Israël (ILS ₪)
- **ASIA_AFRICA** : Asie/Afrique (USD $)

### Packs & Prix

| Pack | EU | US/CA | IL | Asie/Afrique |
|------|-----|-------|-----|--------------|
| Analyse | 3 000 € | 4 000 $ | 7 000 ₪ | 4 000 $ |
| Succursales | 15 000 € | 30 000 $ | 55 000 ₪ | 30 000 $ |
| Franchise | 15 000 € | 30 000 $ | 55 000 ₪ | 30 000 $ |

### Plans de paiement
- **ONE_SHOT** : Paiement comptant
- **3X** : 3 mensualités
- **12X** : 12 mensualités

Configuration dans `pricing_config.py`.

## 🔐 Sécurité

### CORS
Origins autorisées dans `server.py` :
```python
allow_origins=[
    "http://localhost:3000",
    "https://israelgrowthventure.com",
    "https://igv-site.onrender.com"
]
```

### Admin Password
Défini dans `server.py` : `ADMIN_PASSWORD = "igv2025"`

⚠️ **À changer en production** via variable d'environnement.

## 📦 Structure

```
backend/
├── server.py              # FastAPI app principale
├── pricing_config.py      # Configuration pricing zones
├── requirements.txt       # Dépendances Python
├── .env.example          # Template variables d'environnement
├── render.yaml           # Configuration Render Blueprint
├── Procfile              # Commande démarrage
├── runtime.txt           # Version Python
└── RENDER_DEPLOYMENT.md  # Guide déploiement complet
```

## 🧪 Tests

### Test health check
```bash
curl http://localhost:8000/api/health
```

### Test géolocalisation
```bash
curl http://localhost:8000/api/geo
```

### Test pricing
```bash
curl "http://localhost:8000/api/pricing?packId=analyse&zone=EU"
```

## 📝 Logs

### Production (Render)
- Dashboard Render → Service → Logs
- Niveau : INFO

### Local
```bash
# Logs affichés dans le terminal
# Format : timestamp - logger - level - message
```

## 🔄 CI/CD

Déploiement automatique sur push à `main` :

```bash
git add .
git commit -m "Update backend"
git push
```

Render détecte le push et redéploie automatiquement.

## 🌐 Intégration Frontend

Dans le frontend, configurez :

```env
REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api
```

Le frontend appellera automatiquement le backend pour :
- Géolocalisation utilisateur
- Récupération des prix
- Création de sessions Stripe
- Soumission de formulaires contact

## 💡 Tips

### MongoDB Atlas
- Plan gratuit M0 suffisant pour démarrer
- Région Frankfurt (proche Render EU)
- Allow IP 0.0.0.0/0 pour Render

### Gmail SMTP
- Utilisez un mot de passe d'application (16 caractères)
- Activez validation en 2 étapes sur le compte Google

### Stripe
- Mode test : `sk_test_...` (développement)
- Mode live : `sk_live_...` (production)
- Webhooks : testez avec Stripe CLI localement

## 🐛 Dépannage

### Service ne démarre pas
1. Vérifiez logs Render
2. Assurez-vous que `MONGO_URL` est défini
3. Testez localement : `uvicorn server:app --reload`

### Erreur MongoDB
- Vérifiez format URL : `mongodb+srv://...`
- Vérifiez IP whitelisting dans Atlas

### Emails ne partent pas
- Mot de passe d'application Google (pas le mot de passe principal)
- SMTP_PORT=587, SMTP_HOST=smtp.gmail.com

## 📚 Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Render Docs](https://render.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

## 🎉 Support

Questions ? Consultez :
1. `RENDER_DEPLOYMENT.md` - Guide déploiement complet
2. Logs Render - Erreurs en temps réel
3. [Render Community](https://community.render.com/)

---

**Status** : ✅ Prêt pour production  
**Last Updated** : Novembre 2025  
**Version** : 1.0.0
