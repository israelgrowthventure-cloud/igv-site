#!/usr/bin/env python3
"""
Script pour supprimer la page etude-implantation-merci (route alternative obsolète)
La page canonique est /etude-implantation-360/merci
"""
import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

def login():
    """Authentification admin"""
    print(f"\n{'='*60}")
    print(f"Authentification admin...")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                print(f"✅ Authentification réussie")
                return token
            else:
                print(f"❌ Token non trouvé")
                return None
        else:
            print(f"❌ Échec authentification: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def delete_page(token, slug):
    """Supprime une page"""
    print(f"\n{'='*60}")
    print(f"Suppression de la page: {slug}")
    print(f"{'='*60}")
    
    try:
        response = requests.delete(
            f"{BACKEND_URL}/api/pages/{slug}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Page supprimée avec succès")
            return True
        else:
            print(f"❌ Échec suppression: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    print(f"\n{'#'*60}")
    print(f"# Suppression page etude-implantation-merci")
    print(f"# (Route obsolète - Canonique: /etude-implantation-360/merci)")
    print(f"{'#'*60}")
    
    token = login()
    if not token:
        print(f"\n❌ Impossible de continuer sans authentification")
        return False
    
    success = delete_page(token, "etude-implantation-merci")
    
    if success:
        print(f"\n{'='*60}")
        print(f"✨ Suppression réussie !")
        print(f"{'='*60}")
        print(f"\n📌 Page canonique: /etude-implantation-360/merci")
        print(f"⚠️  TODO Frontend: Ajouter redirection /etude-implantation-merci → /etude-implantation-360/merci")
        print(f"{'='*60}\n")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
