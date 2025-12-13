from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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

# MongoDB Import Guard
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    HAS_MONGO = True
except ImportError:
    HAS_MONGO = False
    AsyncIOMotorClient = None
    logging.warning("MongoDB driver (motor) not found. running in Skeleton Mode.")

# Import pricing configuration
try:
    from pricing_config import (
        get_all_packs,
        calculate_price,
        get_zone_from_country_code,
        ZONE_MAPPING
    )
except ImportError as e:
    logging.warning(f"Could not import pricing config: {e}")
    # Minimal Fallbacks
    get_all_packs = lambda: []
    calculate_price = lambda s, z: {}
    get_zone_from_country_code = lambda c: 'EU'
    ZONE_MAPPING = {}

# Track import errors for debugging
import_errors = []

# --- ROUTER IMPORTS (CONDITIONAL WITH GUARDS) ---
try:
    from auth_routes import router as auth_router, get_current_user
except Exception as e:
    import_errors.append({"module": "auth_routes", "error": str(e)})
    auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
    @auth_router.get("/status")
    async def auth_disabled():
        return {"status": "disabled", "reason": "Auth module failed to load"}

try:
    from crm_routes import router as crm_router
except Exception as e:
    import_errors.append({"module": "crm_routes", "error": str(e)})
    crm_router = APIRouter(prefix="/api/crm", tags=["crm"])
    @crm_router.get("/status")
    async def crm_disabled():
        return {"status": "disabled", "reason": "CRM module failed to load"}

try:
    from cms_routes import router as cms_router
except Exception as e:
    import_errors.append({"module": "cms_routes", "error": str(e)})
    cms_router = APIRouter(prefix="/api/cms", tags=["cms"])
    @cms_router.get("/status")
    async def cms_disabled():
        return {"status": "disabled", "reason": "CMS module failed to load"}

try:
    from payment_routes import router as payment_router
except Exception as e:
    import_errors.append({"module": "payment_routes", "error": str(e)})
    payment_router = APIRouter(prefix="/api/payment", tags=["payment"])
    @payment_router.get("/status")
    async def payment_disabled():
        return {"status": "disabled", "reason": "Payment module failed to load"}

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app (SINGLE DECLARATION)
app = FastAPI(title="IGV V3 API", version="3.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

# MongoDB connection (Conditional)
client = None
db = None
if HAS_MONGO:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME', 'igv_db')]
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {e}")

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

@api_router.get("/debug/imports")
async def get_import_errors():
    return {
        "status": "ok", 
        "errors": import_errors,
        "has_mongo": HAS_MONGO,
        "mongo_connected": client is not None,
        "env_keys": [k for k in os.environ.keys() if "KEY" not in k and "SECRET" not in k and "PASS" not in k]
    }


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

@api_router.get("/health")
async def health_check():
    """Health check endpoint for Render - ALWAYS returns 200"""
    health_data = {
        "status": "ok", 
        "version": "3.0",
        "mongodb": "connected" if client else "disconnected",
        "modules": {
            "auth": len([e for e in import_errors if e.get("module") == "auth_routes"]) == 0,
            "cms": len([e for e in import_errors if e.get("module") == "cms_routes"]) == 0,
            "crm": len([e for e in import_errors if e.get("module") == "crm_routes"]) == 0,
            "payment": len([e for e in import_errors if e.get("module") == "payment_routes"]) == 0
        }
    }
    return health_data


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(contact: ContactForm):
    """Handle contact form submission"""
    contact_dict = contact.model_dump()
    contact_obj = ContactResponse(**contact_dict)
    
    if client:
        # Save to MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.contacts.insert_one(doc)
    else:
        logging.warning("MongoDB not available, contact not saved")
    
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
    # await send_email_gmail(recipient_email, email_subject, email_body, html_body)
    # Temporarily disabled email sending in skeleton mode to avoid SMTP errors without env vars
    
    return contact_obj


@api_router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts():
    """Get all contacts (admin)"""
    if not client:
        return []
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
    if client:
        doc = cart_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.cart.insert_one(doc)
    return cart_obj


@api_router.get("/cart", response_model=List[CartItem])
async def get_cart():
    """Get cart items"""
    if not client:
        return []
    items = await db.cart.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    return items


# Include the router in the main app
app.include_router(api_router)

# Include auth and CRM routers (Mandatory V3)
app.include_router(auth_router)
app.include_router(crm_router)
app.include_router(cms_router)
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
    if client:
        client.close()
