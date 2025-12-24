"""
Mini-Analysis Routes for Israel Growth Venture
Handles brand analysis requests with Gemini AI + IGV internal data
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
import google.generativeai as genai

router = APIRouter(prefix="/api")

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash-exp')

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        logging.info(f"✅ Gemini configured successfully with model: {GEMINI_MODEL}")
    except Exception as e:
        logging.error(f"❌ Gemini configuration error: {str(e)}")
        model = None
else:
    logging.warning("⚠️ GEMINI_API_KEY not configured - mini-analysis endpoint will fail")
    model = None

# MongoDB connection (from server.py)
mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME', 'igv_production')

client = None
db = None
if mongo_url:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

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


def build_prompt(request: MiniAnalysisRequest) -> str:
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
    
    logging.info(f"Using prompt: {prompt_name} for sector: {request.secteur}")
    
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
    
    # Combine master prompt + form data
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
        "gemini_model_initialized": model is not None,
        "mongodb_configured": db is not None,
        "mongodb_db_name": db_name if db else None,
        "igv_files": igv_files_status
    }


@router.post("/mini-analysis")
async def generate_mini_analysis(request: MiniAnalysisRequest):
    """
    Generate AI-powered mini-analysis for Israel market entry
    Includes anti-duplicate check + MongoDB persistence
    """
    
    # Validate required fields
    if not request.email or not request.nom_de_marque or not request.secteur:
        raise HTTPException(status_code=400, detail="Email, nom_de_marque et secteur sont obligatoires")
    
    # Additional validation for food sector
    if request.secteur == "Restauration / Food" and not request.statut_alimentaire:
        raise HTTPException(status_code=400, detail="Le statut alimentaire est obligatoire pour le secteur Restauration / Food")
    
    # Check Gemini API key
    if not GEMINI_API_KEY or not model:
        logging.error(f"❌ Gemini not configured: API_KEY={bool(GEMINI_API_KEY)}, model={model is not None}")
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY non configurée - contactez l'administrateur")
    
    # Check MongoDB connection
    if not db:
        raise HTTPException(status_code=500, detail="Base de données non configurée")
    
    # Normalize brand name for deduplication
    brand_slug = normalize_brand_slug(request.nom_de_marque)
    
    # Check for existing analysis (anti-duplicate)
    existing = await db.mini_analyses.find_one({"brand_slug": brand_slug})
    if existing:
        logging.info(f"Duplicate analysis attempt for brand: {brand_slug}")
        raise HTTPException(
            status_code=409,
            detail=f"Une mini-analyse a déjà été générée pour cette enseigne ({request.nom_de_marque})"
        )
    
    # Build prompt with IGV data
    try:
        prompt = build_prompt(request)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error building prompt: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la construction de la requête IA")
    
    # Call Gemini API
    try:
        logging.info(f"Calling Gemini API for brand: {request.nom_de_marque} (model: {GEMINI_MODEL})")
        response = model.generate_content(prompt)
        analysis_text = response.text
        
        if not analysis_text:
            raise HTTPException(status_code=500, detail="Réponse IA vide")
        
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur API Gemini: {str(e)}")
    
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
        
        result = await db.mini_analyses.insert_one(analysis_record)
        logging.info(f"Analysis saved to MongoDB with ID: {result.inserted_id}")
        
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
