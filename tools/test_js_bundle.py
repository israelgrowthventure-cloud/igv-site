#!/usr/bin/env python3
"""Test si le JavaScript React se charge et s'exécute correctement"""

import requests
from bs4 import BeautifulSoup
import re

PROD_URL = "https://israelgrowthventure.com"

def test_js_bundle():
    """Teste si le bundle JS se charge"""
    print("\n🔍 TESTING JAVASCRIPT BUNDLE\n")
    print("="*70)
    
    # Get main page
    response = requests.get(f"{PROD_URL}/admin", timeout=10)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find JS bundles
    scripts = soup.find_all('script', src=True)
    js_bundles = [s['src'] for s in scripts if '.js' in s['src']]
    
    print(f"\n📦 Found {len(js_bundles)} JS bundles\n")
    
    for bundle_src in js_bundles:
        # Make absolute URL
        if bundle_src.startswith('/'):
            bundle_url = f"{PROD_URL}{bundle_src}"
        elif bundle_src.startswith('http'):
            bundle_url = bundle_src
        else:
            bundle_url = f"{PROD_URL}/{bundle_src}"
        
        print(f"📥 Fetching: {bundle_src}")
        
        try:
            js_response = requests.get(bundle_url, timeout=10)
            js_code = js_response.text
            
            print(f"   Status: {js_response.status_code}")
            print(f"   Size: {len(js_code)} bytes")
            
            # Check for React keywords
            has_react = 'react' in js_code.lower() or 'React' in js_code
            has_reactdom = 'reactdom' in js_code.lower() or 'ReactDOM' in js_code
            has_router = 'browserrouter' in js_code.lower() or 'BrowserRouter' in js_code
            has_admin = 'admin' in js_code.lower()
            
            print(f"   Contains React: {has_react}")
            print(f"   Contains ReactDOM: {has_reactdom}")
            print(f"   Contains Router: {has_router}")
            print(f"   Contains 'admin': {has_admin}")
            
            # Check for common errors
            errors = []
            if 'Cannot read property' in js_code:
                errors.append("Runtime error: Cannot read property")
            if 'undefined is not' in js_code:
                errors.append("Runtime error: undefined")
            if 'SyntaxError' in js_code:
                errors.append("Syntax error in bundle")
            
            if errors:
                print(f"   ⚠️  Potential errors: {', '.join(errors)}")
            
            # Look for source maps
            has_sourcemap = '//# sourceMappingURL=' in js_code
            print(f"   Has sourcemap: {has_sourcemap}")
            
            print("")
            
        except Exception as e:
            print(f"   ❌ Error fetching bundle: {e}\n")

def check_console_errors():
    """Simule un test de console errors (nécessiterait Selenium pour être complet)"""
    print("\n⚠️  CONSOLE ERRORS CHECK (Manual)")
    print("="*70)
    print("\nPour vérifier les erreurs JavaScript:")
    print("1. Ouvrir https://israelgrowthventure.com/admin dans le navigateur")
    print("2. Ouvrir DevTools (F12)")
    print("3. Aller dans l'onglet Console")
    print("4. Chercher des erreurs rouges")
    print("")
    print("Erreurs communes à chercher:")
    print("   - Failed to compile")
    print("   - Cannot find module")
    print("   - Uncaught TypeError")
    print("   - Uncaught ReferenceError")
    print("")

if __name__ == "__main__":
    test_js_bundle()
    check_console_errors()
