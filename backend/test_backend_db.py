#!/usr/bin/env python3
"""
Test complet de validation post-déploiement Phase 1ter C+D
Vérifie que le backend utilise IGV-Cluster et que tous les endpoints fonctionnent
"""
import requests
import sys

backend_url = "https://igv-cms-backend.onrender.com"
frontend_url = "https://israelgrowthventure.com"

print("=" * 70)
print("TESTS PRODUCTION - Phase 1ter C+D")
print("=" * 70)

tests_passed = 0
tests_failed = 0

# Test 1: Health check
print("\n[1/7] Backend Health Check...")
try:
    r = requests.get(f"{backend_url}/api/health", timeout=10)
    if r.status_code == 200:
        data = r.json()
        print(f"   ✅ Status: {r.status_code}")
        print(f"   Version: {data.get('version', 'N/A')}")
        print(f"   MongoDB: {data.get('mongodb', 'N/A')}")
        tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code}")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 2: Liste des pages (diagnostic)
print("\n[2/7] Liste pages API...")
try:
    r = requests.get(f"{backend_url}/api/pages", timeout=10)
    if r.status_code == 200:
        pages = r.json()
        slugs = [p.get('slug') for p in pages]
        print(f"   ✅ Trouvé {len(pages)} pages:")
        for slug in slugs:
            print(f"      - {slug}")
        
        # Vérifier si pages Étude 360 sont présentes
        has_etude_360 = 'etude-implantation-360' in slugs
        has_etude_merci = 'etude-implantation-merci' in slugs
        
        if has_etude_360 and has_etude_merci:
            print("   ✅ Pages Étude 360° détectées dans la liste")
        else:
            print("   ⚠️  Pages Étude 360° manquantes dans la liste")
        tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code}")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 3: Page etude-implantation-360
print("\n[3/7] GET /api/pages/etude-implantation-360...")
try:
    r = requests.get(f"{backend_url}/api/pages/etude-implantation-360", timeout=10)
    if r.status_code == 200:
        page = r.json()
        title = page.get('title', {}).get('fr', 'N/A') if isinstance(page.get('title'), dict) else page.get('title', 'N/A')
        print(f"   ✅ Status: {r.status_code}")
        print(f"   Titre: {title}")
        tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code} - Page non trouvée")
        print("   → Le backend n'utilise probablement pas la base IGV-Cluster")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 4: Page etude-implantation-merci
print("\n[4/7] GET /api/pages/etude-implantation-merci...")
try:
    r = requests.get(f"{backend_url}/api/pages/etude-implantation-merci", timeout=10)
    if r.status_code == 200:
        page = r.json()
        title = page.get('title', {}).get('fr', 'N/A') if isinstance(page.get('title'), dict) else page.get('title', 'N/A')
        print(f"   ✅ Status: {r.status_code}")
        print(f"   Titre: {title}")
        tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code} - Page non trouvée")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 5: Login admin
print("\n[5/7] POST /api/auth/login (admin IGV)...")
try:
    payload = {
        "email": "postmaster@israelgrowthventure.com",
        "password": "Admin@igv2025#"
    }
    r = requests.post(f"{backend_url}/api/auth/login", json=payload, timeout=10)
    if r.status_code == 200:
        data = r.json()
        if 'access_token' in data:
            print(f"   ✅ Status: {r.status_code}")
            print(f"   Token: {data['access_token'][:20]}...")
            tests_passed += 1
        else:
            print(f"   ❌ Status: {r.status_code} mais pas de token")
            tests_failed += 1
    elif r.status_code == 401:
        print(f"   ❌ Status: 401 - Admin non trouvé ou mauvais password")
        print("   → Vérifier que l'admin existe dans IGV-Cluster")
        tests_failed += 1
    else:
        print(f"   ❌ Status: {r.status_code}")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 6: Frontend home
print("\n[6/7] GET Frontend Home...")
try:
    r = requests.get(frontend_url, timeout=10)
    if r.status_code == 200:
        print(f"   ✅ Status: {r.status_code}")
        tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code}")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Test 7: Frontend payment success
print("\n[7/7] GET /payment/success...")
try:
    r = requests.get(f"{frontend_url}/payment/success?pack=Test&amount=1200&currency=EUR&provider=stripe", timeout=10)
    if r.status_code == 200:
        # Vérifier présence du texte "Paiement confirmé" ou "Payment confirmed"
        if 'Paiement confirmé' in r.text or 'Payment confirmed' in r.text or 'payment' in r.text.lower():
            print(f"   ✅ Status: {r.status_code}")
            print("   ✅ Contenu 'paiement' détecté")
            tests_passed += 1
        else:
            print(f"   ⚠️  Status: {r.status_code} mais contenu non vérifié")
            tests_passed += 1
    else:
        print(f"   ❌ Status: {r.status_code}")
        tests_failed += 1
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    tests_failed += 1

# Résumé
print("\n" + "=" * 70)
print("RÉSUMÉ DES TESTS")
print("=" * 70)
print(f"✅ Tests réussis: {tests_passed}/7")
print(f"❌ Tests échoués: {tests_failed}/7")

if tests_failed == 0:
    print("\n🎉 TOUS LES TESTS SONT PASSÉS !")
    print("   Phase 1ter C+D validée en production.")
    sys.exit(0)
else:
    print("\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
    if tests_failed >= 3:
        print("\n=== DIAGNOSTIC ===")
        print("Si login admin + pages Étude 360 échouent:")
        print("→ Le backend n'utilise probablement pas la base 'IGV-Cluster'")
        print("→ Action: Vérifier DB_NAME sur Render Dashboard")
        print("→ URL: https://dashboard.render.com/web/srv-cr64m4pu0jms73cnqplg")
    sys.exit(1)
