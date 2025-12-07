#!/usr/bin/env python3
"""
Script pour obtenir le Service ID exact du backend IGV sur Render.
Nécessite RENDER_API_KEY en variable d'environnement.
"""
import os
import requests
import sys

RENDER_API_KEY = os.environ.get("RENDER_API_KEY")
if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY requise.")
    print("   Obtenir depuis: https://dashboard.render.com/account/api-keys")
    print("   Puis: $env:RENDER_API_KEY='rnd_...'")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Content-Type": "application/json"
}

print("📋 Liste des services Render...")
url = "https://api.render.com/v1/services"
response = requests.get(url, headers=headers)

if response.status_code != 200:
    print(f"❌ Erreur API: {response.status_code}")
    print(response.text)
    sys.exit(1)

services = response.json()
print(f"   Trouvé {len(services)} services\n")

backend_service = None
for svc in services:
    name = svc.get("name", "")
    service_id = svc.get("id", "")
    service_type = svc.get("type", "")
    print(f"   - {name} ({service_type}) : {service_id}")
    
    if "igv-cms-backend" in name.lower() or "backend" in name.lower():
        backend_service = svc

if backend_service:
    print(f"\n✅ Backend trouvé:")
    print(f"   Nom: {backend_service.get('name')}")
    print(f"   ID: {backend_service.get('id')}")
    print(f"   URL: {backend_service.get('serviceDetails', {}).get('url', 'N/A')}")
else:
    print("\n⚠️  Service backend non trouvé avec pattern 'igv-cms-backend'")
