"""Test login admin en production avec credentials corrects."""
import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 60)
print("TEST LOGIN ADMIN EN PRODUCTION")
print("=" * 60)

# Test 1: Essayer /admin/login
print("\n1️⃣ Test endpoint: /admin/login")
try:
    response = requests.post(
        f"{BACKEND_URL}/admin/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 2: Essayer /api/admin/login
print("\n2️⃣ Test endpoint: /api/admin/login")
try:
    response = requests.post(
        f"{BACKEND_URL}/api/admin/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 3: Essayer /auth/login
print("\n3️⃣ Test endpoint: /auth/login")
try:
    response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 4: Vérifier que le backend répond
print("\n4️⃣ Test santé backend: /")
try:
    response = requests.get(f"{BACKEND_URL}/", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n" + "=" * 60)
