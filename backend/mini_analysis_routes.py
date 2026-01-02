"""
Mini-Analysis Routes for Israel Growth Venture
Handles brand analysis requests with Gemini AI + IGV internal data
"""

from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
import google.genai as genai
import traceback

# PDF generation
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from io import BytesIO
    import base64
    PDF_AVAILABLE = True
except ImportError:
    logging.warning("reportlab not available - PDF generation will fail")
    PDF_AVAILABLE = False

# Email
try:
    import aiosmtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders
    EMAIL_AVAILABLE = True
except ImportError:
    logging.warning("Email libraries not available")
    EMAIL_AVAILABLE = False

router = APIRouter(prefix="/api")

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# PRODUCTION MODEL: gemini-2.5-flash (verified working with google-genai 0.2.2)
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

gemini_client = None

if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        key_length = len(GEMINI_API_KEY)
        logging.info(f"✅ Gemini client initialized successfully")
        logging.info(f"✅ Gemini model used: {GEMINI_MODEL}")
        logging.info(f"✅ GEMINI_API_KEY present: yes, length: {key_length}")
    except Exception as e:
        logging.error(f"❌ Gemini client initialization failed: {str(e)}")
        gemini_client = None
else:
    logging.warning("⚠️ GEMINI_API_KEY not configured - mini-analysis endpoint will fail")

# Diagnostic endpoint for Gemini API (defined AFTER configuration)
@router.get("/diag-gemini")
async def diagnose_gemini():
    """Quick diagnostic endpoint to test Gemini API (10 seconds max)"""
    
    if not GEMINI_API_KEY:
        return {
            "ok": False,
            "model": None,
            "error": "GEMINI_API_KEY not configured"
        }
    
    if gemini_client is None:
        return {
            "ok": False,
            "model": GEMINI_MODEL,
            "error": "Gemini client not initialized"
        }
    
    # Quick test API call
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=['Hello']
        )
        result_text = response.text if hasattr(response, 'text') else str(response)
        
        return {
            "ok": True,
            "model": GEMINI_MODEL,
            "test_response": result_text[:50]
        }
    except Exception as e:
        return {
            "ok": False,
            "model": GEMINI_MODEL,
            "error": str(e)
        }

# MongoDB connection (from server.py)
mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME', 'igv_production')

# SMTP Config - Support both naming conventions
SMTP_SERVER = os.getenv('SMTP_SERVER') or os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME') or os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
SMTP_FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL') or os.getenv('SMTP_FROM', 'israel.growth.venture@gmail.com')
SMTP_FROM_NAME = os.getenv('SMTP_FROM_NAME', 'Israel Growth Venture')

# Company info
COMPANY_NAME = "Israel Growth Venture"
COMPANY_EMAIL = "israel.growth.venture@gmail.com"
COMPANY_WEBSITE = "israelgrowthventure.com"

# MongoDB client et db seront initialisés à la demande
mongo_client = None
db = None

def get_db():
    """Lazy initialization of MongoDB connection"""
    global mongo_client, db
    if db is None and mongo_url:
        mongo_client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        db = mongo_client[db_name]
    return db

# IGV internal data paths
IGV_INTERNAL_DIR = Path(__file__).parent / 'igv_internal'
TYPES_FILE = IGV_INTERNAL_DIR / 'IGV_Types_Emplacements_Activites.txt'
WHITELIST_JEWISH = IGV_INTERNAL_DIR / 'Whitelist_1_Jewish_incl_Mixed.txt'
WHITELIST_ARAB = IGV_INTERNAL_DIR / 'Whitelist_2_Arabe_incl_Mixed.txt'

# Master Prompts directory
PROMPTS_DIR = Path(__file__).parent / 'prompts'
PROMPT_RESTAURATION = PROMPTS_DIR / 'MASTER_PROMPT_RESTAURATION.txt'
PROMPT_RETAIL = PROMPTS_DIR / 'MASTER_PROMPT_RETAIL_NON_FOOD.txt'
PROMPT_SERVICES = PROMPTS_DIR / 'MASTER_PROMPT_SERVICES_PARAMEDICAL.txt'


