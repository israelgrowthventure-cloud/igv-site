#!/usr/bin/env python3
"""Test debug headers endpoint"""

import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("🔍 DEBUG: Headers reçus par le backend")
print("=" * 70)

try:
    response = requests.get(f"{BACKEND_URL}/api/debug/headers", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print("\n📋 Headers détectés:")
        print(f"   X-Forwarded-For: {data.get('x_forwarded_for')}")
        print(f"   X-Real-IP: {data.get('x_real_ip')}")
        print(f"   CF-Connecting-IP: {data.get('cf_connecting_ip')}")
        print(f"   True-Client-IP: {data.get('true_client_ip')}")
        print(f"   Client Host: {data.get('client_host')}")
        print(f"   Client Port: {data.get('client_port')}")
        
        print("\n📝 Tous les headers:")
        for key, value in data.get('headers', {}).items():
            print(f"   {key}: {value}")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n" + "=" * 70)

# Test geolocation
print("\n🌍 Test Géolocalisation")
print("=" * 70)
try:
    response = requests.get(f"{BACKEND_URL}/api/detect-location", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Region: {data.get('region')}")
        print(f"   ✅ Country: {data.get('country')}")
        print(f"   ✅ Currency: {data.get('currency')}")
    else:
        print(f"   ❌ Error {response.status_code}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

print("\n" + "=" * 70)
