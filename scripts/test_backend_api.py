#!/usr/bin/env python3
"""Test complet du backend pour identifier la faille"""
import requests
import json
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def test_cors_preflight():
    """Test OPTIONS request (CORS preflight)"""
    print("\n=== TEST 1: CORS Preflight ===")
    try:
        response = requests.options(
            f"{BACKEND_URL}/api/mini-analysis",
            headers={
                "Origin": "https://israelgrowthventure.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Headers CORS:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower():
                print(f"  {key}: {value}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_post_request():
    """Test POST request avec données valides"""
    print("\n=== TEST 2: POST Request ===")
    payload = {
        "email": "test@example.com",
        "nom_de_marque": f"Test Brand {datetime.now().strftime('%H%M%S')}",
        "secteur": "Services",
        "statut_alimentaire": "",
        "anciennete": "1-3 ans",
        "pays_dorigine": "France",
        "concept": "Service de test",
        "positionnement": "Premium",
        "modele_actuel": "Indépendant",
        "differenciation": "Innovation tech",
        "objectif_israel": "Test marché",
        "contraintes": "Budget limité"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/mini-analysis",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://israelgrowthventure.com"
            },
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        print(f"\nResponse Headers:")
        for key, value in response.headers.items():
            if 'access-control' in key.lower() or 'content-type' in key.lower():
                print(f"  {key}: {value}")
        
        print(f"\nResponse Body:")
        try:
            data = response.json()
            print(json.dumps(data, indent=2, ensure_ascii=False)[:500])
        except:
            print(response.text[:500])
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_root_endpoint():
    """Test endpoint racine"""
    print("\n=== TEST 3: Root Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Erreur: {e}")

def main():
    print("🔍 DIAGNOSTIC COMPLET BACKEND IGV")
    print(f"Backend: {BACKEND_URL}")
    print("=" * 60)
    
    # Test 1: CORS Preflight
    cors_ok = test_cors_preflight()
    
    # Test 2: POST Request
    post_ok = test_post_request()
    
    # Test 3: Root endpoint
    test_root_endpoint()
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ")
    print(f"  CORS Preflight: {'✅ OK' if cors_ok else '❌ FAIL'}")
    print(f"  POST Request:   {'✅ OK' if post_ok else '❌ FAIL'}")
    print("\n💡 DIAGNOSTIC:")
    
    if not post_ok:
        print("  → Le backend retourne une erreur 500")
        print("  → Causes possibles:")
        print("     1. GEMINI_API_KEY non chargée (backend non redéployé)")
        print("     2. MongoDB connection échoue")
        print("     3. Erreur dans le code de génération")
        print("\n🔧 SOLUTION:")
        print("  1. Allez sur https://dashboard.render.com")
        print("  2. Sélectionnez 'igv-cms-backend'")
        print("  3. Cliquez 'Manual Deploy' → 'Deploy latest commit'")
        print("  4. Attendez 2-3 minutes que le déploiement se termine")

if __name__ == "__main__":
    main()
