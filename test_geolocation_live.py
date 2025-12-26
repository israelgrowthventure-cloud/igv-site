#!/usr/bin/env python3
"""Test géolocalisation en LIVE"""

import requests
import json

BASE_URL = "https://israelgrowthventure.com"

def test_geolocation():
    """Test détection géolocalisation"""
    print("🌍 TEST GÉOLOCALISATION LIVE")
    print("=" * 70)
    
    # Test 1: Depuis le backend
    print("\n📍 Test 1: Backend IGV")
    response = requests.get(f"{BASE_URL}/api/detect-location", timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.headers.get('content-type')}")
    print(f"   Response preview: {response.text[:200]}")
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"   Region: {data.get('region')}")
            print(f"   Country: {data.get('country')}")
            print(f"   Currency: {data.get('currency')}")
        except Exception as e:
            print(f"   JSON Parse Error: {e}")
    else:
        print(f"   Error: {response.text[:200]}")
    
    # Test 2: ipapi.co direct (pour comparaison)
    print("\n📍 Test 2: ipapi.co direct")
    try:
        response = requests.get("https://ipapi.co/json/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   IP: {data.get('ip')}")
            print(f"   Country Code: {data.get('country_code')}")
            print(f"   Country Name: {data.get('country_name')}")
            print(f"   City: {data.get('city')}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    test_geolocation()
