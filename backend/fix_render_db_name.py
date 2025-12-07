#!/usr/bin/env python3
"""
Force DB_NAME=IGV-Cluster on Render backend service
"""
import os
import requests
import sys

# Service ID backend sur Render
SERVICE_ID = "srv-cr64m4pu0jms73cnqplg"  # igv-cms-backend

# Lire RENDER_API_KEY depuis env
RENDER_API_KEY = os.environ.get("RENDER_API_KEY")
if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY manquante. Export depuis le .env:")
    print('   $env:RENDER_API_KEY="rnd_..."')
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Content-Type": "application/json"
}

# 1. Lister les env vars actuelles
print("📋 Lecture des variables d'environnement actuelles...")
url_get = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"
response = requests.get(url_get, headers=headers)
if response.status_code != 200:
    print(f"❌ Erreur GET: {response.status_code}")
    print(response.text)
    sys.exit(1)

env_vars = response.json()
print(f"   Trouvé {len(env_vars)} variables")

# Chercher DB_NAME
db_name_var = None
for var in env_vars:
    if var.get("key") == "DB_NAME":
        db_name_var = var
        break

if db_name_var:
    current_value = db_name_var.get("value", "N/A")
    print(f"   DB_NAME actuelle: {current_value}")
    
    if current_value == "IGV-Cluster":
        print("✅ DB_NAME déjà correcte, aucune action nécessaire")
        sys.exit(0)
    else:
        print(f"⚠️  DB_NAME incorrect ({current_value}), correction en cours...")
        # Update
        url_update = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars/{db_name_var['id']}"
        payload = {"value": "IGV-Cluster"}
        response = requests.patch(url_update, headers=headers, json=payload)
        if response.status_code == 200:
            print("✅ DB_NAME mise à jour vers IGV-Cluster")
            print("   Le backend va redémarrer automatiquement (2-3 min)")
        else:
            print(f"❌ Erreur UPDATE: {response.status_code}")
            print(response.text)
            sys.exit(1)
else:
    print("⚠️  DB_NAME inexistante, création...")
    # Create
    url_create = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"
    payload = {
        "key": "DB_NAME",
        "value": "IGV-Cluster"
    }
    response = requests.post(url_create, headers=headers, json=payload)
    if response.status_code == 201:
        print("✅ DB_NAME créée avec valeur IGV-Cluster")
        print("   Le backend va redémarrer automatiquement (2-3 min)")
    else:
        print(f"❌ Erreur CREATE: {response.status_code}")
        print(response.text)
        sys.exit(1)

print("\n🎯 Action complétée. Attendre 2-3 min puis retester les endpoints.")
