"""Bootstrap admin user on production"""
import httpx
import os

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
BOOTSTRAP_TOKEN = "igv-bootstrap-2025-secure-token-xyz789"

print(f"🚀 Bootstrapping admin user on {BACKEND_URL}")
print(f"📝 Using BOOTSTRAP_TOKEN: {BOOTSTRAP_TOKEN[:10]}...")

try:
    response = httpx.post(
        f"{BACKEND_URL}/api/admin/bootstrap",
        params={"token": BOOTSTRAP_TOKEN},
        timeout=30.0
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS: {data.get('message')}")
        print(f"📧 Admin email: {data.get('email')}")
        print(f"\n🔐 You can now login with:")
        print(f"   Email: postmaster@israelgrowthventure.com")
        print(f"   Password: Admin@igv2025#")
    else:
        print(f"\n❌ ERROR {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
