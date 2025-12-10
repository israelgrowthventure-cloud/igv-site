#!/usr/bin/env python3
"""
Script pour lister les packs existants dans MongoDB
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/')
DB_NAME = os.environ.get('DB_NAME', 'IGV-Cluster')

async def list_packs():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    packs_collection = db['packs']
    
    print(f"📊 Packs dans {DB_NAME}:")
    packs = await packs_collection.find({}).to_list(length=10)
    
    for pack in packs:
        print(f"\n{'='*60}")
        print(f"ID: {pack.get('id', pack.get('_id', 'N/A'))}")
        print(f"Name FR: {pack.get('name', {}).get('fr', 'N/A')}")
        print(f"Description FR: {pack.get('description', {}).get('fr', 'N/A')}")
        print(f"Active: {pack.get('active', 'N/A')}")
        print(f"Order: {pack.get('order', 'N/A')}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(list_packs())
