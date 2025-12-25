"""Check if admin user exists in MongoDB"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_admin():
    mongo_url = os.getenv('MONGODB_URI') or os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'igv_production')
    
    if not mongo_url:
        print("❌ MONGODB_URI not set")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "postmaster@israelgrowthventure.com"
    
    user = await db.users.find_one({"email": admin_email})
    
    if user:
        print(f"✅ Admin user exists:")
        print(f"   Email: {user.get('email')}")
        print(f"   Role: {user.get('role')}")
        print(f"   Has password_hash: {'password_hash' in user}")
    else:
        print(f"❌ No admin user found with email: {admin_email}")
        print(f"\nYou need to call POST /api/admin/bootstrap with BOOTSTRAP_TOKEN")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_admin())
