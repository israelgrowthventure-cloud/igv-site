#!/usr/bin/env python3
"""
Vérifier le statut de déploiement Render du frontend
"""

import os
import requests
import json
from datetime import datetime

RENDER_API_KEY = os.getenv("RENDER_API_KEY", "")
RENDER_SERVICE_ID_FRONTEND = os.getenv("RENDER_SERVICE_ID_FRONTEND", "srv-ctco2haj1k6c73fhb920")

def check_render_frontend_status():
    if not RENDER_API_KEY:
        print("❌ RENDER_API_KEY not set")
        return False
    
    print("\n🔍 RENDER FRONTEND SERVICE STATUS")
    print("=" * 70)
    
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Get service info
    print(f"\n📡 GET Service Info: {RENDER_SERVICE_ID_FRONTEND}")
    try:
        service_url = f"https://api.render.com/v1/services/{RENDER_SERVICE_ID_FRONTEND}"
        response = requests.get(service_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ Status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
        
        service = response.json()
        
        print(f"   Name: {service.get('name', 'N/A')}")
        print(f"   Type: {service.get('type', 'N/A')}")
        print(f"   Env: {service.get('env', 'N/A')}")
        print(f"   Region: {service.get('region', 'N/A')}")
        print(f"   Status: {service.get('suspended', 'N/A')}")
        print(f"   URL: {service.get('serviceDetails', {}).get('url', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Get recent deploys
    print(f"\n📦 Recent Deploys (last 5):")
    try:
        deploys_url = f"https://api.render.com/v1/services/{RENDER_SERVICE_ID_FRONTEND}/deploys"
        response = requests.get(deploys_url, headers=headers, params={"limit": 5}, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ Status: {response.status_code}")
            return False
        
        deploys = response.json()
        
        for i, deploy in enumerate(deploys[:5], 1):
            deploy_id = deploy.get('id', 'N/A')
            status = deploy.get('status', 'N/A')
            commit = deploy.get('commit', {})
            commit_msg = commit.get('message', 'N/A')[:60]
            created_at = deploy.get('createdAt', 'N/A')
            finished_at = deploy.get('finishedAt', 'N/A')
            
            status_emoji = {
                'live': '✅',
                'build_failed': '❌',
                'deactivated': '⏸️',
                'pre_deploy_failed': '❌',
                'update_failed': '❌',
                'canceled': '⏹️'
            }.get(status, '🔄')
            
            print(f"\n   {i}. {status_emoji} Deploy {deploy_id[:12]}")
            print(f"      Status: {status}")
            print(f"      Commit: {commit_msg}")
            print(f"      Created: {created_at}")
            print(f"      Finished: {finished_at}")
        
        # Check if latest deploy is live
        if deploys and deploys[0].get('status') == 'live':
            print(f"\n✅ Latest deploy is LIVE")
            return True
        elif deploys:
            print(f"\n⚠️  Latest deploy status: {deploys[0].get('status')}")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = check_render_frontend_status()
    print("\n" + "=" * 70)
    if success:
        print("✅ FRONTEND SERVICE IS LIVE")
    else:
        print("❌ FRONTEND SERVICE HAS ISSUES")
    print("=" * 70 + "\n")
