"""
DIAGNOSTIC COMPLET - Pourquoi DELETE user ne fonctionne PAS
Test direct de la structure MongoDB via l'API
"""
import requests
import json

# Login
login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

print("="*80)
print("DIAGNOSTIC: Structure réelle des users en MongoDB")
print("="*80)

# Récupérer les users via GET
response = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
users = response.json()['users']

print(f"\nTotal users: {len(users)}")
print("\n--- STRUCTURE RETOURNEE PAR GET /users ---")
for i, user in enumerate(users[:2]):
    print(f"\nUser {i+1}: {user.get('email')}")
    print(f"  Champs retournés: {list(user.keys())}")
    print(f"  _id: {user.get('_id')}")
    print(f"  id: {user.get('id')}")

# Créer un user de test
print("\n" + "="*80)
print("TEST: Créer un user et voir ce qui est VRAIMENT stocké en DB")
print("="*80)

new_user = {
    "email": f"diagnostic.{int(__import__('time').time())}@test.com",
    "first_name": "Diagnostic",
    "last_name": "Test",
    "password": "test123456",
    "role": "viewer"
}

create_response = requests.post(
    'https://igv-cms-backend.onrender.com/api/admin/users',
    headers=headers,
    json=new_user
)

print(f"\nCREATE Status: {create_response.status_code}")
print(f"CREATE Response keys: {list(create_response.json().keys())}")
print(f"CREATE Response: {json.dumps(create_response.json(), indent=2)}")

# Récupérer à nouveau la liste pour voir le user créé
print("\n--- VERIFICATION: User créé visible dans GET /users ---")
response2 = requests.get('https://igv-cms-backend.onrender.com/api/admin/users', headers=headers)
users2 = response2.json()['users']

new_user_in_list = next((u for u in users2 if u.get('email') == new_user['email']), None)
if new_user_in_list:
    print(f"\nUser trouvé dans la liste:")
    print(f"  email: {new_user_in_list.get('email')}")
    print(f"  _id: {new_user_in_list.get('_id')}")
    print(f"  id: {new_user_in_list.get('id')}")
    print(f"  Type de _id: {type(new_user_in_list.get('_id'))}")
    print(f"  Type de id: {type(new_user_in_list.get('id'))}")
    
    # TEST 1: Essayer de supprimer avec le champ "id"
    user_id_to_delete = new_user_in_list.get('id')
    print(f"\n" + "="*80)
    print(f"TEST DELETE #1: Utilisation du champ 'id' = {user_id_to_delete}")
    print("="*80)
    
    delete_response1 = requests.delete(
        f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id_to_delete}',
        headers=headers
    )
    
    print(f"Status: {delete_response1.status_code}")
    print(f"Response: {delete_response1.text}")
    
    if delete_response1.status_code != 200:
        # TEST 2: Essayer avec _id
        user_id_to_delete2 = new_user_in_list.get('_id')
        print(f"\n" + "="*80)
        print(f"TEST DELETE #2: Utilisation du champ '_id' = {user_id_to_delete2}")
        print("="*80)
        
        delete_response2 = requests.delete(
            f'https://igv-cms-backend.onrender.com/api/admin/users/{user_id_to_delete2}',
            headers=headers
        )
        
        print(f"Status: {delete_response2.status_code}")
        print(f"Response: {delete_response2.text}")
        
        if delete_response2.status_code == 200:
            print("\n✅ SOLUTION TROUVEE: Utiliser '_id' au lieu de 'id'")
        else:
            print("\n❌ AUCUNE METHODE NE FONCTIONNE")
    else:
        print("\n✅ SOLUTION: Le champ 'id' fonctionne")
else:
    print("\n❌ User créé non trouvé dans la liste")

print("\n" + "="*80)
print("CONCLUSION")
print("="*80)
print("\nAnalyse:")
print("1. Quel champ est vraiment stocké en MongoDB?")
print("2. Quel champ utilise le frontend pour DELETE?")
print("3. Comment corriger le backend pour que ça marche?")
