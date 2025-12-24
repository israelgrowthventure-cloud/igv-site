#!/usr/bin/env python3
"""
Test complet POST /api/mini-analysis avec capture de l'erreur réelle
Objectif : Récupérer le request_id et le message d'erreur complet
"""
import requests
import json
import time
import sys

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TEST DIAGNOSTIC FINAL - CAPTURE ERREUR RÉELLE")
print("=" * 80)

# Attendre le déploiement
print("\n⏳ Attente 90 secondes pour que Render déploie les corrections...")
time.sleep(90)

print("\n[PHASE 1] Test OPTIONS preflight")
print("-" * 80)
try:
    response = requests.options(
        f"{BACKEND_URL}/api/mini-analysis",
        headers={
            "Origin": "https://israelgrowthventure.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        },
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"CORS Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower():
            print(f"  {key}: {value}")
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n[PHASE 2] Test /api/diag-gemini (nouveau endpoint)")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/api/diag-gemini", timeout=30)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    if data.get("status") == "success":
        print(f"\n✅ Gemini API fonctionne!")
        print(f"   Test response: {data.get('test_response', 'N/A')}")
    elif data.get("status") == "error":
        print(f"\n❌ Gemini API error:")
        print(f"   Message: {data.get('message', 'N/A')}")
        print(f"   Error: {data.get('error', 'N/A')}")
        print(f"   Error Type: {data.get('error_type', 'N/A')}")
        if 'traceback' in data:
            print(f"\n📋 TRACEBACK COMPLET:")
            print(data['traceback'])
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n[PHASE 3] POST /api/mini-analysis (CAPTURE ERREUR COMPLÈTE)")
print("-" * 80)

payload = {
    "email": "debug@israelgrowthventure.com",
    "nom_de_marque": "Debug Test Brand",
    "secteur": "restauration",
    "statut_alimentaire": "alimentaire",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Test de capture d'erreur complète",
    "positionnement": "Premium",
    "modele_actuel": "B2C",
    "differenciation": "Innovation",
    "objectif_israel": "Test diagnostic",
    "contraintes": "Capture stacktrace"
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
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"\n📋 Response Headers:")
    for key, value in response.headers.items():
        if 'access-control' in key.lower() or 'content-type' in key.lower():
            print(f"  {key}: {value}")
    
    # Check CORS
    has_cors = any('access-control-allow-origin' in k.lower() for k in response.headers.keys())
    if has_cors:
        print(f"\n✅ CORS headers présents")
    else:
        print(f"\n❌ CORS headers ABSENTS")
    
    # Parse response
    print(f"\n📄 Response Body:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        # Extract critical info
        print(f"\n" + "=" * 80)
        print("INFORMATIONS CRITIQUES EXTRAITES:")
        print("=" * 80)
        
        if 'error_id' in data or 'request_id' in data:
            error_id = data.get('error_id') or data.get('request_id')
            print(f"🆔 REQUEST_ID: {error_id}")
        
        if 'error' in data:
            print(f"❌ ERROR: {data['error']}")
        
        if 'message' in data:
            print(f"💬 MESSAGE: {data['message']}")
        
        if 'error_type' in data:
            print(f"🔍 ERROR_TYPE: {data['error_type']}")
        
        if 'traceback' in data:
            print(f"\n📋 STACKTRACE COMPLET:")
            print(data['traceback'])
        
        if 'detail' in data:
            print(f"\n📝 DETAIL:")
            if isinstance(data['detail'], dict):
                print(json.dumps(data['detail'], indent=2, ensure_ascii=False))
            else:
                print(data['detail'])
        
        # Success case
        if response.status_code == 200:
            print(f"\n✅ SUCCÈS! Mini-analyse générée")
        
    except json.JSONDecodeError:
        print(f"⚠️ Réponse non-JSON:")
        print(response.text[:1000])
    
except requests.exceptions.Timeout:
    print(f"❌ Timeout après 60 secondes")
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {e}")

print("\n" + "=" * 80)
print("FIN DU TEST")
print("=" * 80)
print("\n📌 ACTION SUIVANTE:")
print("   1. Copier le REQUEST_ID ci-dessus")
print("   2. Copier la STACKTRACE complète")
print("   3. Identifier la ligne exacte qui plante")
print("   4. Corriger la cause racine")
print("   5. Redéployer")
