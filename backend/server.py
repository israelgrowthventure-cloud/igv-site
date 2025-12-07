"""
IGV Backend - API principale FastAPI
=====================================

Ce fichier est le point d'entrée principal du backend IGV.
Il expose toutes les routes API utilisées par le frontend et le CMS.

FRAMEWORK: FastAPI 0.110.1
DATABASE: MongoDB (Motor 3.3.1 - async driver)
AUTH: JWT (PyJWT 2.10.1) + bcrypt password hashing
PAYMENTS: Stripe

ROUTES PRINCIPALES:
- /api/auth/* - Authentification JWT (register, login, me)
- /api/pages/* - Gestion pages CMS (CRUD complet)
- /api/packs/* - Packs de services (CRUD complet)
- /api/pricing-rules/* - Règles de pricing géographique (CRUD)
- /api/translations/* - Traductions i18n (CRUD)
- /api/orders/* - Commandes et paiements Stripe
- /api/health - Healthcheck pour monitoring Render

VARIABLES D'ENVIRONNEMENT REQUISES:
- MONGO_URL: URL MongoDB Atlas (CRITIQUE)
- DB_NAME: Nom de la base de données
- JWT_SECRET: Secret pour génération tokens JWT (32+ chars)
- ADMIN_EMAIL: Email administrateur CMS
- ADMIN_PASSWORD: Mot de passe administrateur
- SMTP_*: Configuration email (host, port, user, password)
- STRIPE_SECRET_KEY: Clé API Stripe
- FRONTEND_URL: URL du frontend pour CORS
- CORS_ORIGINS: Origins autorisés pour CORS

DÉPLOIEMENT: Render Web Service
- Build: pip install -r requirements.txt
- Start: uvicorn server:app --host 0.0.0.0 --port $PORT
- Health Check: /api/health
"""

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import time
import json
import logging
import uuid
import httpx
import aiosmtplib
import stripe
from dotenv import load_dotenv
from fastapi.responses import PlainTextResponse
import jwt
from passlib.context import CryptContext

# Import de la configuration pricing
from pricing_config import (
    Zone, PackType, PlanType, 
    get_zone_from_country, 
    get_price_for_pack,
    get_currency_for_zone,
    get_currency_symbol,
    to_stripe_amount,
    calculate_monthly_amount,
    format_price,
    PRICING_CONFIG
)

# Import des routes CMS
from cms_routes import cms_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging AVANT toute utilisation
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection with timeout and error handling
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError("MONGO_URL environment variable must be set for production")

db_name = os.environ.get('DB_NAME', 'IGV-Cluster')  # Updated default to match Render config

# Configure MongoDB client with connection timeout
try:
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=5000,  # 5 secondes max pour sélection serveur
        connectTimeoutMS=5000,  # 5 secondes max pour connexion
        socketTimeoutMS=5000  # 5 secondes max pour opérations socket
    )
    db = client[db_name]
    logger.info(f"MongoDB client configured for database: {db_name}")
except Exception as e:
    logger.error(f"Failed to configure MongoDB client: {e}")
    db = None

# ==================== CREATE APP ====================
app = FastAPI(title="IGV Backend", version="1.0.0")

# Healthcheck route pour Render
@app.get("/")
def healthcheck():
    return {"status": "ok"}

# ==================== CORS CONFIGURATION ====================
# ✅ PLACER ICI : après app = FastAPI(), avant les routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://israelgrowthventure.com",
        "https://www.israelgrowthventure.com",
        "https://igv-site.onrender.com"  # ✅ Autorise le frontend Render
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable must be set for production")
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ==================== Modèles Pydantic ====================

# --- Auth Models ---
class User(BaseModel):
    """Modèle utilisateur pour authentification JWT et gestion des rôles (admin/editor)."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    role: str = "editor"  # admin, editor
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    """Payload de création d'utilisateur (email, mot de passe, rôle)."""
    email: str
    password: str
    role: str = "editor"

class UserLogin(BaseModel):
    """Payload de login utilisateur (email, mot de passe)."""
    email: str
    password: str

# --- Page Models ---
class Page(BaseModel):
    """Modèle de page CMS (GrapesJS) avec contenu multilingue, HTML/CSS, publication."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: Dict[str, str]  # {"fr": "...", "en": "...", "he": "..."}
    content_json: str  # GrapesJS JSON
    content_html: str = ""  # GrapesJS HTML
    content_css: str = ""  # GrapesJS CSS
    published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageCreate(BaseModel):
    """Payload de création de page CMS (slug, titres, contenu, publication)."""
    slug: str
    title: Dict[str, str]
    content_json: str = "{}"
    content_html: str = ""
    content_css: str = ""
    published: bool = False

class PageUpdate(BaseModel):
    """Payload de mise à jour partielle d'une page CMS."""
    title: Optional[Dict[str, str]] = None
    content_json: Optional[str] = None
    content_html: Optional[str] = None
    content_css: Optional[str] = None
    published: Optional[bool] = None

