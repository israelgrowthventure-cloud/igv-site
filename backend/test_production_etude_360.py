"""
Production Test Suite for Étude d'Implantation 360° Feature

This script runs comprehensive tests to validate the complete flow:
1. Backend health check
2. Frontend health check
3. Étude 360 page availability
4. Lead creation API endpoint
5. Thank you page availability
6. Non-regression test (packs page)

Usage:
    python test_production_etude_360.py
"""

import requests
import json
from datetime import datetime

# Service URLs
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Test results
results = []

def test_step(name, url, method="GET", json_data=None, expected_status=200, contains=None):
    """Execute a test step and record the result"""
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{timestamp}] {name}")
    print(f"  URL: {url}")
    print(f"  Method: {method}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=15)
        elif method == "POST":
            print(f"  Payload: {json.dumps(json_data, indent=2)}")
            response = requests.post(url, json=json_data, timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"  Status: {response.status_code}")
        
        # Check status code
        status_match = response.status_code == expected_status
        
        # Check content if specified
        content_match = True
        if contains:
            content_match = contains in response.text
            print(f"  Contains '{contains}': {content_match}")
        
        # Overall result
        success = status_match and content_match
        
        if success:
            print(f"  Result: ✅ PASS")
        else:
            print(f"  Result: ❌ FAIL")
            if not status_match:
                print(f"    Expected status {expected_status}, got {response.status_code}")
            if not content_match:
                print(f"    Expected content '{contains}' not found")
        
        results.append({
            "name": name,
            "success": success,
            "status_code": response.status_code,
            "expected_status": expected_status
        })
        
        return success
        
    except Exception as e:
        print(f"  Result: ❌ ERROR - {e}")
        results.append({
            "name": name,
            "success": False,
            "error": str(e)
        })
        return False

def run_tests():
    """Run all production tests"""
    
    print(f"\n{'#'*60}")
    print(f"# Production Test Suite - Étude 360°")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*60}")
    
    # Test 1: Backend health
    test_step(
        name="Test 1: Backend Health Check",
        url=f"{BACKEND_URL}/api/health",
        method="GET",
        expected_status=200
    )
    
    # Test 2: Frontend health
    test_step(
        name="Test 2: Frontend Health Check",
        url=FRONTEND_URL,
        method="GET",
        expected_status=200
    )
    
    # Test 3: Étude 360 page (CMS content loaded dynamically by React)
    test_step(
        name="Test 3: Étude 360° Page",
        url=f"{FRONTEND_URL}/etude-implantation-360",
        method="GET",
        expected_status=200
        # Note: Content is loaded dynamically by React from CMS API, not in initial HTML
    )
    
    # Test 4: Lead creation API
    test_payload = {
        "full_name": "TEST_PRODUCTION_ETUDE360",
        "work_email": f"test+prod-etude360-{int(datetime.now().timestamp())}@israelgrowthventure.com",
        "role": "Production Test",
        "brand_group": "Test Suite",
        "implantation_horizon": "unknown",
        "source": "production_test_suite",
        "locale": "fr"
    }
    
    test_step(
        name="Test 4: Lead Creation API",
        url=f"{BACKEND_URL}/api/leads/etude-implantation-360",
        method="POST",
        json_data=test_payload,
        expected_status=201
    )
    
    # Test 5: Thank you page (CMS content loaded dynamically by React)
    test_step(
        name="Test 5: Thank You Page",
        url=f"{FRONTEND_URL}/etude-implantation-merci",
        method="GET",
        expected_status=200
        # Note: Content is loaded dynamically by React from CMS API, not in initial HTML
    )
    
    # Test 6: Non-regression - Packs page
    test_step(
        name="Test 6: Non-regression - Packs Page",
        url=f"{FRONTEND_URL}/packs",
        method="GET",
        expected_status=200
    )
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Test Summary")
    print(f"{'='*60}")
    
    total = len(results)
    passed = sum(1 for r in results if r["success"])
    failed = total - passed
    
    print(f"\nTotal tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    
    if failed > 0:
        print(f"\nFailed tests:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['name']}")
                if "error" in r:
                    print(f"    Error: {r['error']}")
                else:
                    print(f"    Status: {r.get('status_code')} (expected {r.get('expected_status')})")
    
    print(f"\n{'='*60}")
    
    if passed == total:
        print(f"\n✅ All tests passed - Feature is production-ready!")
        return True
    else:
        print(f"\n❌ Some tests failed - Investigation required")
        return False

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
