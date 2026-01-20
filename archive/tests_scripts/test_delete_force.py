"""
Test: Forcer Render à chercher le user qu'on vient de créer
On va créer un user, puis immédiatement lister TOUS les users en MongoDB
pour voir s'il existe vraiment
"""
import requests
import json
import time

login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Créer un user avec email unique
timestamp = int(time.time())
test_email = f"test.force.{timestamp}@test.com"

print(f"Création user: {test_email}")
create_response = requests.post(
    'https://igv-cms-backend.onrender.com/api/admin/users',
    headers=headers,
    json={
        "email": test_email,
        "first_name": "Force",
        "last_name": "Test",
        "password": "test123456",
        "role": "viewer"
    }
)

print(f"CREATE Status: {create_response.status_code}")
print(f"CREATE Response: {create_response.json()}")

# Attendre 2 secondes
print("\nAttente 2 secondes...")
time.sleep(2)

# Récupérer tous les users
print("\nRécupération de tous les users...")
users_response = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
all_users = users_response.json()['users']

# Chercher notre user
our_user = next((u for u in all_users if u.get('email') == test_email), None)

if our_user:
    print(f"\n✅ User trouvé dans GET /users:")
    print(f"  email: {our_user.get('email')}")
    print(f"  id: {our_user.get('id')}")
    print(f"  _id: {our_user.get('_id')}")
    
    # Maintenant testons toutes les variantes possibles de DELETE
    user_id = our_user.get('id')
    
    # Test 1: DELETE avec l'id UUID
    print(f"\n--- TEST DELETE avec UUID: {user_id} ---")
    del_resp = requests.delete(
        f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id}',
        headers=headers
    )
    print(f"Status: {del_resp.status_code}")
    print(f"Response: {del_resp.text}")
    
    # Vérifier si le user est toujours là
    users_response2 = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
    all_users2 = users_response2.json()['users']
    still_exists = next((u for u in all_users2 if u.get('email') == test_email), None)
    
    if still_exists:
        print(f"\n⚠️ User existe TOUJOURS après DELETE")
        print(f"   is_active: {still_exists.get('is_active')}")
    else:
        print(f"\n✅ User supprimé (ou désactivé) avec succès")
else:
    print(f"\n❌ User NON TROUVÉ dans GET /users")
    print(f"   Nombre total de users: {len(all_users)}")
    print(f"   Derniers emails: {[u.get('email') for u in all_users[-3:]]}")
