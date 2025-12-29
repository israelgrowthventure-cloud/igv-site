"""
Monitor Render deployment progress
Polls backend health until new build is detected
"""
import time
import requests
import sys
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "https://igv-cms-backend.onrender.com"
CHECK_INTERVAL = 10  # seconds
MAX_WAIT = 600  # 10 minutes

print("=" * 70)
print("RENDER DEPLOYMENT MONITOR")
print(f"Started: {datetime.now().strftime('%H:%M:%S')}")
print("=" * 70)

start_time = time.time()
iteration = 0

# Check current state
print("\n[INITIAL STATE]")
try:
    resp = requests.get(f"{BACKEND_URL}/health", timeout=5)
    print(f"Backend: LIVE ({resp.status_code})")
    initial_render_id = resp.headers.get('rndr-id', 'unknown')
    print(f"Render ID: {initial_render_id}")
except:
    print("Backend: DOWN or ERROR")
    initial_render_id = None

print("\nWaiting for deployment to complete...")
print("(Checking every 10 seconds for up to 10 minutes)")

while time.time() - start_time < MAX_WAIT:
    iteration += 1
    elapsed = int(time.time() - start_time)
    
    print(f"\n[{elapsed}s] Check #{iteration}")
    
    try:
        # Check health
        resp = requests.get(f"{BACKEND_URL}/health", timeout=5)
        current_render_id = resp.headers.get('rndr-id', 'unknown')
        
        # Check if ID changed (new deployment)
        if current_render_id != initial_render_id and initial_render_id:
            print(f"✓ NEW DEPLOYMENT DETECTED!")
            print(f"  Old ID: {initial_render_id}")
            print(f"  New ID: {current_render_id}")
            break
        
        # Check if new routes are available
        routes_check = {
            "/api/invoices/": "Invoices",
            "/api/monetico/config": "Monetico",
            "/api/crm/tasks": "Tasks"
        }
        
        found_routes = 0
        for route, name in routes_check.items():
            try:
                r = requests.get(f"{BACKEND_URL}{route}", timeout=3)
                if r.status_code != 404:
                    print(f"  ✓ {name} route found!")
                    found_routes += 1
            except:
                pass
        
        if found_routes >= 2:
            print(f"\n✓ DEPLOYMENT SUCCESSFUL!")
            print(f"  {found_routes}/3 new routes active")
            break
        
        print(f"  Backend: LIVE | Render ID: {current_render_id[:12]}...")
        print(f"  New routes: {found_routes}/3")
        
    except requests.exceptions.Timeout:
        print("  Backend: TIMEOUT (may be restarting)")
    except requests.exceptions.ConnectionError:
        print("  Backend: DOWN (deploying)")
    except Exception as e:
        print(f"  Error: {str(e)[:50]}")
    
    time.sleep(CHECK_INTERVAL)

else:
    print(f"\n✗ TIMEOUT: No deployment detected after {MAX_WAIT}s")
    print("Check Render dashboard manually")
    sys.exit(1)

# Final verification
print("\n" + "=" * 70)
print("FINAL VERIFICATION")
print("=" * 70)

routes_to_test = [
    ("/health", "Health"),
    ("/api/detect-location", "Geolocation"),
    ("/api/invoices/", "Invoices"),
    ("/api/monetico/config", "Monetico"),
    ("/api/crm/tasks", "CRM Tasks")
]

results = []
for route, name in routes_to_test:
    try:
        resp = requests.get(f"{BACKEND_URL}{route}", timeout=5)
        status = "✓ OK" if resp.status_code in [200, 401] else f"✗ {resp.status_code}"
        results.append((name, status))
        print(f"{status} - {name}")
    except Exception as e:
        results.append((name, "✗ ERROR"))
        print(f"✗ ERROR - {name}")

success_count = sum(1 for _, s in results if "✓" in s)
print(f"\nRoutes active: {success_count}/{len(results)}")

if success_count >= 4:
    print("\n✓ DEPLOYMENT SUCCESSFUL!")
    sys.exit(0)
else:
    print("\n✗ DEPLOYMENT INCOMPLETE")
    sys.exit(1)
