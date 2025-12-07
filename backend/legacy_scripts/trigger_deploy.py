#!/usr/bin/env python3
"""
Force un déploiement manuel des deux services Render
"""

import os
import requests
import time

RENDER_API_BASE = "https://api.render.com/v1"
api_key = os.environ.get('RENDER_API_KEY')

def trigger_deploy(service_id: str, service_name: str) -> bool:
    """Déclenche un déploiement manuel avec clear cache"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    payload = {
        "clearCache": "clear"
    }
    
    try:
        print(f"🚀 Déclenchement déploiement: {service_name}")
        response = requests.post(
            f"{RENDER_API_BASE}/services/{service_id}/deploys",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        deploy = response.json()
        deploy_data = deploy.get('deploy', deploy)
        
        print(f"✅ Déploiement lancé!")
        print(f"   Deploy ID: {deploy_data.get('id')}")
        print(f"   Status: {deploy_data.get('status')}")
        print(f"   Commit: {deploy_data.get('commit', {}).get('message', 'N/A')[:60]}")
        print()
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Détails: {e.response.text}")
        return False

def check_deploy_status(service_id: str, service_name: str):
    """Vérifie le statut du dernier déploiement"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}/deploys",
            headers=headers,
            params={'limit': 1},
            timeout=30
        )
        response.raise_for_status()
        
        deploys = response.json()
        if deploys:
            deploy = deploys[0].get('deploy', deploys[0])
            status = deploy.get('status')
            print(f"📊 {service_name}: {status}")
            return status
        
    except Exception as e:
        print(f"❌ Erreur vérification: {e}")
        return None

# IDs des services
backend_id = "srv-d4ka5q63jp1c738n6b2g"
frontend_id = "srv-d4no5dc9c44c73d1opgg"

print("\n" + "="*80)
print("DÉCLENCHEMENT MANUEL DES DÉPLOIEMENTS RENDER")
print("="*80 + "\n")

# Déclencher backend
success_backend = trigger_deploy(backend_id, "igv-cms-backend")
time.sleep(2)

# Déclencher frontend
success_frontend = trigger_deploy(frontend_id, "igv-site-web")

if success_backend and success_frontend:
    print("="*80)
    print("✅ LES DEUX DÉPLOIEMENTS SONT LANCÉS")
    print("="*80)
    print("\n⏳ Durée estimée:")
    print("   Backend:  5-7 minutes (pip install + uvicorn start)")
    print("   Frontend: 6-8 minutes (npm install + build + node start)")
    print("\n💡 Monitoring en cours...\n")
    
    # Monitoring pendant 10 minutes
    for i in range(20):  # 20 checks = 10 minutes (30s chaque)
        print(f"Check {i+1}/20 ({(i+1)*30}s) - " + time.strftime("%H:%M:%S"))
        
        backend_status = check_deploy_status(backend_id, "Backend ")
        frontend_status = check_deploy_status(frontend_id, "Frontend")
        
        # Vérifier si les deux sont live
        if backend_status == 'live' and frontend_status == 'live':
            print("\n" + "="*80)
            print("🎉🎉🎉 LES DEUX SERVICES SONT MAINTENANT LIVE! 🎉🎉🎉")
            print("="*80)
            break
        
        # Vérifier si l'un a échoué
        if backend_status and 'failed' in backend_status.lower():
            print(f"\n❌ Backend a échoué: {backend_status}")
        if frontend_status and 'failed' in frontend_status.lower():
            print(f"\n❌ Frontend a échoué: {frontend_status}")
        
        if i < 19:  # Ne pas attendre après le dernier check
            print()
            time.sleep(30)
    
    print("\n" + "="*80)
    print("FIN DU MONITORING")
    print("="*80)
    
else:
    print("\n❌ Échec du déclenchement des déploiements")
