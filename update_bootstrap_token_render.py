"""Update Render environment variables to add BOOTSTRAP_TOKEN"""
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

# First, get all current env vars
url_get = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"

try:
    print("📥 Fetching current environment variables...")
    response = httpx.get(url_get, headers=headers, timeout=30.0)
    
    if response.status_code != 200:
        print(f"❌ Error fetching vars: {response.status_code}")
        exit(1)
    
    current_vars = response.json()
    
    # Check if BOOTSTRAP_TOKEN already exists
    bootstrap_exists = False
    for env_var in current_vars:
        if env_var.get('envVar', {}).get('key') == 'BOOTSTRAP_TOKEN':
            bootstrap_exists = True
            print(f"⚠️  BOOTSTRAP_TOKEN already exists")
            break
    
    if not bootstrap_exists:
        # Build the update payload with all existing vars + new BOOTSTRAP_TOKEN
        env_vars_list = []
        
        # Keep all existing vars
        for env_var in current_vars:
            env_vars_list.append({
                "key": env_var.get('envVar', {}).get('key'),
                "value": env_var.get('envVar', {}).get('value')
            })
        
        # Add BOOTSTRAP_TOKEN
        env_vars_list.append({
            "key": "BOOTSTRAP_TOKEN",
            "value": BOOTSTRAP_TOKEN
        })
        
        # Update all env vars
        url_put = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"
        
        print(f"📤 Updating environment variables (adding BOOTSTRAP_TOKEN)...")
        response_put = httpx.put(url_put, headers=headers, json=env_vars_list, timeout=30.0)
        
        if response_put.status_code in [200, 201]:
            print(f"✅ BOOTSTRAP_TOKEN added successfully!")
            print(f"   Value: {BOOTSTRAP_TOKEN[:15]}...")
            print(f"\n⏳ Service will redeploy automatically (~2-3 minutes)")
            print(f"\nAfter deployment, run:")
            print(f"   python bootstrap_admin_production.py")
        else:
            print(f"❌ Error updating vars: {response_put.status_code}")
            print(f"   Response: {response_put.text}")
    else:
        print(f"\n✅ BOOTSTRAP_TOKEN is already configured")
        print(f"   You can now run: python bootstrap_admin_production.py")
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