def generate_mini_analysis_pdf(brand_name: str, analysis_text: str, language: str = "fr") -> bytes:
    """Generate mini-analysis PDF with IGV header"""
    if not PDF_AVAILABLE:
        raise Exception("PDF generation not available - reportlab not installed")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#4b5563'),
        alignment=TA_CENTER
    )
    
    # IGV Header
    story.append(Paragraph(COMPANY_NAME, title_style))
    story.append(Paragraph(f"{COMPANY_EMAIL} | {COMPANY_WEBSITE}", header_style))
    story.append(Spacer(1, 1*cm))
    
    # Title
    title_text = {
        "fr": f"Mini-Analyse de Marché - {brand_name}",
        "en": f"Market Mini-Analysis - {brand_name}",
        "he": f"מיני-אנליזה שוק - {brand_name}"
    }.get(language, f"Mini-Analyse de Marché - {brand_name}")
    
    story.append(Paragraph(title_text, styles['Heading2']))
    story.append(Spacer(1, 0.5*cm))
    
    # Date
    date_label = {
        "fr": "Généré le:",
        "en": "Generated on:",
        "he": "נוצר בתאריך:"
    }.get(language, "Généré le:")
    
    story.append(Paragraph(f"<i>{date_label} {datetime.now(timezone.utc).strftime('%d/%m/%Y')}</i>", styles['Normal']))
    story.append(Spacer(1, 1*cm))
    
    # Analysis content - split into paragraphs
    paragraphs = analysis_text.split('\n\n')
    for para in paragraphs:
        if para.strip():
            # Handle bullet points
            if para.strip().startswith('-') or para.strip().startswith('•'):
                lines = para.split('\n')
                for line in lines:
                    if line.strip():
                        story.append(Paragraph(line.strip(), styles['Normal']))
                story.append(Spacer(1, 0.3*cm))
            else:
                story.append(Paragraph(para.strip(), styles['Normal']))
                story.append(Spacer(1, 0.5*cm))
    
    # Footer
    story.append(Spacer(1, 1*cm))
    footer_text = {
        "fr": "Ce document est une analyse préliminaire générée par IA. Pour un accompagnement complet, contactez-nous.",
        "en": "This document is a preliminary AI-generated analysis. For complete support, contact us.",
        "he": "מסמך זה הוא ניתוח ראשוני שנוצר על ידי AI. לליווי מלא, צור איתנו קשר."
    }.get(language, "Ce document est une analyse préliminaire générée par IA.")
    
    story.append(Paragraph(f"<i>{footer_text}</i>", header_style))
    
    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


async def send_mini_analysis_email(email: str, brand_name: str, pdf_bytes: bytes, language: str = "fr") -> dict:
    """Send mini-analysis email with PDF attachment"""
    if not EMAIL_AVAILABLE or not SMTP_USERNAME or not SMTP_PASSWORD:
        logging.warning("Email not configured - skipping email send")
        return {"success": False, "error": "Email not configured"}
    
    try:
        # Create message
        message = MIMEMultipart()
        message['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message['To'] = email
        message['Bcc'] = COMPANY_EMAIL  # Copy to company
        message['Subject'] = {
            "fr": f"Votre Mini-Analyse IGV - {brand_name}",
            "en": f"Your IGV Mini-Analysis - {brand_name}",
            "he": f"המיני-אנליזה שלך מ-IGV - {brand_name}"
        }.get(language, f"Votre Mini-Analyse IGV - {brand_name}")
        
        # Email body
        body_template = {
            "fr": f"""Bonjour,

Merci d'avoir utilisé notre service de mini-analyse gratuite !

Vous trouverez ci-joint votre analyse de marché personnalisée pour {brand_name}.

Cette analyse est un premier aperçu des opportunités d'expansion de votre marque en Israël. Pour un accompagnement complet et une étude approfondie, nos experts sont à votre disposition.

📞 Réservez un appel gratuit de 30 minutes :
https://israelgrowthventure.com/appointment

📦 Découvrez nos packs d'accompagnement :
https://israelgrowthventure.com/packs

Cordialement,
L'équipe Israel Growth Venture

{COMPANY_EMAIL}
{COMPANY_WEBSITE}
""",
            "en": f"""Hello,

Thank you for using our free mini-analysis service!

Please find attached your personalized market analysis for {brand_name}.

This analysis is a first overview of your brand's expansion opportunities in Israel. For complete support and an in-depth study, our experts are at your disposal.

📞 Book a free 30-minute call:
https://israelgrowthventure.com/appointment

📦 Discover our support packages:
https://israelgrowthventure.com/packs

Best regards,
Israel Growth Venture Team

{COMPANY_EMAIL}
{COMPANY_WEBSITE}
""",
            "he": f"""שלום,

תודה שהשתמשת בשירות המיני-אנליזה החינמי שלנו!

בצרוף תמצא את הניתוח האישי שלך עבור {brand_name}.

ניתוח זה הוא סקירה ראשונית של הזדמנויות ההתרחבות של המותג שלך בישראל. לליווי מלא ומחקר מעמיק, המומחים שלנו לרשותך.

📞 קבע שיחה חינמית של 30 דקות:
https://israelgrowthventure.com/appointment

📦 גלה את חבילות הליווי שלנו:
https://israelgrowthventure.com/packs

בברכה,
צוות Israel Growth Venture

{COMPANY_EMAIL}
{COMPANY_WEBSITE}
"""
        }.get(language, body_template["fr"])
        
        message.attach(MIMEText(body_template, 'plain', 'utf-8'))
        
        # Attach PDF
        pdf_attachment = MIMEBase('application', 'pdf')
        pdf_attachment.set_payload(pdf_bytes)
        encoders.encode_base64(pdf_attachment)
        filename = f"IGV_Mini_Analysis_{brand_name.replace(' ', '_')}.pdf"
        pdf_attachment.add_header(
            'Content-Disposition',
            f'attachment; filename={filename}'
        )
        message.attach(pdf_attachment)
        
        # Send
        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.starttls()
            await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            await smtp.send_message(message)
        
        logging.info(f"Mini-analysis email sent to {email}")
        
        return {"success": True, "sent_at": datetime.now(timezone.utc).isoformat()}
        
    except Exception as e:
        logging.error(f"Failed to send mini-analysis email: {str(e)}")
        return {"success": False, "error": str(e)}


class MiniAnalysisRequest(BaseModel):
    # CORE FIELDS - FIXED 2025-12-29-17-25 (build 647212f)
    email: EmailStr
    phone: str = ""  # REQUIRED FIELD - Added 2025-01-01
    nom_de_marque: str = ""  # Will be filled from aliases if empty
    secteur: str = ""  # Optional field
    
    # ALIASES for compatibility (accept company_name OR brand_name as alternatives)
    company_name: str | None = None
    brand_name: str | None = None
    
    # OPTIONAL FIELDS
    statut_alimentaire: str = ""
    anciennete: str = ""
    pays_dorigine: str = ""
    concept: str = ""
    positionnement: str = ""
    modele_actuel: str = ""
    differenciation: str = ""
    objectif_israel: str = ""
    contraintes: str = ""
    language: str = "fr"  # LANGUAGE SUPPORT: fr/en/he
    
    def model_post_init(self, __context):
        """Handle aliases - populate nom_de_marque from company_name or brand_name"""
        if not self.nom_de_marque:
            if self.company_name:
                self.nom_de_marque = self.company_name
            elif self.brand_name:
                self.nom_de_marque = self.brand_name
            else:
                raise ValueError("nom_de_marque, company_name, or brand_name required")


def normalize_brand_slug(brand_name: str) -> str:
    """Normalize brand name to slug for deduplication"""
    # Lowercase
    slug = brand_name.lower()
    # Remove accents (basic)
    accents = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n'
    }
    for accent, replacement in accents.items():
        slug = slug.replace(accent, replacement)
    # Remove punctuation and special chars, keep only alphanumeric and spaces
    slug = re.sub(r'[^a-z0-9\s]', '', slug)
    # Collapse multiple spaces
    slug = ' '.join(slug.split())
    # Trim
    return slug.strip()


