#!/usr/bin/env python3
"""
Diagnostic du problème de pricing sur la page /packs
"""
import httpx

BACKEND_URL = "https://igv-cms-backend.onrender.com/api"

print("=" * 80)
print("DIAGNOSTIC PRICING /PACKS")
print("=" * 80)

# 1. Vérifier les packs retournés par l'API
print("\n1. Récupération des packs depuis /api/packs:")
r = httpx.get(f"{BACKEND_URL}/packs", timeout=15)
packs = r.json()

for pack in packs:
    print(f"\n📦 {pack['name']['fr']}")
    print(f"   ID (UUID): {pack['id']}")
    print(f"   Slug (si existe): {pack.get('slug', 'N/A')}")
    print(f"   Order: {pack.get('order', 'N/A')}")

# 2. Tester l'API pricing avec les IDs MongoDB
print("\n" + "=" * 80)
print("2. Test /api/pricing avec IDs MongoDB (zone IL):")
print("=" * 80)

for pack in packs:
    pack_id = pack['id']
    pack_name = pack['name']['fr']
    
    try:
        r = httpx.get(
            f"{BACKEND_URL}/pricing",
            params={"packId": pack_id, "zone": "IL"},
            timeout=15
        )
        
        if r.status_code == 200:
            data = r.json()
            print(f"\n✅ {pack_name} (ID: {pack_id[:8]}...)")
            print(f"   Prix: {data['total_price']} {data['currency_symbol']}")
            print(f"   Display: {data['display']['total']}")
        else:
            print(f"\n❌ {pack_name} (ID: {pack_id[:8]}...)")
            print(f"   HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"\n❌ {pack_name} (ID: {pack_id[:8]}...)")
        print(f"   Exception: {str(e)}")

# 3. Tester avec les slugs
print("\n" + "=" * 80)
print("3. Test /api/pricing avec slugs (zone IL):")
print("=" * 80)

slugs = ['analyse', 'succursales', 'franchise']

for slug in slugs:
    try:
        r = httpx.get(
            f"{BACKEND_URL}/pricing",
            params={"packId": slug, "zone": "IL"},
            timeout=15
        )
        
        if r.status_code == 200:
            data = r.json()
            print(f"\n✅ {slug}")
            print(f"   Prix: {data['total_price']} {data['currency_symbol']}")
            print(f"   Display: {data['display']['total']}")
        else:
            print(f"\n❌ {slug}")
            print(f"   HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"\n❌ {slug}")
        print(f"   Exception: {str(e)}")

print("\n" + "=" * 80)
print("DIAGNOSTIC TERMINÉ")
print("=" * 80)
