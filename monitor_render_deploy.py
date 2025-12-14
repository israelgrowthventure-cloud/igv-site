#!/usr/bin/env python3
"""
Moniteur de déploiement Render - Attend que backend + frontend soient deployed
"""
import os
import requests
import time
import sys
from datetime import datetime, timezone

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY non défini")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

# Service IDs
BACKEND_ID = "srv-ctdvq72v06l2vv0jb5kg"
FRONTEND_ID = "srv-ctdur72v06l2vv0j9s7g"

def get_service_status(service_id, service_name):
    """Récupère le statut d'un service"""
    try:
        url = f"https://api.render.com/v1/services/{service_id}"
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            data = response.json()
            status = data.get("service", {}).get("serviceDetails", {}).get("health", "unknown")
            return status
        else:
            print(f"  ⚠️  {service_name}: API error {response.status_code}")
            return "error"
    except Exception as e:
        print(f"  ⚠️  {service_name}: {str(e)}")
        return "error"

def main():
    print("=" * 80)
    print("SURVEILLANCE DÉPLOIEMENT RENDER")
    print(f"Commit: 2388bac")
    print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 80)
    
    timeout = 600  # 10 minutes max
    start_time = time.time()
    check_interval = 15  # Check toutes les 15 secondes
    
    backend_ready = False
    frontend_ready = False
    
    print("\n⏳ Attente du déploiement...\n")
    
    while time.time() - start_time < timeout:
        backend_status = get_service_status(BACKEND_ID, "Backend")
        frontend_status = get_service_status(FRONTEND_ID, "Frontend")
        
        # Afficher statut
        backend_symbol = "✓" if backend_status == "healthy" else "⏳"
        frontend_symbol = "✓" if frontend_status == "healthy" else "⏳"
        
        print(f"\r{backend_symbol} Backend: {backend_status:12} | {frontend_symbol} Frontend: {frontend_status:12}", end="", flush=True)
        
        if backend_status == "healthy":
            backend_ready = True
        if frontend_status == "healthy":
            frontend_ready = True
        
        if backend_ready and frontend_ready:
            print("\n\n✅ DÉPLOIEMENT TERMINÉ - Backend et Frontend sont HEALTHY")
            return 0
        
        time.sleep(check_interval)
    
    print("\n\n⚠️  TIMEOUT - Déploiement non terminé dans les 10 minutes")
    print(f"Backend: {backend_status} | Frontend: {frontend_status}")
    return 1

if __name__ == "__main__":
    sys.exit(main())
