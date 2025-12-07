"""
Déclencher déploiement backend Render avec clear cache
"""
import httpx
import json
import sys

API_KEY = "rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q"
BACKEND_SERVICE = "srv-d4ka5q63jp1c738n6b2g"

headers = {"Authorization": f"Bearer {API_KEY}"}

print("="*80)
print("DÉCLENCHEMENT DÉPLOIEMENT BACKEND")
print("="*80)

try:
    response = httpx.post(
        f"https://api.render.com/v1/services/{BACKEND_SERVICE}/deploys",
        headers=headers,
        json={"clearCache": "clear"},
        timeout=30
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Deploy triggered successfully")
        print(f"Deploy ID: {data.get('id', 'N/A')}")
        print(f"Status: {data.get('status', 'N/A')}")
    else:
        print(f"❌ Erreur")
        print(f"Response: {response.text[:500]}")
        
except Exception as e:
    print(f"❌ Exception: {e}")
    sys.exit(1)

print("\n" + "="*80)
