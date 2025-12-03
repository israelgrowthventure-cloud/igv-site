#!/usr/bin/env python3
"""
Tests automatiques pour le backend IGV
Teste toutes les routes critiques du CMS
"""
import requests
import sys
import time

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com/api"
LOCAL_URL = "http://localhost:8000/api"

# Utiliser le backend de production
BASE_URL = BACKEND_URL

print("=" * 60)
print("🧪 TESTS BACKEND IGV - V2 COMPLETE")
print("=" * 60)
print(f"Backend: {BASE_URL}\n")

# Variables globales
token = None
test_results = []

def test(name, func):
    """Execute un test et enregistre le résultat"""
    try:
        print(f"▶️  {name}...", end=" ")
        result = func()
        if result:
            print("✅ PASS")
            test_results.append((name, "PASS", None))
            return True
        else:
            print("❌ FAIL")
            test_results.append((name, "FAIL", "Returned False"))
            return False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        test_results.append((name, "FAIL", str(e)))
        return False

def test_health():
    """Test 1: Health check"""
    r = requests.get(f"{BASE_URL.replace('/api', '')}/api/health", timeout=10)
    return r.status_code == 200

def test_admin_login():
    """Test 2: Admin login avec JWT"""
    global token
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "postmaster@israelgrowthventure.com", "password": "Admin@igv"},
        timeout=10
    )
    if r.status_code == 200:
        data = r.json()
        token = data.get("access_token")
        return token is not None
    return False

def test_auth_me():
    """Test 3: GET /auth/me avec token"""
    if not token:
        raise Exception("No token available")
    r = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    return r.status_code == 200

def test_get_packs():
    """Test 4: GET /packs"""
    r = requests.get(f"{BASE_URL}/packs", timeout=10)
    if r.status_code == 200:
        packs = r.json()
        return isinstance(packs, list)
    return False

def test_get_pricing_rules():
    """Test 5: GET /pricing-rules"""
    r = requests.get(f"{BASE_URL}/pricing-rules", timeout=10)
    if r.status_code == 200:
        rules = r.json()
        return isinstance(rules, list)
    return False

def test_create_pricing_rule():
    """Test 6: POST /pricing-rules (auth required)"""
    if not token:
        raise Exception("No token available")
    r = requests.post(
        f"{BASE_URL}/pricing-rules",
        json={
            "zone_name": "TEST_ZONE",
            "country_codes": ["XX"],
            "price": 9999,
            "currency": "EUR",
            "active": True
        },
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    return r.status_code in [200, 201]

def test_get_pages():
    """Test 7: GET /pages"""
    r = requests.get(f"{BASE_URL}/pages", timeout=10)
    if r.status_code == 200:
        pages = r.json()
        return isinstance(pages, list)
    return False

def test_get_translations():
    """Test 8: GET /translations"""
    r = requests.get(f"{BASE_URL}/translations", timeout=10)
    if r.status_code == 200:
        translations = r.json()
        return isinstance(translations, list)
    return False

def test_pricing_country():
    """Test 9: GET /pricing/country/{code}"""
    r = requests.get(f"{BASE_URL}/pricing/country/FR", timeout=10)
    if r.status_code == 200:
        pricing = r.json()
        return "price" in pricing and "currency" in pricing
    return False

def test_get_orders():
    """Test 10: GET /orders (auth required)"""
    if not token:
        raise Exception("No token available")
    r = requests.get(
        f"{BASE_URL}/orders",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    return r.status_code == 200

# Exécution des tests
print("\n📋 TESTS PUBLICS (sans auth)")
print("-" * 60)
test("Health check", test_health)
test("GET /packs", test_get_packs)
test("GET /pricing/country/FR", test_pricing_country)
test("GET /pages", test_get_pages)
test("GET /translations", test_get_translations)
test("GET /pricing-rules", test_get_pricing_rules)

print("\n🔐 TESTS AUTHENTIFICATION")
print("-" * 60)
test("POST /auth/login (admin)", test_admin_login)
test("GET /auth/me", test_auth_me)

print("\n🔒 TESTS PROTÉGÉS (auth required)")
print("-" * 60)
test("GET /orders", test_get_orders)
test("POST /pricing-rules", test_create_pricing_rule)

# Résumé
print("\n" + "=" * 60)
print("📊 RÉSUMÉ DES TESTS")
print("=" * 60)
passed = sum(1 for _, status, _ in test_results if status == "PASS")
failed = sum(1 for _, status, _ in test_results if status == "FAIL")
total = len(test_results)

for name, status, error in test_results:
    symbol = "✅" if status == "PASS" else "❌"
    print(f"{symbol} {name}")
    if error:
        print(f"   └─ {error}")

print("\n" + "=" * 60)
print(f"Total: {total} | Passed: {passed} | Failed: {failed}")
success_rate = (passed / total * 100) if total > 0 else 0
print(f"Taux de réussite: {success_rate:.1f}%")
print("=" * 60)

# Exit code
sys.exit(0 if failed == 0 else 1)
