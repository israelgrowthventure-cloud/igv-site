"""
TEST COMPLET: Créer user + Supprimer user EN PRODUCTION
PREUVE FINALE avec backend à jour
"""
import requests
import json
import uuid

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("TEST COMPLET: CREATE + DELETE USER EN PRODUCTION")
print("=" * 80)

# STEP 1: Login
print("\n[1] Login admin...")
login_response = requests.post(
    f"{BACKEND_URL}/api/admin/login",
    json={"email": EMAIL, "password": PASSWORD}
)
if login_response.status_code != 200:
    print(f"❌ Login échoué: {login_response.status_code} - {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✅ Token obtenu")

# STEP 2: Compter users AVANT création
print("\n[2] Compter users AVANT création...")
get_before = requests.get(f"{BACKEND_URL}/api/admin/users", headers=headers)
users_before = get_before.json()["users"]
print(f"✅ Total users AVANT: {len(users_before)}")

# STEP 3: Créer nouveau user
print("\n[3] Créer nouveau user...")
test_email = f"test.final.{uuid.uuid4().hex[:8]}@test.com"
user_data = {
    "email": test_email,
    "first_name": "Final",
    "last_name": "Test",
    "password": "TestPass123!",
    "role": "commercial"
}
print(f"Payload: {json.dumps(user_data, indent=2, ensure_ascii=False)}")

create_response = requests.post(
    f"{BACKEND_URL}/api/admin/users",
    headers=headers,
    json=user_data
)
print(f"\nStatus: {create_response.status_code}")
print(f"Response: {create_response.text[:500]}")

if create_response.status_code not in [200, 201]:
    print(f"❌ Création échouée")
    exit(1)

created_data = create_response.json()
print(f"\n✅ User créé - Structure de la réponse:")
print(f"{json.dumps(created_data, indent=2, ensure_ascii=False)}")

# Extraire l'ID du user créé
user_id = None
if "user" in created_data and "id" in created_data["user"]:
    user_id = created_data["user"]["id"]
elif "user_id" in created_data:
    user_id = created_data["user_id"]
elif "id" in created_data:
    user_id = created_data["id"]

print(f"\n🎯 ID extrait: {user_id}")

if not user_id:
    print("❌ PROBLEME: Impossible d'extraire l'ID de la réponse")
    print("   On va chercher le user dans la liste GET /users...")
    
    # Fallback: chercher dans la liste
    get_after_create = requests.get(f"{BACKEND_URL}/api/admin/users", headers=headers)
    users_after_create = get_after_create.json()["users"]
    test_user = next((u for u in users_after_create if u["email"] == test_email), None)
    
    if test_user:
        user_id = test_user["id"]
        print(f"   ✅ User trouvé dans liste, ID: {user_id}")
    else:
        print("   ❌ User introuvable même dans la liste!")
        exit(1)

# STEP 4: Vérifier user dans GET /users
print(f"\n[4] Vérifier user dans GET /api/admin/users...")
get_after = requests.get(f"{BACKEND_URL}/api/admin/users", headers=headers)
users_after = get_after.json()["users"]
print(f"✅ Total users APRÈS création: {len(users_after)}")

test_user = next((u for u in users_after if u["email"] == test_email), None)
if test_user:
    print(f"✅ User trouvé:")
    print(f"   Email: {test_user['email']}")
    print(f"   ID: {test_user['id']}")
    print(f"   Name: {test_user.get('first_name')} {test_user.get('last_name')}")
else:
    print(f"❌ User NON TROUVÉ (email: {test_email})")

# STEP 5: DELETE user
print(f"\n[5] DELETE user ID = {user_id}...")
delete_url = f"{BACKEND_URL}/api/admin/users/{user_id}"
print(f"URL: DELETE {delete_url}")

delete_response = requests.delete(delete_url, headers=headers)
print(f"\nStatus: {delete_response.status_code}")
print(f"Response: {delete_response.text}")

if delete_response.status_code == 200:
    print("✅ DELETE réussi (200 OK)")
elif delete_response.status_code == 404:
    print(f"❌ DELETE ÉCHOUÉ (404 - User not found)")
    print(f"   PREUVE DU BUG: L'ID {user_id} existe mais DELETE retourne 404")
else:
    print(f"❌ DELETE ÉCHOUÉ ({delete_response.status_code})")

# STEP 6: Vérifier disparition
print(f"\n[6] Vérifier disparition du user...")
get_final = requests.get(f"{BACKEND_URL}/api/admin/users", headers=headers)
users_final = get_final.json()["users"]
print(f"✅ Total users FINAL: {len(users_final)}")

test_user_final = next((u for u in users_final if u["email"] == test_email), None)
if test_user_final:
    print(f"❌ User ENCORE PRÉSENT après DELETE:")
    print(f"   Email: {test_user_final['email']}")
    print(f"   ID: {test_user_final['id']}")
    print(f"   is_active: {test_user_final.get('is_active')}")
else:
    print(f"✅ User bien supprimé (absent de la liste)")

# RÉSUMÉ
print("\n" + "=" * 80)
print("RÉSUMÉ FINAL:")
print("=" * 80)
print(f"✅ Login: 200 OK")
print(f"{'✅' if create_response.status_code in [200, 201] else '❌'} Création user: {create_response.status_code}")
print(f"{'✅' if user_id else '❌'} ID extrait: {user_id}")
print(f"{'✅' if test_user else '❌'} User dans liste GET")
print(f"{'✅' if delete_response.status_code == 200 else '❌'} DELETE: {delete_response.status_code}")
print(f"{'✅' if not test_user_final else '❌'} User supprimé définitivement")
print("\nCONCLUSION:")
if delete_response.status_code == 200 and not test_user_final:
    print("🎉 TOUT FONCTIONNE ! CREATE + DELETE OK en production")
else:
    print("❌ BUG CONFIRMÉ - DELETE ne fonctionne pas correctement")
print("=" * 80)
