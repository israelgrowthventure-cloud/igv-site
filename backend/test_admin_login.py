#!/usr/bin/env python3
"""
Test du login admin en production
Vérifie que l'utilisateur postmaster@israelgrowthventure.com peut se connecter
"""
import requests
import sys
from datetime import datetime

BACKEND = "https://igv-cms-backend.onrender.com"
FRONTEND = "https://israelgrowthventure.com"

print("=" * 80)
print("TEST LOGIN ADMIN - Production")
print(f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
print("=" * 80)

results = []

# Test 1: Frontend home
print("\n[1/4] Frontend Home")
try:
    r = requests.get(FRONTEND, timeout=10)
    status = "✅ OK" if r.status_code == 200 else f"❌ FAIL"
    print(f"  URL: {FRONTEND}")
    print(f"  Status: {r.status_code} - {status}")
    results.append(("Frontend Home", r.status_code, r.status_code == 200))
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results.append(("Frontend Home", "ERROR", False))

# Test 2: Frontend /admin (devrait rediriger vers /admin/login si non connecté)
print("\n[2/4] Frontend /admin")
try:
    r = requests.get(f"{FRONTEND}/admin", timeout=10, allow_redirects=True)
    # On accepte 200 (page chargée) ou 302/301 (redirection)
    status = "✅ OK" if r.status_code in [200, 301, 302] else f"❌ FAIL"
    print(f"  URL: {FRONTEND}/admin")
    print(f"  Status: {r.status_code} - {status}")
    results.append(("Frontend /admin", r.status_code, r.status_code in [200, 301, 302]))
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results.append(("Frontend /admin", "ERROR", False))

# Test 3: Backend login API (direct)
print("\n[3/4] Backend Login API (direct)")
try:
    payload = {
        "email": "postmaster@israelgrowthventure.com",
        "password": "Admin@igv2025#"
    }
    r = requests.post(f"{BACKEND}/api/auth/login", json=payload, timeout=10)
    
    if r.status_code == 200:
        data = r.json()
        if 'access_token' in data:
            print(f"  ✅ Status: {r.status_code}")
            print(f"  ✅ Token reçu: {data['access_token'][:30]}...")
            print(f"  ✅ Login backend fonctionnel")
            results.append(("Backend Login API", 200, True))
        else:
            print(f"  ❌ Status: {r.status_code} mais pas de token")
            print(f"  Response: {data}")
            results.append(("Backend Login API", r.status_code, False))
    else:
        print(f"  ❌ Status: {r.status_code}")
        print(f"  Response: {r.text[:200]}")
        results.append(("Backend Login API", r.status_code, False))
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results.append(("Backend Login API", "ERROR", False))

# Test 4: Frontend /admin/login (page accessible)
print("\n[4/4] Frontend /admin/login")
try:
    r = requests.get(f"{FRONTEND}/admin/login", timeout=10)
    status = "✅ OK" if r.status_code == 200 else f"❌ FAIL"
    print(f"  URL: {FRONTEND}/admin/login")
    print(f"  Status: {r.status_code} - {status}")
    
    # Vérifier que le formulaire contient le bon placeholder
    if r.status_code == 200:
        if "postmaster@israelgrowthventure.com" in r.text:
            print(f"  ✅ Placeholder email correct détecté")
        else:
            print(f"  ⚠️  Placeholder ancien (admin@igv.co.il) encore présent")
    
    results.append(("Frontend /admin/login", r.status_code, r.status_code == 200))
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results.append(("Frontend /admin/login", "ERROR", False))

# Résumé
print("\n" + "=" * 80)
print("RÉSUMÉ")
print("=" * 80)

passed = sum(1 for _, _, success in results if success)
total = len(results)

for name, status, success in results:
    icon = "✅" if success else "❌"
    print(f"{icon} {name}: {status}")

print(f"\n🎯 TOTAL: {passed}/{total} tests réussis")

if passed == total:
    print("\n✅ TOUS LES TESTS SONT PASSÉS")
    print("\n📝 Instructions pour test manuel du login:")
    print("   1. Ouvrir https://israelgrowthventure.com/admin/login")
    print("   2. Entrer:")
    print("      Email: postmaster@israelgrowthventure.com")
    print("      Password: Admin@igv2025#")
    print("   3. Cliquer 'Sign In'")
    print("   4. Vérifier redirection vers /admin")
    sys.exit(0)
else:
    print(f"\n⚠️  {total - passed} test(s) échoué(s)")
    sys.exit(1)
