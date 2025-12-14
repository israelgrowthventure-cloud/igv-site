#!/usr/bin/env python3
"""
Retrieve logs for failed backend deployment
"""
import os
import requests
import sys

SERVICE_ID = "srv-d4ka5q63jp1c738n6b2g"
DEPLOY_ID = "dep-d4utjtfpm1nc73bd2nd0"
API_KEY = os.environ.get('RENDER_API_KEY')
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

print(f"🔍 Fetching logs for {DEPLOY_ID}...")
url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{DEPLOY_ID}/logs"

try:
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        logs = resp.json()
        print("📝 DEPLOY LOGS:")
        for entry in logs:
            print(f"[{entry.get('timestamp')}] {entry.get('message')}")
    else:
        print(f"⚠️ Failed to get deploy logs: {resp.status_code}. Trying Service Logs...")
        service_log_url = f"https://api.render.com/v1/services/{SERVICE_ID}/logs?limit=100"
        svc_resp = requests.get(service_log_url, headers=HEADERS)
        if svc_resp.status_code == 200:
            svc_logs = svc_resp.json()
            print("📝 SERVICE LOGS (Last 100):")
            for entry in svc_logs:
                print(f"[{entry.get('timestamp')}] {entry.get('message')}")
        else:
            print(f"❌ Failed to get service logs: {svc_resp.status_code}")
except Exception as e:
    print(f"❌ Exception: {e}")
