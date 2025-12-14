import requests
import time
import sys

URL = "https://igv-cms-backend.onrender.com/api/health"

print(f"🔍 Monitoring Backend Health: {URL}")

start_time = time.time()
while True:
    try:
        if time.time() - start_time > 600: # 10 min timeout
            print("❌ Timeout waiting for backend")
            sys.exit(1)
            
        r = requests.get(URL, timeout=10)
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Backend LIVE! Version: {data.get('version')}")
            if data.get('version') == "3.0":
                print("🎯 V3 Deployed Successfully!")
                sys.exit(0)
            else:
                print(f"⚠️ Still on version {data.get('version')}...")
        else:
            print(f"⏳ Status: {r.status_code}")
            
    except Exception as e:
        print(f"⏳ Connection error: {e}")
        
    time.sleep(10)
