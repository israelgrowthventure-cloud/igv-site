#!/usr/bin/env python3
"""
Détecte automatiquement les service IDs Render et déclenche déploiement
"""
import os
import sys
import time
import requests
from datetime import datetime, timezone

# IDs potentiels (anciens + nouveaux)
BACKEND_IDS = [
    "srv-ctdvq72v06l2vv0jb5kg",  # Nouveau (dans render_deploy.py)
    "srv-d4ka5q63jp1c738n6b2g",  # Ancien (dans archives)
]

FRONTEND_IDS = [
    "srv-ctdur72v06l2vv0j9s7g",  # Nouveau
    "srv-d4no5dc9c44c73d1opgg",  # Ancien
]

RENDER_API_KEY = os.getenv("RENDER_API_KEY")

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY manquante")
    print("\n🔧 Pour configurer:")
    print("1. Obtenir clé: https://dashboard.render.com/account/api-keys")
    print("2. Définir: $env:RENDER_API_KEY='votre_clé'")
    print("3. Relancer: python scripts/auto_detect_and_deploy.py")
    print("\n⚠️  OU utiliser déploiement manuel Dashboard (voir RENDER_MANUAL_DEPLOY_REQUIRED.md)")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

print("=" * 80)
print("AUTO-DÉTECTION + DÉPLOIEMENT RENDER")
print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
print("=" * 80)
print()

def check_service(service_id, name):
    """Vérifie si un service ID est valide"""
    try:
        response = requests.get(
            f"https://api.render.com/v1/services/{service_id}",
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            service_name = data.get("name", "N/A")
            service_type = data.get("type", "N/A")
            print(f"✅ {name}: {service_id}")
            print(f"   Nom: {service_name}")
            print(f"   Type: {service_type}")
            return True
        elif response.status_code == 404:
            print(f"❌ {name}: {service_id} (404 not found)")
            return False
        else:
            print(f"⚠️  {name}: {service_id} (status {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ {name}: {service_id} (erreur: {e})")
        return False

def trigger_deploy(service_id, name):
    """Déclenche un déploiement"""
    try:
        response = requests.post(
            f"https://api.render.com/v1/services/{service_id}/deploys",
            headers=headers,
            json={"clearCache": "do_not_clear"},
            timeout=10
        )
        if response.status_code in [200, 201]:
            data = response.json()
            deploy_id = data.get("id", "N/A")
            print(f"✅ {name}: Déploiement déclenché")
            print(f"   Deploy ID: {deploy_id}")
            return deploy_id
        else:
            print(f"❌ {name}: Erreur {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ {name}: Erreur déclenchement ({e})")
        return None

# Phase 1: Détection
print("🔍 PHASE 1: DÉTECTION DES SERVICE IDS\n")

valid_backend_id = None
for bid in BACKEND_IDS:
    if check_service(bid, "Backend"):
        valid_backend_id = bid
        break
    print()

print()

valid_frontend_id = None
for fid in FRONTEND_IDS:
    if check_service(fid, "Frontend"):
        valid_frontend_id = fid
        break
    print()

if not valid_backend_id or not valid_frontend_id:
    print("\n❌ Impossible de trouver les service IDs valides")
    print("\n📋 Services détectés:")
    print(f"   Backend: {valid_backend_id or 'NON TROUVÉ'}")
    print(f"   Frontend: {valid_frontend_id or 'NON TROUVÉ'}")
    print("\n🔧 Actions possibles:")
    print("1. Vérifier RENDER_API_KEY valide")
    print("2. Utiliser scripts/list_render_services.py pour lister tous les services")
    print("3. Déploiement manuel Dashboard (voir RENDER_MANUAL_DEPLOY_REQUIRED.md)")
    sys.exit(1)

# Phase 2: Déploiement
print("\n" + "=" * 80)
print("🚀 PHASE 2: DÉCLENCHEMENT DÉPLOIEMENT\n")

backend_deploy = trigger_deploy(valid_backend_id, "Backend")
print()
frontend_deploy = trigger_deploy(valid_frontend_id, "Frontend")

if not backend_deploy or not frontend_deploy:
    print("\n⚠️  Certains déploiements ont échoué")
    print("\n📋 Résultats:")
    print(f"   Backend: {backend_deploy or 'ÉCHEC'}")
    print(f"   Frontend: {frontend_deploy or 'ÉCHEC'}")
    sys.exit(1)

print("\n" + "=" * 80)
print("✅ DÉPLOIEMENTS DÉCLENCHÉS")
print("=" * 80)
print(f"\nBackend ID: {valid_backend_id}")
print(f"Frontend ID: {valid_frontend_id}")
print(f"\nBackend Deploy: {backend_deploy}")
print(f"Frontend Deploy: {frontend_deploy}")

print("\n⏳ Attente build + deploy (10-15 minutes)...")
print("\n🔍 Surveiller progression:")
print(f"   Backend: https://dashboard.render.com/web/{valid_backend_id}")
print(f"   Frontend: https://dashboard.render.com/web/{valid_frontend_id}")

print("\n✅ Tests à exécuter APRÈS déploiement:")
print("   python scripts/test_production_http.py")
print("   node scripts/test_production_browser_playwright.mjs")

# Sauvegarder IDs valides
with open("scripts/valid_service_ids.txt", "w") as f:
    f.write(f"BACKEND={valid_backend_id}\n")
    f.write(f"FRONTEND={valid_frontend_id}\n")

print(f"\n✓ IDs sauvegardés: scripts/valid_service_ids.txt")
