"""
Post-Deployment Tests - Multilingual Mini-Analysis + PDF Header
Execute tests E.1, E.2, E.3 as per MISSION_MULTILANG_PDF.md
"""

import httpx
import json
import sys
import os
from datetime import datetime

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def test_gemini_multilang_endpoint(language: str):
    """
    Test E.1: Test Gemini multilingual support via admin endpoint
    """
    print(f"\n{'='*80}")
    print(f"TEST E.1.{language.upper()}: Admin Endpoint /api/admin/test-gemini-multilang")
    print(f"{'='*80}")
    
    url = f"{BACKEND_URL}/api/admin/test-gemini-multilang"
    params = {"language": language}
    
    try:
        print(f"→ Calling: POST {url}?language={language}")
        print(f"  (This may take 30-60s for Gemini API...)")
        
        response = httpx.post(url, params=params, timeout=120.0)
        
        print(f"← Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
        
        data = response.json()
        
        # Check success
        success = data.get("success", False)
        lang_fail = data.get("lang_fail_detected", True)
        first_200 = data.get("first_200_chars", "")
        model = data.get("model", "")
        tokens = data.get("tokens", {})
        
        print(f"\nResults:")
        print(f"  Model: {model}")
        print(f"  Success: {success}")
        print(f"  LANG_FAIL Detected: {lang_fail}")
        print(f"  Tokens: in={tokens.get('input', 0)}, out={tokens.get('output', 0)}")
        print(f"  Response Length: {data.get('response_length', 0)} chars")
        print(f"\nFirst 200 chars:")
        print(f"  {first_200}")
        
        # Validation
        if not success:
            print(f"\n❌ TEST FAILED: success=False")
            return False
        
        if lang_fail:
            print(f"\n❌ TEST FAILED: LANG_FAIL detected in response")
            return False
        
        print(f"\n✅ TEST PASSED: {language.upper()} response is correct")
        return True
        
    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_diag_gemini():
    """
    Quick diagnostic test to verify Gemini is configured
    """
    print(f"\n{'='*80}")
    print(f"PRE-TEST: Verify Gemini Configuration")
    print(f"{'='*80}")
    
    url = f"{BACKEND_URL}/api/diag-gemini"
    
    try:
        print(f"→ Calling: GET {url}")
        print(f"  (Cold start may take 30-60s...)")
        
        response = httpx.get(url, timeout=120.0)
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return False
        
        data = response.json()
        
        print(f"\nDiagnostic Results:")
        print(f"  OK: {data.get('ok', False)}")
        print(f"  Model: {data.get('model', 'N/A')}")
        print(f"  Test Response: {data.get('test_response', 'N/A')[:100]}")
        
        if not data.get('ok'):
            print(f"  Error: {data.get('error', 'Unknown')}")
            print(f"\n❌ Gemini not configured properly")
            return False
        
        print(f"\n✅ Gemini configured and working")
        return True
        
    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")
        return False


def main():
    print(f"\n{'#'*80}")
    print(f"# POST-DEPLOYMENT TESTS")
    print(f"# Backend: {BACKEND_URL}")
    print(f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")
    
    # Pre-test: Verify Gemini is configured
    if not test_diag_gemini():
        print(f"\n❌ ABORTING: Gemini not configured")
        sys.exit(1)
    
    # Test E.1: Multilingual admin endpoints
    results = {}
    
    print(f"\n\n{'#'*80}")
    print(f"# TEST SUITE E.1: GEMINI MULTILINGUAL ADMIN ENDPOINTS")
    print(f"{'#'*80}")
    
    results['fr'] = test_gemini_multilang_endpoint('fr')
    results['en'] = test_gemini_multilang_endpoint('en')
    results['he'] = test_gemini_multilang_endpoint('he')
    
    # Summary
    print(f"\n\n{'='*80}")
    print(f"TEST SUMMARY")
    print(f"{'='*80}")
    
    for lang, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {lang.upper()}")
    
    all_passed = all(results.values())
    
    print(f"\n{'='*80}")
    if all_passed:
        print("✅ ALL TESTS PASSED")
        print(f"{'='*80}")
        
        print(f"\n✅ MISSION E.1 COMPLETE")
        print(f"\nNext Steps:")
        print(f"  1. Test full mini-analysis on frontend (E.2)")
        print(f"  2. Generate PDFs in FR/EN/HE and verify header (E.2)")
        print(f"  3. Check Render logs for LANG_REQUESTED/HEADER_MERGE_OK (E.3)")
        
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        print(f"{'='*80}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
