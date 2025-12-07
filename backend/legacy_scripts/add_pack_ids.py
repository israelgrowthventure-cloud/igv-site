import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

async def add_ids():
    client = AsyncIOMotorClient(
        'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0',
        serverSelectionTimeoutMS=10000
    )
    db = client['igv_cms_db']
    
    # Get all packs without ID
    packs = await db.packs.find({"id": {"$exists": False}}).to_list(None)
    print(f"Found {len(packs)} packs without ID")
    
    for pack in packs:
        new_id = str(uuid.uuid4())
        await db.packs.update_one(
            {"_id": pack["_id"]},
            {"$set": {"id": new_id}}
        )
        print(f"  Added ID to: {pack['name']} -> {new_id}")
    
    print("\nVerification:")
    all_packs = await db.packs.find({}, {"_id": 0}).to_list(None)
    for p in all_packs:
        print(f"  {p['name']}: {p.get('id', 'NO ID')}")
    
    client.close()

asyncio.run(add_ids())
