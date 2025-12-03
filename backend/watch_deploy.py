#!/usr/bin/env python3
"""Surveiller les déploiements Render en temps réel"""
import requests
import json
import time

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'
FRONTEND_ID = 'srv-d4no5dc9c44c73d1opgg'

headers = {'Authorization': f'Bearer {API_KEY}'}

print("=== Surveillance des déploiements Render ===\n")
print("Attente de 30 secondes pour que Render détecte le commit...\n")
time.sleep(30)

# Backend
print("=== BACKEND (igv-cms-backend) ===")
backend_resp = requests.get(f'https://api.render.com/v1/services/{BACKEND_ID}/deploys?limit=1', headers=headers)
if backend_resp.status_code == 200 and backend_resp.json():
    b = backend_resp.json()[0]['deploy']
    print(f"Deploy ID: {b.get('id', 'N/A')}")
    print(f"Status: {b.get('status', 'N/A')}")
    print(f"Commit: {b.get('commit', {}).get('id', 'N/A')[:7]}")
    print(f"Message: {b.get('commit', {}).get('message', 'N/A')[:60]}")
    print(f"Created: {b.get('createdAt', 'N/A')}")
    print(f"Updated: {b.get('updatedAt', 'N/A')}")
else:
    print(f"❌ Erreur API: {backend_resp.status_code}")

# Frontend
print("\n=== FRONTEND (igv-site-web) ===")
frontend_resp = requests.get(f'https://api.render.com/v1/services/{FRONTEND_ID}/deploys?limit=1', headers=headers)
if frontend_resp.status_code == 200 and frontend_resp.json():
    f = frontend_resp.json()[0]['deploy']
    print(f"Deploy ID: {f.get('id', 'N/A')}")
    print(f"Status: {f.get('status', 'N/A')}")
    print(f"Commit: {f.get('commit', {}).get('id', 'N/A')[:7]}")
    print(f"Message: {f.get('commit', {}).get('message', 'N/A')[:60]}")
    print(f"Created: {f.get('createdAt', 'N/A')}")
    print(f"Updated: {f.get('updatedAt', 'N/A')}")
else:
    print(f"❌ Erreur API: {frontend_resp.status_code}")
