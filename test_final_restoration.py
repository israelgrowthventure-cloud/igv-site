import requests
import sys

SERVICES = [
    {"name": "Frontend (Rescue)", "url": "https://israelgrowthventure.com", "expect": [200]},
    {"name": "Backend Health (V3)", "url": "https://igv-cms-backend.onrender.com/api/health", "expect": [200], "check_json": {"mongodb": "connected"}},
    {"name": "Backend Router CMS", "url": "https://igv-cms-backend.onrender.com/api/cms/pages", "expect": [401, 200, 403]}
]

print("🔍 FINAL RESTORATION VERIFICATION")
print("==================================")

success = True
for svc in SERVICES:
    try:
        print(f"Testing {svc['name']}...")
        r = requests.get(svc['url'], timeout=10)
        print(f"   URL: {svc['url']}")
        print(f"   Status: {r.status_code}")
        
        if r.status_code not in svc['expect']:
            print(f"   ❌ FAILED: Expected {svc['expect']}, got {r.status_code}")
            success = False
        else:
            if "check_json" in svc:
                json_data = r.json()
                print(f"   JSON: {json_data}")
                for k, v in svc['check_json'].items():
                    if json_data.get(k) != v:
                        print(f"   ❌ JSON MISMATCH: {k}={json_data.get(k)}, expected {v}")
                        success = False
                    else:
                        print(f"   ✅ JSON OK: {k}={v}")
            print(f"   ✅ OK")
            
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        success = False

if success:
    print("\n🎉 MISSION SUCCESS: V3 BACKEND RESTORED (Skeleton + DB + CMS/Auth)")
    sys.exit(0)
else:
    print("\n⚠️ VERIFICATION FAILED")
    sys.exit(1)
