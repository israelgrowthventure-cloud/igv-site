"""
Test: Est-ce que l'admin principal (postmaster) a un champ "id" ?
"""
import requests

login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

users_response = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
all_users = users_response.json()['users']

# Chercher postmaster
postmaster = next((u for u in all_users if u.get('email') == 'postmaster@israelgrowthventure.com'), None)

if postmaster:
    print("User: postmaster@israelgrowthventure.com")
    print(f"  id: {postmaster.get('id')}")
    print(f"  _id: {postmaster.get('_id')}")
    print(f"  Type id: {type(postmaster.get('id'))}")
    
    # Est-ce que c'est un ObjectId converti en string?
    id_val = postmaster.get('id')
    if id_val:
        print(f"  Longueur: {len(id_val)}")
        print(f"  Format ObjectId (24 hex): {len(id_val) == 24 and all(c in '0123456789abcdef' for c in id_val)}")
        print(f"  Format UUID (36 avec tirets): {len(id_val) == 36 and id_val.count('-') == 4}")

# Regardons aussi les nouveaux users
new_users = [u for u in all_users if 'diagnostic' in u.get('email', '') or 'test.force' in u.get('email', '')]
if new_users:
    print(f"\n--- Nouveaux users de test ---")
    for nu in new_users[:2]:
        print(f"\n{nu.get('email')}:")
        print(f"  id: {nu.get('id')}")
        id_val = nu.get('id')
        if id_val:
            print(f"  Longueur: {len(id_val)}")
            print(f"  Format UUID: {len(id_val) == 36 and id_val.count('-') == 4}")
