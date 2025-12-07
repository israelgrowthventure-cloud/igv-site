"""
Diagnostic Script - Admin Dashboard Issues
==========================================

Tests:
1. Pages count (should show 4+ pages from MongoDB)
2. Orders endpoint (403 error - authentication required)
3. Stats endpoint (if exists)

Run: python diagnose_admin_issues.py
"""

import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def test_pages_endpoint():
    """Test /api/pages endpoint"""
    print("\n" + "="*60)
    print("TEST 1: GET /api/pages")
    print("="*60)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/pages")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Type: {type(data)}")
            print(f"Pages count: {len(data) if isinstance(data, list) else 'Not a list'}")
            
            if isinstance(data, list) and len(data) > 0:
                print(f"\nFirst page structure:")
                first_page = data[0]
                print(json.dumps({
                    "id": first_page.get("id"),
                    "slug": first_page.get("slug"),
                    "title": first_page.get("title"),
                    "published": first_page.get("published"),
                }, indent=2))
                
                # Check if it's from CMS_PAGES (memory) or MongoDB
                has_uuid = first_page.get("id", "").count("-") == 4
                has_content_json = "content_json" in first_page
                has_content_html = "content_html" in first_page
                
                print(f"\nSource detection:")
                print(f"  - Has UUID ID: {has_uuid}")
                print(f"  - Has content_json: {has_content_json}")
                print(f"  - Has content_html: {has_content_html}")
                print(f"  - Likely source: {'MongoDB (api_router)' if has_uuid else 'Memory (cms_router)'}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

def test_orders_endpoint():
    """Test /api/orders endpoint"""
    print("\n" + "="*60)
    print("TEST 2: GET /api/orders (without auth)")
    print("="*60)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/orders")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 403:
            print("✅ Expected: 403 Not authenticated")
            print("⚠️  Dashboard should NOT call this endpoint without auth token")
            
    except Exception as e:
        print(f"Exception: {e}")

def test_with_auth():
    """Test orders endpoint WITH auth (if possible)"""
    print("\n" + "="*60)
    print("TEST 3: GET /api/orders (with fake token)")
    print("="*60)
    
    try:
        headers = {"Authorization": "Bearer fake-token-for-testing"}
        response = requests.get(f"{BACKEND_URL}/api/orders", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        
    except Exception as e:
        print(f"Exception: {e}")

def test_router_order():
    """Check which router handles /api/pages"""
    print("\n" + "="*60)
    print("TEST 4: Router Mounting Order Analysis")
    print("="*60)
    
    print("Backend server.py structure:")
    print("  Line 1472: app.include_router(api_router)     # /api/* from server.py")
    print("  Line 1475: app.include_router(cms_router)     # /api/* from cms_routes.py")
    print("\nBoth routers have /api/pages routes:")
    print("  - api_router.get('/pages')     → MongoDB (persistent)")
    print("  - cms_router.get('/pages')     → CMS_PAGES dict (memory)")
    print("\n⚠️  CONFLICT: cms_router is mounted AFTER api_router")
    print("   FastAPI uses FIRST matching route (api_router wins)")
    print("   BUT cms_router.get('/pages') is at line 113 (cms_routes.py)")
    print("   and api_router.get('/pages') is at line 1054 (server.py)")
    print("\n✅ Solution: Remove cms_router OR change its prefix")

if __name__ == "__main__":
    print("="*60)
    print("IGV Admin Dashboard - Diagnostic Report")
    print("="*60)
    print(f"Backend: {BACKEND_URL}")
    
    test_pages_endpoint()
    test_orders_endpoint()
    test_with_auth()
    test_router_order()
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print("\n1. Pages = 0 Issue:")
    print("   Root cause: Two routers conflict on /api/pages")
    print("   Fix: Remove cms_router or use different prefix (/api/cms/pages)")
    print("\n2. Orders 403 Error:")
    print("   Root cause: Dashboard calls /api/orders without auth token")
    print("   Fix: Remove ordersAPI.getAll() call from Dashboard OR pass token")
    print("\n3. Router Mounting:")
    print("   Current: api_router (line 1472) + cms_router (line 1475)")
    print("   Problem: Both have /api/pages routes")
    print("   Solution: Change cms_router prefix to /api/cms")
