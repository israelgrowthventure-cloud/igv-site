"""Liste les pages existantes dans la base de données"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0')
DB_NAME = os.environ.get('DB_NAME', 'igv_cms_db')

async def list_pages():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    pages = await db.pages.find({}, {'slug': 1, 'title': 1, 'published': 1}).to_list(100)
    
    print("\n📚 Pages existantes dans la base:")
    print("=" * 50)
    for page in pages:
        status = "✅" if page.get('published') else "📝"
        print(f"{status} {page['slug']}")
        if 'title' in page and isinstance(page['title'], dict):
            print(f"   Titre FR: {page['title'].get('fr', 'N/A')}")
    print("=" * 50)
    print(f"\nTotal: {len(pages)} page(s)")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(list_pages())
