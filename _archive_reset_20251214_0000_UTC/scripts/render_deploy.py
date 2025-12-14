#!/usr/bin/env python3
"""
Script de déploiement automatisé Render
Déclenche le déploiement backend + frontend via API Render et attend "Deployed"
"""
import os
import sys
import time
import requests
from datetime import datetime, timezone

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
BACKEND_SERVICE_ID = os.getenv("RENDER_BACKEND_SERVICE_ID", "srv-d4ka5q63jp1c738n6b2g")
FRONTEND_SERVICE_ID = os.getenv("RENDER_FRONTEND_SERVICE_ID", "srv-d4no5dc9c44c73d1opgg")

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY non défini")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def trigger_deploy(service_id, service_name):
    """Déclenche un déploiement manuel"""
    url = f"https://api.render.com/v1/services/{service_id}/deploys"
    try:
        response = requests.post(url, headers=HEADERS, json={"clearCache": "do_not_clear"}, timeout=10)
        if response.status_code in [200, 201]:
            deploy_id = response.json().get("id")
            print(f"✓ {service_name}: Déploiement déclenché (ID: {deploy_id})")
            return deploy_id
        else:
            print(f"❌ {service_name}: Erreur API {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ {service_name}: {str(e)}")
        return None

def check_deploy_status(service_id, service_name):
    """Vérifie le statut d'un service"""
    url = f"https://api.render.com/v1/services/{service_id}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # L'API peut renvoyer soit un objet direct, soit sous clé "service"
            service_obj = data.get("service", data)
            service_details = service_obj.get("serviceDetails", {})
            status = service_details.get("deploy", {}).get("status", service_obj.get("serviceStatus", "unknown"))
            health = service_details.get("health", service_obj.get("health", "unknown"))
            return status, health
        return "error", "unknown"
    except Exception as e:
        return "error", str(e)

def wait_for_deployed(service_id, service_name, timeout=900):
    """Attend que le service soit déployé"""
    start = time.time()
    print(f"\n⏳ Attente déploiement {service_name}...")
    
    while time.time() - start < timeout:
        status, health = check_deploy_status(service_id, service_name)
        
        if status == "live":
            print(f"✅ {service_name}: DEPLOYED (Health: {health})")
            return True
        elif status in ["failed", "error"]:
            print(f"❌ {service_name}: Déploiement FAILED (Status: {status})")
            return False
        
        print(f"   {service_name}: {status} (Health: {health})")
        time.sleep(15)
    
    print(f"⚠️  {service_name}: TIMEOUT après {timeout}s")
    return False

def main():
    print("=" * 80)
    print("DÉPLOIEMENT AUTOMATISÉ RENDER")
    print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 80)
    
    # Déclencher déploiements
    print("\n📤 Déclenchement des déploiements...")
    backend_deploy_id = trigger_deploy(BACKEND_SERVICE_ID, "Backend")
    frontend_deploy_id = trigger_deploy(FRONTEND_SERVICE_ID, "Frontend")
    
    if not backend_deploy_id and not frontend_deploy_id:
        print("\n❌ Aucun déploiement déclenché")
        return 1
    
    # Attendre les déploiements
    backend_ok = wait_for_deployed(BACKEND_SERVICE_ID, "Backend") if backend_deploy_id else False
    frontend_ok = wait_for_deployed(FRONTEND_SERVICE_ID, "Frontend") if frontend_deploy_id else False
    
    # Résumé
    print("\n" + "=" * 80)
    print("RÉSUMÉ DÉPLOIEMENT")
    print("=" * 80)
    print(f"Backend:  {'✅ SUCCESS' if backend_ok else '❌ FAILED'}")
    print(f"Frontend: {'✅ SUCCESS' if frontend_ok else '❌ FAILED'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 DÉPLOIEMENT COMPLET RÉUSSI")
        return 0
    else:
        print("\n❌ DÉPLOIEMENT PARTIEL OU ÉCHOUÉ")
        return 1

if __name__ == "__main__":
    sys.exit(main())
