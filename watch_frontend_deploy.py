#!/usr/bin/env python3
"""
Script de surveillance du déploiement frontend
"""
import os
import sys
import time
import requests
from datetime import datetime

RENDER_API_KEY = os.environ.get('RENDER_API_KEY')
SERVICE_ID = "srv-d4no5dc9c44c73d1opgg"
DEPLOY_ID = "dep-d4srp1jhq33s73ffkuv0"
RENDER_API_BASE = "https://api.render.com/v1"

HEADERS = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

def check_status():
    url = f"{RENDER_API_BASE}/services/{SERVICE_ID}/deploys/{DEPLOY_ID}"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        return data['deploy']['status']
    except Exception as e:
        print(f"Erreur: {e}")
        return None

print("⏳ Surveillance déploiement frontend...")
print(f"Service: {SERVICE_ID}")
print(f"Deploy: {DEPLOY_ID}")
print("-" * 50)

attempt = 0
max_attempts = 60
last_status = None

while attempt < max_attempts:
    attempt += 1
    status = check_status()
    
    if status and status != last_status:
        print(f"[{attempt}/{max_attempts}] Status: {status}")
        last_status = status
    
    if status == "live":
        print("\n✅ Déploiement frontend terminé avec succès!")
        sys.exit(0)
    
    if status in ["build_failed", "update_failed", "canceled"]:
        print(f"\n❌ Déploiement échoué: {status}")
        sys.exit(1)
    
    time.sleep(10)

print("\n⏱️ Timeout atteint")
sys.exit(1)
