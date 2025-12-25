"""Add BOOTSTRAP_TOKEN to Render environment variables"""
import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"  # igv-cms-backend
BOOTSTRAP_TOKEN = "igv-bootstrap-2025-secure-token-xyz789"

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

url = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"

payload = {
    "key": "BOOTSTRAP_TOKEN",
    "value": BOOTSTRAP_TOKEN
}

try:
    response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
    
    if response.status_code in [200, 201]:
        print(f"✅ BOOTSTRAP_TOKEN added successfully")
        print(f"   Value: {BOOTSTRAP_TOKEN[:10]}...")
        print(f"\n⚠️  Service will redeploy automatically")
        print(f"   Wait ~2 minutes, then run: python bootstrap_admin_production.py")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
