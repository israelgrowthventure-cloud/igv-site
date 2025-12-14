import requests
import sys

try:
    # Check Health and MongoDB Status
    r_health = requests.get("https://igv-cms-backend.onrender.com/api/health", timeout=5)
    health_data = r_health.json()
    print(f"Health Check: {r_health.status_code}")
    print(f"Health Data: {health_data}")

    if health_data.get("mongodb") == "connected":
        print("✅ MongoDB Connected")
    else:
        print("⚠️ MongoDB Disconnected")

    # Check CMS Endpoint (Public read or protected?)
    # /api/cms/pages returns all pages. It depends on get_current_user?
    # No, get_all_pages has Depends(get_current_user). So it should return 403 or 401.
    # If returned 404, it means router is not loaded.
    r_cms = requests.get("https://igv-cms-backend.onrender.com/api/cms/pages", timeout=5)
    print(f"CMS Pages Status: {r_cms.status_code}")
    
    if r_cms.status_code in [401, 403, 200]:
        print("✅ CMS Router Active")
        sys.exit(0)
    elif r_cms.status_code == 404:
        print("❌ CMS Router NOT Found (404)")
        sys.exit(1)
    else:
        print(f"⚠️ CMS Status Unexpected: {r_cms.status_code}")
        # Could be 500 if DB error
        sys.exit(1)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
