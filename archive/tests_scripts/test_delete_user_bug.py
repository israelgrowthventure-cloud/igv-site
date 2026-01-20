import requests
import json

# Login admin
login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Get users
print("=== RECUPERATION DES USERS ===\n")
response = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
users = response.json()['users']

print(f"Total users: {len(users)}\n")

# Show first 3 users
for i, user in enumerate(users[:3]):
    print(f"User {i+1}:")
    print(f"  - _id: {user.get('_id')}")
    print(f"  - id: {user.get('id')}")
    print(f"  - email: {user.get('email')}")
    print(f"  - is_active: {user.get('is_active')}")
    print()

# Try to delete user "Debug Create" using the ID from the screenshot
# The screenshot shows users, let's try to delete one
test_user_email = "debug.create.response@test.com"
test_user = next((u for u in users if u.get('email') == test_user_email), None)

if test_user:
    user_id = test_user.get('id') or str(test_user.get('_id'))
    print(f"=== TEST SUPPRESSION USER ===")
    print(f"Email: {test_user_email}")
    print(f"ID utilisé: {user_id}\n")
    
    delete_response = requests.delete(
        f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id}',
        headers=headers
    )
    
    print(f"Status Code: {delete_response.status_code}")
    print(f"Response: {delete_response.text}")
    
    if delete_response.status_code == 200:
        print("\nSUCCES: User supprimé")
    else:
        print("\nECHEC: Erreur lors de la suppression")
        print(f"Détail: {delete_response.json()}")
else:
    print(f"User {test_user_email} non trouvé")
