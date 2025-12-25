"""Update ADMIN_PASSWORD on Render to correct value"""
import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"  # igv-cms-backend
CORRECT_PASSWORD = "Admin@igv2025#"

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# Get all current env vars
url_get = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"

try:
    print("📥 Fetching current environment variables...")
    response = httpx.get(url_get, headers=headers, timeout=30.0)
    
    if response.status_code != 200:
        print(f"❌ Error fetching vars: {response.status_code}")
        exit(1)
    
    current_vars = response.json()
    
    # Build updated list
    env_vars_list = []
    password_updated = False
    
    for env_var in current_vars:
        key = env_var.get('envVar', {}).get('key')
        value = env_var.get('envVar', {}).get('value')
        
        if key == 'ADMIN_PASSWORD':
            env_vars_list.append({
                "key": key,
                "value": CORRECT_PASSWORD
            })
            password_updated = True
            print(f"🔄 Updating ADMIN_PASSWORD...")
        else:
            env_vars_list.append({
                "key": key,
                "value": value
            })
    
    if not password_updated:
        print(f"⚠️  ADMIN_PASSWORD not found in current vars")
        exit(1)
    
    # Update all env vars
    url_put = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"
    
    print(f"📤 Pushing updated environment variables...")
    response_put = httpx.put(url_put, headers=headers, json=env_vars_list, timeout=30.0)
    
    if response_put.status_code in [200, 201]:
        print(f"\n✅ ADMIN_PASSWORD updated successfully!")
        print(f"   New value: {CORRECT_PASSWORD}")
        print(f"\n⚠️  You must manually redeploy the backend service")
        print(f"   Run: python force_backend_redeploy.py")
        print(f"\nAfter deployment:")
        print(f"   1. Wait ~2 minutes")
        print(f"   2. Run: python bootstrap_admin_production.py")
        print(f"   3. Try login with: {CORRECT_PASSWORD}")
    else:
        print(f"❌ Error updating vars: {response_put.status_code}")
        print(f"   Response: {response_put.text}")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
