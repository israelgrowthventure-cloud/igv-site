from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (aliases supported)
mongo_url = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URL')
if not mongo_url:
    raise RuntimeError('Missing MongoDB connection string (MONGODB_URI or MONGO_URL)')

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME') or os.environ.get('MONGO_DB_NAME') or 'igv_cms_db'
db = client[db_name]

# Create the main app without a prefix
app = FastAPI()

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
    region: str
    country: str
    currency: str


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
    return {"message": "Israel Growth Venture API"}


@api_router.get("/health")
async def health():
    """Lightweight healthcheck for Render."""
    db_status = "unknown"

    try:
        await db.command("ping")
        db_status = "ok"
    except Exception as exc:  # pragma: no cover - best effort only
        logging.error("Healthcheck ping failed: %s", exc)
        db_status = "error"

    return {"status": "ok", "db": db_status}


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


@api_router.get("/detect-location")
async def detect_location():
    """Detect user location based on IP using ipapi.co"""
    try:
        async with httpx.AsyncClient() as client:
            # Get client IP from ipapi.co
            response = await client.get('https://ipapi.co/json/', timeout=5.0)
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
            
            return IPLocationResponse(
                region=region,
                country=country_name,
                currency=currency
            )
    except Exception as e:
        logging.error(f"Error detecting location: {str(e)}")
        # Default to Europe if detection fails
        return IPLocationResponse(
            region='europe',
            country='France',
            currency='€'
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=(os.environ.get('CORS_ALLOWED_ORIGINS') or os.environ.get('CORS_ORIGINS') or '*').split(','),
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
