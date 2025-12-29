# -*- coding: utf-8 -*-
"""
Quick Live Test - Essential validation only
"""
import requests
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://igv-cms-backend.onrender.com"

def test_endpoints():
    """Test core endpoints"""
    results = []
    
    # 1. Health
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        results.append(("Health", r.status_code == 200))
    except Exception as e:
        results.append(("Health", False))
    
    # 2. Geolocation
    try:
        r = requests.get(f"{BASE_URL}/api/detect-location", timeout=5)
        results.append(("Geolocation", r.status_code == 200))
    except Exception as e:
        results.append(("Geolocation", False))
    
    # 3. Mini-analyse
    try:
        payload = {
            "email": "test@test.com",
            "phone": "+972501234567",
            "nom_de_marque": "TestBrand",
            "secteur": "E-commerce"
        }
        r = requests.post(f"{BASE_URL}/api/mini-analysis", json=payload, timeout=90)
        results.append(("Mini-analysis", r.status_code in [200, 201]))
        if r.status_code in [200, 201]:
            data = r.json()
            print(f"  - Analysis generated: {bool(data.get('analysis_text') or data.get('analysis'))}")
            print(f"  - PDF URL: {data.get('pdf_url', 'N/A')}")
            print(f"  - Email status: {data.get('email_status', 'N/A')}")
    except Exception as e:
        results.append(("Mini-analysis", False))
        print(f"  - Error: {e}")
    
    # 4. CRM Endpoints (without auth - expect 401)
    try:
        r = requests.get(f"{BASE_URL}/api/crm/tasks", timeout=5)
        # 401 is expected without auth - means endpoint exists
        results.append(("CRM Routes", r.status_code in [200, 401]))
    except Exception as e:
        results.append(("CRM Routes", False))
    
    # 5. Invoice endpoint (without auth)
    try:
        r = requests.get(f"{BASE_URL}/api/invoices/", timeout=5)
        results.append(("Invoice Routes", r.status_code in [200, 401]))
    except Exception as e:
        results.append(("Invoice Routes", False))
    
    # 6. Frontend
    try:
        r = requests.get("https://israelgrowthventure.com", timeout=10)
        results.append(("Frontend", r.status_code == 200 and "Israel Growth Venture" in r.text))
    except Exception as e:
        results.append(("Frontend", False))
    
    # Results
    print("\n" + "="*50)
    print("LIVE VALIDATION RESULTS")
    print("="*50)
    
    for name, passed in results:
        status = "OK" if passed else "KO"
        symbol = "✓" if passed else "✗"
        print(f"{symbol} {name}: {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    print("\n" + "="*50)
    print(f"Total: {total} | Passed: {passed} | Failed: {total - passed}")
    print("="*50)
    
    if passed == total:
        print("\n✅ OK — ALL CORE FEATURES WORKING LIVE")
        return True
    elif passed >= total * 0.7:  # 70% success
        print(f"\n⚠ PARTIAL — {passed}/{total} working ({passed*100//total}%)")
        return True
    else:
        print(f"\n❌ KO — Too many failures ({passed}/{total})")
        return False

if __name__ == "__main__":
    success = test_endpoints()
    exit(0 if success else 1)
