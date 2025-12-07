#!/usr/bin/env python3
"""
Test HTTP de l'admin IGV - Diagnostic page blanche
Vérifie que /admin charge correctement le HTML + bundles JS
"""

import requests
from bs4 import BeautifulSoup
import json

ADMIN_URL = "https://israelgrowthventure.com/admin"

def test_admin_entrypoint():
    print("\n🔍 DIAGNOSTIC ADMIN ENTRYPOINT")
    print("=" * 60)
    
    try:
        print(f"\n📡 GET {ADMIN_URL}")
        response = requests.get(ADMIN_URL, timeout=15, allow_redirects=True)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Final URL: {response.url}")
        print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"   Content-Length: {len(response.content)} bytes")
        
        if response.status_code != 200:
            print(f"\n❌ ERROR: Expected 200, got {response.status_code}")
            return False
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Vérifier <head>
        print("\n📄 HTML <head>:")
        head = soup.find('head')
        if head:
            title = head.find('title')
            print(f"   <title>: {title.string if title else 'NOT FOUND'}")
            
            # Scripts dans head
            head_scripts = head.find_all('script')
            print(f"   Scripts in <head>: {len(head_scripts)}")
            for i, script in enumerate(head_scripts[:3], 1):
                src = script.get('src', 'inline')
                print(f"      {i}. {src}")
        else:
            print("   ⚠️  No <head> found")
        
        # Vérifier <body>
        print("\n📄 HTML <body>:")
        body = soup.find('body')
        if body:
            # Chercher root divs communs
            root_ids = ['root', 'admin-root', 'app', 'admin', '__next']
            found_roots = []
            for root_id in root_ids:
                elem = body.find(id=root_id)
                if elem:
                    found_roots.append(root_id)
                    print(f"   ✅ Found root: <div id=\"{root_id}\">")
            
            if not found_roots:
                print("   ⚠️  No common root div found (root, admin-root, app)")
                # Afficher premiers divs
                divs = body.find_all('div', limit=5)
                print(f"   First divs: {[d.get('id', d.get('class', 'no-id')) for d in divs]}")
            
            # Scripts dans body
            body_scripts = body.find_all('script')
            print(f"\n   Scripts in <body>: {len(body_scripts)}")
            for i, script in enumerate(body_scripts[:5], 1):
                src = script.get('src', 'inline')
                print(f"      {i}. {src}")
        else:
            print("   ❌ No <body> found")
        
        # Vérifier bundles React typiques
        print("\n🔍 Bundles React/Admin:")
        all_scripts = soup.find_all('script', src=True)
        react_bundles = [s['src'] for s in all_scripts if 'main' in s['src'] or 'bundle' in s['src'] or 'admin' in s['src']]
        
        if react_bundles:
            for bundle in react_bundles:
                print(f"   ✅ {bundle}")
        else:
            print("   ⚠️  No obvious React bundle found (main.*.js, bundle.*.js)")
        
        # Afficher extrait HTML body (premiers 500 chars)
        print("\n📄 Body content preview (first 500 chars):")
        body_text = soup.body.get_text(strip=True) if soup.body else "NO BODY"
        print(f"   {body_text[:500]}")
        
        # Chercher messages d'erreur
        if "error" in response.text.lower() or "404" in response.text or "not found" in response.text.lower():
            print("\n⚠️  WARNING: HTML contains error keywords")
        
        return response.status_code == 200 and len(found_roots) > 0
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ NETWORK ERROR: {e}")
        return False
    except Exception as e:
        print(f"\n❌ PARSING ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_admin_entrypoint()
    print("\n" + "=" * 60)
    if success:
        print("✅ ADMIN ENTRYPOINT OK")
    else:
        print("❌ ADMIN ENTRYPOINT HAS ISSUES")
    print("=" * 60 + "\n")
