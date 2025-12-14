#!/usr/bin/env python3
"""
Monitor V3 Deployment
"""
import requests
import time
import sys

BACKEND_URL = "https://igv-cms-backend.onrender.com/api/health"
FRONTEND_URL = "https://israelgrowthventure.com/"

def check_backend():
    try:
        resp = requests.get(BACKEND_URL, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            version = data.get('version', 'unknown')
            print(f"Backend: {resp.status_code} | Version: {version}")
            return version == "3.0"
        else:
            print(f"Backend: {resp.status_code}")
            return False
    except Exception as e:
        print(f"Backend Error: {e}")
        return False

def check_frontend():
    try:
        resp = requests.get(FRONTEND_URL, timeout=10)
        if resp.status_code == 200:
            print(f"Frontend: 200 OK | Size: {len(resp.content)} bytes")
            return True
        else:
            print(f"Frontend: {resp.status_code}")
            return False
    except Exception as e:
        print(f"Frontend Error: {e}")
        return False

print("⏳ Monitoring V3 Deployment (Timeout: 600s)")
start_time = time.time()
while time.time() - start_time < 600:
    print(f"\nTime: {int(time.time() - start_time)}s")
    b_ok = check_backend()
    f_ok = check_frontend()
    
    if b_ok and f_ok:
        print("\n✅ V3 DEPLOYMENT SUCCESSFUL!")
        sys.exit(0)
    
    time.sleep(20)

print("\n❌ Timeout waiting for deployment")
sys.exit(1)
