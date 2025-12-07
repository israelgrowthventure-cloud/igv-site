"""
Test Dashboard API Calls
========================

Simulates what the Dashboard.jsx does when loading stats
"""

import requests

BACKEND = "https://igv-cms-backend.onrender.com"

print("="*60)
print("Testing Dashboard API Calls")
print("="*60)

# Test Pages API (no auth needed for GET)
print("\n1. GET /api/pages (what pagesAPI.getAll() does)")
print("-"*60)
try:
    response = requests.get(f"{BACKEND}/api/pages")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        pages = response.json()
        print(f"Type: {type(pages)}")
        print(f"Length: {len(pages)}")
        print(f"✅ This should show as stats.pages = {len(pages)}")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test Packs API
print("\n2. GET /api/packs (what packsAPI.getAll() does)")
print("-"*60)
try:
    response = requests.get(f"{BACKEND}/api/packs")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        packs = response.json()
        print(f"Type: {type(packs)}")
        print(f"Length: {len(packs)}")
        print(f"✅ This should show as stats.packs = {len(packs)}")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test Orders API (will fail without auth)
print("\n3. GET /api/orders (what ordersAPI.getAll() does)")
print("-"*60)
try:
    response = requests.get(f"{BACKEND}/api/orders")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        orders = response.json()
        print(f"Type: {type(orders)}")
        print(f"Length: {len(orders)}")
        print(f"✅ This should show as stats.orders = {len(orders)}")
    elif response.status_code == 403:
        print(f"❌ 403 Forbidden: {response.json()}")
        print("⚠️  This causes Promise.all() to reject in Dashboard!")
        print("⚠️  Result: stats never gets set, stays at {pages: 0, packs: 0, orders: 0}")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n" + "="*60)
print("ROOT CAUSE IDENTIFIED")
print("="*60)
print("""
The Dashboard.jsx does:

  const [pagesRes, packsRes, ordersRes] = await Promise.all([
    pagesAPI.getAll(),
    packsAPI.getAll(),
    ordersAPI.getAll(),  // ← This throws 403 error
  ]);

Promise.all() FAILS when ANY promise rejects.
Result: catch block runs, stats stays at initial {pages: 0, packs: 0, orders: 0}

SOLUTION:
  Option 1: Remove ordersAPI.getAll() call (orders count not critical)
  Option 2: Use Promise.allSettled() instead of Promise.all()
  Option 3: Add auth token to orders call
  Option 4: Make orders endpoint public (bad security)

RECOMMENDED: Option 1 (remove orders call from dashboard)
""")
