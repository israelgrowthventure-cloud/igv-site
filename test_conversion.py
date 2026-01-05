"""
Test de conversion prospect -> contact
Vérifie que le backend retourne le contact_id pour la redirection
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

# Login
login_response = requests.post(
    f"{BASE_URL}/admin/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
)
login_data = login_response.json()
TOKEN = login_data.get("token") or login_data.get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

print("="*60)
print("TEST CONVERSION PROSPECT -> CONTACT")
print("="*60)

# Create test lead
test_lead = {
    "email": f"convert_test_{int(datetime.now().timestamp())}@test.com",
    "brand_name": "Convert Test Brand",
    "name": "Test Convert User",
    "phone": "+33600000000",
    "language": "fr"
}

create_response = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead)
if create_response.status_code in [200, 201]:
    lead_id = create_response.json().get("lead_id")
    print(f"\n1. Created test lead: {lead_id}")
    
    # Convert to contact
    print(f"\n2. Converting lead to contact...")
    convert_response = requests.post(
        f"{BASE_URL}/crm/leads/{lead_id}/convert-to-contact",
        headers=HEADERS
    )
    
    print(f"   Status: {convert_response.status_code}")
    convert_data = convert_response.json()
    print(f"   Response: {json.dumps(convert_data, indent=2)}")
    
    contact_id = convert_data.get("contact_id")
    
    if contact_id:
        print(f"\n3. ✅ Contact ID returned: {contact_id}")
        
        # Verify contact exists
        contact_response = requests.get(f"{BASE_URL}/crm/contacts/{contact_id}", headers=HEADERS)
        if contact_response.status_code == 200:
            contact_data = contact_response.json()
            print(f"\n4. ✅ Contact accessible:")
            print(f"   Email: {contact_data.get('email')}")
            print(f"   Name: {contact_data.get('name')}")
            
            # Check lead status
            lead_response = requests.get(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS)
            if lead_response.status_code == 200:
                lead_data = lead_response.json()
                print(f"\n5. Lead status after conversion:")
                print(f"   Status: {lead_data.get('status')}")
                print(f"   converted_to_contact_id: {lead_data.get('converted_to_contact_id')}")
            
            # Cleanup contact
            delete_contact = requests.delete(f"{BASE_URL}/crm/contacts/{contact_id}", headers=HEADERS)
            print(f"\n   Cleanup contact: {delete_contact.status_code}")
        else:
            print(f"\n4. ❌ Cannot access contact: {contact_response.status_code}")
    else:
        print(f"\n3. ❌ No contact_id in response!")
    
    # Cleanup lead (may fail if converted)
    delete_lead = requests.delete(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS)
    print(f"   Cleanup lead: {delete_lead.status_code}")
else:
    print(f"Failed to create test lead: {create_response.status_code}")
    print(create_response.text)

print("\n" + "="*60)
print("DONE")
print("="*60)
