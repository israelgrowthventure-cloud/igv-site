#!/usr/bin/env python3
import os
import requests
import json
import sys

SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"
API_KEY = os.environ.get('RENDER_API_KEY')
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print(f"🚀 Triggering Force Deploy for {SERVICE_ID} with Clear Cache...")
url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
payload = {
    "clearCache": "clear"
}

try:
    resp = requests.post(url, headers=HEADERS, json=payload)
    if resp.status_code == 201:
        data = resp.json()
        print(f"✅ Deploy triggered successfully!")
        print(f"   ID: {data.get('id')}")
        print(f"   Status: {data.get('status')}")
    else:
        print(f"❌ Failed to trigger deploy: {resp.status_code} - {resp.text}")

except Exception as e:
    print(f"❌ Exception: {e}")
