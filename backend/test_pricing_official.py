#!/usr/bin/env python3
"""
Test de l'API pricing avec les packs officiels créés
"""
import requests

BASE_URL = "https://igv-cms-backend.onrender.com/api"

print("=" * 80)
print("TEST PRICING AVEC PACKS OFFICIELS")
print("=" * 80)

# 1. Récupérer tous les packs
print("\n1. Récupération des packs disponibles...")
r = requests.get(f"{BASE_URL}/packs")
packs = r.json()
print(f"✓ {len(packs)} packs trouvés\n")

for pack in packs:
    name = pack.get('name', {})
    if isinstance(name, dict):
        name_fr = name.get('fr', 'N/A')
    else:
        name_fr = str(name)
    print(f"  - {name_fr}")
    print(f"    ID: {pack.get('_id', 'N/A')}")
    print(f"    Prix base: {pack.get('base_price', 'N/A')} {pack.get('base_currency', '')}")
    print()

# 2. Tester pricing avec les 3 packs officiels et toutes les zones
packs_officiels = ['analyse', 'succursales', 'franchise']
zones = ['EU', 'US_CA', 'IL', 'ASIA_AFRICA']

print("\n2. Test API pricing pour chaque pack et zone...")
print("-" * 80)

for pack in packs_officiels:
    print(f"\n📦 Pack {pack.upper()}")
    for zone in zones:
        try:
            r = requests.get(
                f"{BASE_URL}/pricing",
                params={"packId": pack, "zone": zone}
            )
            if r.status_code == 200:
                data = r.json()
                print(f"  ✓ {zone:12} → {data['total_price']:>8} {data['currency']}")
            else:
                print(f"  ✗ {zone:12} → Erreur {r.status_code}: {r.text[:100]}")
        except Exception as e:
            print(f"  ✗ {zone:12} → Exception: {e}")

print("\n" + "=" * 80)
print("TEST TERMINÉ")
print("=" * 80)
