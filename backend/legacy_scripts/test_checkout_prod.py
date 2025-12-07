#!/usr/bin/env python3
"""
Script de diagnostic du checkout en production
Teste uniquement la production, aucun test local
"""
import requests
import json
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com"
TIMEOUT = 30

print("=" * 80)
print("DIAGNOSTIC CHECKOUT EN PRODUCTION")
print("=" * 80)

# Test 1: Vérifier qu'un pack existe
print("\n1. Test: Récupération d'un pack pour le checkout...")
try:
    response = requests.get(f"{BACKEND_URL}/api/packs/pack-analyse", timeout=TIMEOUT)
    if response.status_code == 200:
        pack = response.json()
        print(f"✓ Pack trouvé: {pack.get('name', {}).get('fr', 'N/A')}")
        print(f"  Prix de base: {pack.get('base_price')} {pack.get('currency')}")
    elif response.status_code == 404:
        print("✗ Pack 'pack-analyse' introuvable")
        print("  Essai avec les packs disponibles...")
        packs_response = requests.get(f"{BACKEND_URL}/api/packs", timeout=TIMEOUT)
        if packs_response.status_code == 200:
            packs = packs_response.json()
            if packs:
                first_pack = packs[0]
                print(f"  Premier pack disponible: {first_pack.get('id')}")
                test_pack_id = first_pack.get('id')
            else:
                print("  ✗ Aucun pack disponible!")
                test_pack_id = None
        else:
            print(f"  ✗ Erreur lors de la récupération des packs: {packs_response.status_code}")
            test_pack_id = None
    else:
        print(f"✗ Erreur: {response.status_code}")
        test_pack_id = None
except Exception as e:
    print(f"✗ Exception: {e}")
    test_pack_id = None

# Test 2: Tester l'endpoint de pricing
print("\n2. Test: Récupération du pricing pour une zone...")
try:
    if test_pack_id:
        response = requests.get(
            f"{BACKEND_URL}/api/pricing",
            params={"packId": test_pack_id, "zone": "EU"},
            timeout=TIMEOUT
        )
        if response.status_code == 200:
            pricing = response.json()
            print(f"✓ Pricing récupéré:")
            print(f"  Zone: {pricing.get('zone')}")
            print(f"  Prix total: {pricing.get('total_price')} {pricing.get('currency')}")
            print(f"  Affichage: {pricing.get('display', {}).get('total')}")
        else:
            print(f"✗ Erreur pricing: {response.status_code}")
            print(f"  Response: {response.text[:200]}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Test 3: Simuler un appel checkout (SANS créer réellement la session Stripe)
print("\n3. Test: Simulation appel checkout...")
print("  NOTE: Test avec données fictives pour mesurer le temps de réponse")

checkout_payload = {
    "packId": "analyse",  # Utiliser l'ID tel que défini dans pricing_config.py
    "packName": "Pack Analyse Test",
    "priceLabel": "3 000 EUR",
    "customer": {
        "fullName": "Test User",
        "company": "Test Company",
        "email": "test@example.com",
        "phone": "+33612345678",
        "country": "FR"
    },
    "planType": "ONE_SHOT",
    "zone": "EU"
}

print(f"\n  Payload:")
print(f"    Pack: {checkout_payload['packId']}")
print(f"    Zone: {checkout_payload['zone']}")
print(f"    Plan: {checkout_payload['planType']}")

try:
    start_time = time.time()
    response = requests.post(
        f"{BACKEND_URL}/api/checkout",
        json=checkout_payload,
        timeout=TIMEOUT,
        headers={"Content-Type": "application/json"}
    )
    elapsed = time.time() - start_time
    
    print(f"\n  Temps de réponse: {elapsed:.2f}s")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Checkout SUCCESS!")
        print(f"  Order ID: {data.get('orderId')}")
        print(f"  Payment URL présente: {'paymentUrl' in data}")
    elif response.status_code == 400:
        error_data = response.json()
        print(f"✗ Erreur 400 (validation):")
        print(f"  {error_data.get('detail', 'Unknown error')}")
    elif response.status_code == 502:
        print(f"✗ Erreur 502 (Bad Gateway - problème Stripe?)")
        print(f"  Response: {response.text[:300]}")
    else:
        print(f"✗ Erreur {response.status_code}")
        print(f"  Response: {response.text[:300]}")
        
except requests.Timeout:
    elapsed = time.time() - start_time
    print(f"✗ TIMEOUT après {elapsed:.2f}s")
    print("  → Le checkout est trop lent!")
except Exception as e:
    elapsed = time.time() - start_time
    print(f"✗ Exception après {elapsed:.2f}s: {e}")

# Test 4: Vérifier la configuration Stripe
print("\n4. Test: Vérification configuration Stripe...")
print("  (Test indirect via health check)")

try:
    response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
    if response.status_code == 200:
        health = response.json()
        print(f"✓ Backend opérationnel")
        print(f"  MongoDB: {health.get('mongodb')}")
        # Note: on ne peut pas vérifier Stripe directement sans endpoint dédié
    else:
        print(f"✗ Health check failed: {response.status_code}")
except Exception as e:
    print(f"✗ Exception: {e}")

# Résumé
print("\n" + "=" * 80)
print("DIAGNOSTIC TERMINÉ")
print("=" * 80)
print("\nPROBLÈMES POTENTIELS:")
print("1. Si le temps de réponse checkout > 5s:")
print("   → Appels Stripe API lents (vérifier clé API, région)")
print("   → Timeout MongoDB trop long")
print("   → Pas de timeout configuré sur les appels externes")
print("\n2. Si erreur 502:")
print("   → STRIPE_SECRET_KEY manquante ou invalide")
print("   → Problème de connexion à l'API Stripe")
print("\n3. Si erreur 400:")
print("   → Validation des données échoue")
print("   → PackType enum ne correspond pas aux IDs envoyés")
print("\n4. Si timeout:")
print("   → Backend bloqué sur un appel externe sans timeout")
print("   → Cold start Render (> 30s pour réveiller le service)")
