"""
CRM routes for managing leads and orders
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from auth_routes import get_current_user, User

router = APIRouter(prefix="/crm", tags=["crm"])

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'igv_db')]

# Models
class Lead(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str
    source: str = "contact_form"  # contact_form, appointment, pack_inquiry
    status: str = "new"  # new, contacted, qualified, converted, closed
    language: str = "fr"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class Order(BaseModel):
    id: Optional[str] = None
    lead_id: Optional[str] = None
    pack_type: str
    pack_name: str
    amount: float
    currency: str
    zone: str
    status: str = "pending"  # pending, paid, failed, refunded
    payment_method: Optional[str] = None
    created_at: Optional[datetime] = None

@router.get("/leads", dependencies=[Depends(get_current_user)])
async def get_leads(
    status: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    limit: int = Query(100, le=500)
):
    """Get all leads with optional filtering"""
    query = {}
    if status:
        query["status"] = status
    if language:
        query["language"] = language
    
    # Get contacts from MongoDB
    leads = await db.contacts.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Convert timestamps
    for lead in leads:
        if isinstance(lead.get('timestamp'), str):
            lead['timestamp'] = datetime.fromisoformat(lead['timestamp'])
    
    return {"data": leads, "count": len(leads)}

@router.get("/leads/{lead_id}", dependencies=[Depends(get_current_user)])
async def get_lead(lead_id: str):
    """Get a specific lead by ID"""
    lead = await db.contacts.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"data": lead}

@router.patch("/leads/{lead_id}", dependencies=[Depends(get_current_user)])
async def update_lead(lead_id: str, update: LeadUpdate):
    """Update lead status or add notes"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.contacts.update_one(
        {"id": lead_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"message": "Lead updated successfully"}

@router.get("/orders", dependencies=[Depends(get_current_user)])
async def get_orders(limit: int = Query(100, le=500)):
    """Get all orders"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"data": orders, "count": len(orders)}

@router.get("/stats", dependencies=[Depends(get_current_user)])
async def get_stats():
    """Get CRM statistics"""
    total_leads = await db.contacts.count_documents({})
    new_leads = await db.contacts.count_documents({"status": "new"})
    total_orders = await db.orders.count_documents({})
    
    # Leads by language
    leads_by_lang = {}
    for lang in ["fr", "en", "he"]:
        count = await db.contacts.count_documents({"language": lang})
        leads_by_lang[lang] = count
    
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_orders": total_orders,
        "leads_by_language": leads_by_lang
    }
