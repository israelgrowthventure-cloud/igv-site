# Variables d'Environnement Requises (Render)

Copier ces valeurs dans les paramètres d'environnement de Render.

```ini
# --- Paiement Monetico (CRITIQUE) ---
MONETICO_KEY=               # Clé HEX (40 caractères) ou Clé TPE
MONETICO_TPE=               # Numéro TPE (7 chiffres)
MONETICO_COMPANY_CODE=      # Code Société
MONETICO_ENV=PROD          # TEST ou PROD
MONETICO_URL_SUCCESS=https://israelgrowthventure.com/payment/success
MONETICO_URL_FAILURE=https://israelgrowthventure.com/payment/failure

# --- Base de Données (CRITIQUE) ---
MONGO_URL=mongodb+srv://... # URL de connexion MongoDB Atlas
DB_NAME=IGV-Cluster         # Nom de la DB

# --- Sécurité ---
JWT_SECRET=                 # Générer une chaîne aléatoire longue (openssl rand -hex 32)
FRONTEND_URL=https://israelgrowthventure.com

# --- Email (SMTP) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@israelgrowthventure.com
SMTP_PASSWORD=              # Mot de passe d'application (App Password)

# --- Stripe (Optionnel si Monetico principal) ---
STRIPE_SECRET_KEY=sk_live_...
```