def load_igv_file(file_path: Path) -> str:
    """Load IGV internal file with error handling"""
    if not file_path.exists():
        logging.error(f"MISSING_IGV_FILE:{file_path}")
        raise HTTPException(status_code=500, detail=f"Fichier IGV manquant: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logging.error(f"Error reading {file_path}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lecture fichier: {file_path.name}")


def build_prompt(request: MiniAnalysisRequest, language: str = "fr") -> str:
    """Build runtime prompt with master prompt + form data"""
    
    # Select master prompt based on sector AND language
    lang_suffix = f"_{language.upper()}" if language != "fr" else ""
    
    if request.secteur == "Restauration / Food":
        prompt_file = PROMPTS_DIR / f'MASTER_PROMPT_RESTAURATION{lang_suffix}.txt'
        prompt_name = f"MASTER_PROMPT_RESTAURATION{lang_suffix}"
    elif request.secteur == "Retail (hors food)":
        prompt_file = PROMPTS_DIR / f'MASTER_PROMPT_RETAIL_NON_FOOD{lang_suffix}.txt'
        prompt_name = f"MASTER_PROMPT_RETAIL_NON_FOOD{lang_suffix}"
    else:  # Services or Paramédical / Santé
        prompt_file = PROMPTS_DIR / f'MASTER_PROMPT_SERVICES_PARAMEDICAL{lang_suffix}.txt'
        prompt_name = f"MASTER_PROMPT_SERVICES_PARAMEDICAL{lang_suffix}"
    
    logging.info(f"Using prompt: {prompt_name} for sector: {request.secteur}, language: {language}")
    
    # Load master prompt
    master_prompt = load_igv_file(prompt_file)
    
    # Load whitelists (still needed for prompt context)
    types_data = load_igv_file(TYPES_FILE)
    
    # Select whitelist based on statut_alimentaire
    if request.statut_alimentaire.lower() == 'halal':
        whitelist_data = load_igv_file(WHITELIST_ARAB)
        whitelist_name = "Whitelist_2_Arabe_incl_Mixed"
    else:
        whitelist_data = load_igv_file(WHITELIST_JEWISH)
        whitelist_name = "Whitelist_1_Jewish_incl_Mixed"
    
    # Build form data section (TRANSLATED based on language)
    if language == "en":
        form_data_section = f"""

---

**CLIENT FORM DATA:**

- **Brand Name:** {request.nom_de_marque}
- **Email:** {request.email}
- **Sector:** {request.secteur}
- **Food Status:** {request.statut_alimentaire or "Not specified"}
- **Company Age:** {request.anciennete or "Not specified"}
- **Country of Origin:** {request.pays_dorigine or "Not specified"}
- **Concept:** {request.concept or "Not specified"}
- **Positioning:** {request.positionnement or "Not specified"}
- **Current Business Model:** {request.modele_actuel or "Not specified"}
- **Differentiation:** {request.differenciation or "Not specified"}
- **Israel Objective:** {request.objectif_israel or "Not specified"}
- **Constraints:** {request.contraintes or "Not specified"}

---

**REFERENCE DOCUMENT 1: Location Types and Activities**

{types_data}

---

**REFERENCE DOCUMENT 2: {whitelist_name} (AUTHORIZED LOCATIONS)**

{whitelist_data}

---
"""
    elif language == "he":
        form_data_section = f"""

---

**נתוני טופס הלקוח:**

- **שם המותג:** {request.nom_de_marque}
- **אימייל:** {request.email}
- **תחום:** {request.secteur}
- **סטטוס מזון:** {request.statut_alimentaire or "לא צוין"}
- **ותק החברה:** {request.anciennete or "לא צוין"}
- **מדינת מוצא:** {request.pays_dorigine or "לא צוין"}
- **קונספט:** {request.concept or "לא צוין"}
- **מיצוב:** {request.positionnement or "לא צוין"}
- **מודל עסקי נוכחי:** {request.modele_actuel or "לא צוין"}
- **בידול:** {request.differenciation or "לא צוין"}
- **יעד בישראל:** {request.objectif_israel or "לא צוין"}
- **אילוצים:** {request.contraintes or "לא צוין"}

---

**מסמך עזר 1: סוגי מיקומים ופעילויות**

{types_data}

---

**מסמך עזר 2: {whitelist_name} (מיקומים מורשים)**

{whitelist_data}

---
"""
    else:  # French (default)
        form_data_section = f"""

---

**DONNÉES DU FORMULAIRE CLIENT:**

- **Nom de marque:** {request.nom_de_marque}
- **Email:** {request.email}
- **Secteur:** {request.secteur}
- **Statut alimentaire:** {request.statut_alimentaire or "Non spécifié"}
- **Ancienneté:** {request.anciennete or "Non spécifié"}
- **Pays d'origine:** {request.pays_dorigine or "Non spécifié"}
- **Concept:** {request.concept or "Non spécifié"}
- **Positionnement:** {request.positionnement or "Non spécifié"}
- **Modèle actuel:** {request.modele_actuel or "Non spécifié"}
- **Différenciation:** {request.differenciation or "Non spécifié"}
- **Objectif Israël:** {request.objectif_israel or "Non spécifié"}
- **Contraintes:** {request.contraintes or "Non spécifié"}

---

**DOCUMENT DE RÉFÉRENCE 1: Types d'Emplacements et Activités**

{types_data}

---

**DOCUMENT DE RÉFÉRENCE 2: {whitelist_name} (EMPLACEMENTS AUTORISÉS)**

{whitelist_data}

---
"""
    
    # NO NEED for translation instructions - the master_prompt is ALREADY in the target language
    # Gemini will naturally respond in the same language as the prompt
    
    # Combine: master prompt (already in target language) + form data (already in target language)
    final_prompt = master_prompt + form_data_section
    
    return final_prompt


@router.get("/mini-analysis/debug")
async def debug_mini_analysis():
    """Debug endpoint pour vérifier configuration mini-analysis"""
    igv_files_status = {}
    try:
        for name, path in [
            ("IGV_Types", TYPES_FILE),
            ("Whitelist_Jewish", WHITELIST_JEWISH),
            ("Whitelist_Arab", WHITELIST_ARAB),
            ("Prompt_Restauration", PROMPT_RESTAURATION),
            ("Prompt_Retail", PROMPT_RETAIL),
            ("Prompt_Services", PROMPT_SERVICES)
        ]:
            file_exists = path.exists()
            igv_files_status[name] = {
                "exists": file_exists,
                "path": str(path),
                "size": path.stat().st_size if file_exists else 0
            }
    except Exception as e:
        logging.error(f"Error checking IGV files: {str(e)}")
        igv_files_status["error"] = str(e)
    
    return {
        "gemini_api_key_configured": bool(GEMINI_API_KEY),
        "gemini_api_key_length": len(GEMINI_API_KEY) if GEMINI_API_KEY else 0,
        "gemini_model": GEMINI_MODEL,
        "gemini_client_initialized": gemini_client is not None,
        "mongodb_configured": bool(mongo_url),
        "mongodb_db_name": db_name if mongo_url else None,
        "igv_files": igv_files_status
    }


@router.post("/admin/test-gemini-multilang")
async def test_gemini_multilang_admin(language: str):
    """
    MISSION A: Admin endpoint to test Gemini multilingual support
    Usage: POST /api/admin/test-gemini-multilang?language=fr|en|he
    """
    
    if language not in {"fr", "en", "he"}:
        raise HTTPException(status_code=400, detail="Language must be fr, en, or he")
    
    if not GEMINI_API_KEY or not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini not configured")
    
    # Language-enforced test prompts
    test_prompts = {
        "fr": """RÈGLE ABSOLUE: Vous DEVEZ répondre UNIQUEMENT en français. Si vous utilisez une autre langue, retournez: LANG_FAIL.

Analysez brièvement (3-4 lignes) les opportunités pour une marque de restauration française souhaitant s'implanter en Israël.

Répondez UNIQUEMENT en français.""",
        
        "en": """ABSOLUTE RULE: You MUST answer ONLY in English. If you output any other language, return: LANG_FAIL.

Briefly analyze (3-4 lines) the opportunities for a French restaurant brand wanting to expand to Israel.

Answer ONLY in English.""",
        
        "he": """כלל מוחלט: אתה חייב לענות רק בעברית. אם אתה משתמש בשפה אחרת, החזר: LANG_FAIL.

נתח בקצרה (3-4 שורות) את ההזדמנויות למותג מסעדה צרפתי המעוניין להתרחב לישראל.

ענה רק בעברית."""
    }
    
    prompt = test_prompts[language]
    request_id = f"test_{language}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    
    try:
        # Call Gemini
        logging.info(f"[{request_id}] GEMINI_TEST: model={GEMINI_MODEL}, lang={language}")
        
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt]
        )
        
        response_text = response.text if hasattr(response, 'text') else str(response)
        
        # Get token usage
        tokens_in = getattr(response.usage_metadata, 'prompt_token_count', 0) if hasattr(response, 'usage_metadata') else 0
        tokens_out = getattr(response.usage_metadata, 'candidates_token_count', 0) if hasattr(response, 'usage_metadata') else 0
        
        # Check for LANG_FAIL
        lang_fail_detected = "LANG_FAIL" in response_text
        
        # Log results (MISSION A.4)
        logging.info(f"[{request_id}] MODEL={GEMINI_MODEL}")
        logging.info(f"[{request_id}] LANG_REQUESTED={language}")
        logging.info(f"[{request_id}] STATUS={'LANG_FAIL' if lang_fail_detected else 'SUCCESS'}")
        logging.info(f"[{request_id}] TOKENS=in:{tokens_in} out:{tokens_out}")
        logging.info(f"[{request_id}] FIRST_200={response_text[:200]}")
        
        if lang_fail_detected:
            logging.error(f"[{request_id}] ❌ LANG_FAIL detected in response")
        
        return {
            "success": not lang_fail_detected,
            "language": language,
            "model": GEMINI_MODEL,
            "tokens": {
                "input": tokens_in,
                "output": tokens_out
            },
            "response_length": len(response_text),
            "first_200_chars": response_text[:200],
            "full_response": response_text,
            "lang_fail_detected": lang_fail_detected,
            "request_id": request_id
        }
        
    except Exception as e:
        logging.error(f"[{request_id}] ❌ Error: {str(e)}")
        import traceback
        logging.error(traceback.format_exc())
        
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "request_id": request_id
        })


