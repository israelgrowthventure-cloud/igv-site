"""
Tests production complets - israelgrowthventure.com
"""
import httpx
import sys

TESTS = [
    # Frontend pages
    ("Frontend Homepage", "GET", "https://israelgrowthventure.com/", None),
    ("Frontend Packs", "GET", "https://israelgrowthventure.com/packs", None),
    ("Frontend About", "GET", "https://israelgrowthventure.com/about", None),
    ("Frontend Contact", "GET", "https://israelgrowthventure.com/contact", None),
    ("Checkout Page", "GET", "https://israelgrowthventure.com/checkout/analyse", None),
    ("Admin Login", "GET", "https://israelgrowthventure.com/admin/login", None),
    ("Admin Pages", "GET", "https://israelgrowthventure.com/admin/pages", None),
    
    # Backend API
    ("Backend Health", "GET", "https://igv-cms-backend.onrender.com/api/health", None),
    ("API Packs", "GET", "https://igv-cms-backend.onrender.com/api/packs", None),
    ("API Pages CMS", "GET", "https://igv-cms-backend.onrender.com/api/pages", None),
    ("API Pricing IL", "GET", "https://igv-cms-backend.onrender.com/api/pricing?packId=analyse&zone=IL", None),
    ("API Auth", "POST", "https://igv-cms-backend.onrender.com/api/auth/login", 
     {"email": "postmaster@israelgrowthventure.com", "password": "Admin@igv"}),
]

print("="*80)
print("TESTS PRODUCTION - israelgrowthventure.com")
print("="*80)

passed = 0
failed = 0

for name, method, url, data in TESTS:
    try:
        if method == "GET":
            r = httpx.get(url, timeout=15, follow_redirects=True)
        else:
            r = httpx.post(url, json=data, timeout=15)
        
        if r.status_code in [200, 201]:
            print(f"✅ {name}: {r.status_code}")
            passed += 1
        else:
            print(f"❌ {name}: {r.status_code}")
            failed += 1
    except Exception as e:
        print(f"❌ {name}: {str(e)[:50]}")
        failed += 1

print("\n" + "="*80)
print(f"RÉSULTATS: {passed}/{len(TESTS)} tests réussis")
if failed == 0:
    print("🎉 PRODUCTION ENTIÈREMENT OPÉRATIONNELLE")
    sys.exit(0)
else:
    print(f"⚠️  {failed} tests en échec")
    sys.exit(1)
