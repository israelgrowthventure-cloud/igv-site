"""
Monitorer statut déploiement backend
"""
import httpx
import time
import sys

API_KEY = "rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q"
BACKEND_SERVICE = "srv-d4ka5q63jp1c738n6b2g"
DEPLOY_ID = "dep-d4oc70fgi27c738cqggg"

headers = {"Authorization": f"Bearer {API_KEY}"}

print("="*80)
print(f"MONITORING DÉPLOIEMENT: {DEPLOY_ID}")
print("="*80)

print("\n⏳ Attente 2 minutes pour le build...")
time.sleep(120)

try:
    response = httpx.get(
        f"https://api.render.com/v1/services/{BACKEND_SERVICE}/deploys/{DEPLOY_ID}",
        headers=headers,
        timeout=30
    )
    
    if response.status_code == 200:
        deploy = response.json()
        status = deploy.get("status", "unknown")
        
        print(f"\n📊 Status: {status}")
        print(f"Created: {deploy.get('createdAt', 'N/A')}")
        print(f"Updated: {deploy.get('updatedAt', 'N/A')}")
        
        if status == "live":
            print("\n✅ DÉPLOIEMENT RÉUSSI")
            sys.exit(0)
        elif status in ["build_failed", "deploy_failed"]:
            print("\n❌ DÉPLOIEMENT ÉCHOUÉ")
            reason = deploy.get("finishedAtReason", {})
            if reason:
                print(f"Reason: {reason}")
            sys.exit(1)
        else:
            print(f"\n⏳ En cours... Status: {status}")
    else:
        print(f"❌ Erreur API: {response.status_code}")
        print(response.text[:300])
        
except Exception as e:
    print(f"❌ Exception: {e}")
    sys.exit(1)

print("\n" + "="*80)
