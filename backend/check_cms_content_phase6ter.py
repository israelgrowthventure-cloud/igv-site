"""
Script de vérification du contenu CMS après restauration
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0')
DB_NAME = 'igv_cms_db'

async def check_content():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    page = await db.pages.find_one({'slug': 'home'})
    
    if page:
        html = page.get('content_html', '')
        print(f"Page ID: {page['_id']}")
        print(f"HTML Length: {len(html)}")
        print(f"Updated: {page.get('updated_at')}")
        print(f"\nHas 'Développez Votre Activité': {'Développez Votre Activité' in html}")
        print(f"Has 'Pourquoi Choisir IGV': {'Pourquoi Choisir IGV' in html}")
        print(f"Has 'Pack Analyse': {'Pack Analyse' in html}")
        print(f"\nFirst 500 chars:")
        print(html[:500])
    else:
        print("Page home not found!")
    
    client.close()

asyncio.run(check_content())
