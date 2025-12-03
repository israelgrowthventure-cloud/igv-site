#!/usr/bin/env python3
"""Trigger manual deploy on Render"""
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
print("DÉCLENCHEMENT MANUEL DES DÉPLOIEMENTS RENDER")
print("=" * 70)

# Backend deploy
print("\n1. Déploiement BACKEND (igv-cms-backend)")
print("-" * 70)

backend_resp = requests.post(
    f'https://api.render.com/v1/services/{BACKEND_ID}/deploys',
    headers=headers,
    json={"clearCache": "do_not_clear"}
)

if backend_resp.status_code in [200, 201]:
    data = backend_resp.json()
    print("✅ Backend deployment triggered")
    print(f"  Deploy ID: {data.get('id', 'N/A')}")
else:
    print(f"❌ Backend deployment failed: {backend_resp.status_code}")
    print(backend_resp.text)

# Frontend deploy
print("\n2. Déploiement FRONTEND (igv-site-web)")
print("-" * 70)

frontend_resp = requests.post(
    f'https://api.render.com/v1/services/{FRONTEND_ID}/deploys',
    headers=headers,
    json={"clearCache": "do_not_clear"}
)

if frontend_resp.status_code in [200, 201]:
    data = frontend_resp.json()
    print("✅ Frontend deployment triggered")
    print(f"  Deploy ID: {data.get('id', 'N/A')}")
else:
    print(f"❌ Frontend deployment failed: {frontend_resp.status_code}")
    print(frontend_resp.text)

print("\n" + "=" * 70)
print("Attendre 2-3 minutes pour que les builds se terminent")
print("Utiliser check_latest_deploys.py pour surveiller le statut")
print("=" * 70)
