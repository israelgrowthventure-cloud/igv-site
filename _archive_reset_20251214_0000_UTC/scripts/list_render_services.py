#!/usr/bin/env python3
"""
Liste tous les services Render pour trouver les IDs corrects
"""
import os
import sys
import json
import requests
from datetime import datetime, timezone

RENDER_API_KEY = os.getenv("RENDER_API_KEY")

if not RENDER_API_KEY:
    print("❌ RENDER_API_KEY manquante")
    print("\nPour obtenir la clé:")
    print("1. Ouvrir https://dashboard.render.com/account/api-keys")
    print("2. Créer/copier API Key")
    print("3. Exécuter: $env:RENDER_API_KEY='votre_clé'; python scripts/list_render_services.py")
    sys.exit(1)

print("=" * 80)
print("LISTE DES SERVICES RENDER")
print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
print("=" * 80)
print()

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

try:
    response = requests.get(
        "https://api.render.com/v1/services",
        headers=headers,
        params={"limit": 100},
        timeout=30
    )
    
    if response.status_code != 200:
        print(f"❌ Erreur API {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
    
    data = response.json()
    services = data[0].get("service", []) if isinstance(data, list) else data.get("services", [])
    
    # Filtrer services IGV/CMS
    igv_services = [s for s in services if "igv" in s.get("name", "").lower() or "cms" in s.get("name", "").lower()]
    
    if not igv_services:
        print("⚠️  Aucun service IGV/CMS trouvé")
        print(f"\nTotal services: {len(services)}")
        print("\nPremiers 5 services:")
        for s in services[:5]:
            print(f"  - {s.get('name')} ({s.get('id')}) - {s.get('type')}")
    else:
        print(f"✅ {len(igv_services)} service(s) trouvé(s)\n")
        
        for service in igv_services:
            sid = service.get("id", "N/A")
            name = service.get("name", "N/A")
            stype = service.get("type", "N/A")
            region = service.get("serviceDetails", {}).get("region", "N/A")
            branch = service.get("serviceDetails", {}).get("branch", "N/A")
            auto_deploy = service.get("serviceDetails", {}).get("autoDeploy", "N/A")
            
            print(f"{'='*60}")
            print(f"Service: {name}")
            print(f"ID: {sid}")
            print(f"Type: {stype}")
            print(f"Region: {region}")
            print(f"Branch: {branch}")
            print(f"Auto-deploy: {auto_deploy}")
            print()
    
    # Sauvegarder pour référence
    output = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": igv_services
    }
    
    with open("scripts/render_services.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Détails sauvegardés: scripts/render_services.json")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    sys.exit(1)