# Second debug endpoint removed - duplicate


@router.post("/mini-analysis")
async def generate_mini_analysis(request: MiniAnalysisRequest, response: Response, http_request: Request):
    """
    Generate AI-powered mini-analysis for Israel market entry
    Includes anti-duplicate check + MongoDB persistence + AUTOMATIC LEAD CREATION (MISSION C)
    Adds debug headers: X-IGV-Lang-Requested, X-IGV-Lang-Used, X-IGV-Cache-Hit
    """
    
    # Validate required fields
    if not request.email or not request.nom_de_marque or not request.secteur:
        raise HTTPException(status_code=400, detail="Email, nom_de_marque et secteur sont obligatoires")
    
    # Additional validation for food sector
    if request.secteur == "Restauration / Food" and not request.statut_alimentaire:
        raise HTTPException(status_code=400, detail="Le statut alimentaire est obligatoire pour le secteur Restauration / Food")
    
    # LANGUAGE VALIDATION AND LOGGING (MISSION B)
    language = request.language if hasattr(request, 'language') else "fr"
    if language not in {"fr", "en", "he"}:
        logging.warning(f"Invalid language '{language}', falling back to 'en'")
        language = "en"
    
    # DEBUG HEADERS (LIVE VERIFICATION)
    response.headers["X-IGV-Lang-Requested"] = language
    response.headers["X-IGV-Lang-Used"] = language
    
    request_id = f"req_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    logging.info(f"[{request_id}] LANG_REQUESTED={language} LANG_USED={language}")
    
    # MISSION C: CREATE LEAD AUTOMATICALLY (BEFORE checking quota/duplicate)
    lead_data = None
    try:
        from crm_routes import create_lead_in_crm
        
        # Extract client metadata
        client_ip = http_request.client.host if http_request.client else None
        user_agent = http_request.headers.get("User-Agent")
        referrer = http_request.headers.get("Referer")
        
        lead_data = {
            "email": request.email,
            "phone": request.phone,  # Added phone field
            "brand_name": request.nom_de_marque,
            "sector": request.secteur,
            "language": language,
            "status": "NEW",  # Will be updated later
            "ip_address": client_ip,
            "user_agent": user_agent,
            "referrer": referrer,
            "utm_source": http_request.query_params.get("utm_source"),
            "utm_medium": http_request.query_params.get("utm_medium"),
            "utm_campaign": http_request.query_params.get("utm_campaign")
        }
        
        lead_result = await create_lead_in_crm(lead_data, request_id)
        logging.info(f"[{request_id}] Lead creation result: {lead_result}")
    except Exception as lead_error:
        # Don't fail the request if lead creation fails
        logging.error(f"[{request_id}] Lead creation error (non-blocking): {str(lead_error)}")
    
    # Check Gemini client
    if not GEMINI_API_KEY or not gemini_client:
        logging.error(f"❌ Gemini not configured: API_KEY={bool(GEMINI_API_KEY)}, client={gemini_client is not None}")
        
        # Update lead status to ERROR
        if lead_data:
            try:
                from crm_routes import create_lead_in_crm
                lead_data["status"] = "ERROR"
                await create_lead_in_crm(lead_data, request_id)
            except:
                pass
        
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY non configurée - contactez l'administrateur")
    
    # Check MongoDB connection
    current_db = get_db()
    if current_db is None:
        raise HTTPException(status_code=500, detail="Base de données non configurée")
    
    # Normalize brand name for deduplication
    brand_slug = normalize_brand_slug(request.nom_de_marque)
    
    # Check for existing analysis (anti-duplicate)
    existing = await current_db.mini_analyses.find_one({"brand_slug": brand_slug})
    cache_key = f"{brand_slug}_{language}"
    
    if existing:
        logging.info(f"CACHE_HIT=true CACHE_KEY={cache_key}")
        response.headers["X-IGV-Cache-Hit"] = "true"
        
        # Translate error message
        error_messages = {
            "fr": f"Une mini-analyse a déjà été générée pour cette enseigne ({request.nom_de_marque})",
            "en": f"A mini-analysis has already been generated for this brand ({request.nom_de_marque})",
            "he": f"כבר נוצר ניתוח מיני עבור המותג הזה ({request.nom_de_marque})"
        }
        
        raise HTTPException(
            status_code=409,
            detail=error_messages.get(language, error_messages["en"])
        )
    else:
        logging.info(f"CACHE_HIT=false CACHE_KEY={cache_key}")
        response.headers["X-IGV-Cache-Hit"] = "false"
    
    # Build prompt with IGV data
    try:
        prompt = build_prompt(request, language=language)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error building prompt: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la construction de la requête IA")
    
    # Call Gemini API (new google-genai package)
    request_id = f"req_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    try:
        logging.info(f"[{request_id}] Calling Gemini API for brand: {request.nom_de_marque} (model: {GEMINI_MODEL})")
        
        if not gemini_client:
            logging.error(f"[{request_id}] Gemini client not initialized")
            raise HTTPException(
                status_code=500,
                detail={"error": "Gemini client not configured", "request_id": request_id}
            )
        
        # CRITICAL: contents MUST be a list for google-genai 0.2.2
        # Signature: contents: list[Content | list[Part | str] | Part | str]
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt]  # Wrap prompt in a list
        )
        
        # Extract text from response
        analysis_text = response.text if hasattr(response, 'text') else str(response)
        
        logging.info(f"[{request_id}] ✅ Gemini response received: {len(analysis_text)} characters")
        
        # LANG_FAIL DETECTION (MISSION A.5)
        if "LANG_FAIL" in analysis_text:
            logging.error(f"[{request_id}] ❌ LANG_FAIL detected - Gemini failed to respect language={language}")
            logging.warning(f"[{request_id}] Retrying with stricter language instruction...")
            
            # Retry with stricter instruction
            retry_prompts = {
                "fr": f"CRITIQUE: Répondez UNIQUEMENT en français, pas en anglais, pas en hébreu.\n\n{prompt}",
                "en": f"CRITICAL: Answer ONLY in English, not in French, not in Hebrew.\n\n{prompt}",
                "he": f"קריטי: ענה רק בעברית, לא בצרפתית, לא באנגלית.\n\n{prompt}"
            }
            
            retry_prompt = retry_prompts.get(language, prompt)
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[retry_prompt]
            )
            
            analysis_text = response.text if hasattr(response, 'text') else str(response)
            logging.info(f"[{request_id}] Retry response: {len(analysis_text)} characters")
            
            if "LANG_FAIL" in analysis_text:
                logging.error(f"[{request_id}] ❌ LANG_FAIL persists after retry")
        
        if not analysis_text:
            raise HTTPException(
                status_code=500,
                detail={"error": "Réponse IA vide", "request_id": request_id}
            )
        
    except HTTPException:
        raise  # Re-raise HTTPException as-is
    except AttributeError as e:
        import traceback
        error_trace = traceback.format_exc()
        logging.error(f"[{request_id}] ❌ Gemini API structure error: {str(e)}")
        logging.error(f"[{request_id}] Response type: {type(response) if 'response' in locals() else 'no response'}")
        logging.error(f"[{request_id}] Traceback:\n{error_trace}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": f"Erreur structure API Gemini: {str(e)}",
                "request_id": request_id,
                "error_type": "AttributeError"
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        error_str = str(e).lower()
        
        # MISSION: DETECT QUOTA/RESOURCE_EXHAUSTED ERRORS
        if "resource_exhausted" in error_str or "quota" in error_str:
            logging.error(f"[{request_id}] ❌ GEMINI_QUOTA_EXCEEDED: {str(e)}")
            
            # Update lead status to QUOTA_BLOCKED
            if lead_data:
                try:
                    from crm_routes import create_lead_in_crm
                    lead_data["status"] = "QUOTA_BLOCKED"
                    await create_lead_in_crm(lead_data, request_id)
                except:
                    pass
            
            # SAVE TO pending_analyses (UPDATED SCHEMA)
            lead_id_for_queue = None
            if lead_data:
                try:
                    from crm_routes import create_lead_in_crm
                    lead_result = await create_lead_in_crm(lead_data, request_id)
                    lead_id_for_queue = lead_result.get("lead_id")
                except:
                    pass
            
            try:
                pending_record = {
                    "lead_id": lead_id_for_queue or "unknown",
                    "email": request.email,
                    "brand_name": request.nom_de_marque,
                    "sector": request.secteur,
                    "language": language,
                    "status": "pending",
                    "attempts": 0,
                    "request_data": request.dict(),
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                result = await current_db.pending_analyses.insert_one(pending_record)
                queue_id = str(result.inserted_id)
                logging.info(f"[{request_id}] QUEUED_OK: queue_id={queue_id}")
            except Exception as db_error:
                logging.error(f"[{request_id}] QUEUE_FAIL: {str(db_error)}")
                queue_id = None
            
            # SEND CONFIRMATION EMAIL
            email_sent = False
            try:
                from extended_routes import send_quota_confirmation_email
                await send_quota_confirmation_email(request.email, request.nom_de_marque, language, request_id)
                logging.info(f"[{request_id}] EMAIL_SEND_OK")
                email_sent = True
            except Exception as email_error:
                logging.error(f"[{request_id}] EMAIL_SEND_FAIL: {str(email_error)}")
            
            # Multilingual confirmation messages (EXACT SPEC)
            quota_messages = {
                "fr": "Quota de mini-analyses atteint. Revenez demain.",
                "en": "Daily mini-analysis quota reached. Please come back tomorrow.",
                "he": "המכסה היומית למיני-אנליזה הסתיימה. נסו שוב מחר."
            }
            
            response.headers["Retry-After"] = "86400"
            
            raise HTTPException(
                status_code=429,
                detail={
                    "error_code": "GEMINI_QUOTA_DAILY",
                    "message": quota_messages,
                    "email_sent": email_sent,
                    "queued": True,
                    "retry_after_seconds": 86400,
                    "request_id": request_id
                }
            )
        
        # Other errors: 500
        logging.error(f"[{request_id}] ❌ Gemini API error: {str(e)}")
        logging.error(f"[{request_id}] Error type: {type(e).__name__}")
        logging.error(f"[{request_id}] Traceback:\n{error_trace}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": f"Erreur API Gemini: {str(e)}",
                "request_id": request_id,
                "error_type": type(e).__name__,
                "traceback": error_trace
            }
        )
    
    # Save to MongoDB
    try:
        analysis_record = {
            "brand_slug": brand_slug,
            "brand_name": request.nom_de_marque,
            "email": request.email,
            "phone": request.phone,  # Added phone field
            "language": language,
            "payload_form": request.dict(),
            "created_at": datetime.now(timezone.utc),
            "provider": "gemini",
            "model": GEMINI_MODEL,
            "response_text": analysis_text,
            "pdf_url": None,
            "email_sent": False,
            "email_status": None
        }
        
        result = await current_db.mini_analyses.insert_one(analysis_record)
        analysis_id = str(result.inserted_id)
        logging.info(f"Analysis saved to MongoDB with ID: {analysis_id}")
        
        # MISSION C: Update lead status to GENERATED (successful generation)
        lead_id = None
        try:
            from crm_routes import create_lead_in_crm
            lead_data["status"] = "GENERATED"
            lead_result = await create_lead_in_crm(lead_data, request_id)
            lead_id = lead_result.get("lead_id")
        except Exception as lead_update_error:
            logging.error(f"[{request_id}] Lead status update error (non-blocking): {str(lead_update_error)}")
        
        # GENERATE PDF AUTOMATICALLY
        pdf_url = None
        pdf_base64 = None
        try:
            logging.info(f"[{request_id}] Generating PDF for {request.nom_de_marque}")
            pdf_bytes = generate_mini_analysis_pdf(request.nom_de_marque, analysis_text, language)
            pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
            pdf_url = f"data:application/pdf;base64,{pdf_base64}"  # Inline PDF for now
            
            # Update analysis record
            await current_db.mini_analyses.update_one(
                {"_id": result.inserted_id},
                {"$set": {"pdf_url": pdf_url, "pdf_generated_at": datetime.now(timezone.utc)}}
            )
            
            # Update lead
            if lead_id:
                await current_db.leads.update_one(
                    {"_id": lead_id},
                    {"$set": {"pdf_url": pdf_url}}
                )
            
            # Timeline event
            await current_db.timeline_events.insert_one({
                "entity_type": "mini_analysis",
                "entity_id": analysis_id,
                "lead_id": lead_id,
                "event_type": "pdf_generated",
                "description": f"PDF generated for {request.nom_de_marque}",
                "created_at": datetime.now(timezone.utc)
            })
            
            logging.info(f"[{request_id}] PDF generated successfully")
            
        except Exception as pdf_error:
            logging.error(f"[{request_id}] PDF generation failed: {str(pdf_error)}")
        
        # SEND EMAIL AUTOMATICALLY
        email_sent = False
        email_error = None
        try:
            if pdf_bytes:
                logging.info(f"[{request_id}] Sending email to {request.email}")
                email_result = await send_mini_analysis_email(request.email, request.nom_de_marque, pdf_bytes, language)
                email_sent = email_result["success"]
                email_error = email_result.get("error")
                
                # Update analysis record
                await current_db.mini_analyses.update_one(
                    {"_id": result.inserted_id},
                    {
                        "$set": {
                            "email_sent": email_sent,
                            "email_status": "sent" if email_sent else "failed",
                            "email_sent_at": datetime.now(timezone.utc) if email_sent else None,
                            "email_error": email_error
                        }
                    }
                )
                
                # Create EmailEvent
                await current_db.email_events.insert_one({
                    "email_type": "mini_analysis",
                    "to_email": request.email,
                    "bcc": [COMPANY_EMAIL],
                    "subject": f"Mini-Analysis - {request.nom_de_marque}",
                    "language": language,
                    "status": "sent" if email_sent else "failed",
                    "error_message": email_error,
                    "lead_id": lead_id,
                    "created_at": datetime.now(timezone.utc),
                    "sent_at": datetime.now(timezone.utc) if email_sent else None
                })
                
                # Timeline event
                await current_db.timeline_events.insert_one({
                    "entity_type": "mini_analysis",
                    "entity_id": analysis_id,
                    "lead_id": lead_id,
                    "event_type": "email_sent" if email_sent else "email_failed",
                    "description": f"Email {'sent to' if email_sent else 'failed for'} {request.email}",
                    "created_at": datetime.now(timezone.utc)
                })
                
                logging.info(f"[{request_id}] Email {'sent' if email_sent else 'failed'}")
            
        except Exception as email_send_error:
            logging.error(f"[{request_id}] Email send failed: {str(email_send_error)}")
            email_error = str(email_send_error)
        
    except Exception as e:
        logging.error(f"MongoDB save error: {str(e)}")
        # Don't fail the request if save fails - still return analysis
    
    return {
        "success": True,
        "analysis": analysis_text,
        "brand_name": request.nom_de_marque,
        "secteur": request.secteur,
        "statut_alimentaire": request.statut_alimentaire,
        "language": language,
        "pdf_url": pdf_url,
        "pdf_base64": pdf_base64,
        "email_sent": email_sent,
        "email_status": "sent" if email_sent else "failed" if email_error else "pending",
        "lead_id": lead_id
    }
