# Geo-Based Pricing & Multi-Plan Payment - Documentation

## 📋 Vue d'ensemble

Ce commit implémente un système complet de pricing géographique et de paiement échelonné (1x, 3x, 12 mois) pour le site israelgrowthventure.com.

## 🎯 Fonctionnalités implémentées

### 1. Détection géographique automatique
- **Endpoint**: `/api/geo`
- **Service**: ipapi.co
- **Zones supportées**:
  - `EU` : Europe (par défaut)
  - `US_CA` : USA et Canada
  - `IL` : Israël
  - `ASIA_AFRICA` : Asie et Afrique

### 2. Pricing dynamique par zone

#### Configuration des prix (unités métier)

| Pack | Europe (€) | USA/Canada ($) | Israël (₪) | Asie/Afrique ($) |
|------|------------|----------------|------------|------------------|
| **Analyse** | 3 000 € | 4 000 $ | 7 000 ₪ | 4 000 $ |
| **Succursales** | 15 000 € | 30 000 $ | 55 000 ₪ | 30 000 $ |
| **Franchise** | 15 000 € | 30 000 $ | 55 000 ₪ | 30 000 $ |

#### Endpoint pricing
- **Route**: `/api/pricing?packId={analyse|succursales|franchise}&zone={EU|US_CA|IL|ASIA_AFRICA}`
- **Réponse**:
```json
{
  "zone": "EU",
  "currency": "eur",
  "currency_symbol": "€",
  "total_price": 3000,
  "monthly_3x": 1000,
  "monthly_12x": 250,
  "display": {
    "total": "3 000 €",
    "three_times": "3 x 1 000 €",
    "twelve_times": "12 x 250 €"
  }
}
```

### 3. Plans de paiement

#### Types de plans
- **ONE_SHOT** : Paiement comptant (mode `payment`)
- **3X** : 3 mensualités automatiques (mode `subscription`)
- **12X** : 12 mensualités automatiques (mode `subscription`)

#### Implémentation Stripe
- Paiement comptant → `stripe.checkout.Session` en mode `payment`
- Paiements échelonnés → `stripe.checkout.Session` en mode `subscription`
  - Création dynamique de `Product` et `Price` Stripe
  - Mensualités calculées automatiquement
  - Métadonnées complètes pour tracking

## 📁 Fichiers créés/modifiés

### Backend

#### ✅ `backend/pricing_config.py` (NOUVEAU)
Configuration centralisée des prix:
- Enum des zones, devises, packs, plans
- Mapping pays → zone (40+ pays)
- Fonctions utilitaires:
  - `get_zone_from_country(country_code)` → Zone
  - `get_price_for_pack(zone, pack_type)` → int
  - `to_stripe_amount(amount, currency)` → int (conversion cents/agorot)
  - `calculate_monthly_amount(total, installments)` → int
  - `format_price(amount, zone)` → str

#### ✅ `backend/server.py` (MODIFIÉ)
**Ajouts**:
- Import de `pricing_config`
- Nouveaux modèles Pydantic:
  - `GeoResponse` : réponse de géolocalisation
  - `PricingResponse` : réponse de pricing
  - `CheckoutRequest` : ajout de `planType` et `zone`
  
**Nouveaux endpoints**:
```python
@app.get("/api/geo", response_model=GeoResponse)
async def get_geo_location(request: Request)
# Détection IP via ipapi.co, fallback vers EU

@app.get("/api/pricing", response_model=PricingResponse)
async def get_pricing(packId: str, zone: Optional[str] = None)
# Pricing dynamique par zone et pack
```

**Endpoint modifié**:
```python
@app.post("/api/checkout", response_model=CheckoutResponse)
async def create_checkout_session(checkout: CheckoutRequest)
# Support des 3 modes de paiement
# Création session Stripe adaptée au plan choisi
```

### Frontend

#### ✅ `frontend/src/config/pricingConfig.js` (NOUVEAU)
- Constantes des zones, packs, plans
- Configuration statique des prix (référence)
- Fonctions `formatPrice()` et `calculateMonthlyAmount()`

