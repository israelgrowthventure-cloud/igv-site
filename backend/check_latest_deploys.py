#!/usr/bin/env python3
"""Check latest deploys"""
import requests
import time

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'
headers = {'Authorization': f'Bearer {API_KEY}'}

resp = requests.get(f'https://api.render.com/v1/services/{BACKEND_ID}/deploys?limit=3', headers=headers)
deploys = resp.json()

print('\n=== BACKEND - 3 derniers déploiements ===')
for idx, item in enumerate(deploys[:3]):
    d = item['deploy']
    print(f'\nDeploy {idx+1}:')
    print(f'  ID: {d["id"]}')
    print(f'  Status: {d["status"]}')
    print(f'  Commit: {d.get("commit", {}).get("id", "N/A")[:7]}')
    print(f'  Message: {d.get("commit", {}).get("message", "N/A")[:60]}...')
    print(f'  Created: {d["createdAt"]}')
    print(f'  Updated: {d["updatedAt"]}')
