"""
CMS routes for managing page content with drag & drop support
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from auth_routes import get_current_user, User

router = APIRouter(prefix="/cms", tags=["cms"])

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'igv_db')]

# Models
class PageContent(BaseModel):
    id: Optional[str] = None
    page_slug: str  # home, about, packs, etc.
    language: str = "fr"  # fr, en, he
    gjs_html: str  # GrapesJS HTML content
    gjs_css: str  # GrapesJS CSS
    gjs_components: Optional[Dict[str, Any]] = None  # GrapesJS components JSON
    gjs_styles: Optional[Dict[str, Any]] = None  # GrapesJS styles JSON
    published: bool = False
    version: int = 1
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None

class PageContentCreate(BaseModel):
    page_slug: str
    language: str = "fr"
    gjs_html: str
    gjs_css: str
    gjs_components: Optional[Dict[str, Any]] = None
    gjs_styles: Optional[Dict[str, Any]] = None
    published: bool = False

class PageContentUpdate(BaseModel):
    gjs_html: Optional[str] = None
    gjs_css: Optional[str] = None
    gjs_components: Optional[Dict[str, Any]] = None
    gjs_styles: Optional[Dict[str, Any]] = None
    published: Optional[bool] = None

@router.get("/pages")
async def get_all_pages(
    language: Optional[str] = None,
    published_only: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Get all CMS pages"""
    query = {}
    if language:
        query["language"] = language
    if published_only:
        query["published"] = True
    
    pages = await db.cms_pages.find(query, {"_id": 0}).sort("page_slug", 1).to_list(100)
    return {"data": pages, "count": len(pages)}

@router.get("/pages/{page_slug}/{language}")
async def get_page(
    page_slug: str,
    language: str = "fr",
    published_only: bool = False
):
    """Get specific page content (public endpoint if published)"""
    query = {"page_slug": page_slug, "language": language}
    if published_only:
        query["published"] = True
    
    page = await db.cms_pages.find_one(query, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"data": page}

@router.post("/pages", dependencies=[Depends(get_current_user)])
async def create_page(content: PageContentCreate, current_user: User = Depends(get_current_user)):
    """Create new page content"""
    page_id = str(uuid.uuid4())
    page_data = content.model_dump()
    page_data["id"] = page_id
    page_data["created_at"] = datetime.now(timezone.utc).isoformat()
    page_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    page_data["created_by"] = current_user.email
    page_data["version"] = 1
    
    # Check if page already exists
    existing = await db.cms_pages.find_one({
        "page_slug": content.page_slug,
        "language": content.language
    })
    if existing:
        raise HTTPException(status_code=400, detail="Page already exists for this language")
    
    await db.cms_pages.insert_one(page_data)
    return {"message": "Page created successfully", "id": page_id}

@router.put("/pages/{page_id}", dependencies=[Depends(get_current_user)])
async def update_page(
    page_id: str,
    update: PageContentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update page content"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Increment version if content changed
    if any(k in update_data for k in ["gjs_html", "gjs_css", "gjs_components", "gjs_styles"]):
        result = await db.cms_pages.find_one({"id": page_id}, {"version": 1})
        if result:
            update_data["version"] = result.get("version", 1) + 1
    
    result = await db.cms_pages.update_one(
        {"id": page_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {"message": "Page updated successfully"}

@router.delete("/pages/{page_id}", dependencies=[Depends(get_current_user)])
async def delete_page(page_id: str, current_user: User = Depends(get_current_user)):
    """Delete page content"""
    result = await db.cms_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted successfully"}

@router.post("/pages/{page_id}/publish", dependencies=[Depends(get_current_user)])
async def publish_page(page_id: str, current_user: User = Depends(get_current_user)):
    """Publish a page"""
    result = await db.cms_pages.update_one(
        {"id": page_id},
        {"$set": {"published": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page published successfully"}

@router.post("/pages/{page_id}/unpublish", dependencies=[Depends(get_current_user)])
async def unpublish_page(page_id: str, current_user: User = Depends(get_current_user)):
    """Unpublish a page"""
    result = await db.cms_pages.update_one(
        {"id": page_id},
        {"$set": {"published": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page unpublished successfully"}
