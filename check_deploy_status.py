"""
Script de vérification du déploiement Render
Vérifie que le backend a bien déployé la nouvelle version
en testant si POST /api/admin/users renvoie maintenant user_id
"""
import requests
import time
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"
MAX_WAIT = 300  # 5 minutes max
CHECK_INTERVAL = 15  # Vérifier toutes les 15 secondes

print("=" * 80)
print("VÉRIFICATION DÉPLOIEMENT RENDER")
print(f"Commit: febaf0c - Suppression endpoints dupliqués POST/GET /admin/users")
print("=" * 80)

# Attendre 30 secondes pour laisser Render démarrer le build
print("\n⏳ Attente initiale de 30 secondes pour démarrage build Render...")
time.sleep(30)

start_time = time.time()
deployed = False

print(f"\n🔍 Vérification du déploiement (max {MAX_WAIT}s)...")

while time.time() - start_time < MAX_WAIT:
    elapsed = int(time.time() - start_time)
    print(f"\n[{elapsed}s] Test connexion backend...")
    
    try:
        # 1. Test health check
        health = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if health.status_code != 200:
            print(f"   ⏳ Backend non accessible (status: {health.status_code})")
            time.sleep(CHECK_INTERVAL)
            continue
        
        print(f"   ✅ Backend accessible")
        
        # 2. Login
        login_response = requests.post(
            f"{BACKEND_URL}/api/admin/login",
            json={"email": EMAIL, "password": PASSWORD},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"   ⏳ Login échoué (peut-être redéploiement en cours)")
            time.sleep(CHECK_INTERVAL)
            continue
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"   ✅ Login OK")
        
        # 3. Créer un user de test pour vérifier la structure de réponse
        test_email = f"deploy.check.{int(time.time())}@test.com"
        create_response = requests.post(
            f"{BACKEND_URL}/api/admin/users",
            headers=headers,
            json={
                "email": test_email,
                "first_name": "Deploy",
                "last_name": "Check",
                "password": "TestPass123!",
                "role": "commercial"
            },
            timeout=10
        )
        
        if create_response.status_code not in [200, 201]:
            print(f"   ⏳ Création user échouée: {create_response.status_code}")
            print(f"      {create_response.text[:200]}")
            time.sleep(CHECK_INTERVAL)
            continue
        
        response_data = create_response.json()
        print(f"   ✅ User créé")
        print(f"      Response keys: {list(response_data.keys())}")
        
        # 4. Vérifier si la réponse contient user_id (nouvelle version)
        has_user_id = "user_id" in response_data
        has_user_object = "user" in response_data
        
        if has_user_id and has_user_object:
            print(f"\n🎉 DÉPLOIEMENT RÉUSSI!")
            print(f"   ✅ Response contient 'user_id': {response_data.get('user_id')}")
            print(f"   ✅ Response contient 'user': {response_data.get('user', {}).get('id')}")
            print(f"   Backend utilise la NOUVELLE version (admin_user_routes.py)")
            deployed = True
            
            # Nettoyer: supprimer le user de test
            user_id = response_data.get("user_id")
            if user_id:
                delete_response = requests.delete(
                    f"{BACKEND_URL}/api/admin/users/{user_id}",
                    headers=headers,
                    timeout=10
                )
                print(f"\n   🧹 Nettoyage user test: {delete_response.status_code}")
            
            break
        else:
            print(f"\n   ⏳ Backend utilise encore l'ANCIENNE version")
            print(f"      Response: {json.dumps(response_data, indent=2, ensure_ascii=False)[:300]}")
            print(f"      Attente du redéploiement...")
            
    except requests.exceptions.Timeout:
        print(f"   ⏳ Timeout - backend peut-être en redémarrage")
    except requests.exceptions.ConnectionError:
        print(f"   ⏳ Connexion échouée - backend en redémarrage")
    except Exception as e:
        print(f"   ⚠️ Erreur: {type(e).__name__}: {str(e)[:100]}")
    
    time.sleep(CHECK_INTERVAL)

print("\n" + "=" * 80)
if deployed:
    print("✅ DÉPLOIEMENT CONFIRMÉ - Backend à jour")
    print("   Prêt pour tests CREATE + DELETE user")
else:
    print("❌ TIMEOUT - Déploiement non confirmé après 5 minutes")
    print("   Tests vont quand même être lancés")
print("=" * 80)
