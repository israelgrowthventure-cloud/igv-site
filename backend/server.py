from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import asyncio

# Import pricing configuration
from pricing_config import (
    get_all_packs,
    calculate_price,
    get_zone_from_country_code,
    ZONE_MAPPING
)

# Import route modules
try:
    from auth_routes import router as auth_router
    from crm_routes import router as crm_router
    from cms_routes import router as cms_router
    from payment_routes import router as payment_router
except ImportError as e:
    logging.warning(f"Could not import route modules: {e}")
    auth_router = None
    crm_router = None
    cms_router = None
    payment_router = None


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'igv_db')]

# Create the main app without a prefix
app = FastAPI()

# Security middleware for HTTPS redirect and headers
@app.middleware("http")
async def security_middleware(request, call_next):
    response = await call_next(request)
    
    # Add security headers
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://ipapi.co"
    )
    response.headers["Content-Security-Policy"] = csp
    
    return response

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
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
    zone: str
    country_code: str
    country_name: str
    currency: str
    symbol: str

class PriceRequest(BaseModel):
    pack_slug: str
    zone: str = "EU"


# Helper function to send email via Gmail SMTP
async def send_email_gmail(to_email: str, subject: str, body: str, html_body: str = None):
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        raise HTTPException(status_code=500, detail="SMTP credentials not configured")
    
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
        return True
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Israel Growth Venture API", "version": "3.0"}


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(contact: ContactForm):
    """Handle contact form submission"""
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
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    for contact in contacts:
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
    return contacts


# ==================== PACKS ENDPOINTS ====================
@api_router.get("/packs")
async def get_packs(active_only: bool = True):
    """Get all available packs with multilingual content"""
    packs = get_all_packs()
    if active_only:
        packs = [p for p in packs if p.get('active', True)]
    return {"data": packs}


@api_router.get("/packs/{pack_slug}")
async def get_pack_by_slug(pack_slug: str):
    """Get a specific pack by slug"""
    packs = get_all_packs()
    pack = next((p for p in packs if p['slug'] == pack_slug), None)
    if not pack:
        raise HTTPException(status_code=404, detail=f"Pack '{pack_slug}' not found")
    return {"data": pack}


# ==================== PRICING ENDPOINTS ====================
@api_router.post("/pricing/calculate")
async def calculate_pack_price(request: PriceRequest):
    """Calculate price for a pack in a specific zone"""
    try:
        price_data = calculate_price(request.pack_slug, request.zone)
        return {"data": price_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/pricing/{pack_slug}/{zone}")
async def get_pack_pricing(pack_slug: str, zone: str = "EU"):
    """Get pricing for a specific pack and zone"""
    try:
        price_data = calculate_price(pack_slug, zone.upper())
        return {"data": price_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== GEOLOCATION WITH TIMEOUT ====================
@api_router.get("/detect-location")
async def detect_location():
    """Detect user location with 1-second timeout and Europe fallback"""
    default_response = IPLocationResponse(
        zone='EU',
        country_code='FR',
        country_name='France',
        currency='EUR',
        symbol='€'
    )
    
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:  # 1 second timeout
            response = await client.get('https://ipapi.co/json/')
            data = response.json()
            
            country_code = data.get('country_code', 'FR')
            country_name = data.get('country_name', 'France')
            
            # Determine zone from country code
            zone = get_zone_from_country_code(country_code)
            zone_config = ZONE_MAPPING[zone]
            
            return IPLocationResponse(
                zone=zone,
                country_code=country_code,
                country_name=country_name,
                currency=zone_config['currency'],
                symbol=zone_config['symbol']
            )
    except asyncio.TimeoutError:
        logging.warning("Geolocation timeout (1s) - falling back to Europe")
        return default_response
    except Exception as e:
        logging.error(f"Error detecting location: {str(e)}")
        return default_response


# ==================== CART ENDPOINTS ====================
@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(item: CartItemCreate):
    """Add item to cart"""
    cart_obj = CartItem(**item.model_dump())
    doc = cart_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.cart.insert_one(doc)
    return cart_obj


@api_router.get("/cart", response_model=List[CartItem])
async def get_cart():
    """Get cart items"""
    items = await db.cart.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    return items


# Include the router in the main app
app.include_router(api_router)

# Include auth and CRM routers if available
if auth_router:
    app.include_router(auth_router)
if crm_router:
    app.include_router(crm_router)
if cms_router:
    app.include_router(cms_router)
if payment_router:
    app.include_router(payment_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
