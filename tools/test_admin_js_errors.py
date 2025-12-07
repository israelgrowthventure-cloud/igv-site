#!/usr/bin/env python3
"""
Test des erreurs console JS sur /admin en production
Utilise requests + parsing pour détecter les erreurs JS
"""

import requests
import re
import json

ADMIN_URL = "https://israelgrowthventure.com/admin"

def test_admin_console_errors():
    print("\n🔍 TEST ERREURS CONSOLE /admin")
    print("=" * 60)
    
    try:
        print(f"\n📡 GET {ADMIN_URL}")
        response = requests.get(ADMIN_URL, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ Status: {response.status_code}")
            return False
        
        html = response.text
        
        # Chercher les bundles JS
        js_bundles = re.findall(r'src="([^"]*\.js)"', html)
        print(f"\n✅ Found {len(js_bundles)} JS bundles")
        
        for i, bundle in enumerate(js_bundles[:5], 1):
            print(f"   {i}. {bundle}")
            
            # Tester le chargement du bundle
            if bundle.startswith('/'):
                bundle_url = f"https://israelgrowthventure.com{bundle}"
            elif bundle.startswith('http'):
                bundle_url = bundle
            else:
                continue
            
            try:
                bundle_response = requests.head(bundle_url, timeout=10)
                status = "✅" if bundle_response.status_code == 200 else f"❌ {bundle_response.status_code}"
                print(f"      {status}")
            except Exception as e:
                print(f"      ❌ Error loading: {str(e)[:50]}")
        
        # Chercher des erreurs communes dans le HTML
        print("\n🔍 Analyzing HTML for common issues:")
        
        issues = []
        
        if "404" in html or "Not Found" in html:
            issues.append("⚠️  '404' or 'Not Found' text detected")
        
        if "error" in html.lower() and "error-boundary" not in html.lower():
            error_matches = re.findall(r'\berror\b.*?[.!]', html.lower(), re.IGNORECASE)
            if error_matches:
                issues.append(f"⚠️  'error' keyword found: {error_matches[0][:80]}")
        
        if "<div id=\"root\"></div>" in html and len(html) < 5000:
            issues.append("⚠️  Root div is empty and HTML is suspiciously small")
        
        if "Cannot" in html or "Uncaught" in html:
            issues.append("⚠️  JavaScript error keywords detected")
        
        # Vérifier si le root est vraiment vide
        root_match = re.search(r'<div id="root">(.*?)</div>', html, re.DOTALL)
        if root_match:
            root_content = root_match.group(1).strip()
            if root_content and "You need to enable JavaScript" not in root_content:
                print(f"   ✅ Root div has content: {root_content[:100]}")
            else:
                print("   ⚠️  Root div is empty (waiting for JS)")
        
        if issues:
            print("\n⚠️  ISSUES DETECTED:")
            for issue in issues:
                print(f"   {issue}")
        else:
            print("   ✅ No obvious HTML issues")
        
        # Tester la route API pages
        print("\n🔍 Testing backend API endpoints:")
        
        api_tests = [
            ("https://israelgrowthventure.com/api/health", "Health check"),
            ("https://israelgrowthventure.com/api/pages", "Pages list"),
            ("https://israelgrowthventure.com/api/packs", "Packs list"),
        ]
        
        for api_url, desc in api_tests:
            try:
                api_response = requests.get(api_url, timeout=10)
                status_emoji = "✅" if api_response.status_code == 200 else "❌"
                print(f"   {status_emoji} {desc}: {api_response.status_code}")
            except Exception as e:
                print(f"   ❌ {desc}: {str(e)[:50]}")
        
        return len(issues) == 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_admin_console_errors()
    print("\n" + "=" * 60)
    if success:
        print("✅ NO MAJOR ISSUES DETECTED")
    else:
        print("❌ ISSUES FOUND - CHECK LOGS ABOVE")
    print("=" * 60 + "\n")
