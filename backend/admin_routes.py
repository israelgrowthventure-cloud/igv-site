"""
Admin Routes - Dashboard Statistics & Lead Management
MISSION E: Admin endpoints for stats and lead viewing
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import os
import logging

router = APIRouter(prefix="/api/admin")

# MongoDB connection
mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME', 'igv_production')

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


@router.get("/stats/visits")
async def get_visit_stats_admin(range: str = "7d"):
    """
    MISSION E: Admin dashboard - Visit statistics
    
    GET /api/admin/stats/visits?range=7d|30d|90d
    
    Returns:
        - Total visits in range
        - Visits by page (top 10)
        - Visits by language
        - Top UTM sources
        - Conversion rate (mini-analysis requests)
    """
    current_db = get_db()
    if current_db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Calculate time range
        range_map = {
            "7d": 7,
            "30d": 30,
            "90d": 90
        }
        days = range_map.get(range, 7)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Total visits in range
        total_visits = await current_db.visits.count_documents({
            "timestamp": {"$gte": start_date}
        })
        
        # Visits by page (top 10)
        page_pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        pages = await current_db.visits.aggregate(page_pipeline).to_list(10)
        
        # Visits by language
        lang_pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {"_id": "$language", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        languages = await current_db.visits.aggregate(lang_pipeline).to_list(10)
        
        # Top UTM sources
        utm_pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}, "utm_source": {"$ne": None}}},
            {"$group": {"_id": "$utm_source", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        utm_sources = await current_db.visits.aggregate(utm_pipeline).to_list(10)
        
        # Mini-analysis conversions
        total_analyses = await current_db.mini_analyses.count_documents({
            "created_at": {"$gte": start_date}
        })
        
        # Leads created
        total_leads = await current_db.leads.count_documents({
            "created_at": {"$gte": start_date}
        })
        
        # Conversion rate (visits to mini-analysis)
        conversion_rate = (total_analyses / total_visits * 100) if total_visits > 0 else 0
        
        return {
            "range": range,
            "days": days,
            "total_visits": total_visits,
            "total_analyses": total_analyses,
            "total_leads": total_leads,
            "conversion_rate": round(conversion_rate, 2),
            "by_page": [{"page": p["_id"], "visits": p["count"]} for p in pages],
            "by_language": [{"language": l["_id"], "visits": l["count"]} for l in languages],
            "top_utm_sources": [{"source": u["_id"], "visits": u["count"]} for u in utm_sources]
        }
        
    except Exception as e:
        logging.error(f"Error getting admin visit stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/leads")
async def get_lead_stats_admin(range: str = "7d"):
    """
    MISSION E: Admin dashboard - Lead statistics
    
    GET /api/admin/stats/leads?range=7d|30d|90d
    
    Returns:
        - Total leads by status
        - Leads by sector
        - Leads by language
        - Recent leads (last 10)
    """
    current_db = get_db()
    if current_db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Calculate time range
        range_map = {
            "7d": 7,
            "30d": 30,
            "90d": 90
        }
        days = range_map.get(range, 7)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Leads by status
        status_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        by_status = await current_db.leads.aggregate(status_pipeline).to_list(10)
        
        # Leads by sector
        sector_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {"_id": "$sector", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        by_sector = await current_db.leads.aggregate(sector_pipeline).to_list(10)
        
        # Leads by language
        lang_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {"_id": "$language", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        by_language = await current_db.leads.aggregate(lang_pipeline).to_list(10)
        
        # Recent leads (last 10)
        recent_leads = await current_db.leads.find(
            {"created_at": {"$gte": start_date}},
            {"_id": 0, "email": 1, "brand_name": 1, "status": 1, "sector": 1, "language": 1, "created_at": 1}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        return {
            "range": range,
            "days": days,
            "by_status": [{"status": s["_id"], "count": s["count"]} for s in by_status],
            "by_sector": [{"sector": s["_id"], "count": s["count"]} for s in by_sector],
            "by_language": [{"language": l["_id"], "count": l["count"]} for l in by_language],
            "recent_leads": recent_leads
        }
        
    except Exception as e:
        logging.error(f"Error getting lead stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