# --- Pack Models ---
class Pack(BaseModel):
    """Modèle de pack de services IGV (nom, description, features, prix, slug, état)."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Dict[str, str]
    description: Dict[str, str]
    features: Dict[str, List[str]]
    base_price: float
    currency: str = "EUR"
    slug: Optional[str] = None  # Slug pour compatibilité pricing/checkout (analyse, succursales, franchise)
    order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PackCreate(BaseModel):
    """Payload de création de pack de services IGV."""
    name: Dict[str, str]
    description: Dict[str, str]
    features: Dict[str, List[str]]
    base_price: float
    currency: str = "EUR"
    slug: Optional[str] = None
    order: int = 0
    active: bool = True

# --- Pricing Models ---
class PricingRule(BaseModel):
    """Modèle de règle de pricing géographique (zone, pays, prix, devise, état)."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zone_name: str
    country_codes: List[str]
    price: float
    currency: str = "EUR"
    active: bool = True

class PricingRuleCreate(BaseModel):
    zone_name: str
    country_codes: List[str]
    price: float
    currency: str = "EUR"
    active: bool = True

# --- Order Models ---
class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_email: str
    customer_name: str
    pack_id: str
    amount: float
    currency: str
    stripe_payment_intent_id: Optional[str] = None
    status: str = "pending"  # pending, completed, failed
    country_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_email: str
    customer_name: str
    pack_id: str
    country_code: Optional[str] = None

# --- Translation Models ---
class Translation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    translations: Dict[str, str]  # {"fr": "...", "en": "...", "he": "..."}

class TranslationCreate(BaseModel):
    key: str
    translations: Dict[str, str]

# --- Existing Models (Contact, Cart) ---
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    message: str
    language: str = "fr"


class ContactResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    message: str
    language: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pack_name: str
    pack_type: str  # "analyse", "succursales", "franchise"
    price: float
    currency: str
    region: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartItemCreate(BaseModel):
    pack_name: str
    pack_type: str
    price: float
    currency: str
    region: str


class IPLocationResponse(BaseModel):
    region: str
    country: str
    currency: str


class CustomerInfo(BaseModel):
    fullName: str
    company: Optional[str] = None
    email: EmailStr
    phone: str
    country: str


class CheckoutRequest(BaseModel):
    packId: str
    packName: str
    priceLabel: str
    customer: CustomerInfo
    planType: Optional[str] = "ONE_SHOT"  # "ONE_SHOT", "3X", "12X"
    zone: Optional[str] = None  # Zone géographique détectée


class CheckoutResponse(BaseModel):
    orderId: str
    paymentUrl: Optional[str]
    message: str


class GeoResponse(BaseModel):
    """Réponse de géolocalisation"""
    ip: str
    country_code: str
    country_name: str
    zone: str


class PricingResponse(BaseModel):
    """Réponse de pricing pour un pack"""
    zone: str
    currency: str
    currency_symbol: str
    total_price: int
    monthly_3x: int
    monthly_12x: int
    display: dict
    message: str

# ==================== JWT AUTH HELPERS ====================

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": user_email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**{k: v for k, v in user.items() if k != "password_hash"})

async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Verify user is admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== Helper Functions ====================

async def send_email_gmail(to_email: str, subject: str, body: str, html_body: str = None):
    """Helper function to send email via Gmail SMTP"""
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        logger.warning("SMTP credentials not configured, email not sent")
        return False
    
    message = MIMEMultipart('alternative')
    message['Subject'] = subject
    message['From'] = smtp_user
    message['To'] = to_email
    
    part1 = MIMEText(body, 'plain')
    message.attach(part1)
    
    if html_body:
        part2 = MIMEText(html_body, 'html')
        message.attach(part2)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False


def create_order_in_db(checkout: CheckoutRequest) -> str:
    """
    TODO : plus tard, insérer en base de données.
    Pour l'instant, on génère juste un identifiant et on log la commande.
    """
    order_id = f"ORDER_{int(time.time())}"
    print("=" * 60)
    print("NOUVELLE COMMANDE CRÉÉE")
    print("=" * 60)
    print(f"Order ID: {order_id}")
    print(f"Pack: {checkout.packName} ({checkout.packId})")
    print(f"Prix: {checkout.priceLabel}")
    print(f"Client: {checkout.customer.fullName}")
    print(f"Email: {checkout.customer.email}")
    print(f"Téléphone: {checkout.customer.phone}")
    print(f"Société: {checkout.customer.company or 'N/A'}")
    print(f"Pays: {checkout.customer.country}")
    print("=" * 60)
    logger.info(f"Order created: {order_id}")
    return order_id


def create_payment_session(order_id: str, checkout: CheckoutRequest) -> str:
    """
    TODO : plus tard, intégrer Stripe / PayPal.
    Pour l'instant, on renvoie une URL de paiement fictive.
    """
    payment_url = f"https://paiement.exemple.com/session/{order_id}"
    print(f"Session de paiement créée: {payment_url}")
    logger.info(f"Payment session created: {payment_url}")
    return payment_url

