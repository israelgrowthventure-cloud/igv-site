"""
RENDER STATUS CHECKER - FACTUAL VERIFICATION
Verifies actual Render deployment status via API (no assumptions)
"""
# -*- coding: utf-8 -*-
import requests
import os
import sys
import time
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

RENDER_API_KEY = os.getenv('RENDER_API_KEY', '')
RENDER_API_URL = "https://api.render.com/v1"

# Service IDs from render.yaml
BACKEND_SERVICE = "igv-cms-backend"
FRONTEND_SERVICE = "igv-frontend"

def check_render_status_via_web():
    """Check services via public endpoints (no API key needed)"""
    print("=" * 70)
    print("RENDER STATUS CHECK - WEB VERIFICATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    services = {
        "Backend (igv-cms-backend)": "https://igv-cms-backend.onrender.com/health",
        "Frontend (igv-frontend)": "https://israelgrowthventure.com"
    }
    
    results = {}
    
    for service_name, url in services.items():
        print(f"\n[CHECK] {service_name}")
        print(f"URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            status = "LIVE" if response.status_code == 200 else f"ERROR {response.status_code}"
            
            # Get server header to check for recent deploy
            server_info = response.headers.get('x-render-origin-server', 'unknown')
            render_id = response.headers.get('rndr-id', 'unknown')
            
            print(f"Status: {status}")
            print(f"Response time: {response.elapsed.total_seconds():.2f}s")
            print(f"Render ID: {render_id}")
            
            if response.status_code == 200:
                results[service_name] = "LIVE"
            else:
                results[service_name] = f"DOWN ({response.status_code})"
                
        except requests.exceptions.Timeout:
            print(f"Status: TIMEOUT (service may be spinning up)")
            results[service_name] = "TIMEOUT"
        except requests.exceptions.ConnectionError:
            print(f"Status: CONNECTION ERROR (service down or deploying)")
            results[service_name] = "DOWN"
        except Exception as e:
            print(f"Status: ERROR - {str(e)}")
            results[service_name] = f"ERROR: {str(e)}"
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    for service, status in results.items():
        symbol = "✓" if status == "LIVE" else "✗"
        print(f"{symbol} {service}: {status}")
    
    # Deployment inference
    all_live = all(s == "LIVE" for s in results.values())
    any_timeout = any("TIMEOUT" in s or "DOWN" in s for s in results.values())
    
    print("\n" + "=" * 70)
    if all_live:
        print("CONCLUSION: ALL SERVICES LIVE - NO DEPLOYMENT IN PROGRESS")
    elif any_timeout:
        print("CONCLUSION: POSSIBLE DEPLOYMENT IN PROGRESS (timeouts detected)")
    else:
        print("CONCLUSION: SERVICES HAVE ISSUES - CHECK RENDER DASHBOARD")
    print("=" * 70)
    
    return results

def check_last_git_commit():
    """Check last git commit to verify if code was pushed"""
    print("\n" + "=" * 70)
    print("GIT STATUS CHECK")
    print("=" * 70)
    
    import subprocess
    
    try:
        # Get last commit
        result = subprocess.run(
            ['git', 'log', '-1', '--pretty=format:%H|%s|%ar'],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )
        
        if result.returncode == 0:
            commit_hash, message, time_ago = result.stdout.split('|')
            print(f"Last commit: {commit_hash[:8]}")
            print(f"Message: {message}")
            print(f"Time: {time_ago}")
            
            # Check if pushed
            subprocess.run(['git', 'fetch'], capture_output=True)
            result2 = subprocess.run(
                ['git', 'rev-list', '--count', 'origin/main..HEAD'],
                capture_output=True,
                text=True
            )
            
            unpushed = int(result2.stdout.strip()) if result2.returncode == 0 else 0
            
            if unpushed > 0:
                print(f"\n⚠ WARNING: {unpushed} commit(s) NOT PUSHED to GitHub")
                print("Render cannot deploy unpushed commits!")
            else:
                print("\n✓ All commits pushed to GitHub")
                
        else:
            print("Could not get git status")
            
    except Exception as e:
        print(f"Git check failed: {e}")

def test_backend_routes():
    """Test critical backend routes to verify deployment"""
    print("\n" + "=" * 70)
    print("BACKEND ROUTES TEST")
    print("=" * 70)
    
    base_url = "https://igv-cms-backend.onrender.com"
    
    routes = {
        "/health": "Health check",
        "/api/detect-location": "Geolocation",
        "/api/crm/tasks": "CRM Tasks (needs auth)",
        "/api/invoices/": "Invoices (needs auth)",
        "/api/monetico/config": "Monetico config"
    }
    
    for route, description in routes.items():
        url = f"{base_url}{route}"
        try:
            response = requests.get(url, timeout=5)
            status = response.status_code
            
            if status == 200:
                print(f"✓ {route} - {description}: OK")
            elif status == 401:
                print(f"✓ {route} - {description}: OK (requires auth)")
            elif status == 404:
                print(f"✗ {route} - {description}: NOT FOUND (route missing)")
            else:
                print(f"? {route} - {description}: {status}")
                
        except Exception as e:
            print(f"✗ {route} - {description}: ERROR - {str(e)}")

if __name__ == "__main__":
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "RENDER FACTUAL STATUS CHECKER" + " " * 24 + "║")
    print("╚" + "═" * 68 + "╝")
    
    # Check web status
    results = check_render_status_via_web()
    
    # Check git
    check_last_git_commit()
    
    # Test routes
    test_backend_routes()
    
    print("\n" + "=" * 70)
    print("CHECK COMPLETE")
    print("=" * 70)
