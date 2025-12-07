"""
Force le redéploiement manuel du backend sur Render
"""
import requests
import os
import json

RENDER_API_KEY = os.environ.get('RENDER_API_KEY', 'rnd_kHvFyfbdSJVWZqJrI4YkFCZ6dF3L')
SERVICE_ID = 'srv-cthh9lu8ii6s73c8vbe0'  # igv-cms-backend

def trigger_deploy():
    """Déclenche un nouveau déploiement"""
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "clearCache": "do_not_clear"
    }
    
    print("🚀 Déclenchement du redéploiement du backend...")
    print(f"   Service: {SERVICE_ID}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"\n✅ Déploiement déclenché avec succès!")
            print(f"   Deploy ID: {data.get('id')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Commit: {data.get('commit', {}).get('id', 'N/A')[:7]}")
            print(f"\n🔍 Surveillez: https://dashboard.render.com/web/{SERVICE_ID}")
            return True
        else:
            print(f"\n❌ Erreur: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        return False

if __name__ == '__main__':
    print("=" * 70)
    print("🔄 REDÉPLOIEMENT MANUEL DU BACKEND")
    print("=" * 70)
    print()
    
    result = trigger_deploy()
    
    if result:
        print("\n✅ Commande envoyée")
        print("⏳ Le build va démarrer dans quelques secondes...")
    else:
        print("\n❌ Échec du redéploiement")
