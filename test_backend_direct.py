#!/usr/bin/env python3
"""Test backend direct"""

import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("🔍 Test Backend Direct")
print("=" * 70)

# Test 1: Health check
print("\n1. Health Check")
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Detect location
print("\n2. Detect Location")
try:
    response = requests.get(f"{BACKEND_URL}/api/detect-location", timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.headers.get('content-type')}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Region: {data.get('region')}")
        print(f"   Country: {data.get('country')}")
        print(f"   Currency: {data.get('currency')}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 70)
