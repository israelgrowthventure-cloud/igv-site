#!/usr/bin/env python3
"""
Diagnose Backend Deploys
"""
import os
import requests
import json
import sys

SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"
API_KEY = os.environ.get('RENDER_API_KEY')
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

print(f"🔍 Listing deploys for Backend {SERVICE_ID}...")
url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys?limit=5"

try:
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        deploys = resp.json()
        print(f"✅ Found {len(deploys)} deploys")
        
        for item in deploys:
            d = item.get('deploy', item)
            print(f"   - {d.get('id')} | {d.get('status')} | {d.get('createdAt')}")
            
    else:
        print(f"❌ Failed to list deploys: {resp.status_code} - {resp.text}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
