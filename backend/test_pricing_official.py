#!/usr/bin/env python3
"""
Test de validation de la price-list officielle
===============================================
Vérifie que les prix retournés par l'API correspondent exactement
à PRICELIST_OFFICIELLE.json pour toutes les zones et tous les packs.
"""
import requests
import json
import os

BASE_URL = "https://igv-cms-backend.onrender.com/api"

# Charger la price-list officielle
script_dir = os.path.dirname(os.path.abspath(__file__))
pricelist_path = os.path.join(script_dir, "PRICELIST_OFFICIELLE.json")

with open(pricelist_path, 'r', encoding='utf-8') as f:
    OFFICIAL_PRICES = json.load(f)

# Mapping zones API -> zones JSON
ZONE_MAPPING = {
    "EU": "EU",
    "US_CA": "US",
    "IL": "IL",
    "ASIA_AFRICA": "ASIA"
}

print("=" * 80)
print("TEST PRICING OFFICIEL - VALIDATION COMPLÈTE")
print("=" * 80)

errors = []
success_count = 0
total_tests = 0

for pack_data in OFFICIAL_PRICES["packs"]:
    pack_id = pack_data["id"]
    print(f"\n📦 Pack {pack_id.upper()}")
    
    for api_zone, json_zone in ZONE_MAPPING.items():
        total_tests += 1
        expected_price = pack_data["zones"][json_zone]
        
        try:
            response = requests.get(
                f"{BASE_URL}/pricing",
                params={"packId": pack_id, "zone": api_zone},
                timeout=15
            )
            
            if response.status_code != 200:
                error_msg = f"❌ {pack_id} ({api_zone}): HTTP {response.status_code}"
                print(f"  {error_msg}")
                errors.append(error_msg)
                continue
            
            data = response.json()
            actual_price = data["total_price"]
            
            if actual_price == expected_price:
                print(f"  ✅ {api_zone:12} → {actual_price:>8} {data['currency_symbol']:3} (OK)")
                success_count += 1
            else:
                error_msg = f"❌ {pack_id} ({api_zone}): Expected {expected_price}, Got {actual_price}"
                print(f"  {error_msg}")
                errors.append(error_msg)
                
        except Exception as e:
            error_msg = f"❌ {pack_id} ({api_zone}): Exception - {str(e)}"
            print(f"  {error_msg}")
            errors.append(error_msg)

print("\n" + "=" * 80)
print(f"RÉSULTATS: {success_count}/{total_tests} tests réussis")

if errors:
    print(f"\n❌ {len(errors)} ERREURS DÉTECTÉES:")
    for error in errors:
        print(f"  {error}")
    exit(1)
else:
    print("\n✅ TOUS LES PRIX CORRESPONDENT À LA PRICE-LIST OFFICIELLE")
    exit(0)
