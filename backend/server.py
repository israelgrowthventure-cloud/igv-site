from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'igv_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Modèles Pydantic ====================

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
    
    # Fallback par défaut
    default_response = GeoResponse(
        ip=client_ip,
        country_code="FR",
        country_name="France",
        zone=Zone.EU
    )
    
    # Si IP locale, retourner le défaut
    if client_ip in ["127.0.0.1", "localhost", "::1"]:
        logger.info("Local IP detected, using EU default")
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
    Si zone n'est pas fournie, utilise EU par défaut.
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
        zone = Zone.EU
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
        zone=zone,
        currency=currency,
        currency_symbol=currency_symbol,
        total_price=total_price,
        monthly_3x=monthly_3x,
        monthly_12x=monthly_12x,
        display=display
    )

# ==================== Health Check Route ====================
if not STRIPE_SECRET_KEY:
    logger.warning("STRIPE_SECRET_KEY not set in .env — Stripe will not work until configured.")
stripe.api_key = STRIPE_SECRET_KEY

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
    return {"status": "ok", "message": "Backend IGV est opérationnel"}

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
                success_url=f"{FRONTEND_URL}/packs?payment=success",
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
                success_url=f"{FRONTEND_URL}/packs?payment=success",
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

ADMIN_PASSWORD = "igv2025"

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

# ==================== Lifecycle Events ====================
@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    client.close()
    logger.info("MongoDB connection closed")

