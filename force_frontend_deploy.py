"""Force frontend redeploy after routing fixes"""
import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4no5dc9c44c73d1opgg"  # igv-site-web (frontend)

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY not set in environment")
    print("Set it with: $env:RENDER_API_KEY='your-key'")
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
    print(f"🚀 Triggering manual frontend redeploy...")
    print(f"   Service ID: {SERVICE_ID}")
    
    response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
    
    if response.status_code in [200, 201]:
        data = response.json()
        deploy_id = data.get('id', 'unknown')
        print(f"✅ Deploy triggered successfully!")
        print(f"   Deploy ID: {deploy_id}")
        print(f"\n⏳ Deployment will take ~3-5 minutes")
        print(f"   Monitor at: https://dashboard.render.com/web/{SERVICE_ID}")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
