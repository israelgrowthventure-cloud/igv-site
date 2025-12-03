#!/usr/bin/env python3
"""
Script pour configurer correctement les services Render via API
Corrige les buildCommand, startCommand et env manquants
"""

import os
import requests
import json

RENDER_API_BASE = "https://api.render.com/v1"
api_key = os.environ.get('RENDER_API_KEY')

def update_service(service_id: str, config: dict) -> bool:
    """Met à jour la configuration d'un service"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.patch(
            f"{RENDER_API_BASE}/services/{service_id}",
            headers=headers,
            json=config,
            timeout=30
        )
        response.raise_for_status()
        print(f"✅ Service {service_id[:12]}... mis à jour")
        return True
    except Exception as e:
        print(f"❌ Erreur: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Détails: {e.response.text}")
        return False

# IDs des services
backend_id = "srv-d4ka5q63jp1c738n6b2g"
frontend_id = "srv-d4no5dc9c44c73d1opgg"

print("\n" + "="*80)
print("CONFIGURATION AUTOMATIQUE DES SERVICES RENDER")
print("="*80 + "\n")

# Configuration Backend
print("📦 Configuration du BACKEND (igv-cms-backend)")
print("-" * 80)
backend_config = {
    "env": "python",
    "buildCommand": "pip install --upgrade pip && pip install -r requirements.txt",
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 65"
}
print(f"  Env: python")
print(f"  Build: pip install --upgrade pip && pip install -r requirements.txt")
print(f"  Start: uvicorn server:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 65")

if update_service(backend_id, backend_config):
    print("✅ Backend configuré\n")
else:
    print("❌ Échec configuration backend\n")

# Configuration Frontend
print("📦 Configuration du FRONTEND (igv-site-web)")
print("-" * 80)
frontend_config = {
    "env": "node",
    "buildCommand": "npm install && npm run build",
    "startCommand": "node server.js"
}
print(f"  Env: node")
print(f"  Build: npm install && npm run build")
print(f"  Start: node server.js")

if update_service(frontend_id, frontend_config):
    print("✅ Frontend configuré\n")
else:
    print("❌ Échec configuration frontend\n")

print("="*80)
print("✅ Configuration terminée!")
print("="*80)
print("\n💡 Les services vont redéployer automatiquement.")
print("   Attendez 3-5 minutes puis vérifiez le statut.\n")
