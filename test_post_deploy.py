#!/usr/bin/env python3
"""Tests post-déploiement pour vérifier CORS, endpoints santé et mini-analyse"""
import requests
import json
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TESTS POST-DÉPLOIEMENT - BACKEND IGV")
print("=" * 80)
print(f"Backend URL: {BACKEND_URL}")
print(f"Attente 60 secondes pour le déploiement...")
print("=" * 80)

time.sleep(60)  # Wait for deployment

# Test 1: Health check
print("\n[TEST 1] GET /health")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    print(f"✅ Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 2: /api/health (avec MongoDB)
print("\n[TEST 2] GET /api/health")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
    print(f"✅ Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 3: /diag-gemini (nouveau endpoint)
print("\n[TEST 3] GET /api/diag-gemini (NOUVEAU)")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/api/diag-gemini", timeout=30)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Body:")
    print(json.dumps(result, indent=2))
    
    if result.get("status") == "success":
        print(f"\n✅ Gemini API fonctionne!")
    else:
        print(f"\n❌ Gemini API ne fonctionne pas")
        if "error" in result:
            print(f"   Erreur: {result['error']}")
        if "traceback" in result:
            print(f"   Traceback: {result['traceback'][:500]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 4: OPTIONS preflight
print("\n[TEST 4] OPTIONS /api/mini-analysis (Preflight CORS)")
print("-" * 80)
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
    print(f"CORS Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower():
            print(f"  {key}: {value}")
    
    has_origin = "access-control-allow-origin" in [k.lower() for k in response.headers.keys()]
    has_methods = "access-control-allow-methods" in [k.lower() for k in response.headers.keys()]
    
    if has_origin and has_methods:
        print(f"\n✅ CORS Preflight OK")
    else:
        print(f"\n❌ CORS Preflight incomplet")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 5: POST mini-analysis (requête réelle)
print("\n[TEST 5] POST /api/mini-analysis (Requête complète)")
print("-" * 80)
payload = {
    "email": "test-deployment@example.com",
    "nom_de_marque": "Test Deployment Brand",
    "secteur": "restauration",
    "statut_alimentaire": "alimentaire",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Test post-déploiement",
    "positionnement": "Premium",
    "modele_actuel": "B2C",
    "differenciation": "Innovation",
    "objectif_israel": "Expansion",
    "contraintes": "Budget test"
}

try:
    response = requests.post(
        f"{BACKEND_URL}/api/mini-analysis",
        json=payload,
        headers={
            "Origin": "https://israelgrowthventure.com",
            "Content-Type": "application/json"
        },
        timeout=60
    )
    print(f"Status: {response.status_code}")
    
    # Check CORS headers
    print(f"\nCORS Headers:")
    cors_found = False
    for key, value in response.headers.items():
        if 'access-control' in key.lower():
            print(f"  {key}: {value}")
            cors_found = True
    
    if not cors_found:
        print(f"  ❌ Aucun header CORS trouvé!")
    else:
        print(f"  ✅ Headers CORS présents")
    
    # Check response
    print(f"\nResponse Body:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
        
        if response.status_code == 200:
            print(f"\n✅ POST /api/mini-analysis SUCCÈS!")
        elif response.status_code == 500:
            print(f"\n⚠️ Erreur 500 mais réponse JSON lisible:")
            if "error_id" in data:
                print(f"   Error ID: {data['error_id']}")
            if "error_type" in data:
                print(f"   Type: {data['error_type']}")
            if "traceback" in data:
                print(f"\n   Traceback complet:\n{data['traceback']}")
        else:
            print(f"\n⚠️ Status: {response.status_code}")
    except:
        print(response.text[:500])
        
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n" + "=" * 80)
print("FIN DES TESTS")
print("=" * 80)
