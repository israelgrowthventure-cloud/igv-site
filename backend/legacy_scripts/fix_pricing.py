import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix():
    client = AsyncIOMotorClient(
        'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0',
        serverSelectionTimeoutMS=10000
    )
    db = client['igv_cms_db']
    result = await db.pricing_rules.delete_many({})
    print(f'✅ Supprimé: {result.deleted_count} anciennes règles')
    client.close()

asyncio.run(fix())
