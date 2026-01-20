"""
Diagnostic des anciens users cassés en base MongoDB
Objectif : Identifier la structure des anciens users et pourquoi ils sont "cassés"
"""
import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("DIAGNOSTIC ANCIENS USERS - STRUCTURE EN BASE")
print("=" * 80)

# Login
print("\n[1] Login admin...")
login_response = requests.post(
    f"{BACKEND_URL}/api/admin/login",
    json={"email": EMAIL, "password": PASSWORD}
)
if login_response.status_code != 200:
    print(f"❌ Login échoué: {login_response.status_code}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✅ Token obtenu")

# Get all users
print("\n[2] Récupération de TOUS les users via GET /api/admin/users...")
users_response = requests.get(f"{BACKEND_URL}/api/admin/users", headers=headers)
print(f"Status: {users_response.status_code}")

if users_response.status_code != 200:
    print(f"❌ Échec: {users_response.text}")
    exit(1)

users_raw = users_response.json()
print(f"✅ Réponse reçue")

# L'API renvoie {"users": [...]}
if isinstance(users_raw, dict) and "users" in users_raw:
    users = users_raw["users"]
elif isinstance(users_raw, list):
    users = users_raw
else:
    print(f"❌ ERREUR: Format inattendu")
    print(f"Réponse: {json.dumps(users_raw, indent=2, ensure_ascii=False)[:500]}")
    exit(1)

print(f"✅ Total users récupérés: {len(users)}")

# Analyze structure
print("\n" + "=" * 80)
print("ANALYSE STRUCTURE DES USERS")
print("=" * 80)

users_with_id = []
users_without_id = []
users_with_only_id_mongodb = []

for idx, user in enumerate(users):
    if not isinstance(user, dict):
        print(f"⚠️ User {idx} n'est pas un dict: {type(user)}")
        continue
    
    has_uuid_id = user.get("id") is not None and user.get("id") != ""
    has_mongodb_id = user.get("_id") is not None
    
    if has_uuid_id:
        users_with_id.append(user)
    elif has_mongodb_id:
        users_with_only_id_mongodb.append(user)
    else:
        users_without_id.append(user)

print(f"\n📊 STATISTIQUES:")
print(f"   - Users avec champ 'id' (UUID): {len(users_with_id)}")
print(f"   - Users avec SEULEMENT '_id' (MongoDB): {len(users_with_only_id_mongodb)}")
print(f"   - Users SANS id du tout: {len(users_without_id)}")

# Show examples
if users_with_id:
    print(f"\n✅ Exemple user AVEC 'id' (nouveau):")
    u = users_with_id[0]
    print(f"   {json.dumps({k: v for k, v in u.items() if k in ['id', '_id', 'email', 'first_name', 'last_name', 'role']}, indent=2, ensure_ascii=False)}")

if users_with_only_id_mongodb:
    print(f"\n⚠️ Exemple user CASSÉ (ancien - seulement _id):")
    u = users_with_only_id_mongodb[0]
    print(f"   Structure complète:")
    print(f"   {json.dumps(u, indent=2, ensure_ascii=False)}")

if users_without_id:
    print(f"\n❌ Exemple user SANS ID:")
    u = users_without_id[0]
    print(f"   {json.dumps(u, indent=2, ensure_ascii=False)}")

# List all old users
if users_with_only_id_mongodb:
    print(f"\n" + "=" * 80)
    print(f"LISTE DES {len(users_with_only_id_mongodb)} ANCIENS USERS À RÉPARER:")
    print("=" * 80)
    for idx, user in enumerate(users_with_only_id_mongodb, 1):
        print(f"{idx}. Email: {user.get('email')}")
        print(f"   _id: {user.get('_id')}")
        print(f"   id: {user.get('id')}")
        print(f"   role: {user.get('role')}")
        print(f"   is_active: {user.get('is_active')}")
        print(f"   Champs présents: {list(user.keys())}")
        print()

print("\n" + "=" * 80)
print("CONCLUSION:")
print("=" * 80)
if users_with_only_id_mongodb:
    print(f"⚠️ {len(users_with_only_id_mongodb)} anciens users doivent être migrés")
    print("   Action requise: Ajouter un champ 'id' (UUID) à chaque ancien user")
    print("   OU: Exposer '_id' comme 'id' dans les réponses API")
else:
    print("✅ Tous les users ont déjà un champ 'id' utilisable")
