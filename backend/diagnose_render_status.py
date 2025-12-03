"""
Script de diagnostic: État actuel des services Render en production
====================================================================

Teste:
1. Backend API health check
2. Frontend homepage
3. API packs
4. API pricing
5. Admin login page
6. Checkout page

Aucun test local - que des requêtes HTTP vers production.
"""

import requests
import sys
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

def test_endpoint(name, url, method="GET", json_data=None, expected_status=200):
    """Teste un endpoint et retourne le résultat."""
    try:
        print(f"\n🔍 Test: {name}")
        print(f"   URL: {url}")
        
        start = datetime.now()
        
        if method == "GET":
            response = requests.get(url, timeout=15)
        elif method == "POST":
            response = requests.post(url, json=json_data, timeout=15)
        
        duration = (datetime.now() - start).total_seconds()
        
        print(f"   Status: {response.status_code}")
        print(f"   Durée: {duration:.2f}s")
        
        if response.status_code == expected_status:
            print(f"   ✅ OK")
            # Afficher un extrait de la réponse
            try:
                if 'application/json' in response.headers.get('content-type', ''):
                    data = response.json()
                    print(f"   Réponse: {str(data)[:200]}...")
                else:
                    print(f"   Réponse: {response.text[:200]}...")
            except:
                pass
            return True, response
        else:
            print(f"   ❌ ERREUR: Attendu {expected_status}, reçu {response.status_code}")
            print(f"   Body: {response.text[:500]}")
            return False, response
            
    except requests.exceptions.Timeout:
        print(f"   ❌ TIMEOUT après 15s")
        return False, None
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ CONNEXION IMPOSSIBLE: {str(e)}")
        return False, None
    except Exception as e:
        print(f"   ❌ ERREUR: {str(e)}")
        return False, None

def main():
    print("=" * 70)
    print("DIAGNOSTIC ÉTAT PRODUCTION RENDER")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    results = []
    
    # Test 1: Backend Health Check
    success, _ = test_endpoint(
        "Backend Health Check",
        f"{BACKEND_URL}/api/health"
    )
    results.append(("Backend Health", success))
    
    # Test 2: Backend Root
    success, _ = test_endpoint(
        "Backend Root",
        f"{BACKEND_URL}/",
        expected_status=200
    )
    results.append(("Backend Root", success))
    
    # Test 3: API Packs
    success, resp = test_endpoint(
        "API Packs",
        f"{BACKEND_URL}/api/packs"
    )
    if success and resp:
        try:
            packs = resp.json()
            print(f"   📦 Nombre de packs: {len(packs)}")
        except:
            pass
    results.append(("API Packs", success))
    
    # Test 4: API Pricing
    success, resp = test_endpoint(
        "API Pricing (Pack Analyse, Zone IL)",
        f"{BACKEND_URL}/api/pricing?packId=analyse&zone=IL"
    )
    if success and resp:
        try:
            pricing = resp.json()
            print(f"   💰 Prix: {pricing.get('price')} {pricing.get('currency')}")
        except:
            pass
    results.append(("API Pricing", success))
    
    # Test 5: Frontend Homepage
    success, _ = test_endpoint(
        "Frontend Homepage",
        FRONTEND_URL
    )
    results.append(("Frontend Homepage", success))
    
    # Test 6: Frontend Packs Page
    success, _ = test_endpoint(
        "Frontend Packs Page",
        f"{FRONTEND_URL}/packs"
    )
    results.append(("Frontend Packs", success))
    
    # Test 7: Admin Login Page
    success, _ = test_endpoint(
        "Admin Login Page",
        f"{FRONTEND_URL}/admin/login"
    )
    results.append(("Admin Login", success))
    
    # Test 8: Checkout Page (avec slug)
    success, _ = test_endpoint(
        "Checkout Page (slug: analyse)",
        f"{FRONTEND_URL}/checkout/analyse"
    )
    results.append(("Checkout Page", success))
    
    # Résumé
    print("\n" + "=" * 70)
    print("RÉSUMÉ")
    print("=" * 70)
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for name, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {name}")
    
    print(f"\nRésultat: {success_count}/{total_count} tests passés")
    
    if success_count == total_count:
        print("\n🎉 TOUS LES SERVICES SONT OPÉRATIONNELS")
        return 0
    else:
        print("\n⚠️  CERTAINS SERVICES SONT EN ÉCHEC")
        print("\nActions recommandées:")
        print("1. Vérifier les logs Render pour les services en échec")
        print("2. Vérifier les variables d'environnement sur Render")
        print("3. Vérifier les derniers commits/déploiements")
        return 1

if __name__ == "__main__":
    sys.exit(main())
