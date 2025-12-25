"""Get Render environment variables for backend service"""
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
        
        # Look for admin-related variables
        admin_vars = {}
        for env_var in env_vars:
            key = env_var.get('envVar', {}).get('key', '')
            if any(x in key for x in ['ADMIN', 'BOOTSTRAP', 'JWT']):
                value = env_var.get('envVar', {}).get('value', '')
                # Mask sensitive values
                if 'PASSWORD' in key or 'SECRET' in key or 'TOKEN' in key:
                    admin_vars[key] = value[:5] + "..." if value else "NOT SET"
                else:
                    admin_vars[key] = value
        
        print("Admin-related environment variables on Render:")
        for key, value in admin_vars.items():
            print(f"  {key}: {value}")
            
        if not admin_vars:
            print("⚠️ No admin-related variables found!")
            
    else:
        print(f"Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"Exception: {str(e)}")
