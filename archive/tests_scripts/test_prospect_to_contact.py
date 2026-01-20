"""
Test conversion Prospect → Contact en PRODUCTION
"""
import requests
import json
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("TEST CONVERSION PROSPECT → CONTACT")
print("=" * 80)

# Login
print("\n[1] Login admin...")
login_response = requests.post(
    f"{BACKEND_URL}/api/admin/login",
    json={"email": EMAIL, "password": PASSWORD}
)
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✅ Token obtenu")

# Récupérer les leads
print("\n[2] Récupérer les leads...")
leads_response = requests.get(f"{BACKEND_URL}/api/crm/leads", headers=headers)
leads_data = leads_response.json()

# Gérer format {leads: [...]} ou liste directe
if isinstance(leads_data, dict) and "leads" in leads_data:
    leads = leads_data["leads"]
elif isinstance(leads_data, list):
    leads = leads_data
else:
    leads = []

print(f"Total leads: {len(leads)}")
if leads:
    # Chercher un lead NON converti
    lead = next((l for l in leads if not l.get("converted_to_contact_id")), None)
    
    if not lead:
        print("\n⚠️ Tous les leads sont déjà convertis!")
        print("   Création d'un nouveau lead pour test...")
        
        # Créer un nouveau lead
        new_lead_data = {
            "email": f"test.conversion.{int(time.time())}@test.com",
            "brand_name": "Test Conversion",
            "name": "Test User",
            "phone": "+972501234567",
            "status": "NEW",
            "language": "fr"
        }
        create_response = requests.post(
            f"{BACKEND_URL}/api/crm/leads",
            headers=headers,
            json=new_lead_data
        )
        if create_response.status_code in [200, 201]:
            lead_data = create_response.json()
            lead = {"_id": lead_data.get("id") or lead_data.get("lead_id"), **new_lead_data}
            print(f"   ✅ Lead créé: {lead['_id']}")
        else:
            print(f"   ❌ Échec création lead: {create_response.text}")
            exit(1)
    
    lead_id = lead.get("_id") or lead.get("id")
    print(f"\n📋 Lead à convertir:")
    print(f"   ID: {lead_id}")
    print(f"   Email: {lead.get('email')}")
    print(f"   Marque: {lead.get('brand_name')}")
    print(f"   Status: {lead.get('status')}")
    print(f"   Déjà converti?: {lead.get('converted_to_contact_id')}")
    
    # Tenter conversion
    print(f"\n[3] Conversion Prospect → Contact...")
    convert_url = f"{BACKEND_URL}/api/crm/leads/{lead_id}/convert-to-contact"
    print(f"URL: {convert_url}")
    
    convert_response = requests.post(convert_url, headers=headers)
    
    print(f"\nStatus: {convert_response.status_code}")
    print(f"Response: {convert_response.text}")
    
    if convert_response.status_code == 200:
        data = convert_response.json()
        contact_id = data.get("contact_id")
        print(f"\n✅ CONVERSION RÉUSSIE!")
        print(f"   Contact ID: {contact_id}")
        print(f"   Message: {data.get('message')}")
        
        # Vérifier que le contact existe
        print(f"\n[4] Vérifier contact créé...")
        contacts_response = requests.get(f"{BACKEND_URL}/api/crm/contacts", headers=headers)
        contacts_data = contacts_response.json()
        
        # Gérer format dict/list
        if isinstance(contacts_data, dict) and "contacts" in contacts_data:
            contacts = contacts_data["contacts"]
        elif isinstance(contacts_data, list):
            contacts = contacts_data
        else:
            contacts = []
        
        new_contact = next((c for c in contacts if c.get("_id") == contact_id or c.get("id") == contact_id), None)
        if new_contact:
            print(f"✅ Contact trouvé:")
            print(f"   Email: {new_contact.get('email')}")
            print(f"   Nom: {new_contact.get('name')}")
        else:
            print(f"❌ Contact non trouvé dans la liste")
    elif convert_response.status_code == 400:
        error = convert_response.json()
        if "already converted" in error.get("detail", "").lower():
            print(f"\n⚠️ Lead déjà converti")
        else:
            print(f"\n❌ Erreur: {error.get('detail')}")
    else:
        print(f"\n❌ ÉCHEC CONVERSION")
        
else:
    print("❌ Aucun lead disponible")

print("\n" + "=" * 80)
