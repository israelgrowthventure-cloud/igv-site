"""
Script de redéploiement automatisé du backend CMS sur Render
=============================================================

Déclenche un nouveau déploiement via l'API Render.

Variables d'environnement requises:
- RENDER_API_KEY: Clé API Render
- RENDER_SERVICE_ID_CMS_BACKEND: ID du service backend

Usage:
    python render_redeploy_cms_backend.py

Note: Ce script est UNIQUEMENT pour redéploiement, jamais importé par server.py
"""

import os
import sys
import requests
import time
from datetime import datetime

# Configuration
RENDER_API_KEY = os.environ.get('RENDER_API_KEY')
SERVICE_ID = os.environ.get('RENDER_SERVICE_ID_CMS_BACKEND', 'srv-cthh9lu8ii6s73c8vbe0')

def trigger_deploy():
    """Déclenche un nouveau déploiement"""
    
    if not RENDER_API_KEY:
        print("❌ RENDER_API_KEY non défini")
        print("   Définissez la variable d'environnement avant d'exécuter ce script")
        return None
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "clearCache": "do_not_clear"
    }
    
    try:
        print(f"🚀 Déclenchement du redéploiement...")
        print(f"   Service: {SERVICE_ID}")
        print(f"   Date: {datetime.now().isoformat()}")
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 401:
            print(f"\n❌ Erreur 401: RENDER_API_KEY invalide ou expirée")
            print("   Récupérez une nouvelle clé depuis:")
            print("   https://dashboard.render.com/account/api-keys")
            return None
        elif response.status_code not in [200, 201]:
            print(f"\n❌ Erreur: {response.status_code}")
            print(f"   {response.text}")
            return None
        
        data = response.json()
        deploy_id = data.get('id')
        status = data.get('status')
        commit = data.get('commit', {})
        
        print(f"\n✅ Déploiement déclenché avec succès!")
        print(f"   Deploy ID: {deploy_id}")
        print(f"   Status initial: {status}")
        print(f"   Commit: {commit.get('id', 'N/A')[:7]}")
        print(f"   Message: {commit.get('message', 'N/A')[:60]}")
        print(f"\n🔗 Suivez le déploiement:")
        print(f"   https://dashboard.render.com/web/{SERVICE_ID}")
        
        return deploy_id
        
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        return None

def check_deploy_status(deploy_id):
    """Vérifie le statut d'un déploiement"""
    
    if not RENDER_API_KEY or not deploy_id:
        return None
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{deploy_id}"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return None
        
        data = response.json()
        return data.get('status')
        
    except:
        return None

def wait_for_deploy(deploy_id, timeout=600):
    """Attend la fin du déploiement (avec timeout)"""
    
    if not deploy_id:
        return False
    
    print(f"\n⏳ Attente de la fin du déploiement (timeout: {timeout}s)...")
    
    start_time = time.time()
    last_status = None
    
    while time.time() - start_time < timeout:
        status = check_deploy_status(deploy_id)
        
        if status and status != last_status:
            print(f"   Status: {status}")
            last_status = status
        
        if status == 'live':
            elapsed = int(time.time() - start_time)
            print(f"\n✅ Déploiement réussi! (durée: {elapsed}s)")
            return True
        elif status in ['build_failed', 'deactivated', 'canceled']:
            print(f"\n❌ Déploiement échoué: {status}")
            return False
        
        time.sleep(10)  # Vérifier toutes les 10 secondes
    
    print(f"\n⏰ Timeout dépassé ({timeout}s)")
    print("   Le déploiement continue en arrière-plan")
    print("   Vérifiez manuellement le dashboard Render")
    return None

def redeploy():
    """Redéploiement complet avec suivi"""
    
    print("=" * 70)
    print("🔄 REDÉPLOIEMENT BACKEND CMS")
    print("=" * 70)
    print()
    
    if not RENDER_API_KEY:
        print("💡 Alternative: Déploiement manuel")
        print("   1. Ouvrez: https://dashboard.render.com/web/srv-cthh9lu8ii6s73c8vbe0")
        print("   2. Cliquez sur 'Manual Deploy' > 'Deploy latest commit'")
        return False
    
    # Déclencher le deploy
    deploy_id = trigger_deploy()
    
    if not deploy_id:
        return False
    
    # Attendre la fin (optionnel, peut être commenté pour retour immédiat)
    # wait_for_deploy(deploy_id)
    
    return True

if __name__ == '__main__':
    success = redeploy()
    sys.exit(0 if success else 1)
