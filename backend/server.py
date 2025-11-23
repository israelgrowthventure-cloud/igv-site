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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'igv_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ==================== CREATE APP ====================
app = FastAPI(title="IGV Backend", version="1.0.0")

# ==================== CORS CONFIGURATION ====================
# ✅ PLACER ICI : après app = FastAPI(), avant les routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend React (port 3000)
        "http://localhost:3001",      # Frontend React (port 3001)
        "http://localhost:5173",      # Vite dev server
        "https://israelgrowthventure.com",
        "https://www.israelgrowthventure.com"
    ],
    allow_credentials=True,           # Autoriser les cookies
    allow_methods=["*"],              # Autoriser tous les verbes (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],              # Autoriser tous les headers
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


class CheckoutResponse(BaseModel):
    orderId: str
    paymentUrl: Optional[str]
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

@app.post("/api/checkout", response_model=CheckoutResponse)
async def create_checkout_session(checkout: CheckoutRequest):
    """
    Crée une session Stripe Checkout et retourne l'URL de paiement.
    """
    logger.info(f"Checkout request received for pack: {checkout.packId}")
    valid_packs = set(PACK_PRICES_EUR.keys())
    if checkout.packId not in valid_packs:
        logger.error(f"Invalid pack ID: {checkout.packId}")
        raise HTTPException(status_code=400, detail=f"Pack invalide. Valeurs acceptées: {', '.join(valid_packs)}")

    # Obtenir montant
    amount = PACK_PRICES_EUR.get(checkout.packId)
    if not amount:
        logger.error("No amount configured for pack")
        raise HTTPException(status_code=500, detail="Montant du pack non configuré")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": checkout.packName,
                        "description": f"{checkout.packName} - {checkout.priceLabel}"
                    },
                    "unit_amount": amount,
                },
                "quantity": 1,
            }],
            customer_email=checkout.customer.email,
            metadata={
                "order_pack_id": checkout.packId,
                "order_customer_name": checkout.customer.fullName,
            },
            success_url="http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=f"http://localhost:3000/checkout/{checkout.packId}",
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating session: {str(e)}")
        raise HTTPException(status_code=502, detail="Erreur de création de session de paiement")

    # Création de la commande locale / logging (optionnel)
    order_id = create_order_in_db(checkout)

    return CheckoutResponse(orderId=order_id, paymentUrl=session.url, message="Redirection vers Stripe Checkout")


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
