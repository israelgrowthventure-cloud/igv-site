#!/usr/bin/env python3
"""
Tests HTTP Production - Validation endpoints sans navigateur
Objectif : Vérifier que frontend et backend sont accessibles et répondent correctement
"""
import requests
import json
import sys
from datetime import datetime, timezone
from typing import Dict, Any, List

class ProductionHTTPTests:
    def __init__(self):
        self.frontend_url = "https://israelgrowthventure.com"
        self.backend_url = "https://igv-cms-backend.onrender.com"
        self.results: List[Dict[str, Any]] = []
        self.passed = 0
        self.failed = 0
        
    def test(self, name: str, url: str, method: str = "GET", expected_status: int = 200,
             should_contain: str = None, should_be_json: bool = False, headers: Dict = None) -> bool:
        """Execute un test HTTP et enregistre le résultat"""
        print(f"\n{'='*80}")
        print(f"TEST: {name}")
        print(f"URL: {url}")
        print(f"Method: {method} | Expected: {expected_status}")
        
        try:
            response = requests.request(
                method, url, 
                headers=headers or {},
                timeout=15,
                allow_redirects=True
            )
            
            actual_status = response.status_code
            success = actual_status == expected_status
            
            # Check content
            content_check = True
            if should_contain and success:
                content_check = should_contain in response.text
                if not content_check:
                    print(f"❌ Content check failed: '{should_contain}' not found")
            
            if should_be_json and success:
                try:
                    data = response.json()
                    content_check = isinstance(data, dict)
                    if content_check:
                        print(f"✓ Valid JSON: {json.dumps(data, indent=2)[:200]}")
                except:
                    content_check = False
                    print(f"❌ Invalid JSON response")
            
            success = success and content_check
            
            result = {
                "name": name,
                "url": url,
                "method": method,
                "expected_status": expected_status,
                "actual_status": actual_status,
                "content_length": len(response.content),
                "success": success,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            if success:
                print(f"✅ PASS - Status: {actual_status} | Content: {len(response.content)} bytes")
                self.passed += 1
            else:
                print(f"❌ FAIL - Expected: {expected_status}, Got: {actual_status}")
                self.failed += 1
                
            self.results.append(result)
            return success
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            self.results.append({
                "name": name,
                "url": url,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            self.failed += 1
            return False
    
    def run_all_tests(self):
        """Execute tous les tests de production"""
        print("\n" + "="*80)
        print("PRODUCTION HTTP TESTS - israelgrowthventure.com")
        print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
        print("="*80)
        
        # Test 1: Frontend accessible
        self.test(
            "Frontend Homepage",
            self.frontend_url,
            should_contain="<title>"
        )
        
        # Test 2: Backend health
        self.test(
            "Backend Health Check",
            f"{self.backend_url}/api/health",
            should_be_json=True
        )
        
        # Test 3: Backend debug imports (optionnel)
        self.test(
            "Backend Debug Imports",
            f"{self.backend_url}/api/debug/imports",
            should_be_json=True
        )
        
        # Test 4: CMS Pages endpoint (doit être protégé = 401 ou accessible = 200)
        cms_response = requests.get(f"{self.backend_url}/api/cms/pages", timeout=10)
        cms_ok = cms_response.status_code in [200, 401, 403]
        self.results.append({
            "name": "CMS Pages Endpoint",
            "url": f"{self.backend_url}/api/cms/pages",
            "actual_status": cms_response.status_code,
            "expected": "200 or 401/403",
            "success": cms_ok,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        if cms_ok:
            print(f"\n✅ CMS endpoint responds: {cms_response.status_code}")
            self.passed += 1
        else:
            print(f"\n❌ CMS endpoint error: {cms_response.status_code}")
            self.failed += 1
        
        # Test 5: CRM Leads endpoint (doit être protégé = 401/403)
        crm_response = requests.get(f"{self.backend_url}/api/crm/leads", timeout=10)
        crm_ok = crm_response.status_code in [401, 403]
        self.results.append({
            "name": "CRM Leads Endpoint (Protected)",
            "url": f"{self.backend_url}/api/crm/leads",
            "actual_status": crm_response.status_code,
            "expected": "401 or 403 (protected)",
            "success": crm_ok,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        if crm_ok:
            print(f"✅ CRM endpoint protected: {crm_response.status_code}")
            self.passed += 1
        else:
            print(f"❌ CRM endpoint unexpected status: {crm_response.status_code}")
            self.failed += 1
        
        # Summary
        print("\n" + "="*80)
        print("SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"Total: {self.passed + self.failed}")
        
        # Save results
        with open("scripts/test_results_http.json", "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "passed": self.passed,
                "failed": self.failed,
                "results": self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Results saved to scripts/test_results_http.json")
        
        return self.failed == 0

if __name__ == "__main__":
    tester = ProductionHTTPTests()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
