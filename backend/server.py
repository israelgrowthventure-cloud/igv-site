from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import jwt
import hashlib
import hmac

# Import AI routes
from ai_routes import router as ai_router
from mini_analysis_routes import router as mini_analysis_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT & Admin configuration (from environment only)
JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
BOOTSTRAP_TOKEN = os.getenv('BOOTSTRAP_TOKEN')

# MongoDB connection with environment variable aliases (Render compatibility)
mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME', 'igv_production')

# Initialize MongoDB client (optional - will be None if not configured)
client = None
db = None
mongodb_status = "not_configured"

if mongo_url:
    try:
        # Configure MongoDB with timeout and connection pooling
        client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=1
        )
        db = client[db_name]
        mongodb_status = "configured"
        logging.info(f"MongoDB configured for database: {db_name}")
    except Exception as e:
        logging.error(f"MongoDB connection error: {str(e)}")
        mongodb_status = "error"
else:
    logging.warning("MongoDB not configured (MONGODB_URI or MONGO_URL not set)")

# Create the main app without a prefix
app = FastAPI()

# Debug endpoint to check router status
@app.get("/debug/routers")
async def debug_routers():
    """Debug endpoint to check if routers are loaded"""
    import sys
    return {
        "ai_router_loaded": 'ai_routes' in sys.modules,
        "mini_analysis_router_loaded": 'mini_analysis_routes' in sys.modules,
        "gemini_api_key_set": bool(os.getenv('GEMINI_API_KEY')),
        "gemini_api_key_length": len(os.getenv('GEMINI_API_KEY', '')),
        "mongodb_uri_set": bool(mongo_url),
        "db_name": db_name,
        "mongodb_status": mongodb_status
    }

# Ultra-light health check at root (no MongoDB dependency)
@app.get("/health")
async def root_health():
    """Ultra-fast health check - no database check"""
    return {"status": "ok", "service": "igv-backend", "version": "1.0.0"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "IGV Backend API", "status": "running"}

# CORS configuration - MUST be configured BEFORE routers
# Production domains explicitly allowed
cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS') or os.getenv('CORS_ORIGINS', '')

# Default production origins
default_origins = [
    "https://israelgrowthventure.com",
    "https://www.israelgrowthventure.com",
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000"   # Local development
]

# Merge environment origins with defaults
if cors_origins_env and cors_origins_env != '*':
    final_origins = list(set(default_origins + cors_origins_env.split(',')))
else:
    final_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=final_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Health check endpoint (REQUIRED for Render)
@api_router.get("/health")
async def health_check():
    """Health check endpoint with MongoDB status"""
    health_status = {
        "status": "ok",
        "mongodb": mongodb_status
    }
    
    if mongodb_status == "configured" and db is not None:
        try:
            # Test MongoDB connection with timeout
            import asyncio
            await asyncio.wait_for(db.command('ping'), timeout=3.0)
            health_status["mongodb"] = "connected"
            health_status["db"] = db_name
        except asyncio.TimeoutError:
            logging.error("MongoDB ping timeout")
            health_status["mongodb"] = "timeout"
        except Exception as e:
            logging.error(f"MongoDB ping failed: {str(e)}")
            health_status["mongodb"] = "error"
    
    return health_status


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

class CMSContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str  # 'home', 'about', 'packs', etc.
    language: str  # 'fr', 'en', 'he'
    content: Dict[str, Any]  # GrapesJS JSON content
    updated_by: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CMSContentCreate(BaseModel):
    page: str
    language: str
    content: Dict[str, Any]

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str = 'admin'  # 'admin', 'editor', 'viewer'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class MoneticopaymentRequest(BaseModel):
    pack_type: str  # 'analyse'
    amount: float
    currency: str
    customer_email: EmailStr
    customer_name: str
    language: str = 'fr'

# Security
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password

def create_jwt_token(email: str, role: str) -> str:
    """Create JWT token"""
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET not configured")
    
    payload = {
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET not configured")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    return verify_jwt_token(token)


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


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(contact: ContactForm):
    """Handle contact form submission"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
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
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    for contact in contacts:
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
    return contacts


@api_router.post("/cart", response_model=CartItem)
async def add_to_cart(item: CartItemCreate):
    """Add item to cart"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    cart_obj = CartItem(**item.model_dump())
    doc = cart_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.cart.insert_one(doc)
    return cart_obj


@api_router.get("/cart", response_model=List[CartItem])
async def get_cart():
    """Get cart items"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    items = await db.cart.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    return items


@api_router.get("/detect-location")
async def detect_location(request: Request):
    """Detect user location based on IP using ipapi.co"""
    try:
        # Get client IP from request headers (Render/CloudFlare forward the real IP)
        client_ip = request.headers.get('X-Forwarded-For', '').split(',')[0].strip()
        if not client_ip:
            client_ip = request.headers.get('X-Real-IP', '')
        
        async with httpx.AsyncClient() as client:
            # Get location from client IP
            if client_ip:
                response = await client.get(f'https://ipapi.co/{client_ip}/json/', timeout=5.0)
            else:
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


# ============================================================
# CMS Endpoints (Protected)
# ============================================================

@api_router.get("/cms/content")
async def get_cms_content(page: str, language: str = 'fr', user: Dict = Depends(get_current_user)):
    """Get CMS content for a specific page and language (protected)"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    content = await db.cms_content.find_one(
        {"page": page, "language": language},
        {"_id": 0}
    )
    
    if not content:
        return {"page": page, "language": language, "content": {}}
    
    return content

