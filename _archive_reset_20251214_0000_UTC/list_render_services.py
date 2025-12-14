import os
import requests
from datetime import datetime

# Charger RENDER_API_KEY depuis .env
api_key = None
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('RENDER_API_KEY='):
                api_key = line.split('=', 1)[1].strip()
                break
except:
    pass

if not api_key:
    print("❌ RENDER_API_KEY non trouvée dans .env")
    exit(1)

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "application/json"
}

print("=" * 80)
print(f"LISTE DES SERVICES RENDER")
print(f"Date UTC: {datetime.utcnow().isoformat()}Z")
print("=" * 80)
print()

try:
    response = requests.get("https://api.render.com/v1/services?limit=20", headers=headers)
    response.raise_for_status()
    data = response.json()
    
    services = [s['service'] for s in data]
    igv_services = [s for s in services if 'igv' in s['name'].lower() or 'cms' in s['name'].lower()]
    
    if not igv_services:
        print("❌ Aucun service IGV/CMS trouvé")
        exit(1)
    
    print(f"✅ {len(igv_services)} service(s) trouvé(s):\n")
    
    for svc in igv_services:
        print(f"📦 {svc['name']}")
        print(f"   ID: {svc['id']}")
        print(f"   Type: {svc['type']}")
        print(f"   Repo: {svc['serviceDetails'].get('url', 'N/A')}")
        print(f"   Branch: {svc['serviceDetails'].get('branch', 'N/A')}")
        print()
    
except requests.exceptions.RequestException as e:
    print(f"❌ Erreur API: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"   Response: {e.response.text}")
    exit(1)
