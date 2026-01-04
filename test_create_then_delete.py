import requests
import json

# Login
login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Create a test user
print("=== CREATION TEST USER ===\n")
new_user = {
    "email": "test.delete.bug.fix@test.com",
    "first_name": "Delete",
    "last_name": "Test",
    "password": "test123456",
    "role": "viewer",
    "is_active": True
}

create_response = requests.post(
    'https://igv-cms-backend.onrender.com/api/admin/users',
    headers=headers,
    json=new_user
)

print(f"Create Status: {create_response.status_code}")
print(f"Response: {create_response.text}\n")

if create_response.status_code in [200, 201]:
    created_user = create_response.json().get('user', {})
    user_id = created_user.get('id') or created_user.get('_id')
    
    print(f"User créé avec ID: {user_id}\n")
    
    # Try to delete immediately
    print("=== TEST SUPPRESSION IMMEDIATE ===\n")
    delete_response = requests.delete(
        f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id}',
        headers=headers
    )
    
    print(f"Delete Status: {delete_response.status_code}")
    print(f"Response: {delete_response.text}")
    
    if delete_response.status_code == 200:
        print("\nSUCCES!")
    else:
        print("\nECHEC - Bug confirmé")
else:
    print("Erreur création user")
