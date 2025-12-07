"""
Test du flux checkout complet en production
============================================

Simule le parcours utilisateur:
1. Sélection d'un pack sur /packs
2. Navigation vers /checkout/{slug}
3. Fetch des données du pack
4. Fetch du pricing selon la zone
5. Test de la création de session Stripe

Ce test identifiera précisément où le checkout bloque.
"""

import requests
import sys
from datetime import datetime
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

def test_checkout_flow():
    print("=" * 70)
    print("TEST FLUX CHECKOUT COMPLET")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Étape 1: Récupérer la liste des packs
    print("\n📦 ÉTAPE 1: Récupération de la liste des packs")
    print(f"URL: {BACKEND_URL}/api/packs")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/packs", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ ERREUR: Impossible de récupérer les packs")
            print(f"Réponse: {response.text}")
            return False
            
        packs = response.json()
        print(f"✅ {len(packs)} packs récupérés")
        
        # Afficher les détails de chaque pack
        for i, pack in enumerate(packs):
            print(f"\n  Pack {i+1}:")
            print(f"    ID: {pack.get('id')}")
            print(f"    Nom FR: {pack.get('name', {}).get('fr')}")
            print(f"    Slug: {pack.get('slug', 'N/A')}")
            print(f"    Order: {pack.get('order', 'N/A')}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        return False
    
    # Tester avec le premier pack (Analyse)
    if not packs:
        print("\n❌ Aucun pack disponible")
        return False
        
    test_pack = packs[0]
    pack_id = test_pack.get('id')
    pack_slug = test_pack.get('slug', 'analyse')
    pack_name = test_pack.get('name', {}).get('fr', 'Pack Analyse')
    
    print(f"\n🎯 Pack sélectionné pour le test: {pack_name}")
    print(f"   ID: {pack_id}")
    print(f"   Slug: {pack_slug}")
    
    # Étape 2: Test du pricing avec SLUG (ce que le checkout devrait utiliser)
    print(f"\n💰 ÉTAPE 2: Test pricing avec SLUG")
    print(f"URL: {BACKEND_URL}/api/pricing?packId={pack_slug}&zone=IL")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/pricing",
            params={"packId": pack_slug, "zone": "IL"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            pricing = response.json()
            print(f"✅ Pricing récupéré avec SLUG")
            print(f"   Prix total: {pricing.get('total_price')} {pricing.get('currency')}")
            print(f"   Display: {pricing.get('display', {}).get('total')}")
        else:
            print(f"❌ ERREUR: Pricing avec slug échoue")
            print(f"Réponse: {response.text}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Étape 3: Test du pricing avec UUID (ancienne méthode qui causait le bug)
    print(f"\n💰 ÉTAPE 3: Test pricing avec UUID (ancien comportement bugué)")
    print(f"URL: {BACKEND_URL}/api/pricing?packId={pack_id}&zone=IL")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/pricing",
            params={"packId": pack_id, "zone": "IL"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            pricing = response.json()
            print(f"⚠️  Pricing fonctionne avec UUID (ne devrait pas)")
            print(f"   Prix total: {pricing.get('total_price')} {pricing.get('currency')}")
        else:
            print(f"✅ Pricing avec UUID échoue comme attendu (400)")
            print(f"   Message: {response.json().get('detail', response.text)}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Étape 4: Test de la page checkout elle-même
    print(f"\n🛒 ÉTAPE 4: Test chargement page checkout")
    print(f"URL: {FRONTEND_URL}/checkout/{pack_slug}")
    
    try:
        response = requests.get(f"{FRONTEND_URL}/checkout/{pack_slug}", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Page checkout accessible")
            # Vérifier si la page contient des erreurs JavaScript visibles
            html = response.text
            if "Application error" in html or "Error:" in html:
                print(f"⚠️  La page contient potentiellement des erreurs")
        else:
            print(f"❌ ERREUR: Page checkout inaccessible")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Étape 5: Test de l'endpoint de récupération d'un pack spécifique par ID
    print(f"\n📦 ÉTAPE 5: Test récupération pack par ID")
    print(f"URL: {BACKEND_URL}/api/packs/{pack_id}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/packs/{pack_id}", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            pack_detail = response.json()
            print(f"✅ Pack récupéré par ID")
            print(f"   Nom: {pack_detail.get('name', {}).get('fr')}")
            print(f"   Slug: {pack_detail.get('slug', 'N/A')}")
        elif response.status_code == 404:
            print(f"❌ Route /api/packs/:id n'existe pas")
            print(f"   Le frontend devra utiliser /api/packs et filtrer")
        else:
            print(f"⚠️  Status inattendu: {response.status_code}")
            print(f"   Réponse: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Étape 6: Test création session Stripe (optionnel)
    print(f"\n💳 ÉTAPE 6: Test création session Stripe")
    print(f"URL: {BACKEND_URL}/api/checkout")
    
    checkout_data = {
        "packId": pack_slug,
        "packName": pack_name,
        "zone": "IL",
        "planType": "ONE_SHOT",
        "customer": {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+972501234567"
        }
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/checkout",
            json=checkout_data,
            timeout=15
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Session Stripe créée")
            if 'url' in result:
                print(f"   URL de paiement générée: {result['url'][:50]}...")
            if 'sessionId' in result:
                print(f"   Session ID: {result['sessionId']}")
        else:
            print(f"❌ ERREUR lors de la création de session")
            print(f"   Réponse: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    print("\n" + "=" * 70)
    print("FIN DU TEST")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    test_checkout_flow()
