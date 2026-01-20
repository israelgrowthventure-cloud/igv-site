"""
Test détaillé des modèles email et des notes
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
print("TEST EMAIL TEMPLATES")
print("="*60)

templates_response = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS)
if templates_response.status_code == 200:
    data = templates_response.json()
    templates = data.get("templates", [])
    print(f"\nFound {len(templates)} templates:\n")
    
    for tpl in templates:
        print(f"ID: {tpl.get('_id')}")
        print(f"Name: {tpl.get('name')}")
        print(f"Subject: {tpl.get('subject')}")
        print(f"Body: {tpl.get('body')[:200] if tpl.get('body') else 'N/A'}...")
        print(f"Language: {tpl.get('language')}")
        print("-" * 40)
else:
    print(f"Error: {templates_response.status_code} - {templates_response.text}")

# Test notes with both content and note_text formats
print("\n" + "="*60)
print("TEST NOTES FORMAT")
print("="*60)

# Create a test lead first
test_lead = {
    "email": f"note_test_{int(datetime.now().timestamp())}@test.com",
    "brand_name": "Note Test Brand",
    "language": "fr"
}

create_response = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead)
if create_response.status_code in [200, 201]:
    lead_id = create_response.json().get("lead_id")
    print(f"\nCreated test lead: {lead_id}")
    
    # Test with note_text field (frontend format)
    print("\nTest 1: Adding note with note_text field...")
    note_response_1 = requests.post(
        f"{BASE_URL}/crm/leads/{lead_id}/notes",
        headers=HEADERS,
        json={"note_text": "Test note with note_text field"}
    )
    print(f"  Response: {note_response_1.status_code} - {note_response_1.text}")
    
    # Test with content field (backend format)
    print("\nTest 2: Adding note with content field...")
    note_response_2 = requests.post(
        f"{BASE_URL}/crm/leads/{lead_id}/notes",
        headers=HEADERS,
        json={"content": "Test note with content field"}
    )
    print(f"  Response: {note_response_2.status_code} - {note_response_2.text}")
    
    # Fetch lead and check notes
    print("\nFetching lead to verify notes...")
    lead_response = requests.get(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS)
    if lead_response.status_code == 200:
        lead_data = lead_response.json()
        print(f"\nLead has notes array: {'notes' in lead_data}")
        notes = lead_data.get("notes", [])
        print(f"Number of notes: {len(notes)}")
        for note in notes:
            print(f"  - {note.get('note_text', 'N/A')[:50]}... (by {note.get('created_by', 'N/A')})")
        
        activities = lead_data.get("activities", [])
        note_activities = [a for a in activities if a.get("type") == "note"]
        print(f"\nNumber of note activities: {len(note_activities)}")
    else:
        print(f"Error fetching lead: {lead_response.status_code}")
    
    # Cleanup
    print("\nCleaning up test lead...")
    delete_response = requests.delete(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS)
    print(f"Delete response: {delete_response.status_code}")
else:
    print(f"Failed to create test lead: {create_response.status_code}")
    print(create_response.text)

print("\n" + "="*60)
print("DONE")
print("="*60)