@api_router.post("/cms/content")
async def save_cms_content(data: CMSContentCreate, user: Dict = Depends(get_current_user)):
    """Save CMS content (protected, admin/editor only)"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    if user['role'] not in ['admin', 'editor']:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    content_obj = CMSContent(
        page=data.page,
        language=data.language,
        content=data.content,
        updated_by=user['email']
    )
    
    # Upsert: update if exists, insert if not
    await db.cms_content.update_one(
        {"page": data.page, "language": data.language},
        {"$set": content_obj.model_dump()},
        upsert=True
    )
    
    return {"message": "Content saved successfully", "id": content_obj.id}


# ============================================================
# Admin/CRM Endpoints
# ============================================================

@api_router.post("/admin/bootstrap")
async def bootstrap_admin(token: str):
    """Bootstrap admin account (protected by BOOTSTRAP_TOKEN)"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    if not BOOTSTRAP_TOKEN:
        raise HTTPException(status_code=500, detail="BOOTSTRAP_TOKEN not configured")
    
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="ADMIN_EMAIL or ADMIN_PASSWORD not configured")
    
    if token != BOOTSTRAP_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid bootstrap token")
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing_admin:
        return {"message": "Admin already exists", "email": ADMIN_EMAIL}
    
    # Create admin user
    admin_user = AdminUser(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        role='admin'
    )
    
    await db.users.insert_one(admin_user.model_dump())
    
    return {"message": "Admin created successfully", "email": ADMIN_EMAIL}

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLoginRequest):
    """Admin login - returns JWT token"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user['email'], user['role'])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user['role']
    }

@api_router.get("/admin/contacts")
async def get_all_contacts(user: Dict = Depends(get_current_user)):
    """Get all contacts (admin only)"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    if user['role'] not in ['admin', 'editor', 'viewer']:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    contacts = await db.contacts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return contacts

@api_router.get("/admin/stats")
async def get_stats(user: Dict = Depends(get_current_user)):
    """Get dashboard statistics (admin)"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    if user['role'] not in ['admin', 'editor', 'viewer']:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    total_contacts = await db.contacts.count_documents({})
    total_carts = await db.cart.count_documents({})
    
    return {
        "total_contacts": total_contacts,
        "total_carts": total_carts,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


# ============================================================
# Monetico Payment Endpoints
# ============================================================

def generate_monetico_mac(data: Dict[str, str], key: str) -> str:
    """Generate Monetico MAC signature"""
    # Concatenate values in specific order
    message = '*'.join([
        data.get('TPE', ''),
        data.get('date', ''),
        data.get('montant', ''),
        data.get('reference', ''),
        data.get('texte-libre', ''),
        data.get('version', '3.0'),
        data.get('lgue', 'FR'),
        data.get('societe', ''),
        data.get('mail', '')
    ])
    
    # Create HMAC-SHA1 signature
    mac = hmac.new(key.encode(), message.encode(), hashlib.sha1).hexdigest()
    return mac

@api_router.post("/monetico/init-payment")
async def init_monetico_payment(payment: MoneticopaymentRequest):
    """Initialize Monetico payment (Pack Analyse only)"""
    
    # Get Monetico config from environment
    monetico_tpe = os.getenv('MONETICO_TPE')
    monetico_key = os.getenv('MONETICO_KEY')
    monetico_company = os.getenv('MONETICO_COMPANY_CODE')
    monetico_mode = os.getenv('MONETICO_MODE', 'TEST')
    
    if not all([monetico_tpe, monetico_key, monetico_company]):
        raise HTTPException(status_code=500, detail="Monetico not configured")
    
    # Only Pack Analyse is payable via Monetico
    if payment.pack_type != 'analyse':
        raise HTTPException(status_code=400, detail="Only Pack Analyse is available for online payment")
    
    # Generate unique reference
    reference = f"IGV-{payment.pack_type.upper()}-{uuid.uuid4().hex[:8]}"
    
    # Prepare payment data
    payment_data = {
        'TPE': monetico_tpe,
        'date': datetime.now(timezone.utc).strftime('%d/%m/%Y:%H:%M:%S'),
        'montant': f"{payment.amount:.2f}{payment.currency}",
        'reference': reference,
        'texte-libre': f"Pack {payment.pack_type}",
        'version': '3.0',
        'lgue': payment.language.upper(),
        'societe': monetico_company,
        'mail': payment.customer_email
    }
    
    # Generate MAC
    mac = generate_monetico_mac(payment_data, monetico_key)
    payment_data['MAC'] = mac
    
    # Return payment form data
    return {
        "reference": reference,
        "payment_url": f"https://p.monetico-services.com/paiement.cgi" if monetico_mode == 'PRODUCTION' else "https://p.monetico-services.com/test/paiement.cgi",
        "form_data": payment_data
    }

@api_router.post("/monetico/callback")
async def monetico_callback(data: Dict[str, Any]):
    """Handle Monetico payment callback"""
    # Log callback for debugging
    logging.info(f"Monetico callback received: {data}")
    
    # TODO: Verify MAC, store payment result, send confirmation email, generate PDF invoice
    
    return {"version": "3.0", "cdr": "0"}  # Acknowledge receipt


# Include the routers in the main app
app.include_router(api_router)
app.include_router(ai_router)  # AI Insight generation
app.include_router(mini_analysis_router)  # Mini-Analysis with Gemini

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
