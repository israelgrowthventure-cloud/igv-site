#!/usr/bin/env python3
"""
Diagnostic Render API
"""
import os
import requests
import json

api_key = os.environ.get('RENDER_API_KEY')
print(f"🔑 Key found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"🔑 Key prefix: {api_key[:8]}...")

url = "https://api.render.com/v1/services?limit=20"
headers = {
    "Accept": "application/json",
    "Authorization": f"Bearer {api_key}"
}

print(f"\n📡 Requesting: {url}")
try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"📥 Status: {response.status_code}")
    
    if response.status_code == 200:
        services = response.json()
        print(f"✅ Services found: {len(services)}")
        if len(services) > 0:
            print(f"🔍 Type of services: {type(services)}")
            print(f"🔍 First item keys: {services[0].keys() if hasattr(services[0], 'keys') else 'Not a dict'}")
            print(f"🔍 First item raw: {json.dumps(services[0], indent=2)[:500]}...")
            
        for s in services:
             # Try 'service' key if list of wrappers
            svc = s.get('service', s)
            print(f"   - {svc.get('name')} | {svc.get('id')} | {svc.get('serviceDetails', {}).get('url', 'no-url')}")
            if svc.get('name') == 'igv-cms-backend':
                print(f"     🎯 FOUND TARGET BACKEND SERVICE: {svc.get('id')}")
                # Write ID to file for next step
                with open("backend_service_id.txt", "w") as f:
                    f.write(svc.get('id'))
    else:
        print(f"❌ Error content: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
