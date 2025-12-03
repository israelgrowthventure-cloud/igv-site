"""
CMS Pages Management - Routes pour le CMS Emergent
===================================================

Ce module expose les routes API pour la gestion des pages CMS.
Utilisé par le CMS Emergent (frontend/src/pages/admin/PageEditor.jsx)

ROUTES EXPOSÉES:
- GET /api/cms/pages - Liste toutes les pages
- GET /api/cms/pages/{slug} - Détails d'une page
- POST /api/cms/pages - Créer une page (authentification requise)
- PUT /api/cms/pages/{slug} - Modifier une page (authentification requise)
- DELETE /api/cms/pages/{slug} - Supprimer une page (admin uniquement)

STOCKAGE:
- Actuellement: mémoire (CMS_PAGES dict)
- TODO: Migration vers MongoDB (collections pages)

INTÉGRATION:
- Importé dans server.py via: from cms_routes import cms_router
- Monté sur l'application: app.include_router(cms_router)

DÉPENDANCES:
- FastAPI pour le routing
- Pydantic pour la validation des modèles
- JSON pour le stockage temporaire
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Router CMS
cms_router = APIRouter(prefix="/api", tags=["CMS"])

# Stockage en mémoire des pages CMS (à remplacer par MongoDB plus tard)
# Pour l'instant, on charge depuis les fichiers JSON d'export
CMS_PAGES = {}

class CMSBlock(BaseModel):
    """Bloc de contenu CMS"""
    id: str
    type: str
    props: dict
    children: List = []

class CMSPage(BaseModel):
    """Page CMS complète"""
    slug: str
    title: str
    status: str = "published"
    metadata: dict = {}
    blocks: List[CMSBlock]

def load_initial_pages():
    """Charge les pages initiales depuis cms-export/"""
    global CMS_PAGES
    
    # Chemin vers les fichiers d'export
    export_dir = Path(__file__).parent.parent / "cms-export"
    
    if not export_dir.exists():
        logger.info(f"cms-export directory not found: {export_dir} - CMS will start empty")
        return
    
    # Slugs des pages à charger
    page_slugs = ["home", "packs", "about", "contact", "future-commerce"]
    
    for slug in page_slugs:
        json_file = export_dir / f"page-{slug}.json"
        
        if json_file.exists():
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    page_data = json.load(f)
                    CMS_PAGES[slug] = page_data
                    logger.info(f"✅ Loaded CMS page: {slug}")
            except Exception as e:
                logger.error(f"❌ Error loading {slug}: {e}")
        else:
            logger.warning(f"⚠️ File not found: {json_file}")
    
    logger.info(f"CMS initialized with {len(CMS_PAGES)} pages: {list(CMS_PAGES.keys())}")

@cms_router.get("/pages/{slug}")
async def get_page_by_slug(slug: str):
    """
    Récupère une page CMS par son slug
    
    Exemples:
    - GET /api/pages/home
    - GET /api/pages/packs
    - GET /api/pages/about
    """
    # Charger les pages si pas encore fait
    if not CMS_PAGES:
        load_initial_pages()
    
    if slug not in CMS_PAGES:
        logger.error(f"Page not found: {slug}. Available: {list(CMS_PAGES.keys())}")
        raise HTTPException(
            status_code=404, 
            detail=f"Page '{slug}' not found in CMS. Available pages: {', '.join(CMS_PAGES.keys())}"
        )
    
    return CMS_PAGES[slug]

@cms_router.get("/pages")
async def get_all_pages():
    """Liste toutes les pages CMS publiées"""
    # Charger les pages si pas encore fait
    if not CMS_PAGES:
        load_initial_pages()
    
    # Retourner seulement les métadonnées
    return [
        {
            "slug": slug,
            "title": page.get("title", slug),
            "status": page.get("status", "published")
        }
        for slug, page in CMS_PAGES.items()
        if page.get("status") == "published"
    ]

@cms_router.post("/admin/init-pages")
async def initialize_cms_pages():
    """
    Endpoint d'initialisation: charge toutes les pages depuis cms-export/
    Appeler une fois après déploiement pour initialiser le CMS
    """
    load_initial_pages()
    
    return {
        "success": True,
        "message": f"CMS initialized with {len(CMS_PAGES)} pages",
        "pages": list(CMS_PAGES.keys())
    }

# Charger les pages au démarrage du serveur
load_initial_pages()
