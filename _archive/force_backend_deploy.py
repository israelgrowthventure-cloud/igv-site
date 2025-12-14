#!/usr/bin/env python3
"""
Force Backend Deployment via Render API
"""
import os
import requests
import time
import sys

SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"
API_KEY = os.environ.get('RENDER_API_KEY')
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print(f"🚀 Triggering deploy for {SERVICE_ID}...")
url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"

try:
    resp = requests.post(url, headers=HEADERS, json={"clearCache": "clear"})
    print(f"📥 Status: {resp.status_code}")
    
    if resp.status_code == 201:
        deploy = resp.json()
        deploy_id = deploy.get('id')
        print(f"✅ Deployment triggered: {deploy_id}")
        
        # Monitor
        print("⏳ Monitoring deployment status...")
        monitor_url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{deploy_id}"
        
        for _ in range(60): # 10 minutes
            r = requests.get(monitor_url, headers=HEADERS)
            if r.status_code == 200:
                d = r.json()
                status = d.get('status')
                print(f"   Status: {status}")
                
                if status == "live":
                    print("✅ Deployment LIVE!")
                    sys.exit(0)
                elif status in ["build_failed", "update_failed", "canceled"]:
                    print(f"❌ Deployment FAILED: {status}")
                    sys.exit(1)
            else:
                print(f"   ⚠️ Monitor status: {r.status_code}")
                
            time.sleep(10)
            
        print("⏱️ Timeout monitoring deployment")
        sys.exit(1)
        
    else:
        print(f"❌ Trigger failed: {resp.text}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Exception: {e}")
    sys.exit(1)