# Charger la clé Stripe depuis l'environnement
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", None)
if not STRIPE_SECRET_KEY:
    logger.warning("STRIPE_SECRET_KEY not set in .env — Stripe will not work until configured.")
stripe.api_key = STRIPE_SECRET_KEY

# Mapping des prix (en centimes) pour les packs - DEPRECATED, utiliser pricing_config.py
PACK_PRICES_EUR = {
    "analyse": 300000,       # 3 000.00 EUR
    "succursales": 1500000,  # 15 000.00 EUR
    "franchise": 1500000,    # 15 000.00 EUR
}

# ==================== Geolocation & Pricing Routes ====================

@app.get("/api/geo", response_model=GeoResponse)
async def get_geo_location(request: Request):
    """
    Détecte la zone géographique de l'utilisateur via son IP.
    Utilise ipapi.co comme service de géolocalisation.
    """
    # Récupérer l'IP du client (en tenant compte des proxies/load balancers)
    client_ip = request.client.host
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    
    logger.info(f"Geo request from IP: {client_ip}")
    
    # Fallback par défaut vers Israël (zone de secours)
    default_response = GeoResponse(
        ip=client_ip,
        country_code="IL",
        country_name="Israel",
        zone=Zone.IL
    )
    
    # Si IP locale, retourner le défaut
    if client_ip in ["127.0.0.1", "localhost", "::1"]:
        logger.info("Local IP detected, using IL default")
        return default_response
    
    try:
        # Appel à ipapi.co
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"https://ipapi.co/{client_ip}/json/")
            
            if response.status_code == 200:
                data = response.json()
                country_code = data.get("country_code", "FR")
                country_name = data.get("country_name", "France")
                
                # Déterminer la zone
                zone = get_zone_from_country(country_code)
                
                logger.info(f"Geo detected: {country_code} -> {zone}")
                
                return GeoResponse(
                    ip=client_ip,
                    country_code=country_code,
                    country_name=country_name,
                    zone=zone
                )
            else:
                logger.warning(f"ipapi.co returned status {response.status_code}")
                return default_response
                
    except Exception as e:
        logger.error(f"Error during geolocation: {str(e)}")
        return default_response


@app.get("/api/pricing", response_model=PricingResponse)
async def get_pricing(packId: str, zone: Optional[str] = None):
    """
    Retourne le pricing pour un pack donné dans une zone spécifique.
    Si zone n'est pas fournie, utilise IL par défaut (zone de secours).
    """
    # Validation du pack
    try:
        pack_type = PackType(packId)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Pack invalide. Valeurs acceptées: {', '.join([p.value for p in PackType])}"
        )
    
    # Validation de la zone
    if zone is None:
        zone = Zone.IL  # Zone de secours : Israël
    else:
        try:
            zone = Zone(zone)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Zone invalide. Valeurs acceptées: {', '.join([z.value for z in Zone])}"
            )
    
    # Récupérer le prix
    total_price = get_price_for_pack(zone, pack_type)
    currency = get_currency_for_zone(zone)
    currency_symbol = get_currency_symbol(zone)
    
    # Calculer les mensualités
    monthly_3x = calculate_monthly_amount(total_price, 3)
    monthly_12x = calculate_monthly_amount(total_price, 12)
    
    # Format d'affichage
    display = {
        "total": format_price(total_price, zone),
        "three_times": f"3 x {format_price(monthly_3x, zone)}",
        "twelve_times": f"12 x {format_price(monthly_12x, zone)}"
    }
    
    return PricingResponse(
        zone=zone.value,
        currency=currency,
        currency_symbol=currency_symbol,
        total_price=total_price,
        monthly_3x=monthly_3x,
        monthly_12x=monthly_12x,
        display=display,
        message="Pricing retrieved successfully"
    )

# ==================== Health Check Route ====================
if not STRIPE_SECRET_KEY:
    logger.warning("STRIPE_SECRET_KEY not set in .env — Stripe will not work until configured.")
stripe.api_key = STRIPE_SECRET_KEY

# Configure Stripe with timeout to prevent slow checkout
stripe.max_network_retries = 2
# Note: stripe.http_client deprecated in newer versions - using default client

# Mapping des prix (en centimes) pour les packs
PACK_PRICES_EUR = {
    "analyse": 300000,       # 3 000.00 EUR
    "succursales": 1500000,  # 15 000.00 EUR
    "franchise": 1500000,    # 15 000.00 EUR
}

# ==================== Health Check Route ====================

@app.get("/api/health")
async def health_check():
    """Endpoint simple pour vérifier que le backend est opérationnel."""
    health_status = {
        "status": "ok",
        "message": "Backend IGV est opérationnel",
        "version": "2.0.1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mongodb": "disconnected"
    }
    
    # Vérifier la connexion MongoDB
    if db is not None:
        try:
            # Ping MongoDB avec timeout court
            await db.command('ping', maxTimeMS=2000)
            health_status["mongodb"] = "connected"
        except Exception as e:
            logger.warning(f"MongoDB ping failed: {e}")
            health_status["mongodb"] = "error"
            health_status["mongodb_error"] = str(e)[:100]
    
    return health_status

