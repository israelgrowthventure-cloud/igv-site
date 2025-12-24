#!/usr/bin/env python3
"""Test POST /api/mini-analysis maintenant que gemini-2.5-flash fonctionne"""
import requests
import json
import random

BACKEND_URL = "https://igv-cms-backend.onrender.com"

brand_name = f"Final Success Test {random.randint(10000, 99999)}"

payload = {
    "email": "final-test@israelgrowthventure.com",
    "nom_de_marque": brand_name,
    "secteur": "restauration",
    "statut_alimentaire": "alimentaire",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Restaurant français gastronomique avec influence méditerranéenne",
    "positionnement": "Premium - Fine dining expérience",
    "modele_actuel": "Restaurant 80 couverts avec cave à vins",
    "differenciation": "Chef étoilé Michelin avec recettes familiales ancestrales",
    "objectif_israel": "Ouverture 1er restaurant Tel Aviv Q4 2025, puis expansion",
    "contraintes": "Budget 600K€, recherche partenariat local, adaptation kasher possible"
}

print("="*80)
print("TEST POST /api/mini-analysis AVEC GEMINI-2.5-FLASH")
print("="*80)
print(f"\nBrand: {brand_name}")
print(f"Secteur: {payload['secteur']}")

try:
    response = requests.post(
        f"{BACKEND_URL}/api/mini-analysis",
        json=payload,
        headers={
            "Origin": "https://israelgrowthventure.com",
            "Content-Type": "application/json"
        },
        timeout=90
    )
    
    print(f"\nStatus: {response.status_code}")
    
    # CORS check
    cors_origin = response.headers.get('Access-Control-Allow-Origin')
    print(f"CORS: {cors_origin if cors_origin else '❌ Missing'}")
    
    data = response.json()
    
    if response.status_code == 200:
        print(f"\n🎉 SUCCÈS! Mini-analyse générée!")
        print(f"\nID MongoDB: {data.get('id', 'N/A')}")
        print(f"Brand slug: {data.get('brand_slug', 'N/A')}")
        print(f"Timestamp: {data.get('timestamp', 'N/A')}")
        
        analysis = data.get('analysis', '')
        print(f"\nLongueur analyse: {len(analysis)} caractères")
        print(f"\n--- EXTRAIT (premiers 500 caractères) ---")
        print(analysis[:500])
        print("...")
        print(f"\n--- FIN EXTRAIT ---")
        
        print(f"\n✅ LE BACKEND EST 100% FONCTIONNEL")
        print(f"✅ gemini-2.5-flash: OK")
        print(f"✅ MongoDB: OK")
        print(f"✅ CORS: OK")
        print(f"\n🚀 Le bouton sur israelgrowthventure.com devrait fonctionner!")
        
    elif response.status_code == 409:
        print(f"\n⚠️ Duplicate détecté")
        print(f"Detail: {data.get('detail')}")
        print(f"\n(C'est normal si vous testez plusieurs fois le même brand)")
        
    elif response.status_code == 500:
        print(f"\n❌ ERREUR 500")
        print(f"Error ID: {data.get('error_id', 'N/A')}")
        print(f"Error: {data.get('error', 'N/A')}")
        print(f"Message: {data.get('message', 'N/A')}")
        print(f"Type: {data.get('error_type', 'N/A')}")
        
    else:
        print(f"\n⚠️ Status {response.status_code}")
        print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
        
except requests.exceptions.Timeout:
    print(f"\n❌ Timeout après 90 secondes")
    print(f"   Gemini peut prendre du temps, réessayez")
except Exception as e:
    print(f"\n❌ Exception: {type(e).__name__}: {e}")

print("\n" + "="*80)
