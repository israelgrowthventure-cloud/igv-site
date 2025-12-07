#!/usr/bin/env python3
"""Update Render service configuration via API"""
import requests
import json

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 70)
print("MISE À JOUR CONFIGURATION BACKEND VIA API")
print("=" * 70)

# Configuration à mettre à jour
update_data = {
    "serviceDetails": {
        "envSpecificDetails": {
            "buildCommand": "pip install --upgrade pip && pip install -r requirements.txt",
            "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 65"
        }
    },
    "rootDir": "backend"
}

print("\nConfiguration à appliquer:")
print(json.dumps(update_data, indent=2))

# Mise à jour du service
resp = requests.patch(
    f'https://api.render.com/v1/services/{BACKEND_ID}',
    headers=headers,
    json=update_data
)

print(f"\nRésultat: {resp.status_code}")
if resp.status_code == 200:
    print("✅ Configuration mise à jour avec succès")
    print("\nDétails:")
    print(json.dumps(resp.json(), indent=2))
else:
    print(f"❌ Échec de la mise à jour")
    print(resp.text)

print("\n" + "=" * 70)
print("IMPORTANT: Après cette mise à jour, déclencher un nouveau déploiement")
print("=" * 70)
