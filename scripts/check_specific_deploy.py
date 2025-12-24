#!/usr/bin/env python3
"""Check a specific deployment status"""
import os
import requests
import sys

RENDER_API_KEY = os.getenv('RENDER_API_KEY', 'rnd_HEnI4fb65T3b1RAlso77w2g6ftEz')
SERVICE_ID = 'srv-d4ka5q63jp1c738n6b2g'
DEPLOY_ID = sys.argv[1] if len(sys.argv) > 1 else 'dep-d55llmmmcj7s73fdv700'

headers = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Accept': 'application/json'
}

try:
    url = f'https://api.render.com/v1/services/{SERVICE_ID}/deploys/{DEPLOY_ID}'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        deploy = response.json()
        print(f"Deploy ID: {deploy.get('id')}")
        print(f"Status: {deploy.get('status')}")
        print(f"Commit: {deploy.get('commit', {}).get('id', 'N/A')[:8]}")
        print(f"Created: {deploy.get('createdAt')}")
        print(f"Updated: {deploy.get('updatedAt')}")
        if deploy.get('finishedAt'):
            print(f"Finished: {deploy.get('finishedAt')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Exception: {e}")