# ==================== E-commerce Routes ====================

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@app.post("/api/checkout", response_model=CheckoutResponse)
async def create_checkout_session(checkout: CheckoutRequest):
    """
    Crée une session Stripe Checkout et retourne l'URL de paiement.
    Supporte le paiement en 1 fois, 3 fois ou 12 mois.
    """
    logger.info(f"Checkout request received for pack: {checkout.packId}, plan: {checkout.planType}")
    
    # Validation du pack
    try:
        pack_type = PackType(checkout.packId)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Pack invalide. Valeurs acceptées: {', '.join([p.value for p in PackType])}"
        )
    
    # Validation de la zone
    zone = Zone(checkout.zone) if checkout.zone else Zone.EU
    
    # Validation du plan
    plan_type = PlanType(checkout.planType) if checkout.planType else PlanType.ONE_SHOT
    
    # Récupérer le prix total et la devise
    total_price = get_price_for_pack(zone, pack_type)
    currency = get_currency_for_zone(zone)
    
    # Création de la commande locale
    order_id = create_order_in_db(checkout)
    
    try:
        if plan_type == PlanType.ONE_SHOT:
            # Paiement comptant en une fois
            stripe_amount = to_stripe_amount(total_price, currency)
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                line_items=[{
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": checkout.packName,
                            "description": f"{checkout.packName} - Paiement comptant"
                        },
                        "unit_amount": stripe_amount,
                    },
                    "quantity": 1,
                }],
                customer_email=checkout.customer.email,
                metadata={
                    "order_id": order_id,
                    "order_pack_id": checkout.packId,
                    "order_customer_name": checkout.customer.fullName,
                    "plan_type": plan_type,
                    "zone": zone,
                    "total_price": total_price,
                },
                success_url=f"{FRONTEND_URL}/payment/success?provider=stripe&pack={checkout.packName}&amount={total_price}&currency={currency}&status=confirmed",
                cancel_url=f"{FRONTEND_URL}/packs?payment=cancel",
            )
            
        elif plan_type in [PlanType.THREE_TIMES, PlanType.TWELVE_TIMES]:
            # Paiement échelonné via Subscription
            installments = 3 if plan_type == PlanType.THREE_TIMES else 12
            monthly_amount = calculate_monthly_amount(total_price, installments)
            stripe_monthly_amount = to_stripe_amount(monthly_amount, currency)
            
            # Créer un produit et un prix Stripe pour la souscription
            product = stripe.Product.create(
                name=f"{checkout.packName} - {installments}x",
                description=f"Paiement en {installments} mensualités"
            )
            
            price = stripe.Price.create(
                product=product.id,
                unit_amount=stripe_monthly_amount,
                currency=currency,
                recurring={"interval": "month", "interval_count": 1}
            )
            
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="subscription",
                line_items=[{
                    "price": price.id,
                    "quantity": 1,
                }],
                customer_email=checkout.customer.email,
                subscription_data={
                    "metadata": {
                        "order_id": order_id,
                        "pack_id": checkout.packId,
                        "plan_type": plan_type,
                        "zone": zone,
                        "total_installments": installments,
                        "installment_amount": monthly_amount,
                    },
                    # Annuler automatiquement après N paiements
                    "trial_settings": None,
                },
                metadata={
                    "order_id": order_id,
                    "order_pack_id": checkout.packId,
                    "order_customer_name": checkout.customer.fullName,
                    "plan_type": plan_type,
                    "zone": zone,
                    "installments": installments,
                    "monthly_amount": monthly_amount,
                },
                success_url=f"{FRONTEND_URL}/payment/success?provider=stripe&pack={checkout.packName}&amount={monthly_amount}x{installments}&currency={currency}&status=confirmed",
                cancel_url=f"{FRONTEND_URL}/packs?payment=cancel",
            )
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating session: {str(e)}")
        raise HTTPException(status_code=502, detail="Erreur de création de session de paiement")

    logger.info(f"Stripe session created: {session.id}")
    return CheckoutResponse(
        orderId=order_id, 
        paymentUrl=session.url, 
        message="Redirection vers Stripe Checkout"
    )


# Webhook Stripe (vérifie signature si STRIPE_WEBHOOK_SECRET présent)
@app.post("/api/webhooks/payment")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        # No webhook secret configured — try to parse body (less secure)
        try:
            event = json.loads(payload)
        except Exception as e:
            logger.error(f"Unable to parse webhook payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid payload")

    # Handle the event types you care about
    evt_type = event.get("type") if isinstance(event, dict) else getattr(event, "type", None)
    logger.info(f"Stripe webhook received: {evt_type}")
    if evt_type == "checkout.session.completed":
        session = event["data"]["object"] if isinstance(event, dict) else None
        logger.info(f"Checkout completed: {session}")
        # TODO: mark order as paid in DB using session.metadata or session.id
    return {"status": "received"}