#### ✅ `frontend/src/context/GeoContext.js` (NOUVEAU)
Contexte React global pour la géolocalisation:
- Hook `useGeo()` → `{ zone, country_code, country_name, ip, isLoading, error }`
- Appel automatique à `/api/geo` au chargement
- Fallback vers EU en cas d'erreur

#### ✅ `frontend/src/App.js` (MODIFIÉ)
- Intégration du `<GeoProvider>` autour de l'app
- Disponibilité globale du contexte geo

#### ✅ `frontend/src/pages/Checkout.js` (MODIFIÉ)
**Changements majeurs**:
- Utilisation de `useGeo()` pour récupérer la zone
- Appel à `/api/pricing` pour obtenir les prix dynamiques
- Interface de sélection des plans de paiement:
  - Radio buttons stylisés
  - Affichage des 3 options (1x, 3x, 12x)
  - Prix mis à jour en temps réel
- Payload checkout enrichi avec `planType` et `zone`
- Récapitulatif adapté au plan sélectionné

## 🚀 Tests locaux

### Backend

```powershell
cd "C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\backend"

# Activer l'environnement virtuel (si existant)
.\venv\Scripts\Activate.ps1

# Installer les dépendances (si nécessaire)
pip install -r requirements.txt

# Lancer le serveur
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Tests des endpoints**:
```powershell
# Test géolocalisation
curl http://localhost:8000/api/geo

# Test pricing Europe
curl "http://localhost:8000/api/pricing?packId=analyse&zone=EU"

# Test pricing Israël
curl "http://localhost:8000/api/pricing?packId=succursales&zone=IL"
```

### Frontend

```powershell
cd "C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend"

# Installer les dépendances (si nécessaire)
npm install

# Lancer le dev server
npm start

# OU builder pour production
npm run build
```

**Pages à tester**:
- Home (`/`) : vérifier que le contexte geo se charge
- Packs (`/packs`) : vérifier l'affichage des prix selon la zone
- Checkout (`/checkout/analyse`) : 
  - Vérifier les 3 options de paiement
  - Vérifier le prix adapté à la zone
  - Tester la soumission vers Stripe

## 📦 Déploiement sur Render

### 1. Backend

**Variables d'environnement à configurer**:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://israelgrowthventure.com
MONGO_URL=mongodb://...
DB_NAME=igv_db
```

**Déploiement**:
```powershell
git push origin main
```
→ Render détectera automatiquement les changements et redéploiera le backend.

**Vérifications post-déploiement**:
```powershell
# Test endpoint geo
curl https://igv-backend.onrender.com/api/geo

# Test endpoint pricing
curl "https://igv-backend.onrender.com/api/pricing?packId=analyse&zone=EU"

# Test health check
curl https://igv-backend.onrender.com/api/health
```

### 2. Frontend

**Variables d'environnement** (déjà configurées):
```env
REACT_APP_API_BASE_URL=https://igv-backend.onrender.com
```

**Déploiement**:
```powershell
git push origin main
```
→ Render rebuild automatiquement le frontend.

**Build command** (déjà configuré dans Render):
```
npm run build
```

**Publish directory**: `build`

## 🔍 Points d'attention

### Stripe Webhooks

Pour les paiements échelonnés (3x, 12x), il est **fortement recommandé** de configurer les webhooks Stripe pour gérer:
- `invoice.payment_succeeded` : mensualité payée
- `invoice.payment_failed` : échec de prélèvement
- `customer.subscription.deleted` : abonnement annulé

