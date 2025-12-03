#!/usr/bin/env python3
"""
Update Render service configuration via API
Fix build/start commands to remove duplicate 'cd backend' and 'cd frontend'
"""
import requests
import json

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'
FRONTEND_ID = 'srv-d4no5dc9c44c73d1opgg'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 70)
print("MISE À JOUR CONFIGURATION RENDER SERVICES")
print("=" * 70)

# Backend update
print("\n1. Mise à jour BACKEND (igv-cms-backend)")
print("-" * 70)

backend_update = {
    "rootDir": "backend",
    "buildCommand": "pip install --upgrade pip && pip install -r requirements.txt",
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 65"
}

print("Configuration:")
print(json.dumps(backend_update, indent=2))

backend_resp = requests.patch(
    f'https://api.render.com/v1/services/{BACKEND_ID}',
    headers=headers,
    json=backend_update
)

if backend_resp.status_code == 200:
    print("✅ Backend configuration updated successfully")
else:
    print(f"❌ Backend update failed: {backend_resp.status_code}")
    print(backend_resp.text)

# Frontend update
print("\n2. Mise à jour FRONTEND (igv-site-web)")
print("-" * 70)

frontend_update = {
    "rootDir": "frontend",
    "buildCommand": "npm install && npm run build",
    "startCommand": "node server.js"
}

print("Configuration:")
print(json.dumps(frontend_update, indent=2))

frontend_resp = requests.patch(
    f'https://api.render.com/v1/services/{FRONTEND_ID}',
    headers=headers,
    json=frontend_update
)

if frontend_resp.status_code == 200:
    print("✅ Frontend configuration updated successfully")
else:
    print(f"❌ Frontend update failed: {frontend_resp.status_code}")
    print(frontend_resp.text)

print("\n" + "=" * 70)
print("RÉSUMÉ")
print("=" * 70)
print(f"Backend: {'✅ OK' if backend_resp.status_code == 200 else '❌ FAILED'}")
print(f"Frontend: {'✅ OK' if frontend_resp.status_code == 200 else '❌ FAILED'}")
print("\nProchaine étape: Push git pour déclencher un nouveau déploiement")
