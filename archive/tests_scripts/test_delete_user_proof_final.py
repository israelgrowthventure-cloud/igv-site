"""
Test DELETE user en PRODUCTION avec PREUVE complète
Après commit e4c23b1 (UsersTab.js recréé) + 8c1ba10 (DELETE simplifié)
"""
import requests
import json
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("TEST DELETE USER - PREUVE PRODUCTION FINALE")
print(f"Date: {datetime.now().isoformat()}")
print(f"Backend: {BASE_URL}")
print(f"Commits: e4c23b1 (UsersTab) + 8c1ba10 (DELETE fix)")
print("=" * 80)

# 1. Login admin
print("\n[1] LOGIN ADMIN...")
login_response = requests.post(f"{BASE_URL}/admin/login", json={
    "email": ADMIN_EMAIL,
    "password": ADMIN_PASSWORD
})
print(f"Status: {login_response.status_code}")
if login_response.status_code != 200:
    print(f"ERREUR LOGIN: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✅ Token obtenu: {token[:50]}...")

# 2. Create test user
print("\n[2] CREATE TEST USER...")
test_email = f"delete.proof.{int(datetime.now().timestamp())}@test.com"
create_payload = {
    "email": test_email,
    "first_name": "Delete",
    "last_name": "Proof",
    "password": "TestPass123!",
    "role": "commercial",
    "is_active": True
}
create_response = requests.post(f"{BASE_URL}/admin/users", json=create_payload, headers=headers)
print(f"Status: {create_response.status_code}")
print(f"Response: {json.dumps(create_response.json(), indent=2)}")

if create_response.status_code != 200:
    print("❌ ÉCHEC CRÉATION USER")
    exit(1)

created_user = create_response.json()
user_id = created_user.get("id")
print(f"✅ USER CRÉÉ - ID: {user_id}")
print(f"   Email: {created_user.get('email')}")
print(f"   Nom: {created_user.get('first_name')} {created_user.get('last_name')}")

# 3. Verify user exists in GET /users
print("\n[3] VERIFY USER IN GET /admin/users...")
get_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
print(f"Status: {get_response.status_code}")
all_users = get_response.json()
test_user_found = [u for u in all_users if u.get("email") == test_email]
print(f"Users avec email {test_email}: {len(test_user_found)}")
if test_user_found:
    print(f"✅ USER TROUVÉ dans GET /users:")
    print(f"   id: {test_user_found[0].get('id')}")
    print(f"   _id: {test_user_found[0].get('_id')}")
    print(f"   email: {test_user_found[0].get('email')}")
else:
    print("❌ USER NON TROUVÉ dans GET /users")

# 4. DELETE user with the ID returned by POST
print(f"\n[4] DELETE USER avec ID: {user_id}...")
delete_response = requests.delete(f"{BASE_URL}/admin/users/{user_id}", headers=headers)
print(f"Status: {delete_response.status_code}")
print(f"Response: {delete_response.text}")

if delete_response.status_code == 200:
    print("✅ DELETE RÉUSSI (200)")
    delete_data = delete_response.json()
    print(f"   Message: {delete_data.get('message')}")
elif delete_response.status_code == 404:
    print("❌ DELETE ÉCHOUÉ (404 - User not found)")
    print(f"   PREUVE BUG: L'ID {user_id} existe mais DELETE retourne 404")
else:
    print(f"❌ DELETE ÉCHOUÉ ({delete_response.status_code})")

# 5. Verify user no longer in GET /users OR is_active=False
print("\n[5] VERIFY USER SUPPRIMÉ OU DÉSACTIVÉ...")
verify_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
remaining_users = verify_response.json()
remaining_test_users = [u for u in remaining_users if u.get("email") == test_email]
print(f"Users avec email {test_email} après DELETE: {len(remaining_test_users)}")

if len(remaining_test_users) == 0:
    print("✅ USER COMPLÈTEMENT SUPPRIMÉ (absent de GET /users)")
elif not remaining_test_users[0].get("is_active"):
    print(f"✅ USER DÉSACTIVÉ (is_active=False)")
    print(f"   ID: {remaining_test_users[0].get('id')}")
else:
    print("❌ USER TOUJOURS ACTIF (is_active=True)")
    print(f"   PREUVE BUG: DELETE n'a pas supprimé ni désactivé le user")
    print(f"   ID: {remaining_test_users[0].get('id')}")
    print(f"   is_active: {remaining_test_users[0].get('is_active')}")

print("\n" + "=" * 80)
print("RÉSULTAT FINAL:")
if delete_response.status_code == 200 and len(remaining_test_users) == 0:
    print("✅ DELETE USER FONCTIONNE EN PRODUCTION")
    print(f"✅ PREUVE: User {user_id} créé puis supprimé avec succès")
elif delete_response.status_code == 200 and len(remaining_test_users) > 0 and not remaining_test_users[0].get("is_active"):
    print("✅ DELETE USER FONCTIONNE (désactivation)")
    print(f"✅ PREUVE: User {user_id} créé puis désactivé avec succès")
else:
    print("❌ DELETE USER NE FONCTIONNE PAS")
    print(f"❌ PREUVE: Status {delete_response.status_code}, user toujours présent")
print("=" * 80)