# ==================== API Router for Other Routes ====================

api_router = APIRouter(prefix="/api")


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(contact: ContactForm):
    """Handle contact form submission"""
    logger.info(f"Contact form received from: {contact.email}")
    
    contact_dict = contact.model_dump()
    contact_obj = ContactResponse(**contact_dict)
    
    # Save to MongoDB
    doc = contact_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.contacts.insert_one(doc)
    
    # Send email notification
    email_subject = f"Nouveau contact IGV - {contact.name}"
    email_body = f"""
    Nouveau message de contact:
    
    Nom: {contact.name}
    Email: {contact.email}
    Société: {contact.company or 'Non spécifié'}
    Téléphone: {contact.phone or 'Non spécifié'}
    Langue: {contact.language}
    
    Message:
    {contact.message}
    """
    
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #1e40af;">Nouveau message de contact</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Nom:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{contact.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Société:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{contact.company or 'Non spécifié'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Téléphone:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{contact.phone or 'Non spécifié'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Langue:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{contact.language}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #1e40af;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">{contact.message}</p>
        </div>
      </body>
    </html>
    """
    
    recipient_email = os.getenv('CONTACT_EMAIL', 'israel.growth.venture@gmail.com')
    await send_email_gmail(recipient_email, email_subject, email_body, html_body)
    
    return contact_obj


@api_router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts():
    """Get all contacts (admin)"""
    logger.info("Fetching all contacts")
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    for contact in contacts:
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
    return contacts


@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(item: CartItemCreate):
    """Add item to cart"""
    logger.info(f"Adding to cart: {item.pack_name}")
    cart_obj = CartItem(**item.model_dump())
    doc = cart_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.cart.insert_one(doc)
    return cart_obj


@api_router.get("/cart", response_model=List[CartItem])
async def get_cart():
    """Get cart items"""
    logger.info("Fetching cart items")
    items = await db.cart.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    return items


# ==================== PACKS ROUTES ====================

@api_router.get("/packs")
async def get_packs(active_only: bool = False):
    """Get all packs from MongoDB"""
    logger.info(f"Fetching packs (active_only={active_only})")
    
    # Vérifier si MongoDB est disponible
    if db is None:
        logger.error("MongoDB not configured - MONGO_URL environment variable missing")
        raise HTTPException(
            status_code=503,
            detail="Database not configured. Please set MONGO_URL environment variable."
        )
    
    try:
        query = {"active": True} if active_only else {}
        packs = await db.packs.find(query, {"_id": 0}).to_list(1000)
        logger.info(f"Found {len(packs)} packs")
        return packs
    except Exception as e:
        logger.error(f"Failed to fetch packs from MongoDB: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database error: {str(e)[:100]}"
        )


@api_router.get("/packs/{pack_id}")
async def get_pack_by_id(pack_id: str):
    """Get a single pack by its UUID"""
    logger.info(f"Fetching pack: {pack_id}")
    pack = await db.packs.find_one({"id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail=f"Pack with ID {pack_id} not found")
    return pack


@api_router.get("/detect-location")
async def detect_location():
    """Detect user location based on IP using ipapi.co"""
    try:
        async with httpx.AsyncClient() as http_client:
            # Get client IP from ipapi.co
            response = await http_client.get('https://ipapi.co/json/', timeout=5.0)
            data = response.json()
            
            country_code = data.get('country_code', 'FR')
            country_name = data.get('country_name', 'France')
            
            # Determine region based on country
            if country_code in ['FR', 'BE', 'CH', 'LU', 'MC', 'DE', 'IT', 'ES', 'PT', 'NL', 'GB', 'IE']:
                region = 'europe'
                currency = '€'
            elif country_code in ['US', 'CA']:
                region = 'usa'
                currency = '$'
            elif country_code == 'IL':
                region = 'israel'
                currency = '₪'
            else:
                region = 'other'
                currency = '$'
            
            logger.info(f"Location detected: {country_name} ({country_code}) -> {region}")
            return IPLocationResponse(
                region=region,
                country=country_name,
                currency=currency
            )
    except Exception as e:
        logger.error(f"Error detecting location: {str(e)}")
        # Default to Europe if detection fails
        return IPLocationResponse(
            region='europe',
            country='France',
            currency='€'
        )

# ==================== ADMIN ENDPOINTS ====================

# Identifiants admin (depuis variables d'environnement)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'postmaster@israelgrowthventure.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
if not ADMIN_PASSWORD:
    logger.warning("ADMIN_PASSWORD not set - admin authentication may not work")

class LoginRequest(BaseModel):
    email: str
    password: str

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_create: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing = await db.users.find_one({"email": user_create.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = pwd_context.hash(user_create.password)
    
    # Create user
    user = User(email=user_create.email, role=user_create.role)
    user_doc = user.model_dump()
    user_doc["password_hash"] = hashed_password
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token({"sub": user.email, "role": user.role})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.post("/auth/login")
async def login(user_login: UserLogin):
    """Login with JWT"""
    # Find user in database
    user_doc = await db.users.find_one({"email": user_login.email})
    
    # If not found, check if it's the hardcoded admin
    if not user_doc:
        if user_login.email == ADMIN_EMAIL and user_login.password == ADMIN_PASSWORD:
            # Create admin user if doesn't exist
            hashed_password = pwd_context.hash(ADMIN_PASSWORD)
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL,
                "password_hash": hashed_password,
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(admin_user)
            user_doc = admin_user
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password (support both 'password' and 'password_hash' fields)
    password_hash = user_doc.get("password_hash") or user_doc.get("password")
    if not password_hash or not pwd_context.verify(user_login.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token({"sub": user_doc["email"], "role": user_doc["role"]})
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password_hash" and k != "_id"})
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@api_router.post("/admin/change-password")
async def change_password(request: Request, current_user: User = Depends(get_current_user)):
    """Change current user password"""
    try:
        payload = await request.json()
        old_password = payload.get("old_password")
        new_password = payload.get("new_password")
        
        if not old_password or not new_password:
            raise HTTPException(status_code=400, detail="Ancien et nouveau mot de passe requis")
        
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 8 caractères")
        
        # Récupérer le hash du mot de passe actuel
        user_doc = await db.users.find_one({"email": current_user.email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        password_hash = user_doc.get("password_hash") or user_doc.get("password")
        if not password_hash:
            raise HTTPException(status_code=500, detail="Erreur de configuration du mot de passe")
        
        # Vérifier l'ancien mot de passe
        if not pwd_context.verify(old_password, password_hash):
            raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
        
        # Hasher et enregistrer le nouveau mot de passe
        new_hashed_password = pwd_context.hash(new_password)
        await db.users.update_one(
            {"email": current_user.email},
            {"$set": {"password_hash": new_hashed_password}}
        )
        
        logger.info(f"Password changed successfully for user: {current_user.email}")
        return {"status": "ok", "message": "Mot de passe mis à jour avec succès"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du changement de mot de passe")

# ==================== PAGE ROUTES ====================

@api_router.get("/pages", response_model=List[Page])
async def get_pages(published_only: bool = False, skip: int = 0, limit: int = 100):
    """Get all pages"""
    query = {"published": True} if published_only else {}
    pages = await db.pages.find(query, {"_id": 0}).skip(skip).limit(min(limit, 100)).to_list(limit)
    for page in pages:
        if isinstance(page.get('created_at'), str):
            page['created_at'] = datetime.fromisoformat(page['created_at'])
        if isinstance(page.get('updated_at'), str):
            page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return pages

@api_router.get("/pages/{slug}", response_model=Page)
async def get_page(slug: str):
    """Get page by slug"""
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    if isinstance(page.get('created_at'), str):
        page['created_at'] = datetime.fromisoformat(page['created_at'])
    if isinstance(page.get('updated_at'), str):
        page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return page

@api_router.post("/pages", response_model=Page)
async def create_page(page_create: PageCreate, current_user: User = Depends(get_current_user)):
    """Create a new page"""
    # Check if slug exists
    existing = await db.pages.find_one({"slug": page_create.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")
    
    page = Page(**page_create.model_dump())
    page_doc = page.model_dump()
    page_doc['created_at'] = page_doc['created_at'].isoformat()
    page_doc['updated_at'] = page_doc['updated_at'].isoformat()
    
    await db.pages.insert_one(page_doc)
    return page

@api_router.put("/pages/{slug}", response_model=Page)
async def update_page(slug: str, page_update: PageUpdate, current_user: User = Depends(get_current_user)):
    """Update a page"""
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_data = {k: v for k, v in page_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.pages.update_one({"slug": slug}, {"$set": update_data})
    
    updated_page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if isinstance(updated_page.get('created_at'), str):
        updated_page['created_at'] = datetime.fromisoformat(updated_page['created_at'])
    if isinstance(updated_page.get('updated_at'), str):
        updated_page['updated_at'] = datetime.fromisoformat(updated_page['updated_at'])
    return updated_page

@api_router.delete("/pages/{slug}")
async def delete_page(slug: str, current_user: User = Depends(get_admin_user)):
    """Delete a page (admin only)"""
    result = await db.pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted successfully"}

# ==================== PACK ROUTES (CRUD) ====================

@api_router.post("/packs", response_model=Pack)
async def create_pack(pack_create: PackCreate, current_user: User = Depends(get_current_user)):
    """Create a new pack"""
    pack = Pack(**pack_create.model_dump())
    pack_doc = pack.model_dump()
    pack_doc['created_at'] = pack_doc['created_at'].isoformat()
    await db.packs.insert_one(pack_doc)
    return pack

@api_router.put("/packs/{pack_id}", response_model=Pack)
async def update_pack(pack_id: str, pack_update: PackCreate, current_user: User = Depends(get_current_user)):
    """Update a pack"""
    pack = await db.packs.find_one({"id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    update_data = pack_update.model_dump()
    await db.packs.update_one({"id": pack_id}, {"$set": update_data})
    
    updated_pack = await db.packs.find_one({"id": pack_id}, {"_id": 0})
    if isinstance(updated_pack.get('created_at'), str):
        updated_pack['created_at'] = datetime.fromisoformat(updated_pack['created_at'])
    return updated_pack

@api_router.delete("/packs/{pack_id}")
async def delete_pack(pack_id: str, current_user: User = Depends(get_admin_user)):
    """Delete a pack (admin only)"""
    result = await db.packs.delete_one({"id": pack_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pack not found")
    return {"message": "Pack deleted successfully"}

# ==================== PRICING RULES ROUTES ====================

@api_router.get("/pricing-rules", response_model=List[PricingRule])
async def get_pricing_rules(skip: int = 0, limit: int = 50):
    """Get all pricing rules"""
    rules = await db.pricing_rules.find({}, {"_id": 0}).skip(skip).limit(min(limit, 50)).to_list(limit)
    return rules

@api_router.post("/pricing-rules", response_model=PricingRule)
async def create_pricing_rule(rule_create: PricingRuleCreate, current_user: User = Depends(get_current_user)):
    """Create a new pricing rule"""
    rule = PricingRule(**rule_create.model_dump())
    await db.pricing_rules.insert_one(rule.model_dump())
    return rule

@api_router.put("/pricing-rules/{rule_id}", response_model=PricingRule)
async def update_pricing_rule(rule_id: str, rule_update: PricingRuleCreate, current_user: User = Depends(get_current_user)):
    """Update a pricing rule"""
    result = await db.pricing_rules.update_one({"id": rule_id}, {"$set": rule_update.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    updated_rule = await db.pricing_rules.find_one({"id": rule_id}, {"_id": 0})
    return updated_rule

@api_router.delete("/pricing-rules/{rule_id}")
async def delete_pricing_rule(rule_id: str, current_user: User = Depends(get_admin_user)):
    """Delete a pricing rule (admin only)"""
    result = await db.pricing_rules.delete_one({"id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    return {"message": "Pricing rule deleted successfully"}

@api_router.get("/pricing/country/{country_code}")
async def get_price_for_country(country_code: str):
    """Get pricing for a specific country"""
    rule = await db.pricing_rules.find_one(
        {"country_codes": country_code.upper(), "active": True},
        {"_id": 0}
    )
    if rule:
        return {"price": rule["price"], "currency": rule["currency"], "zone": rule["zone_name"]}
    
    # Default pricing if no rule found
    default_rule = await db.pricing_rules.find_one({"zone_name": "DEFAULT"}, {"_id": 0})
    if default_rule:
        return {"price": default_rule["price"], "currency": default_rule["currency"], "zone": "DEFAULT"}
    
    return {"price": 3000, "currency": "EUR", "zone": "default"}

@api_router.post("/pricing-rules/calculate")
async def calculate_pack_price(request: dict):
    """Calculate pack price based on zone with detailed display formats"""
    pack_id = request.get("pack_id")
    zone = request.get("zone", "DEFAULT")
    
    if not pack_id:
        raise HTTPException(status_code=400, detail="pack_id is required")
    
    # Get the pack
    pack = await db.packs.find_one({"id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    base_price = pack.get("base_price", 0)
    
    # Get pricing rule for zone
    pricing_rule = await db.pricing_rules.find_one({"zone_name": zone.upper(), "active": True}, {"_id": 0})
    if not pricing_rule:
        # Fallback to DEFAULT zone
        pricing_rule = await db.pricing_rules.find_one({"zone_name": "DEFAULT", "active": True}, {"_id": 0})
    
    if not pricing_rule:
        raise HTTPException(status_code=500, detail="No pricing rule available")
    
    multiplier = pricing_rule.get("price", 1.0)
    currency = pricing_rule.get("currency", "EUR")
    
    # Calculate final price
    final_price = base_price * multiplier
    
    # Currency symbols
    currency_symbols = {
        "EUR": "€",
        "USD": "$",
        "ILS": "₪",
        "GBP": "£"
    }
    symbol = currency_symbols.get(currency, currency)
    
    # Format display prices
    def format_price(amount):
        """Format price with proper thousands separator"""
        return f"{int(amount):,}".replace(",", " ")
    
    return {
        "zone": zone,
        "currency": currency,
        "multiplier": multiplier,
        "base_price": base_price,
        "final_price": final_price,
        "display": {
            "total": f"{format_price(final_price)} {symbol}",
            "three_times": f"3 x {format_price(final_price / 3)} {symbol}",
            "twelve_times": f"12 x {format_price(final_price / 12)} {symbol}"
        }
    }

# ==================== TRANSLATION ROUTES ====================

@api_router.get("/translations", response_model=List[Translation])
async def get_translations(skip: int = 0, limit: int = 100):
    """Get all translations"""
    translations = await db.translations.find({}, {"_id": 0}).skip(skip).limit(min(limit, 100)).to_list(limit)
    return translations

@api_router.post("/translations", response_model=Translation)
async def create_translation(translation_create: TranslationCreate, current_user: User = Depends(get_current_user)):
    """Create a new translation"""
    existing = await db.translations.find_one({"key": translation_create.key})
    if existing:
        raise HTTPException(status_code=400, detail="Translation key already exists")
    
    translation = Translation(**translation_create.model_dump())
    await db.translations.insert_one(translation.model_dump())
    return translation

@api_router.put("/translations/{key}", response_model=Translation)
async def update_translation(key: str, translation_update: TranslationCreate, current_user: User = Depends(get_current_user)):
    """Update a translation"""
    result = await db.translations.update_one(
        {"key": key},
        {"$set": {"translations": translation_update.translations}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Translation not found")
    updated = await db.translations.find_one({"key": key}, {"_id": 0})
    return updated

# ==================== ORDER ROUTES ====================

@api_router.post("/orders/create-payment-intent")
async def create_payment_intent(order_create: OrderCreate):
    """Create Stripe payment intent"""
    # Get pack
    pack = await db.packs.find_one({"id": order_create.pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Get pricing for country
    country_code = order_create.country_code or "FR"
    pricing_response = await get_price_for_country(country_code)
    amount = int(pricing_response["price"] * 100)  # Stripe uses cents
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=pricing_response["currency"].lower(),
            metadata={
                "pack_id": order_create.pack_id,
                "customer_email": order_create.customer_email,
                "customer_name": order_create.customer_name
            }
        )
        
        # Create order
        order = Order(
            customer_email=order_create.customer_email,
            customer_name=order_create.customer_name,
            pack_id=order_create.pack_id,
            amount=pricing_response["price"],
            currency=pricing_response["currency"],
            stripe_payment_intent_id=intent.id,
            status="pending",
            country_code=country_code
        )
        order_doc = order.model_dump()
        order_doc['created_at'] = order_doc['created_at'].isoformat()
        await db.orders.insert_one(order_doc)
        
        return {
            "client_secret": intent.client_secret,
            "order_id": order.id,
            "amount": pricing_response["price"],
            "currency": pricing_response["currency"]
        }
    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/orders/{order_id}/confirm")
async def confirm_order(order_id: str):
    """Confirm order payment"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status
    await db.orders.update_one({"id": order_id}, {"$set": {"status": "completed"}})
    
    return {"message": "Order confirmed", "order_id": order_id}

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 100):
    """Get all orders (admin/editor only)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(min(limit, 100)).to_list(limit)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

# ==================== LEGACY ADMIN ROUTES ====================

class PackData(BaseModel):
    analyse: dict
    succursales: dict
    franchise: dict

@api_router.post("/admin/save-content")
async def save_content(request: Request, data: dict):
    """Sauvegarder tout le contenu du site (protégé par password)"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = auth_header.replace("Bearer ", "")
    
    if token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    try:
        # Sauvegarder dans content.json
        content_file = Path(__file__).parent / ".." / "frontend" / "public" / "content.json"
        content_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(content_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info("Content saved successfully")
        
        return {
            "success": True,
            "message": "Contenu sauvegardé avec succès",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error saving content: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving content: {str(e)}")

@api_router.post("/admin/save-packs")
async def save_packs(request: Request, packs_data: PackData):
    """Sauvegarder les données des packs (protégé par password)"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = auth_header.replace("Bearer ", "")
    
    if token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    try:
        # Sauvegarder dans un fichier JSON accessible au frontend
        packs_file = Path(__file__).parent / ".." / "frontend" / "public" / "packs-data.json"
        packs_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(packs_file, 'w', encoding='utf-8') as f:
            json.dump(packs_data.model_dump(), f, ensure_ascii=False, indent=2)
        
        logger.info("Packs data saved successfully")
        
        return {
            "success": True,
            "message": "Packs sauvegardés avec succès",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error saving packs: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving packs: {str(e)}")

@api_router.post("/admin/save-content")
async def save_content(content: dict, request: Request):
    """Save content.json from admin interface"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = auth_header.replace("Bearer ", "")
    
    if token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    try:
        # Sauvegarder dans content.json
        content_file = Path(__file__).parent / ".." / "frontend" / "public" / "content.json"
        content_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(content_file, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        
        logger.info("Content saved successfully")
        
        return {
            "success": True,
            "message": "Contenu sauvegardé avec succès",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error saving content: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving content: {str(e)}")

# ==================== Include API Router ====================
# Les routes du api_router seront préfixées par /api
# Donc @api_router.post("/contact") devient POST /api/contact
app.include_router(api_router)

# Include CMS router
app.include_router(cms_router)

# ==================== Lifecycle Events ====================
@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    client.close()
    logger.info("MongoDB connection closed")

