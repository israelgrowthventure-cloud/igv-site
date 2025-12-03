"""
Vérification état déploiement Render via API
"""
import httpx
import json

API_KEY = "rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q"
BACKEND_SERVICE = "srv-d4ka5q63jp1c738n6b2g"
FRONTEND_SERVICE = "srv-d4no5dc9c44c73d1opgg"

headers = {"Authorization": f"Bearer {API_KEY}"}

print("="*80)
print("DIAGNOSTIC RENDER - ÉTAT RÉEL DES SERVICES")
print("="*80)

# Backend
print("\n🔍 BACKEND (igv-cms-backend)")
print("-" * 80)

try:
    # Service info
    service_r = httpx.get(f"https://api.render.com/v1/services/{BACKEND_SERVICE}", headers=headers, timeout=30)
    service = service_r.json()
    
    details = service.get("serviceDetails", {})
    env_details = details.get("envSpecificDetails", {})
    
    print(f"URL: {details.get('url', 'N/A')}")
    print(f"Region: {details.get('region', 'N/A')}")
    print(f"Runtime: {details.get('runtime', 'N/A')}")
    print(f"Build Command: {env_details.get('buildCommand', 'N/A')}")
    print(f"Start Command: {env_details.get('startCommand', 'N/A')}")
    
    # Derniers déploiements
    deploys_r = httpx.get(f"https://api.render.com/v1/services/{BACKEND_SERVICE}/deploys", headers=headers, timeout=30)
    deploys = deploys_r.json()
    
    if deploys:
        last_deploy = deploys[0].get("deploy", {})
        print(f"\n📦 Dernier déploiement:")
        print(f"  Status: {last_deploy.get('status', 'unknown')}")
        print(f"  Commit: {last_deploy.get('commit', {}).get('id', 'N/A')[:7]}")
        print(f"  Message: {last_deploy.get('commit', {}).get('message', 'N/A')[:60]}")
        print(f"  Created: {last_deploy.get('createdAt', 'N/A')}")
        print(f"  Updated: {last_deploy.get('updatedAt', 'N/A')}")
        
        reason = last_deploy.get("finishedAtReason", {})
        if reason:
            print(f"  Reason: {json.dumps(reason, indent=4)}")
    
    # Variables environnement
    env_r = httpx.get(f"https://api.render.com/v1/services/{BACKEND_SERVICE}/env-vars", headers=headers, timeout=30)
    env_vars = env_r.json()
    
    print(f"\n🔧 Variables d'environnement: {len(env_vars)}")
    for var in env_vars[:10]:  # Afficher seulement les 10 premières
        env_var = var.get("envVar", {})
        key = env_var.get("key", "N/A")
        value = env_var.get("value", "")
        value_display = value[:20] + "..." if len(value) > 20 else value
        print(f"  - {key}: {value_display}")
    
except Exception as e:
    print(f"❌ Erreur: {e}")

# Frontend
print("\n" + "="*80)
print("🔍 FRONTEND (igv-site-web)")
print("-" * 80)

try:
    # Service info
    service_r = httpx.get(f"https://api.render.com/v1/services/{FRONTEND_SERVICE}", headers=headers, timeout=30)
    service = service_r.json()
    
    details = service.get("serviceDetails", {})
    env_details = details.get("envSpecificDetails", {})
    
    print(f"URL: {details.get('url', 'N/A')}")
    print(f"Region: {details.get('region', 'N/A')}")
    print(f"Runtime: {details.get('env', 'N/A')}")
    print(f"Build Command: {env_details.get('buildCommand', 'N/A')}")
    print(f"Start Command: {env_details.get('startCommand', 'N/A')}")
    
    # Derniers déploiements
    deploys_r = httpx.get(f"https://api.render.com/v1/services/{FRONTEND_SERVICE}/deploys", headers=headers, timeout=30)
    deploys = deploys_r.json()
    
    if deploys:
        last_deploy = deploys[0].get("deploy", {})
        print(f"\n📦 Dernier déploiement:")
        print(f"  Status: {last_deploy.get('status', 'unknown')}")
        print(f"  Commit: {last_deploy.get('commit', {}).get('id', 'N/A')[:7]}")
        print(f"  Message: {last_deploy.get('commit', {}).get('message', 'N/A')[:60]}")
        print(f"  Created: {last_deploy.get('createdAt', 'N/A')}")
        print(f"  Updated: {last_deploy.get('updatedAt', 'N/A')}")
        
        reason = last_deploy.get("finishedAtReason", {})
        if reason:
            print(f"  Reason: {json.dumps(reason, indent=4)}")
    
    # Variables environnement
    env_r = httpx.get(f"https://api.render.com/v1/services/{FRONTEND_SERVICE}/env-vars", headers=headers, timeout=30)
    env_vars = env_r.json()
    
    print(f"\n🔧 Variables d'environnement: {len(env_vars)}")
    for var in env_vars[:10]:
        env_var = var.get("envVar", {})
        key = env_var.get("key", "N/A")
        value = env_var.get("value", "")
        value_display = value[:20] + "..." if len(value) > 20 else value
        print(f"  - {key}: {value_display}")
    
except Exception as e:
    print(f"❌ Erreur: {e}")

print("\n" + "="*80)
print("DIAGNOSTIC TERMINÉ")
print("="*80)
