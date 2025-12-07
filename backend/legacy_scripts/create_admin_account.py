#!/usr/bin/env python3
"""
Créer un compte admin avec email réel postmaster@israelgrowthventure.com
"""
import requests

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2024!"  # Nouveau mot de passe sécurisé

print("=" * 80)
print("CRÉATION COMPTE ADMIN AVEC EMAIL RÉEL")
print("=" * 80)

print("\n1. Tentative de création du compte admin...")
print(f"   Email: {ADMIN_EMAIL}")
print(f"   Mot de passe: {'*' * len(ADMIN_PASSWORD)}")

try:
    # Créer le compte
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "full_name": "IGV Administrator",
            "company": "Israel Growth Venture",
            "role": "admin"
        }
    )
    
    if response.status_code == 200:
        print("\n✓ Compte admin créé avec succès!")
        data = response.json()
        print(f"   User ID: {data.get('id', 'N/A')}")
        print(f"   Email: {data.get('email', 'N/A')}")
        print(f"   Role: {data.get('role', 'N/A')}")
    elif response.status_code == 400 and "already exists" in response.text.lower():
        print("\n✓ Le compte existe déjà")
        print("   Tentative de connexion pour vérifier...")
        
        # Tester la connexion
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
        )
        
        if login_response.status_code == 200:
            print("✓ Connexion réussie avec les identifiants")
            token = login_response.json()["access_token"]
            
            # Récupérer le profil
            headers = {"Authorization": f"Bearer {token}"}
            profile_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                print(f"   Email: {profile.get('email')}")
                print(f"   Role: {profile.get('role')}")
                print(f"   Nom: {profile.get('full_name')}")
        else:
            print(f"✗ Échec de connexion: {login_response.status_code}")
            print(f"   Le mot de passe peut être différent de: {ADMIN_PASSWORD}")
            print("\n   Utilise le mot de passe actuel: Admin@igv")
    else:
        print(f"\n✗ Erreur {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
except Exception as e:
    print(f"\n✗ Exception: {e}")

print("\n" + "=" * 80)
print("RÉSUMÉ ACCÈS ADMIN")
print("=" * 80)
print(f"\nEmail: {ADMIN_EMAIL}")
print(f"Mot de passe: Admin@igv (ou {ADMIN_PASSWORD} si nouveau)")
print(f"\nURLs d'accès:")
print(f"  - Dashboard: https://israelgrowthventure.com/admin")
print(f"  - Login: https://israelgrowthventure.com/admin/login")
print(f"  - CMS Pages: https://israelgrowthventure.com/admin/pages")
print("\n" + "=" * 80)
