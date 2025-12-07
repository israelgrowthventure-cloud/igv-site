#!/usr/bin/env python3
"""Get detailed service info and last build logs"""
import requests
import json

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'

headers = {'Authorization': f'Bearer {API_KEY}'}

# Get service details
print("=== Service Backend Details ===\n")
service = requests.get(f'https://api.render.com/v1/services/{BACKEND_ID}', headers=headers)

if service.status_code == 200:
    data = service.json()
    print(json.dumps(data, indent=2))
else:
    print(f"Error: {service.status_code}")
    print(service.text)
