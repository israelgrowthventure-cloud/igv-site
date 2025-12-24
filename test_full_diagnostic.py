#!/usr/bin/env python3
"""Test complet de l'endpoint mini-analysis avec curl et diagnostic"""
import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("DIAGNOSTIC COMPLET - ENDPOINT MINI-ANALYSIS")
print("=" * 80)

# Test 1: Preflight OPTIONS request
print("\n[TEST 1] OPTIONS (Preflight CORS)")
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
    print(f"Status: {response.status_code} {response.reason}")
    print(f"Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower() or 'cors' in key.lower():
            print(f"  {key}: {value}")
    if response.status_code not in [200, 204]:
        print(f"⚠️ CORS Preflight échoué!")
        print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 2: POST request complet
print("\n[TEST 2] POST /api/mini-analysis (Requête réelle)")
print("-" * 80)
payload = {
    "email": "test@example.com",
    "nom_de_marque": "Test Brand",
    "secteur": "restauration",
    "statut_alimentaire": "non-alimentaire",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Test concept",
    "positionnement": "Premium",
    "modele_actuel": "B2C",
    "differenciation": "Innovation",
    "objectif_israel": "Expansion",
    "contraintes": "Budget limité"
}

try:
    response = requests.post(
        f"{BACKEND_URL}/api/mini-analysis",
        json=payload,
        headers={
            "Origin": "https://israelgrowthventure.com",
            "Content-Type": "application/json"
        },
        timeout=30
    )
    print(f"Status: {response.status_code} {response.reason}")
    print(f"\nHeaders CORS:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower():
            print(f"  {key}: {value}")
    
    print(f"\nResponse Body:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(response.text[:500])
    
    if response.status_code == 500:
        print(f"\n❌ ERREUR 500 - INTERNAL SERVER ERROR")
        print(f"⚠️ Vérifier les logs backend pour la stacktrace complète")
    elif response.status_code >= 400:
        print(f"\n❌ Erreur client: {response.status_code}")
    else:
        print(f"\n✅ Succès!")
        
except requests.exceptions.Timeout:
    print(f"❌ Timeout après 30 secondes")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test 3: Health check
print("\n[TEST 3] GET /health")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 4: Root endpoint
print("\n[TEST 4] GET / (root)")
print("-" * 80)
try:
    response = requests.get(BACKEND_URL, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n" + "=" * 80)
print("RÉSUMÉ DES PROBLÈMES DÉTECTÉS:")
print("=" * 80)
print("1. Vérifier config CORS dans server.py")
print("2. Vérifier GEMINI_API_KEY dans env vars Render")
print("3. Vérifier logs backend pour stacktrace complète")
