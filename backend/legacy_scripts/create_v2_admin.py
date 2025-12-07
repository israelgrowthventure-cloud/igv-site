#!/usr/bin/env python3
"""
Création de l'utilisateur admin V2: admin@igv.co.il / admin123
"""
import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = "mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0"
DB_NAME = "igv_cms_db"

async def create_v2_admin():
    print("🔧 Création admin V2 CMS: admin@igv.co.il")
    
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    
    try:
        db = client[DB_NAME]
        users_collection = db.users
        
        # Vérifier si existe déjà
        existing = await users_collection.find_one({"email": "admin@igv.co.il"})
        if existing:
            print("✅ Utilisateur admin@igv.co.il existe déjà")
            return
        
        # Hasher le mot de passe
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        
        # Créer l'utilisateur
        admin_user = {
            "email": "admin@igv.co.il",
            "password": hashed_password.decode('utf-8'),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(admin_user)
        print(f"✅ Admin V2 créé avec ID: {result.inserted_id}")
        print("📧 Email: admin@igv.co.il")
        print("🔑 Password: admin123")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_v2_admin())
