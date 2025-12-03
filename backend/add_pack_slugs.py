#!/usr/bin/env python3
"""
Ajouter le champ 'slug' aux 3 packs officiels pour la compatibilité avec pricing/checkout
"""
import requests

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

# Mapping UUID -> slug
PACK_SLUGS = {
    "ce97cb34-376f-4450-847a-42db24457773": "analyse",      # Pack Analyse
    "19a1f57b-e064-4f40-a2cb-ee56373e70d1": "succursales",  # Pack Succursales
    "019a428e-5d58-496b-9e74-f70e4c26e942": "franchise",    # Pack Franchise
}

print("=" * 80)
print("AJOUT DU CHAMP SLUG AUX PACKS OFFICIELS")
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

# 2. Mettre à jour chaque pack avec son slug
print("\n2. Mise à jour des slugs...")
print("-" * 80)

for pack_id, slug in PACK_SLUGS.items():
    try:
        # D'abord récupérer le pack
        get_response = requests.get(f"{BASE_URL}/packs/{pack_id}", headers=headers)
        if get_response.status_code != 200:
            print(f"✗ Pack {pack_id[:8]}... non trouvé")
            continue
        
        pack_data = get_response.json()
        nom_fr = pack_data['name']['fr']
        
        # Ajouter le slug
        pack_data['slug'] = slug
        
        # Mettre à jour
        update_response = requests.put(
            f"{BASE_URL}/packs/{pack_id}",
            json=pack_data,
            headers=headers
        )
        
        if update_response.status_code == 200:
            print(f"✓ {nom_fr}")
            print(f"  ID: {pack_id[:8]}...")
            print(f"  Slug: {slug}")
        else:
            print(f"✗ {nom_fr}: Erreur {update_response.status_code}")
            print(f"  Response: {update_response.text[:100]}")
    except Exception as e:
        print(f"✗ Pack {pack_id[:8]}: Exception {e}")
    print()

# 3. Vérification
print("\n3. Vérification des slugs...")
print("-" * 80)

packs_response = requests.get(f"{BASE_URL}/packs")
packs = packs_response.json()

for pack in packs:
    nom_fr = pack['name']['fr']
    slug = pack.get('slug', 'AUCUN')
    print(f"✓ {nom_fr}: slug = '{slug}'")

print("\n" + "=" * 80)
print("SLUGS AJOUTÉS")
print("=" * 80)
print("\nLes packs peuvent maintenant être utilisés avec:")
print("  - /api/pricing?packId=analyse&zone=IL")
print("  - /api/checkout (body: {packId: 'analyse', ...})")
print("\n" + "=" * 80)
