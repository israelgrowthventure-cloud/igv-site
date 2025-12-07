#!/usr/bin/env python3
"""
Déclenche le déploiement du service frontend EXISTANT sur Render via API
Utilise la clé d'environnement RENDER_API_KEY (associée à IGV-Deploy-Frontend)
"""
import os
import requests

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
RENDER_SERVICE_ID = os.getenv('RENDER_SERVICE_ID_FRONTEND', 'srv-ctfhv3pu0jms73faofb0')  # ID du service frontend existant

if not RENDER_API_KEY:
    print('❌ RENDER_API_KEY non définie dans l’environnement')
    exit(1)

url = f'https://api.render.com/v1/services/{RENDER_SERVICE_ID}/deploys'
headers = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

print(f'🚀 Déclenchement du déploiement frontend Render (service: {RENDER_SERVICE_ID})...')
response = requests.post(url, headers=headers, json={})
if response.status_code == 201:
    deploy = response.json()
    print(f'✅ Déploiement lancé ! ID: {deploy.get("id")}, status: {deploy.get("status")}, created: {deploy.get("createdAt")}')
else:
    print(f'❌ Erreur lors du déclenchement du déploiement : {response.status_code} {response.text}')
