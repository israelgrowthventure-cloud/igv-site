#!/usr/bin/env python3
"""
Script d'initialisation DIRECT de la base MongoDB
==================================================

Connexion directe à MongoDB Atlas (pas via backend API)
Évite les timeouts des cold starts Render

PRÉREQUIS:
- pip install motor bcrypt pymongo

EXÉCUTION:
    python init_db_direct.py
"""
import asyncio
import bcrypt
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Configuration MongoDB
MONGO_URL = "mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0"
DB_NAME = "igv_cms_db"

# Credentials admin
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

async def main():
    print("=" * 70)
    print("🚀 INITIALISATION DIRECTE BASE DONNÉES MONGODB")
    print("=" * 70)
    
    # Connexion MongoDB
    print("\n📡 Connexion à MongoDB Atlas...")
    client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000
    )
    db = client[DB_NAME]
    
    try:
        # Test connexion
        await client.admin.command('ping')
        print("✅ Connexion MongoDB réussie\n")
        
        # ÉTAPE 1: Utilisateur admin
        print("👤 ÉTAPE 1: Création utilisateur admin...")
        users_collection = db.users
        
        existing_admin = await users_collection.find_one({"email": ADMIN_EMAIL})
        if existing_admin:
            print(f"✓ Admin existe déjà: {ADMIN_EMAIL}")
            # Vérifier si le champ est 'password' et le corriger en 'password_hash'
            if "password" in existing_admin and "password_hash" not in existing_admin:
                print("  ⚠️  Correction: password → password_hash")
                await users_collection.update_one(
                    {"email": ADMIN_EMAIL},
                    {"$rename": {"password": "password_hash"}}
                )
                print("  ✅ Champ corrigé")
        else:
            # Hasher le mot de passe
            hashed_password = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt())
            admin_user = {
                "email": ADMIN_EMAIL,
                "password_hash": hashed_password.decode('utf-8'),  # CORRECTION: password_hash au lieu de password
                "role": "admin",
                "created_at": datetime.utcnow().isoformat()
            }
            result = await users_collection.insert_one(admin_user)
            print(f"✅ Admin créé: {ADMIN_EMAIL}")
            print(f"   ID: {result.inserted_id}")
        
        # ÉTAPE 2: Packs
        print("\n📦 ÉTAPE 2: Création des packs...")
        packs_collection = db.packs
        
        packs_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "Analyse Marché",
                "description": "Étude de marché complète pour votre expansion en Israël",
                "base_price": 5000,
                "features": [
                    "Analyse sectorielle détaillée",
                    "Étude de la concurrence",
                    "Identification des opportunités",
                    "Rapport personnalisé"
                ],
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Création Succursales",
                "description": "Accompagnement juridique et administratif pour l'ouverture",
                "base_price": 15000,
                "features": [
                    "Enregistrement légal",
                    "Ouverture compte bancaire",
                    "Support administratif 6 mois",
                    "Bureau virtuel inclus"
                ],
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Contrat Franchise",
                "description": "Développement et gestion de votre réseau de franchise",
                "base_price": 25000,
                "features": [
                    "Rédaction contrat franchise",
                    "Formation franchisés",
                    "Support juridique continu",
                    "Outils marketing inclus"
                ],
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        
        packs_created = 0
        for pack in packs_data:
            existing = await packs_collection.find_one({"name": pack["name"]})
            if not existing:
                await packs_collection.insert_one(pack)
                packs_created += 1
                print(f"✅ Pack créé: {pack['name']}")
            else:
                print(f"✓ Pack existe: {pack['name']}")
        
        total_packs = await packs_collection.count_documents({})
        print(f"\n📊 Total packs: {total_packs}")
        
        # ÉTAPE 3: Pricing Rules
        print("\n💰 ÉTAPE 3: Création des règles de pricing...")
        pricing_collection = db.pricing_rules
        
        pricing_data = [
            {
                "id": "eu-zone-pricing",
                "zone_name": "EU",
                "country_codes": ["FR", "DE", "IT", "ES", "BE", "NL"],
                "price": 1.0,
                "currency": "EUR",
                "active": True
            },
            {
                "id": "us-ca-zone-pricing",
                "zone_name": "US_CA",
                "country_codes": ["US", "CA"],
                "price": 1.1,
                "currency": "USD",
                "active": True
            },
            {
                "id": "il-zone-pricing",
                "zone_name": "IL",
                "country_codes": ["IL"],
                "price": 0.9,
                "currency": "ILS",
                "active": True
            },
            {
                "id": "asia-africa-pricing",
                "zone_name": "ASIA_AFRICA",
                "country_codes": ["CN", "JP", "IN", "ZA", "EG"],
                "price": 1.2,
                "currency": "USD",
                "active": True
            },
            {
                "id": "default-pricing",
                "zone_name": "DEFAULT",
                "country_codes": ["*"],
                "price": 1.0,
                "currency": "USD",
                "active": True
            }
        ]
        
        rules_created = 0
        for rule in pricing_data:
            existing = await pricing_collection.find_one({"zone_name": rule["zone_name"]})
            if not existing:
                await pricing_collection.insert_one(rule)
                rules_created += 1
                print(f"✅ Règle créée: {rule['zone_name']} ({rule['price']}x)")
            else:
                print(f"✓ Règle existe: {rule['zone_name']}")
        
        total_rules = await pricing_collection.count_documents({})
        print(f"\n📊 Total règles: {total_rules}")
        
        # RÉSUMÉ
        print("\n" + "=" * 70)
        print("✅ INITIALISATION TERMINÉE")
        print("=" * 70)
        print(f"\n📊 RÉCAPITULATIF:")
        print(f"   • Users: {await users_collection.count_documents({})}")
        print(f"   • Packs: {total_packs}")
        print(f"   • Pricing Rules: {total_rules}")
        
        print(f"\n🔐 CONNEXION ADMIN:")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   URL: https://israelgrowthventure.com/admin/login")
        
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()
        print("\n🔌 Connexion MongoDB fermée")

if __name__ == "__main__":
    asyncio.run(main())
