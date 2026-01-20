"""TEST DELETE USER EN PRODUCTION - PREUVE COMPLETE."""
import requests
import json
import uuid

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("TEST DELETE USER EN PRODUCTION - PREUVE COMPLETE")
print("=" * 80)

# STEP 1: Login admin
print("\n📝 STEP 1: Login admin...")
login_response = requests.post(
    f"{BACKEND_URL}/api/admin/login",
    json={"email": EMAIL, "password": PASSWORD}
)
print(f"Status: {login_response.status_code}")
if login_response.status_code != 200:
    print(f"❌ ECHEC LOGIN: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✅ Token obtenu: {token[:50]}...")

# STEP 2: Créer un utilisateur de test
print("\n📝 STEP 2: Créer un utilisateur de test...")
test_email = f"delete.test.{uuid.uuid4().hex[:8]}@test.com"
user_data = {
    "email": test_email,
    "first_name": "Delete",
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
print(f"Response: {create_response.text}")

if create_response.status_code not in [200, 201]:
    print("❌ ECHEC CREATION USER")
    exit(1)

created_user = create_response.json()
print(f"\n✅ User créé:")
print(f"   - Email: {created_user.get('email')}")
print(f"   - ID: {created_user.get('id')}")
print(f"   - _id: {created_user.get('_id')}")
print(f"   - first_name: {created_user.get('first_name')}")

user_id = created_user.get('id') or created_user.get('_id')
if not user_id:
    print("❌ PROBLEME: Aucun ID dans la réponse!")
    print(f"Response complète: {json.dumps(created_user, indent=2, ensure_ascii=False)}")
    exit(1)

print(f"\n🎯 ID à utiliser pour DELETE: {user_id}")

# STEP 3: Vérifier que le user existe dans GET /users
print("\n📝 STEP 3: Vérifier user dans GET /api/admin/users...")
get_response = requests.get(
    f"{BACKEND_URL}/api/admin/users",
    headers=headers
)
print(f"Status: {get_response.status_code}")
users = get_response.json()
test_user = next((u for u in users if u.get('email') == test_email), None)

if test_user:
    print(f"✅ User trouvé dans la liste:")
    print(f"   - Email: {test_user.get('email')}")
    print(f"   - ID: {test_user.get('id')}")
    print(f"   - _id: {test_user.get('_id')}")
else:
    print(f"❌ User NOT FOUND dans GET /users (email: {test_email})")
    print(f"Total users: {len(users)}")

# STEP 4: DELETE le user
print(f"\n📝 STEP 4: DELETE user avec ID = {user_id}...")
delete_url = f"{BACKEND_URL}/api/admin/users/{user_id}"
print(f"URL: DELETE {delete_url}")

delete_response = requests.delete(delete_url, headers=headers)
print(f"\nStatus: {delete_response.status_code}")
print(f"Response: {delete_response.text}")

if delete_response.status_code == 200:
    print("✅ DELETE réussi!")
else:
    print(f"❌ DELETE ECHOUE: {delete_response.status_code}")
    print(f"   Body: {delete_response.text}")

# STEP 5: Vérifier que le user a bien disparu
print("\n📝 STEP 5: Vérifier disparition du user...")
get_response2 = requests.get(
    f"{BACKEND_URL}/api/admin/users",
    headers=headers
)
users2 = get_response2.json()
test_user2 = next((u for u in users2 if u.get('email') == test_email), None)

if test_user2:
    print(f"❌ User ENCORE PRESENT après DELETE:")
    print(f"   - Email: {test_user2.get('email')}")
    print(f"   - ID: {test_user2.get('id')}")
    print(f"   - is_active: {test_user2.get('is_active')}")
else:
    print(f"✅ User bien supprimé (absent de la liste)")

print("\n" + "=" * 80)
print("RÉSUMÉ:")
print(f"  - Login: {'✅' if login_response.status_code == 200 else '❌'}")
print(f"  - Création user: {'✅' if create_response.status_code in [200, 201] else '❌'}")
print(f"  - User dans liste: {'✅' if test_user else '❌'}")
print(f"  - DELETE status: {delete_response.status_code} {'✅' if delete_response.status_code == 200 else '❌'}")
print(f"  - User supprimé: {'✅' if not test_user2 else '❌'}")
print("=" * 80)
