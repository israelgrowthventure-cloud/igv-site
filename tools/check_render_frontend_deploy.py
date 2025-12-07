#!/usr/bin/env python3
"""Vérifie le statut du déploiement Render frontend"""

import requests
import os
from datetime import datetime

RENDER_API_KEY = os.getenv('RENDER_API_KEY', 'rnd_qI2VgOjfIQU4OGl9XfMrxNwuBIKe')
RENDER_SERVICE_ID = "srv-ctfhv3pu0jms73faofb0"  # igv-site-frontend

def get_latest_deploy():
    """Récupère le dernier déploiement"""
    url = f"https://api.render.com/v1/services/{RENDER_SERVICE_ID}/deploys"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, params={"limit": 1})
        response.raise_for_status()
        data = response.json()
        
        if data and len(data) > 0:
            deploy = data[0]
            return deploy
        return None
    except Exception as e:
        print(f"❌ Error fetching deploy: {e}")
        return None

def get_deploy_logs(deploy_id):
    """Récupère les logs d'un déploiement"""
    url = f"https://api.render.com/v1/services/{RENDER_SERVICE_ID}/deploys/{deploy_id}/logs"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "text/plain"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"❌ Error fetching logs: {e}")
        return None

if __name__ == "__main__":
    print("\n🔍 CHECKING RENDER FRONTEND DEPLOYMENT\n")
    print("="*70)
    
    deploy = get_latest_deploy()
    
    if not deploy:
        print("❌ Could not fetch deployment info")
        exit(1)
    
    print(f"\n📦 Latest Deploy:")
    print(f"   ID: {deploy['deploy']['id']}")
    print(f"   Status: {deploy['deploy']['status']}")
    print(f"   Commit: {deploy['deploy'].get('commit', {}).get('id', 'N/A')[:7]}")
    print(f"   Message: {deploy['deploy'].get('commit', {}).get('message', 'N/A')[:60]}")
    print(f"   Created: {deploy['deploy']['createdAt']}")
    print(f"   Updated: {deploy['deploy']['updatedAt']}")
    
    status = deploy['deploy']['status']
    
    if status == 'live':
        print("\n✅ Deploy is LIVE")
    elif status == 'build_failed':
        print("\n❌ Build FAILED!")
    elif status in ['building', 'deploying']:
        print(f"\n⏳ Deploy in progress: {status}")
    else:
        print(f"\n⚠️  Unexpected status: {status}")
    
    # Fetch logs if build failed or in progress
    if status in ['build_failed', 'building', 'deploying']:
        print("\n📜 Fetching logs...")
        print("="*70)
        logs = get_deploy_logs(deploy['deploy']['id'])
        if logs:
            # Montrer les 100 dernières lignes
            lines = logs.split('\n')
            for line in lines[-100:]:
                print(line)
        print("="*70)
    
    print("")
