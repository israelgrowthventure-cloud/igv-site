"""
Test complet du module PROSPECTS (Leads) - Production Live
Ce script teste:
1. Authentification admin
2. Liste des prospects
3. Création prospect test
4. Ajout notes
5. Conversion en contact
6. Suppression prospect
7. Templates email
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

results = {
    "tests": [],
    "errors": [],
    "warnings": []
}

def log_test(name, status, details=""):
    results["tests"].append({
        "name": name,
        "status": status,
        "details": details,
        "timestamp": datetime.now().isoformat()
    })
    print(f"[{'✅' if status == 'PASS' else '❌'}] {name}: {details}")

def log_error(msg):
    results["errors"].append(msg)
    print(f"[ERROR] {msg}")

# Step 1: Login
print("\n" + "="*60)
print("1. AUTHENTICATION")
print("="*60)

login_response = requests.post(
    f"{BASE_URL}/admin/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
)

if login_response.status_code == 200:
    login_data = login_response.json()
    TOKEN = login_data.get("token") or login_data.get("access_token")
    if TOKEN:
        log_test("Admin Login", "PASS", f"Token obtained (first 20 chars: {TOKEN[:20]}...)")
    else:
        log_test("Admin Login", "FAIL", f"No token in response: {login_data}")
        TOKEN = None
else:
    log_test("Admin Login", "FAIL", f"Status: {login_response.status_code}, Response: {login_response.text[:200]}")
    TOKEN = None

if not TOKEN:
    print("\n❌ Cannot continue without authentication token")
    print(json.dumps(results, indent=2, ensure_ascii=False))
    exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Step 2: Get Leads List
print("\n" + "="*60)
print("2. PROSPECTS LIST (GET /crm/leads)")
print("="*60)

leads_response = requests.get(f"{BASE_URL}/crm/leads", headers=HEADERS)
if leads_response.status_code == 200:
    leads_data = leads_response.json()
    total_leads = leads_data.get("total", 0)
    leads_list = leads_data.get("leads", [])
    log_test("Get Leads List", "PASS", f"Total: {total_leads} prospects")
    
    # Display first 3 leads
    if leads_list:
        print(f"\nFirst 3 prospects:")
        for lead in leads_list[:3]:
            print(f"  - ID: {lead.get('_id')}")
            print(f"    Email: {lead.get('email')}")
            print(f"    Brand: {lead.get('brand_name')}")
            print(f"    Status: {lead.get('status')}")
            print()
else:
    log_test("Get Leads List", "FAIL", f"Status: {leads_response.status_code}")
    leads_list = []

# Step 3: Create Test Prospect
print("\n" + "="*60)
print("3. CREATE TEST PROSPECT")
print("="*60)

test_lead_data = {
    "email": f"test_audit_{int(time.time())}@example.com",
    "brand_name": f"Test Audit Brand {int(time.time())}",
    "name": "Audit Test User",
    "phone": "+33612345678",
    "sector": "retail",
    "language": "fr"
}

create_response = requests.post(
    f"{BASE_URL}/crm/leads",
    headers=HEADERS,
    json=test_lead_data
)

TEST_LEAD_ID = None
if create_response.status_code in [200, 201]:
    create_data = create_response.json()
    TEST_LEAD_ID = create_data.get("lead_id")
    log_test("Create Test Prospect", "PASS", f"Lead ID: {TEST_LEAD_ID}")
else:
    log_test("Create Test Prospect", "FAIL", f"Status: {create_response.status_code}, Response: {create_response.text[:300]}")

# Step 4: Get Single Prospect
print("\n" + "="*60)
print("4. GET SINGLE PROSPECT")
print("="*60)

if TEST_LEAD_ID:
    get_lead_response = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS)
    if get_lead_response.status_code == 200:
        lead_detail = get_lead_response.json()
        log_test("Get Single Prospect", "PASS", f"Email: {lead_detail.get('email')}")
        print(f"  Activities: {len(lead_detail.get('activities', []))}")
    else:
        log_test("Get Single Prospect", "FAIL", f"Status: {get_lead_response.status_code}")
else:
    log_test("Get Single Prospect", "SKIP", "No test lead created")

# Step 5: Add Note
print("\n" + "="*60)
print("5. ADD NOTE TO PROSPECT")
print("="*60)

if TEST_LEAD_ID:
    note_data = {"content": f"Test audit note - {datetime.now().isoformat()}"}
    note_response = requests.post(
        f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}/notes",
        headers=HEADERS,
        json=note_data
    )
    
    if note_response.status_code in [200, 201]:
        log_test("Add Note", "PASS", f"Response: {note_response.json()}")
    else:
        log_test("Add Note", "FAIL", f"Status: {note_response.status_code}, Response: {note_response.text[:300]}")
    
    # Verify note persisted
    time.sleep(1)
    get_lead_response2 = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS)
    if get_lead_response2.status_code == 200:
        lead_detail2 = get_lead_response2.json()
        activities = lead_detail2.get("activities", [])
        notes = [a for a in activities if a.get("type") == "note"]
        if notes:
            log_test("Note Persistence", "PASS", f"Found {len(notes)} note(s)")
        else:
            log_test("Note Persistence", "FAIL", "No notes found in activities")
    else:
        log_test("Note Persistence", "FAIL", f"Could not fetch lead: {get_lead_response2.status_code}")
else:
    log_test("Add Note", "SKIP", "No test lead created")

# Step 6: Convert to Contact
print("\n" + "="*60)
print("6. CONVERT PROSPECT TO CONTACT")
print("="*60)

CONTACT_ID = None
if TEST_LEAD_ID:
    convert_response = requests.post(
        f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}/convert-to-contact",
        headers=HEADERS
    )
    
    if convert_response.status_code in [200, 201]:
        convert_data = convert_response.json()
        CONTACT_ID = convert_data.get("contact_id")
        log_test("Convert to Contact", "PASS", f"Contact ID: {CONTACT_ID}")
        
        # Verify contact exists
        if CONTACT_ID:
            contact_response = requests.get(f"{BASE_URL}/crm/contacts/{CONTACT_ID}", headers=HEADERS)
            if contact_response.status_code == 200:
                contact_detail = contact_response.json()
                log_test("Contact Created & Accessible", "PASS", f"Email: {contact_detail.get('email')}")
            else:
                log_test("Contact Created & Accessible", "FAIL", f"Cannot access contact: {contact_response.status_code}")
        
        # Verify lead status updated
        lead_after_convert = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS)
        if lead_after_convert.status_code == 200:
            lead_data_after = lead_after_convert.json()
            if lead_data_after.get("status") == "CONVERTED":
                log_test("Lead Status Updated", "PASS", "Status is CONVERTED")
            else:
                log_test("Lead Status Updated", "FAIL", f"Status is: {lead_data_after.get('status')}")
            if lead_data_after.get("converted_to_contact_id"):
                log_test("Lead Has Contact Reference", "PASS", f"converted_to_contact_id: {lead_data_after.get('converted_to_contact_id')}")
            else:
                log_test("Lead Has Contact Reference", "FAIL", "No converted_to_contact_id")
    else:
        log_test("Convert to Contact", "FAIL", f"Status: {convert_response.status_code}, Response: {convert_response.text[:300]}")
else:
    log_test("Convert to Contact", "SKIP", "No test lead created")

# Step 7: Email Templates
print("\n" + "="*60)
print("7. EMAIL TEMPLATES")
print("="*60)

templates_response = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS)
if templates_response.status_code == 200:
    templates_data = templates_response.json()
    templates = templates_data.get("templates", [])
    log_test("Get Email Templates", "PASS", f"Found {len(templates)} templates")
    
    for tpl in templates[:3]:
        print(f"  - {tpl.get('name')}: {tpl.get('subject')}")
        body = tpl.get('body', '')
        # Check for unresolved placeholders
        placeholders = []
        import re
        found = re.findall(r'\{\{[^}]+\}\}|\[DATE\]|\[HEURE\]|\[NOM\]', body)
        if found:
            print(f"    ⚠️  Placeholders found: {found}")
else:
    log_test("Get Email Templates", "FAIL", f"Status: {templates_response.status_code}")

# Step 8: Delete Test Prospect (cleanup)
print("\n" + "="*60)
print("8. DELETE TEST PROSPECT")
print("="*60)

if TEST_LEAD_ID:
    delete_response = requests.delete(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS)
    if delete_response.status_code in [200, 204]:
        log_test("Delete Prospect", "PASS", f"Lead {TEST_LEAD_ID} deleted")
        
        # Verify deletion
        time.sleep(1)
        verify_delete = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS)
        if verify_delete.status_code == 404:
            log_test("Deletion Verified", "PASS", "Lead no longer exists")
        else:
            log_test("Deletion Verified", "FAIL", f"Lead still accessible: {verify_delete.status_code}")
    else:
        log_test("Delete Prospect", "FAIL", f"Status: {delete_response.status_code}, Response: {delete_response.text[:300]}")
else:
    log_test("Delete Prospect", "SKIP", "No test lead created")

# Cleanup contact if created
if CONTACT_ID:
    delete_contact = requests.delete(f"{BASE_URL}/crm/contacts/{CONTACT_ID}", headers=HEADERS)
    print(f"  Cleanup contact: {delete_contact.status_code}")

# Step 9: Search & Filter
print("\n" + "="*60)
print("9. SEARCH & FILTER")
print("="*60)

search_response = requests.get(f"{BASE_URL}/crm/leads?search=test", headers=HEADERS)
if search_response.status_code == 200:
    log_test("Search Prospects", "PASS", f"Found {search_response.json().get('total', 0)} results")
else:
    log_test("Search Prospects", "FAIL", f"Status: {search_response.status_code}")

# Step 10: Export CSV
print("\n" + "="*60)
print("10. EXPORT CSV")
print("="*60)

export_response = requests.get(f"{BASE_URL}/crm/leads/export/csv", headers=HEADERS)
if export_response.status_code == 200:
    csv_data = export_response.json()
    if csv_data.get("csv"):
        log_test("Export CSV", "PASS", f"Exported {csv_data.get('count', 0)} leads")
    else:
        log_test("Export CSV", "FAIL", "No CSV data in response")
else:
    log_test("Export CSV", "FAIL", f"Status: {export_response.status_code}")

# Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)

passed = len([t for t in results["tests"] if t["status"] == "PASS"])
failed = len([t for t in results["tests"] if t["status"] == "FAIL"])
skipped = len([t for t in results["tests"] if t["status"] == "SKIP"])

print(f"Total: {len(results['tests'])} tests")
print(f"✅ Passed: {passed}")
print(f"❌ Failed: {failed}")
print(f"⏭️  Skipped: {skipped}")

# Save results
with open("test_prospects_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n📄 Results saved to test_prospects_audit_results.json")
