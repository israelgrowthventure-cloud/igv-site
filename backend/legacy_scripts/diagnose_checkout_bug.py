#!/usr/bin/env python3
"""
Diagnostic du bug checkout - Test pricing API avec UUID vs slug
"""
import requests

BASE_URL = "https://igv-cms-backend.onrender.com/api"

print("=" * 80)
print("DIAGNOSTIC BUG CHECKOUT - PRICING API")
print("=" * 80)

# 1. Récupérer les packs pour avoir les UUIDs
print("\n1. Récupération des packs...")
packs_response = requests.get(f"{BASE_URL}/packs")
packs = packs_response.json()

print(f"✓ {len(packs)} packs trouvés")
for pack in packs:
    print(f"\n  Pack: {pack['name']['fr']}")
    print(f"  UUID: {pack['id']}")
    print(f"  Slug: {pack.get('slug', 'AUCUN')}")

# 2. Test pricing avec UUID (ce que le frontend envoie actuellement)
print("\n" + "=" * 80)
print("2. Test pricing avec UUID (comportement actuel)")
print("=" * 80)

for pack in packs:
    pack_uuid = pack['id']
    nom = pack['name']['fr']
    
    print(f"\n  Testing {nom} (UUID: {pack_uuid[:8]}...)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/pricing",
            params={"packId": pack_uuid, "zone": "IL"}
        )
        
        if response.status_code == 200:
            print(f"    ✓ 200 OK")
        else:
            print(f"    ✗ {response.status_code}")
            print(f"    Response: {response.text[:150]}")
    except Exception as e:
        print(f"    ✗ Exception: {e}")

# 3. Test pricing avec slug (ce que l'API attend)
print("\n" + "=" * 80)
print("3. Test pricing avec SLUG (ce que l'API devrait recevoir)")
print("=" * 80)

slug_map = {
    'Pack Analyse': 'analyse',
    'Pack Succursales': 'succursales',
    'Pack Franchise': 'franchise'
}

for pack in packs:
    nom = pack['name']['fr']
    slug = slug_map.get(nom, '')
    
    if not slug:
        print(f"\n  Skipping {nom} (pas de slug)")
        continue
    
    print(f"\n  Testing {nom} (slug: {slug})")
    
    try:
        response = requests.get(
            f"{BASE_URL}/pricing",
            params={"packId": slug, "zone": "IL"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"    ✓ 200 OK")
            print(f"    Prix: {data.get('total_price')} {data.get('currency')}")
        else:
            print(f"    ✗ {response.status_code}")
            print(f"    Response: {response.text[:150]}")
    except Exception as e:
        print(f"    ✗ Exception: {e}")

# 4. Conclusion
print("\n" + "=" * 80)
print("DIAGNOSTIC")
print("=" * 80)
print("\n🔍 PROBLÈME IDENTIFIÉ:")
print("  Le frontend Checkout.js envoie l'UUID du pack (19a1f57b-e064...)")
print("  L'API pricing attend le SLUG du pack (succursales)")
print("\n💡 SOLUTION:")
print("  Modifier Checkout.js ligne 107 pour utiliser le slug au lieu de packId")
print("  OU modifier l'API backend pour accepter les UUIDs")
print("\n" + "=" * 80)
