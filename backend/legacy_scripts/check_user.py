#!/usr/bin/env python3
"""Vérifier la structure de l'utilisateur admin@igv.co.il"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0"
DB_NAME = "igv_cms_db"

async def check():
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    db = client[DB_NAME]
    
    user = await db.users.find_one({"email": "admin@igv.co.il"})
    if user:
        print("Utilisateur trouvé:")
        print(f"  Email: {user.get('email')}")
        print(f"  Champs: {list(user.keys())}")
        print(f"  Password field: {'password' if 'password' in user else 'password_hash' if 'password_hash' in user else 'AUCUN'}")
    else:
        print("❌ Utilisateur non trouvé")
    
    client.close()

asyncio.run(check())
