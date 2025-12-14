import requests
import json
import time

url = "https://igv-cms-backend.onrender.com/api/debug/imports"

print("🔍 Checking Import Errors...")
try:
    r = requests.get(url, timeout=10)
    if r.status_code == 200:
        data = r.json()
        print("✅ Debug Endpoint Reachable")
        if data.get("errors"):
            print("❌ Import Errors Found:")
            print(json.dumps(data["errors"], indent=2))
        else:
            print("✅ No Import Errors! All routers loaded.")
    else:
        print(f"⚠️ Endpoint returned {r.status_code}")
except Exception as e:
    print(f"❌ Error connecting: {e}")
