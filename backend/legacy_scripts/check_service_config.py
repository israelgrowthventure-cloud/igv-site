#!/usr/bin/env python3
"""
Script pour vérifier la configuration actuelle des services Render
"""

import os
import requests
from typing import Dict

RENDER_API_BASE = "https://api.render.com/v1"
api_key = os.environ.get('RENDER_API_KEY')

def get_service_details(service_id: str) -> Dict:
    """Récupère les détails complets d'un service"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}",
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return {}

# IDs des services
backend_id = "srv-d4ka5q63jp1c738n6b2g"
frontend_id = "srv-d4no5dc9c44c73d1opgg"

print("\n" + "="*80)
print("CONFIGURATION ACTUELLE DES SERVICES RENDER")
print("="*80 + "\n")

print("📦 BACKEND (igv-cms-backend)")
print("-" * 80)
backend = get_service_details(backend_id)
if backend:
    svc = backend.get('service', backend)
    print(f"  Name: {svc.get('name')}")
    print(f"  Type: {svc.get('type')}")
    print(f"  Env: {svc.get('env')}")
    print(f"  Branch: {svc.get('branch')}")
    print(f"  Repo: {svc.get('repo')}")
    print(f"  Root Directory: {svc.get('rootDir', '(non défini)')}")
    print(f"  Build Command: {svc.get('buildCommand')}")
    print(f"  Start Command: {svc.get('startCommand')}")
    print(f"  Auto Deploy: {svc.get('autoDeploy')}")

print("\n📦 FRONTEND (igv-site-web)")
print("-" * 80)
frontend = get_service_details(frontend_id)
if frontend:
    svc = frontend.get('service', frontend)
    print(f"  Name: {svc.get('name')}")
    print(f"  Type: {svc.get('type')}")
    print(f"  Env: {svc.get('env')}")
    print(f"  Branch: {svc.get('branch')}")
    print(f"  Repo: {svc.get('repo')}")
    print(f"  Root Directory: {svc.get('rootDir', '(non défini)')}")
    print(f"  Build Command: {svc.get('buildCommand')}")
    print(f"  Start Command: {svc.get('startCommand')}")
    print(f"  Auto Deploy: {svc.get('autoDeploy')}")

print("\n" + "="*80)
