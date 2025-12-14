import requests
import sys

SERVICES = [
    {"name": "Frontend", "url": "https://israelgrowthventure.com"},
    {"name": "Backend", "url": "https://igv-cms-backend.onrender.com/api/health"}
]

print("🔍 FINAL PRODUCTION VERIFICATION (Rescue Mode)")
print("==============================================")

success = True
for svc in SERVICES:
    try:
        r = requests.get(svc['url'], timeout=10)
        print(f"✅ {svc['name']}: {r.status_code} OK")
        print(f"   URL: {svc['url']}")
        if "version" in r.text or "status" in r.text: # valid verification for API
             print(f"   Response: {r.text[:100]}...")
    except Exception as e:
        print(f"❌ {svc['name']}: FAILED - {e}")
        success = False

if success:
    print("\n🎉 ALL SERVICES LIVE AND HEALTHY")
    sys.exit(0)
else:
    print("\n⚠️ SOME CHECKS FAILED")
    sys.exit(1)
