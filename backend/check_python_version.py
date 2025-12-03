#!/usr/bin/env python3
"""Update Render service to use Python 3.11 instead of 3.13"""
import requests
import json

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 70)
print("FORCE PYTHON 3.11 VIA VARIABLE D'ENVIRONNEMENT")
print("=" * 70)

# Get current env vars
resp = requests.get(f'https://api.render.com/v1/services/{BACKEND_ID}/env-vars', headers=headers)

if resp.status_code == 200:
    env_vars = resp.json()
    
    # Check if PYTHON_VERSION exists
    python_version_exists = False
    for var in env_vars:
        if var.get('envVar', {}).get('key') == 'PYTHON_VERSION':
            python_version_exists = True
            current_value = var.get('envVar', {}).get('value')
            print(f"\nPYTHON_VERSION actuelle: {current_value}")
            break
    
    if not python_version_exists:
        print("\n❌ PYTHON_VERSION n'existe pas dans les variables d'environnement")
        print("✅ Il faut l'ajouter manuellement sur le Dashboard Render")
        print("\nÉtapes:")
        print("1. Aller sur: https://dashboard.render.com/web/srv-d4ka5q63jp1c738n6b2g/env")
        print("2. Ajouter: PYTHON_VERSION = 3.11.0")
        print("3. Sauvegarder")
    else:
        if current_value != "3.11.0":
            print(f"\n⚠️ Version incorrecte: {current_value}")
            print("✅ Devrait être: 3.11.0")
        else:
            print("\n✅ Python 3.11.0 déjà configuré")
else:
    print(f"❌ Erreur API: {resp.status_code}")
    print(resp.text)

print("\n" + "=" * 70)
