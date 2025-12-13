#!/usr/bin/env python3
"""
Diagnose Frontend Failure
"""
import os
import requests
import json
import sys

SERVICE_ID = "srv-d4no5dc9c44c73d1opgg"
API_KEY = os.environ.get('RENDER_API_KEY')
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

print(f"🔍 Listing deploys for Frontend {SERVICE_ID}...")
url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys?limit=5"

try:
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        deploys = resp.json()
        print(f"✅ Found {len(deploys)} deploys")
        
        target_deploy = None
        for item in deploys:
            d = item.get('deploy', item)
            print(f"   - {d.get('id')} | {d.get('status')} | {d.get('createdAt')}")
            if d.get('status') in ['build_failed', 'update_failed', 'canceled'] and not target_deploy:
                target_deploy = d
        
        if target_deploy:
            print(f"\n🎯 Analyzing Failed Deploy: {target_deploy.get('id')}")
            log_url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{target_deploy.get('id')}/logs"
            log_resp = requests.get(log_url, headers=HEADERS)
            
            if log_resp.status_code == 200:
                logs = log_resp.json()
                print("📝 LOGS (Last 50 lines):")
                # Print last 50 logs reversed to see error at bottom usually
                for entry in logs[-50:]:
                    print(f"[{entry.get('timestamp')}] {entry.get('message')}")
            else:
                print(f"❌ Failed to get logs: {log_resp.status_code}")
        else:
            print("⚠️ No failed deploy found in recent history (or API limit reached)")

    else:
        print(f"❌ Failed to list deploys: {resp.status_code} - {resp.text}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
