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


class MiniAnalysisRequest(BaseModel):
    email: EmailStr
    nom_de_marque: str
    secteur: str
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
    
    # Select master prompt based on sector
    if request.secteur == "Restauration / Food":
        prompt_file = PROMPT_RESTAURATION
        prompt_name = "MASTER_PROMPT_RESTAURATION"
    elif request.secteur == "Retail (hors food)":
        prompt_file = PROMPT_RETAIL
        prompt_name = "MASTER_PROMPT_RETAIL_NON_FOOD"
    else:  # Services or Paramédical / Santé
        prompt_file = PROMPT_SERVICES
        prompt_name = "MASTER_PROMPT_SERVICES_PARAMEDICAL"
    
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
    
    # Build form data section
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
    
    # Language enforcement instructions
    language_instructions = {
        "fr": """RÈGLE ABSOLUE DE LANGUE:
Vous DEVEZ répondre UNIQUEMENT en français. N'utilisez AUCUNE autre langue.
Si vous ne pouvez pas répondre en français, retournez: LANG_FAIL.

""",
        "en": """ABSOLUTE LANGUAGE RULE:
You MUST answer ONLY in English. Do NOT use any other language.
If you cannot answer in English, return: LANG_FAIL.

""",
        "he": """כלל שפה מוחלט:
אתה חייב לענות רק בעברית. אל תשתמש בשום שפה אחרת.
אם אתה לא יכול לענות בעברית, החזר: LANG_FAIL.

"""
    }
    
    lang_instruction = language_instructions.get(language, language_instructions["en"])
    
    # Combine: language instruction + master prompt + form data
    final_prompt = lang_instruction + master_prompt + form_data_section
    
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
        raise HTTPException(
            status_code=409,
            detail=f"Une mini-analyse a déjà été générée pour cette enseigne ({request.nom_de_marque})"
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
            
            # SAVE TO pending_analyses
            try:
                pending_record = {
                    "created_at": datetime.now(timezone.utc),
                    "brand": request.nom_de_marque,
                    "language": language,
                    "user_email": request.email,
                    "form_payload": request.dict(),
                    "ip_address": http_request.client.host if http_request.client else None,
                    "user_agent": http_request.headers.get("User-Agent"),
                    "referrer": http_request.headers.get("Referer"),
                    "utm_source": http_request.query_params.get("utm_source"),
                    "utm_medium": http_request.query_params.get("utm_medium"),
                    "utm_campaign": http_request.query_params.get("utm_campaign"),
                    "status": "queued",
                    "error_code": "429",
                    "request_id": request_id,
                    "retry_count": 0
                }
                await current_db.pending_analyses.insert_one(pending_record)
                logging.info(f"[{request_id}] QUEUED_OK: Saved to pending_analyses")
            except Exception as db_error:
                logging.error(f"[{request_id}] QUEUE_FAIL: {str(db_error)}")
            
            # SEND CONFIRMATION EMAIL
            email_sent = False
            try:
                from extended_routes import send_quota_confirmation_email
                await send_quota_confirmation_email(request.email, request.nom_de_marque, language, request_id)
                logging.info(f"[{request_id}] EMAIL_SEND_OK")
                email_sent = True
            except Exception as email_error:
                logging.error(f"[{request_id}] EMAIL_SEND_FAIL: {str(email_error)}")
            
            # Multilingual confirmation messages
            quota_messages = {
                "fr": "Capacité du jour atteinte.\\nVotre demande est enregistrée ✅\\nVous recevrez votre mini-analyse par email dès réouverture des créneaux (généralement sous 24–48h).",
                "en": "Daily capacity reached.\\nYour request is saved ✅\\nYou'll receive your mini-analysis by email as soon as capacity reopens (usually within 24–48 hours).",
                "he": "הגענו לקיבולת היומית.\\nהבקשה נשמרה ✅\\nתקבלו את המיני-אנליזה במייל ברגע שהקיבולת תיפתח מחדש (בדרך כלל תוך 24–48 שעות)."
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
            "payload_form": request.dict(),
            "created_at": datetime.now(timezone.utc),
            "provider": "gemini",
            "model": GEMINI_MODEL,
            "response_text": analysis_text
        }
        
        result = await current_db.mini_analyses.insert_one(analysis_record)
        logging.info(f"Analysis saved to MongoDB with ID: {result.inserted_id}")
        
        # MISSION C: Update lead status to GENERATED (successful generation)
        try:
            from crm_routes import create_lead_in_crm
            lead_data["status"] = "GENERATED"
            await create_lead_in_crm(lead_data, request_id)
        except Exception as lead_update_error:
            logging.error(f"[{request_id}] Lead status update error (non-blocking): {str(lead_update_error)}")
        
    except Exception as e:
        logging.error(f"MongoDB save error: {str(e)}")
        # Don't fail the request if save fails - still return analysis
    
    return {
        "success": True,
        "analysis": analysis_text,
        "brand_name": request.nom_de_marque,
        "secteur": request.secteur,
        "statut_alimentaire": request.statut_alimentaire
    }
