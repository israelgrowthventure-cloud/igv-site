#!/usr/bin/env python3
"""
Script de déploiement Render via API pour Phase 6 TER
Déclenche le redéploiement des services frontend et backend
Attend la fin du déploiement et vérifie le statut
"""

import os
import sys
import time
import json
import requests
from datetime import datetime

# Configuration
RENDER_API_KEY = os.environ.get('RENDER_API_KEY')
if not RENDER_API_KEY:
    print("❌ ERROR: RENDER_API_KEY environment variable not set")
    sys.exit(1)

RENDER_API_BASE = "https://api.render.com/v1"
HEADERS = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

# Services à déployer
SERVICES = [
    {
        "id": "srv-d4ka5q63jp1c738n6b2g",  # Backend CMS
        "name": "igv-cms-backend",
        "url": "https://igv-cms-backend.onrender.com/api/health"
    },
    {
        "id": "srv-d4no5dc9c44c73d1opgg",  # Frontend
        "name": "igv-site-web",
        "url": "https://israelgrowthventure.com/"
    }
]

def trigger_deploy(service_id, service_name):
    """Déclenche un déploiement via l'API Render"""
    print(f"\n🚀 Déclenchement déploiement: {service_name} ({service_id})")
    
    url = f"{RENDER_API_BASE}/services/{service_id}/deploys"
    
    try:
        response = requests.post(url, headers=HEADERS, json={})
        response.raise_for_status()
        
        deploy_data = response.json()
        deploy_id = deploy_data.get('id')
        
        print(f"✅ Déploiement déclenché: {deploy_id}")
        return deploy_id
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print(f"❌ Erreur 401 Unauthorized - Vérifier RENDER_API_KEY")
        else:
            print(f"❌ Erreur HTTP {e.response.status_code}: {e.response.text}")
        return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def check_deploy_status(service_id, deploy_id, service_name):
    """Vérifie le statut d'un déploiement"""
    url = f"{RENDER_API_BASE}/services/{service_id}/deploys/{deploy_id}"
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        
        deploy_data = response.json()
        status = deploy_data.get('status')
        
        return status
        
    except Exception as e:
        print(f"⚠️ Erreur lors de la vérification du statut: {e}")
        return None

def wait_for_deploy(service_id, deploy_id, service_name, timeout=600):
    """Attend la fin du déploiement (timeout: 10 minutes)"""
    print(f"\n⏳ Attente fin déploiement {service_name}...")
    
    start_time = time.time()
    last_status = None
    
    while time.time() - start_time < timeout:
        status = check_deploy_status(service_id, deploy_id, service_name)
        
        if status and status != last_status:
            print(f"   Status: {status}")
            last_status = status
        
        if status == "live":
            print(f"✅ Déploiement terminé: {service_name}")
            return True
        elif status in ["build_failed", "update_failed", "canceled"]:
            print(f"❌ Déploiement échoué: {service_name} - Status: {status}")
            return False
        
        time.sleep(10)  # Vérifier toutes les 10 secondes
    
    print(f"⏱️ Timeout atteint pour {service_name}")
    return False

def test_service_health(url, service_name):
    """Teste le healthcheck d'un service"""
    print(f"\n🏥 Test healthcheck: {service_name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Service opérationnel (HTTP 200)")
            return True
        else:
            print(f"⚠️ Service répond mais HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur healthcheck: {e}")
        return False

def main():
    print("=" * 70)
    print("🚀 DÉPLOIEMENT RENDER - PHASE 6 TER")
    print("=" * 70)
    print(f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print(f"Commit: feat(phase6-ter): Restauration design Emergent + CMS hybride")
    print("=" * 70)
    
    deploy_results = []
    
    # Étape 1: Déclencher tous les déploiements
    for service in SERVICES:
        deploy_id = trigger_deploy(service['id'], service['name'])
        deploy_results.append({
            'service': service,
            'deploy_id': deploy_id,
            'success': deploy_id is not None
        })
    
    # Étape 2: Attendre la fin de chaque déploiement
    all_success = True
    for result in deploy_results:
        if result['success']:
            success = wait_for_deploy(
                result['service']['id'],
                result['deploy_id'],
                result['service']['name']
            )
            result['deploy_success'] = success
            all_success = all_success and success
        else:
            result['deploy_success'] = False
            all_success = False
    
    # Étape 3: Tester les services
    print("\n" + "=" * 70)
    print("🏥 TESTS HEALTHCHECK")
    print("=" * 70)
    
    for result in deploy_results:
        if result['deploy_success']:
            health_ok = test_service_health(
                result['service']['url'],
                result['service']['name']
            )
            result['health_ok'] = health_ok
        else:
            result['health_ok'] = False
    
    # Résumé final
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ DÉPLOIEMENT")
    print("=" * 70)
    
    for result in deploy_results:
        service_name = result['service']['name']
        deploy_ok = "✅" if result['deploy_success'] else "❌"
        health_ok = "✅" if result.get('health_ok') else "❌"
        
        print(f"{service_name}:")
        print(f"  Déploiement: {deploy_ok}")
        print(f"  Healthcheck: {health_ok}")
    
    print("=" * 70)
    
    if all_success and all(r.get('health_ok') for r in deploy_results):
        print("✅ DÉPLOIEMENT RÉUSSI - Tous les services opérationnels")
        return 0
    else:
        print("❌ DÉPLOIEMENT PARTIEL/ÉCHOUÉ - Vérifier les logs ci-dessus")
        return 1

if __name__ == "__main__":
    sys.exit(main())
