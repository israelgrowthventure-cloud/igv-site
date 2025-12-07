#!/usr/bin/env python3
"""
Analyse détaillée des packs en base pour identifier les anciens vs nouveaux
"""
import requests
import json

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

print("=" * 80)
print("ANALYSE DES PACKS EN BASE")
print("=" * 80)

# 1. Login admin
print("\n1. Connexion admin...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
)
if login_response.status_code != 200:
    print(f"✗ Erreur login: {login_response.status_code}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✓ Connecté en tant que {ADMIN_EMAIL}")

# 2. Récupérer tous les packs
print("\n2. Récupération de tous les packs...")
packs_response = requests.get(f"{BASE_URL}/packs", headers=headers)
packs = packs_response.json()
print(f"✓ {len(packs)} packs trouvés\n")

# 3. Analyser chaque pack en détail
print("=" * 80)
print("DÉTAILS DES PACKS")
print("=" * 80)

for i, pack in enumerate(packs, 1):
    print(f"\n[Pack #{i}]")
    print(f"  _id: {pack.get('_id', 'N/A')}")
    
    # Gérer les cas où name est une string ou un dict
    name_field = pack.get('name', {})
    if isinstance(name_field, str):
        nom_fr = name_field
        nom_en = name_field
    else:
        nom_fr = name_field.get('fr', 'N/A')
        nom_en = name_field.get('en', 'N/A')
    
    print(f"  Nom FR: {nom_fr}")
    print(f"  Nom EN: {nom_en}")
    print(f"  Prix base: {pack.get('base_price', 'N/A')} {pack.get('base_currency', '')}")
    print(f"  Display order: {pack.get('display_order', 'N/A')}")
    print(f"  Créé: {pack.get('created_at', 'N/A')}")
    
    # Identifier si c'est un pack officiel (base_price = 3000, 15000, ou 15000 avec EUR)
    base_price = pack.get('base_price')
    base_currency = pack.get('base_currency', '')
    nom_fr_lower = nom_fr.lower() if isinstance(nom_fr, str) else ''
    
    is_official = False
    if base_price == 3000.0 and 'analyse' in nom_fr_lower:
        print("  ⭐ Type: PACK OFFICIEL ANALYSE")
        is_official = True
    elif base_price == 15000.0 and 'succursales' in nom_fr_lower:
        print("  ⭐ Type: PACK OFFICIEL SUCCURSALES")
        is_official = True
    elif base_price == 15000.0 and 'franchise' in nom_fr_lower:
        print("  ⭐ Type: PACK OFFICIEL FRANCHISE")
        is_official = True
    else:
        print("  ⚠️  Type: ANCIEN PACK (à supprimer)")
    
    if not is_official:
        print(f"  🗑️  Raison: Prix={base_price} ou nom ne correspond pas aux officiels")

# 4. Résumé et recommandations
print("\n" + "=" * 80)
print("RÉSUMÉ ET ACTIONS")
print("=" * 80)

officiels = []
anciens = []

for p in packs:
    name_field = p.get('name', {})
    if isinstance(name_field, str):
        nom_fr_lower = name_field.lower()
    else:
        nom_fr_lower = name_field.get('fr', '').lower()
    
    base_price = p.get('base_price')
    
    if ((base_price == 3000.0 and 'analyse' in nom_fr_lower) or
        (base_price == 15000.0 and 'succursales' in nom_fr_lower) or
        (base_price == 15000.0 and 'franchise' in nom_fr_lower)):
        officiels.append(p)
    else:
        anciens.append(p)

print(f"\n✓ {len(officiels)} packs officiels identifiés")
for pack in officiels:
    name_field = pack.get('name', {})
    if isinstance(name_field, str):
        nom_affiche = name_field
    else:
        nom_affiche = name_field.get('fr', 'N/A')
    print(f"  - {nom_affiche} (ID: {pack.get('_id', 'N/A')})")

print(f"\n✗ {len(anciens)} anciens packs à supprimer")
for pack in anciens:
    name_field = pack.get('name', {})
    if isinstance(name_field, str):
        nom_affiche = name_field
    else:
        nom_affiche = name_field.get('fr', 'N/A')
    print(f"  - {nom_affiche} (ID: {pack.get('_id', 'N/A')}) → SUPPRIMER")

# 5. Générer le script de suppression
if anciens:
    print("\n" + "=" * 80)
    print("SCRIPT DE SUPPRESSION")
    print("=" * 80)
    print("\nCommandes à exécuter:")
    for pack in anciens:
        print(f"DELETE {BASE_URL}/packs/{pack['_id']}")

print("\n" + "=" * 80)
