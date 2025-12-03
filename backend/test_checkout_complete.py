#!/usr/bin/env python3
"""
Test complet du checkout flow - Vérifie que tout fonctionne
"""

import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

print("\n" + "="*70)
print("TEST CHECKOUT FLOW - Production")
print("="*70 + "\n")

# Test 1: Récupérer les packs
print("1️⃣ Test: GET /api/packs")
try:
    response = requests.get(f"{BACKEND_URL}/api/packs", timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        packs = response.json()
        print(f"   ✅ {len(packs)} packs trouvés")
        for pack in packs:
            slug = pack.get('slug', 'N/A')
            name = pack.get('name', {}).get('fr', 'N/A')
            print(f"      - {slug}: {name}")
    else:
        print(f"   ❌ Erreur {response.status_code}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 2: Pricing avec différents formats
print("\n2️⃣ Test: GET /api/pricing avec pack_slug")
test_slugs = ['analyse', 'succursales', 'franchise']
for slug in test_slugs:
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/pricing",
            params={'pack_slug': slug},  # Utiliser pack_slug au lieu de pack_id
            timeout=10
        )
        print(f"   pack_slug={slug}: {response.status_code}", end="")
        if response.status_code == 200:
            data = response.json()
            price = data.get('price', 'N/A')
            currency = data.get('currency', 'N/A')
            print(f" - ✅ {price} {currency}")
        else:
            print(f" - ❌")
    except Exception as e:
        print(f"   ❌ {slug}: {e}")

# Test 3: Page checkout
print("\n3️⃣ Test: Page checkout")
checkout_urls = [
    f"{FRONTEND_URL}/checkout/analyse",
    f"{FRONTEND_URL}/checkout/succursales",
    f"{FRONTEND_URL}/checkout/franchise"
]
for url in checkout_urls:
    try:
        response = requests.get(url, timeout=10)
        pack_name = url.split('/')[-1]
        if response.status_code == 200:
            print(f"   ✅ {pack_name}: Page accessible")
        else:
            print(f"   ❌ {pack_name}: {response.status_code}")
    except Exception as e:
        print(f"   ❌ {pack_name}: {e}")

# Test 4: Admin pages
print("\n4️⃣ Test: Admin CMS")
try:
    response = requests.get(f"{FRONTEND_URL}/admin/pages", timeout=10)
    if response.status_code == 200:
        print(f"   ✅ Admin accessible: {response.status_code}")
    else:
        print(f"   ❌ Admin: {response.status_code}")
except Exception as e:
    print(f"   ❌ Admin: {e}")

print("\n" + "="*70)
print("✅ Tests terminés")
print("="*70 + "\n")
