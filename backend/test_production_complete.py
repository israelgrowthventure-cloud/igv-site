#!/usr/bin/env python3
"""
Tests production complets - Frontend + Backend
Phase 1ter C+D - Validation finale
"""
import requests
import sys
from datetime import datetime

# URLs
FRONTEND = "https://israelgrowthventure.com"
BACKEND = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TESTS PRODUCTION COMPLETS - Phase 1ter C+D")
print(f"Date: {datetime.utcnow().isoformat()}Z")
print("=" * 80)

results = {
    "frontend": [],
    "backend": []
}

# ============================================================================
# TESTS FRONTEND
# ============================================================================
print("\n📱 TESTS FRONTEND")
print("-" * 80)

frontend_urls = [
    ("/", "Page d'accueil"),
    ("/packs", "Page packs"),
    ("/admin", "Admin login"),
    ("/payment/success?pack=Test&amount=1200&currency=EUR", "Payment success")
]

for path, name in frontend_urls:
    url = f"{FRONTEND}{path}"
    print(f"\n[Frontend] {name}")
    print(f"  URL: {url}")
    try:
        r = requests.get(url, timeout=15, allow_redirects=True)
        status = "✅ OK" if r.status_code == 200 else f"❌ FAIL ({r.status_code})"
        print(f"  Status: {r.status_code} - {status}")
        
        # Vérifications spécifiques
        if path == "/payment/success?pack=Test&amount=1200&currency=EUR":
            if "paiement" in r.text.lower() or "payment" in r.text.lower():
                print("  Contenu: ✅ Texte 'paiement' détecté")
            else:
                print("  Contenu: ⚠️  Texte 'paiement' non trouvé")
        
        results["frontend"].append({
            "name": name,
            "url": url,
            "status": r.status_code,
            "success": r.status_code == 200
        })
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        results["frontend"].append({
            "name": name,
            "url": url,
            "status": "ERROR",
            "success": False
        })

# ============================================================================
# TESTS BACKEND
# ============================================================================
print("\n\n🔧 TESTS BACKEND")
print("-" * 80)

# Test 1: Health check
print("\n[Backend] Health Check")
try:
    r = requests.get(f"{BACKEND}/api/health", timeout=10)
    print(f"  Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  ✅ MongoDB: {data.get('mongodb', 'N/A')}")
        print(f"  ✅ Version: {data.get('version', 'N/A')}")
        results["backend"].append({
            "name": "Health check",
            "status": 200,
            "success": True,
            "mongodb": data.get('mongodb')
        })
    else:
        print(f"  ❌ Status {r.status_code}")
        results["backend"].append({"name": "Health check", "status": r.status_code, "success": False})
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results["backend"].append({"name": "Health check", "status": "ERROR", "success": False})

# Test 2: Pages Étude 360
for page_slug in ["etude-implantation-360", "etude-implantation-merci"]:
    print(f"\n[Backend] Page {page_slug}")
    try:
        r = requests.get(f"{BACKEND}/api/pages/{page_slug}", timeout=10)
        if r.status_code == 200:
            page = r.json()
            title = page.get('title', {})
            if isinstance(title, dict):
                title_fr = title.get('fr', 'N/A')
            else:
                title_fr = title
            print(f"  ✅ Status: {r.status_code}")
            print(f"  ✅ Titre: {title_fr}")
            results["backend"].append({
                "name": f"Page {page_slug}",
                "status": 200,
                "success": True
            })
        else:
            print(f"  ❌ Status: {r.status_code}")
            results["backend"].append({
                "name": f"Page {page_slug}",
                "status": r.status_code,
                "success": False
            })
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        results["backend"].append({
            "name": f"Page {page_slug}",
            "status": "ERROR",
            "success": False
        })

# Test 3: Login admin
print(f"\n[Backend] Login Admin")
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
            print(f"  ✅ Token: {data['access_token'][:25]}...")
            results["backend"].append({
                "name": "Login admin",
                "status": 200,
                "success": True,
                "has_token": True
            })
        else:
            print(f"  ❌ Status: {r.status_code} mais pas de token")
            results["backend"].append({
                "name": "Login admin",
                "status": r.status_code,
                "success": False,
                "has_token": False
            })
    else:
        print(f"  ❌ Status: {r.status_code}")
        if r.status_code == 401:
            print("  ⚠️  Admin non trouvé - DB_NAME probablement incorrect")
        results["backend"].append({
            "name": "Login admin",
            "status": r.status_code,
            "success": False
        })
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    results["backend"].append({
        "name": "Login admin",
        "status": "ERROR",
        "success": False
    })

# ============================================================================
# RÉSUMÉ
# ============================================================================
print("\n" + "=" * 80)
print("RÉSUMÉ FINAL")
print("=" * 80)

frontend_ok = sum(1 for t in results["frontend"] if t["success"])
frontend_total = len(results["frontend"])
backend_ok = sum(1 for t in results["backend"] if t["success"])
backend_total = len(results["backend"])

print(f"\n📱 Frontend: {frontend_ok}/{frontend_total} tests OK")
for test in results["frontend"]:
    status_icon = "✅" if test["success"] else "❌"
    print(f"  {status_icon} {test['name']}: {test['status']}")

print(f"\n🔧 Backend: {backend_ok}/{backend_total} tests OK")
for test in results["backend"]:
    status_icon = "✅" if test["success"] else "❌"
    print(f"  {status_icon} {test['name']}: {test['status']}")

# Diagnostic DB_NAME
if backend_ok < backend_total:
    failed_backend = [t for t in results["backend"] if not t["success"]]
    if any("Page etude" in t["name"] or "Login" in t["name"] for t in failed_backend):
        print("\n⚠️  DIAGNOSTIC:")
        print("  → Pages Étude 360° ou Login admin échouent")
        print("  → Cause probable: DB_NAME pas configuré à 'IGV-Cluster' sur Render")
        print("  → Action: Vérifier https://dashboard.render.com/web/srv-cr64m4pu0jms73cnqplg")
        print("  → Variable requise: DB_NAME=IGV-Cluster")

total_ok = frontend_ok + backend_ok
total_tests = frontend_total + backend_total

print(f"\n🎯 TOTAL: {total_ok}/{total_tests} tests réussis")

if total_ok == total_tests:
    print("\n🎉 TOUS LES TESTS SONT PASSÉS !")
    print("   ✅ Phase 1ter C+D validée en production")
    sys.exit(0)
else:
    print(f"\n⚠️  {total_tests - total_ok} test(s) échoué(s)")
    sys.exit(1)