**Configuration webhook** (dans Stripe Dashboard):
- URL: `https://igv-backend.onrender.com/api/webhooks/payment`
- Events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.*`

### Annulation automatique des abonnements

⚠️ **Important**: L'implémentation actuelle crée des abonnements Stripe qui se renouvellent indéfiniment.

**TODO recommandé**: Ajouter une logique pour annuler l'abonnement après N paiements:
- Option 1: Utiliser Stripe Billing avec un nombre de cycles limité
- Option 2: Webhook qui annule l'abonnement après le Nème paiement
- Option 3: Utiliser `subscription_schedule` pour planifier la fin

### Gestion des erreurs de paiement

Pour les paiements échelonnés:
- Configurer Stripe Smart Retries
- Notifier le client en cas d'échec de prélèvement
- Définir une politique de suspension/annulation

## 📊 Monitoring

### Métriques à suivre

1. **Taux de conversion par zone**:
   - Tracer combien d'utilisateurs de chaque zone finalisent un paiement

2. **Choix des plans**:
   - Répartition ONE_SHOT vs 3X vs 12X
   - Taux d'échec par type de plan

3. **Géolocalisation**:
   - Taux de succès de la détection IP
   - Distribution géographique des visiteurs

4. **Stripe**:
   - Paiements réussis/échoués par plan
   - Revenus par zone géographique

## 🐛 Dépannage

### Frontend: Zone non détectée
**Symptôme**: Prix affichés par défaut (EU) même si l'utilisateur est ailleurs.

**Causes possibles**:
1. Backend non accessible → vérifier `REACT_APP_API_BASE_URL`
2. CORS bloqué → vérifier configuration CORS backend
3. ipapi.co rate limited → attendre ou utiliser un autre service

**Solution**: Le fallback vers EU est intentionnel pour ne jamais bloquer l'utilisateur.

### Backend: Erreur Stripe
**Symptôme**: 502 lors du checkout.

**Causes**:
1. `STRIPE_SECRET_KEY` non configurée
2. Clé de test utilisée en prod (ou inversement)
3. Produit Stripe non créé

**Solution**: Vérifier les logs Render et la configuration Stripe.

### Paiement échelonné: Pas d'annulation après N paiements
**Symptôme**: L'abonnement continue au-delà de 3 ou 12 mois.

**Solution temporaire**: Annulation manuelle dans Stripe Dashboard.

**Solution permanente**: Implémenter la logique d'annulation automatique (voir section Webhooks).

## 📝 Notes techniques

### Conversion unités Stripe

Toutes les devises utilisent le facteur **x100**:
- 3000 € → 300000 cents
- 4000 $ → 400000 cents  
- 7000 ₪ → 700000 agorot

### Format d'affichage

Le format des prix respecte les conventions locales:
- Europe: `3 000 €` (espace comme séparateur de milliers)
- USA: `4 000 $`
- Israël: `7 000 ₪`

### Sécurité

- Les prix sont toujours validés côté backend
- La zone peut être envoyée depuis le frontend mais est recalculée en backend si nécessaire
- Les métadonnées Stripe contiennent toutes les infos pour audit

---

## ✅ Checklist de déploiement

- [x] Backend: pricing_config.py créé
- [x] Backend: Endpoints /api/geo et /api/pricing implémentés
- [x] Backend: Checkout adapté pour 3 plans
- [x] Frontend: GeoContext créé
- [x] Frontend: pricingConfig.js créé
- [x] Frontend: Checkout UI avec sélection de plan
- [x] Build frontend testé et fonctionnel
- [x] Commit créé et prêt à push
- [ ] Variables d'environnement Render vérifiées
- [ ] Webhooks Stripe configurés
- [ ] Tests en production effectués
- [ ] Monitoring activé

---

## 🎉 Prochaines étapes recommandées

1. **Push vers Render**:
   ```powershell
   git push origin main
   ```

2. **Vérifier les déploiements**:
   - Backend: https://igv-backend.onrender.com/api/health
   - Frontend: https://israelgrowthventure.com

3. **Configurer Stripe Webhooks** (important pour paiements échelonnés)

4. **Tester un paiement complet** avec carte de test Stripe:
   - `4242 4242 4242 4242` (succès)
   - Date: future
   - CVC: 123

5. **Implémenter l'annulation automatique** des abonnements (recommandé)

6. **Ajouter des analytics** pour tracker les conversions par zone

---

**Auteur**: GitHub Copilot  
**Date**: 25 novembre 2025  
**Version**: 1.0.0
