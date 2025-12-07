#!/usr/bin/env python3
"""Test toutes les routes admin pour voir laquelle affiche une page blanche"""

import requests
from bs4 import BeautifulSoup

PROD_URL = "https://israelgrowthventure.com"

def test_route(route):
    """Teste une route et analyse le contenu"""
    url = f"{PROD_URL}{route}"
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check for content
        body = soup.find('body')
        body_text = body.get_text(strip=True) if body else ""
        has_content = len(body_text) > 100  # Au moins 100 caractères
        
        # Check for React root
        root = soup.find('div', id='root')
        root_has_children = root and len(root.find_all()) > 0 if root else False
        
        return {
            'route': route,
            'status': response.status_code,
            'final_url': response.url,
            'has_content': has_content,
            'body_length': len(body_text),
            'root_has_children': root_has_children,
            'redirected': response.url != url
        }
    except Exception as e:
        return {
            'route': route,
            'status': 'ERROR',
            'error': str(e)[:100]
        }

if __name__ == "__main__":
    print("\n🧪 TESTING ALL ADMIN ROUTES\n")
    print("="*70)
    
    routes = [
        "/admin",
        "/admin/login",
        "/admin/pages",
        "/admin/pages/new",
        "/admin/pages/home",
        "/admin/pages/packs",
        "/admin/pages/about-us",
        "/admin/packs",
    ]
    
    results = []
    for route in routes:
        print(f"\n📍 Testing: {route}")
        result = test_route(route)
        results.append(result)
        
        if result.get('status') == 'ERROR':
            print(f"   ❌ ERROR: {result.get('error')}")
        else:
            status_icon = "✅" if result['status'] == 200 else "❌"
            content_icon = "✅" if result['has_content'] else "⚠️ "
            
            print(f"   {status_icon} Status: {result['status']}")
            print(f"   {content_icon} Content: {result['body_length']} chars")
            print(f"   {'✅' if result['root_has_children'] else '⚠️ '} Root populated: {result['root_has_children']}")
            
            if result['redirected']:
                print(f"   🔀 Redirected to: {result['final_url']}")
    
    print("\n" + "="*70)
    print("\n📊 SUMMARY:\n")
    
    blank_pages = [r for r in results if r.get('status') == 200 and not r.get('has_content')]
    error_pages = [r for r in results if r.get('status') != 200 and r.get('status') != 'ERROR']
    
    if blank_pages:
        print("⚠️  BLANK PAGES (200 but no content):")
        for r in blank_pages:
            print(f"   - {r['route']}")
    
    if error_pages:
        print("\n❌ ERROR PAGES (non-200):")
        for r in error_pages:
            print(f"   - {r['route']}: {r['status']}")
    
    if not blank_pages and not error_pages:
        print("✅ All routes have content!")
    
    print("")
