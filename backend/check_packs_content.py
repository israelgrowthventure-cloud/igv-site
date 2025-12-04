#!/usr/bin/env python3
"""
Script pour vérifier et mettre à jour les packs avec les textes officiels
"""
import httpx

BACKEND_URL = "https://igv-cms-backend.onrender.com/api"

print("=" * 80)
print("VÉRIFICATION DES PACKS ACTUELS")
print("=" * 80)

r = httpx.get(f"{BACKEND_URL}/packs", timeout=15)
packs = r.json()

print(f"\n{len(packs)} packs trouvés:\n")

for pack in packs:
    name_fr = pack.get('name', {}).get('fr', 'N/A')
    desc_fr = pack.get('description', {}).get('fr', 'N/A')
    features_fr = pack.get('features', {}).get('fr', [])
    
    print(f"📦 {name_fr}")
    print(f"   Description: {desc_fr[:100]}...")
    print(f"   Features: {len(features_fr)} items")
    if features_fr:
        for i, feature in enumerate(features_fr[:3], 1):
            print(f"     {i}. {feature[:60]}...")
    print()
