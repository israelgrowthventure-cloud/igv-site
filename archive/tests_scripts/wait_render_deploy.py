"""
Moniteur de déploiement Render - Attendre que le backend soit Live
"""
import requests
import time
from datetime import datetime

RENDER_API_KEY = "rnd_OarP9GjJznwzvsKL9OP6MXKqxfbF"
SERVICE_ID = "srv-cufq7ue8ii6s73f66p40"

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

print("="*80)
print("🔍 MONITORING DÉPLOIEMENT BACKEND RENDER")
print("="*80)
print(f"Service ID: {SERVICE_ID}")
print(f"Heure: {datetime.now().strftime('%H:%M:%S')}")
print("="*80)

attempt = 0
max_attempts = 60  # 5 minutes max

while attempt < max_attempts:
    attempt += 1
    
    try:
        # Get service status
        response = requests.get(
            f"https://api.render.com/v1/services/{SERVICE_ID}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            service = response.json()
            
            # Get latest deploy
            deploys_response = requests.get(
                f"https://api.render.com/v1/services/{SERVICE_ID}/deploys",
                headers=headers,
                params={"limit": 1},
                timeout=10
            )
            
            if deploys_response.status_code == 200:
                deploys = deploys_response.json()
                
                if deploys and len(deploys) > 0:
                    latest_deploy = deploys[0]
                    status = latest_deploy.get("status", "unknown")
                    commit = latest_deploy.get("commit", {}).get("message", "N/A")[:50]
                    
                    print(f"\r[{attempt}] Status: {status} | Commit: {commit}", end="", flush=True)
                    
                    if status == "live":
                        print(f"\n✅ DÉPLOIEMENT TERMINÉ - Backend LIVE")
                        print(f"Commit: {commit}")
                        print(f"Temps écoulé: {attempt * 5}s")
                        break
                    elif status in ["build_failed", "failed"]:
                        print(f"\n❌ DÉPLOIEMENT ÉCHOUÉ")
                        print(f"Status: {status}")
                        break
    
    except Exception as e:
        print(f"\r[{attempt}] Erreur: {str(e)[:50]}", end="", flush=True)
    
    time.sleep(5)

if attempt >= max_attempts:
    print(f"\n⚠️  TIMEOUT - Déploiement toujours en cours après {max_attempts * 5}s")
else:
    print("="*80)
