"""
Tester DELETE sur un user plus ancien
pour voir si c'est un problème de timing ou de structure
"""
import requests

login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Récupérer tous les users
users_response = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
all_users = users_response.json()['users']

print(f"Total users: {len(all_users)}\n")

# Prendre un vieux user de test
test_users = [u for u in all_users if 'test.com' in u.get('email', '')]
print(f"Users de test trouvés: {len(test_users)}\n")

if test_users:
    # Prendre le PREMIER user de test (le plus ancien)
    old_user = test_users[0]
    
    print(f"User le plus ancien:")
    print(f"  email: {old_user.get('email')}")
    print(f"  id: {old_user.get('id')}")
    print(f"  created_at: {old_user.get('created_at')}")
    
    user_id = old_user.get('id')
    
    print(f"\n--- TEST DELETE ---")
    del_resp = requests.delete(
        f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id}',
        headers=headers
    )
    
    print(f"Status: {del_resp.status_code}")
    print(f"Response: {del_resp.text}")
    
    if del_resp.status_code == 200:
        print("\n✅ SUCCES!")
    else:
        print("\n❌ ECHEC - Même sur un vieux user")
        print("\nCONCLUSION: Le problème n'est PAS un timing")
        print("Le problème est dans la logique de recherche du backend DELETE")
