#!/usr/bin/env python3
"""
Script de mise à jour des packs avec la grille tarifaire officielle
et les textes de la première version du site
"""
import requests
import json
import os
from pathlib import Path

BACKEND_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@igv')

# Charger la configuration officielle
config_path = Path(__file__).parent / "config" / "official_packs_pricing.json"
with open(config_path, 'r', encoding='utf-8') as f:
    official_config = json.load(f)

print("=" * 80)
print("MISE À JOUR DES PACKS AVEC GRILLE TARIFAIRE OFFICIELLE")
print("=" * 80)

# 1. Se connecter en tant qu'admin
print("\n1. Connexion admin...")
try:
    response = requests.post(
        f"{BACKEND_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        token = data["access_token"]
        print(f"✓ Connecté en tant que {ADMIN_EMAIL}")
    else:
        print(f"✗ Erreur de connexion: {response.status_code}")
        print(f"  {response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Exception: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2. Récupérer les packs existants
print("\n2. Récupération des packs existants...")
try:
    response = requests.get(f"{BACKEND_URL}/api/packs", timeout=10)
    if response.status_code == 200:
        existing_packs = response.json()
        print(f"✓ {len(existing_packs)} packs trouvés")
    else:
        print(f"✗ Erreur: {response.status_code}")
        existing_packs = []
except Exception as e:
    print(f"✗ Exception: {e}")
    existing_packs = []

# 3. Mettre à jour ou créer chaque pack selon la configuration officielle
print("\n3. Mise à jour des packs avec grille tarifaire officielle...")

for official_pack in official_config["packs"]:
    pack_id = official_pack["id"]
    print(f"\n  Pack: {official_pack['name']['fr']}")
    
    # Trouver le pack existant par son slug ou ID
    existing_pack = None
    for p in existing_packs:
        if p.get("id") == f"pack-{pack_id}" or p.get("id") == pack_id:
            existing_pack = p
            break
    
    # Préparer les données du pack avec les prix EUR comme base_price
    # (Le pricing dynamique par zone est géré par pricing_config.py)
    pack_data = {
        "name": official_pack["name"],
        "description": official_pack["description"],
        "features": official_pack["features"],
        "base_price": official_pack["pricing"]["EU"]["amount"],
        "currency": "EUR",
        "order": official_pack["order"],
        "active": official_pack["active"]
    }
    
    if existing_pack:
        # Mettre à jour
        print(f"    → Mise à jour du pack existant (ID: {existing_pack['id']})")
        try:
            response = requests.put(
                f"{BACKEND_URL}/api/packs/{existing_pack['id']}",
                json=pack_data,
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                print(f"    ✓ Pack mis à jour")
                print(f"      Prix de base: {pack_data['base_price']} {pack_data['currency']}")
            else:
                print(f"    ✗ Erreur: {response.status_code}")
                print(f"      {response.text[:200]}")
        except Exception as e:
            print(f"    ✗ Exception: {e}")
    else:
        # Créer nouveau pack
        print(f"    → Création d'un nouveau pack")
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/packs",
                json=pack_data,
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                print(f"    ✓ Pack créé")
                print(f"      Prix de base: {pack_data['base_price']} {pack_data['currency']}")
            else:
                print(f"    ✗ Erreur: {response.status_code}")
                print(f"      {response.text[:200]}")
        except Exception as e:
            print(f"    ✗ Exception: {e}")

# 4. Afficher la grille tarifaire appliquée
print("\n" + "=" * 80)
print("GRILLE TARIFAIRE OFFICIELLE APPLIQUÉE")
print("=" * 80)

for pack in official_config["packs"]:
    print(f"\n{pack['name']['fr']} / {pack['name']['he']}")
    print(f"  {pack['description']['fr']}")
    print(f"\n  Tarifs par zone:")
    for zone, pricing in pack["pricing"].items():
        print(f"    {zone}: {pricing['display']}")
    print(f"\n  Notes: {pack['notes']['fr']}")

print("\n" + "=" * 80)
print("✓ MISE À JOUR TERMINÉE")
print("=" * 80)
print("\nLes packs ont été alignés sur la grille tarifaire officielle.")
print("Les prix dynamiques par zone sont gérés par backend/pricing_config.py")
print("\nVérification:")
print(f"  - Packs: {BACKEND_URL}/api/packs")
print(f"  - Page publique: https://israelgrowthventure.com/packs")
