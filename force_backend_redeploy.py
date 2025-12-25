"""Force backend redeploy to pick up new BOOTSTRAP_TOKEN"""
import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"  # igv-cms-backend

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"

payload = {
    "clearCache": "do_not_clear"
}

try:
    print(f"🚀 Triggering manual redeploy for service {SERVICE_ID}...")
    
    response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
    
    if response.status_code in [200, 201]:
        data = response.json()
        deploy_id = data.get('id', 'unknown')
        print(f"✅ Deploy triggered successfully!")
        print(f"   Deploy ID: {deploy_id}")
        print(f"\n⏳ Wait ~2-3 minutes for deployment to complete")
        print(f"   Then run: python bootstrap_admin_production.py")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
