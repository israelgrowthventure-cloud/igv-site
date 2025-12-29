# -*- coding: utf-8 -*-
"""
DIAGNOSE DETAILED - 403/422 errors
"""
import requests
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = "https://igv-cms-backend.onrender.com"

print("DIAGNOSTIC DÉTAILLÉ DES ERREURS")
print("=" * 80)

# Test 403 invoice
print("\n[TEST 403] Invoice endpoint")
r = requests.get(f"{BASE}/api/invoices/")
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")

# Test 422 mini-analyse
print("\n[TEST 422] Mini-analyse")
payload = {"company_name": "Test", "brand_name": "TestBrand", "language": "fr"}
r = requests.post(f"{BASE}/api/mini-analysis", json=payload)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")

# Test 404 dashboard
print("\n[TEST 404] CRM Dashboard")
r = requests.get(f"{BASE}/api/crm/dashboard")
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")

# Check available routes
print("\n[ROUTES DISPONIBLES]")
r = requests.get(f"{BASE}/debug/routers")
data = r.json()
print("Routers chargés:")
for key, value in data.items():
    if 'router' in key.lower() or 'loaded' in key.lower():
        print(f"  {key}: {value}")
