"""Get full ADMIN_PASSWORD value from Render"""
import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"  # igv-cms-backend

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

url = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"

try:
    response = httpx.get(url, headers=headers, timeout=30.0)
    
    if response.status_code == 200:
        env_vars = response.json()
        
        for env_var in env_vars:
            key = env_var.get('envVar', {}).get('key', '')
            if key == 'ADMIN_PASSWORD':
                value = env_var.get('envVar', {}).get('value', '')
                print(f"ADMIN_PASSWORD configured on Render:")
                print(f"  {value}")
                break
    else:
        print(f"Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"Exception: {str(e)}")
