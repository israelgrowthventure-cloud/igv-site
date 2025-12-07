#!/usr/bin/env python3
"""
Suppression des 6 anciens packs pour ne garder que les 3 officiels (dernière version 16:02)
"""
import requests

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

# Packs à CONSERVER (créés à 16:02 avec descriptions complètes)
PACKS_OFFICIELS = [
    "ce97cb34-376f-4450-847a-42db24457773",  # Pack Analyse (16:02)
    "19a1f57b-e064-4f40-a2cb-ee56373e70d1",  # Pack Succursales (16:02)
    "019a428e-5d58-496b-9e74-f70e4c26e942",  # Pack Franchise (16:02)
]

# Packs à SUPPRIMER
PACKS_A_SUPPRIMER = [
    "6a85ed7c-4e9d-4b43-9610-acdc013238d2",  # Ancien: Analyse Marché
    "07e03e2b-835f-4c39-8c72-05f7af8bb063",  # Ancien: Création Succursales
    "56c3812d-734b-4649-abe7-613b3e79b55c",  # Ancien: Contrat Franchise
    "5cbd44d6-53eb-497a-bfd8-81ca506b5949",  # Doublon: Pack Analyse (13:52)
    "b6f80311-4b00-435d-9678-957e99e3ca53",  # Doublon: Pack Succursales (13:52)
    "5c051938-13e0-47fc-9b1d-b450451a689b",  # Doublon: Pack Franchise (13:52)
]

print("=" * 80)
print("SUPPRESSION DES ANCIENS PACKS")
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

# 2. Supprimer les 6 anciens packs
print(f"\n2. Suppression de {len(PACKS_A_SUPPRIMER)} anciens packs...")
print("-" * 80)

suppression_reussies = 0
for pack_id in PACKS_A_SUPPRIMER:
    try:
        response = requests.delete(
            f"{BASE_URL}/packs/{pack_id}",
            headers=headers
        )
        if response.status_code in [200, 204]:
            print(f"✓ Pack {pack_id[:8]}... supprimé")
            suppression_reussies += 1
        else:
            print(f"✗ Erreur {response.status_code} pour pack {pack_id[:8]}...")
            print(f"  Réponse: {response.text[:100]}")
    except Exception as e:
        print(f"✗ Exception pour pack {pack_id[:8]}: {e}")

# 3. Vérification finale
print(f"\n3. Vérification: {suppression_reussies}/{len(PACKS_A_SUPPRIMER)} suppressions réussies")
print("-" * 80)

packs_response = requests.get(f"{BASE_URL}/packs")
packs_restants = packs_response.json()

print(f"\n✓ {len(packs_restants)} packs restants en base")

if len(packs_restants) == 3:
    print("\n🎉 SUCCÈS ! Exactement 3 packs officiels en base:")
    for pack in packs_restants:
        name_field = pack.get('name', {})
        if isinstance(name_field, str):
            nom = name_field
        else:
            nom = name_field.get('fr', 'N/A')
        print(f"  - {nom}")
        print(f"    ID: {pack['id']}")
        print(f"    Prix: {pack.get('base_price')} {pack.get('currency', 'EUR')}")
        print(f"    Order: {pack.get('order', 'N/A')}")
        print()
else:
    print(f"\n⚠️  ATTENTION: {len(packs_restants)} packs au lieu de 3!")
    for pack in packs_restants:
        name_field = pack.get('name', {})
        if isinstance(name_field, str):
            nom = name_field
        else:
            nom = name_field.get('fr', 'N/A')
        print(f"  - {nom} ({pack['id'][:8]}...)")

print("\n" + "=" * 80)
print("NETTOYAGE TERMINÉ")
print("=" * 80)
