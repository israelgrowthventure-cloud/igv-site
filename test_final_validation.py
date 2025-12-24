#!/usr/bin/env python3
"""
TEST FINAL - Vérifier que les corrections fonctionnent
"""
import requests
import json
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TEST FINAL - VALIDATION DES CORRECTIONS")
print("=" * 80)
print("\n⏳ Attente 90 secondes pour déploiement Render...")
time.sleep(90)

# Test 1: Diagnostic Gemini
print("\n[TEST 1] /api/diag-gemini - Vérifier modèle Gemini")
print("-" * 80)
try:
    response = requests.get(f"{BACKEND_URL}/api/diag-gemini", timeout=30)
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Result: {data.get('status', 'N/A')}")
    
    if data.get("status") == "success":
        print(f"✅ GEMINI API FONCTIONNE!")
        print(f"   Model: {data.get('model', 'N/A')}")
        print(f"   Test response: {data.get('test_response', 'N/A')}")
    else:
        print(f"❌ Erreur Gemini:")
        print(f"   {data.get('error', 'N/A')}")
        if 'traceback' in data:
            print(f"\nTraceback:\n{data['traceback'][:500]}")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test 2: POST mini-analysis (test complet)
print("\n[TEST 2] POST /api/mini-analysis - Test complet")
print("-" * 80)

payload = {
    "email": "final-test@israelgrowthventure.com",
    "nom_de_marque": "Final Test Brand Success",
    "secteur": "restauration",
    "statut_alimentaire": "alimentaire",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Restaurant français traditionnel avec influence méditerranéenne",
    "positionnement": "Mid-Premium - Rapport qualité/prix excellent",
    "modele_actuel": "Restaurant physique avec service de plats à emporter",
    "differenciation": "Recettes authentiques transmises sur 3 générations",
    "objectif_israel": "Ouvrir 2-3 restaurants à Tel Aviv et Jérusalem d'ici 2 ans",
    "contraintes": "Budget initial limité à 500K€, besoin d'accompagnement local"
}

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
    
    print(f"Status: {response.status_code}")
    
    # CORS check
    has_cors = any('access-control-allow-origin' in k.lower() for k in response.headers.keys())
    print(f"CORS Headers: {'✅ Présents' if has_cors else '❌ Absents'}")
    
    # Parse response
    try:
        data = response.json()
        
        if response.status_code == 200:
            print(f"\n🎉 SUCCÈS! Mini-analyse générée!")
            print(f"\nPremiers 500 caractères de l'analyse:")
            analysis_text = data.get('analysis', '')
            print(analysis_text[:500])
            print(f"\n... (total: {len(analysis_text)} caractères)")
            
            # Verify saved to MongoDB
            if 'id' in data:
                print(f"\n✅ Sauvegardée en MongoDB avec ID: {data['id']}")
                
        elif response.status_code == 409:
            print(f"\n⚠️ Duplicate détecté (normal si test déjà lancé)")
            print(f"   Detail: {data.get('detail', 'N/A')}")
            
        elif response.status_code == 500:
            print(f"\n❌ Erreur 500 - Mais au moins on a les détails:")
            print(f"   Error ID: {data.get('error_id', 'N/A')}")
            print(f"   Error: {data.get('error', 'N/A')}")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Type: {data.get('error_type', 'N/A')}")
            
        else:
            print(f"\nRéponse complète:")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
            
    except json.JSONDecodeError:
        print(f"\n⚠️ Réponse non-JSON:")
        print(response.text[:500])
        
except requests.exceptions.Timeout:
    print(f"\n❌ Timeout après 90 secondes")
except Exception as e:
    print(f"\n❌ Exception: {type(e).__name__}: {e}")

print("\n" + "=" * 80)
print("FIN DU TEST FINAL")
print("=" * 80)

print("\n📊 RÉSUMÉ:")
print("   Si les 2 tests passent ✅ → Le backend est 100% fonctionnel")
print("   Si Gemini OK mais POST échoue → Vérifier logs Render")
print("   Si Gemini échoue → Vérifier GEMINI_API_KEY sur Render")
