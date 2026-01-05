"""
TEST LOCAL - Vérification des corrections prospects
Date: 6 janvier 2026
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

print("="*70)
print("TEST CORRECTIONS PROSPECTS")
print("="*70)

# AUTH
login_resp = requests.post(f"{BASE_URL}/admin/login", 
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
TOKEN = login_resp.json().get("token") or login_resp.json().get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
print("✅ Auth OK")

# TEST 1: Récupérer la liste des leads et vérifier contact_name
print("\n[TEST 1] Liste prospects - vérifier contact_name alias")
print("-"*40)
leads_resp = requests.get(f"{BASE_URL}/crm/leads", headers=HEADERS, params={"limit": 5}, timeout=30)
if leads_resp.status_code == 200:
    leads = leads_resp.json().get("leads", [])
    if leads:
        first_lead = leads[0]
        print(f"Premier lead:")
        print(f"  - ID: {first_lead.get('lead_id') or first_lead.get('_id')}")
        print(f"  - name: {first_lead.get('name')}")
        print(f"  - contact_name: {first_lead.get('contact_name')}")
        print(f"  - brand_name: {first_lead.get('brand_name')}")
        print(f"  - email: {first_lead.get('email')}")
        print(f"  - phone: {first_lead.get('phone')}")
        
        if first_lead.get('contact_name') is not None:
            print("✅ contact_name alias présent")
        else:
            print("❌ contact_name alias manquant")
        
        if first_lead.get('lead_id'):
            print("✅ lead_id alias présent")
        else:
            print("❌ lead_id alias manquant")
        
        # Tester GET lead detail
        print("\n[TEST 2] Détail prospect - vérifier structure notes")
        print("-"*40)
        lead_id = first_lead.get('lead_id') or first_lead.get('_id')
        detail_resp = requests.get(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS, timeout=30)
        if detail_resp.status_code == 200:
            lead_detail = detail_resp.json()
            print(f"Lead detail récupéré:")
            print(f"  - contact_name: {lead_detail.get('contact_name')}")
            print(f"  - lead_id: {lead_detail.get('lead_id')}")
            
            notes = lead_detail.get('notes', [])
            print(f"  - notes: {len(notes)} note(s)")
            
            if notes:
                first_note = notes[0]
                print(f"\nPremière note:")
                print(f"  - id: {first_note.get('id')}")
                print(f"  - content: {first_note.get('content', 'N/A')[:50]}")
                print(f"  - note_text: {first_note.get('note_text', 'N/A')[:50]}")
                print(f"  - details: {first_note.get('details', 'N/A')[:50]}")
                print(f"  - created_by: {first_note.get('created_by')}")
                
                has_all = first_note.get('content') and first_note.get('note_text') and first_note.get('details')
                if has_all:
                    print("✅ Tous les alias de note présents")
                else:
                    print("❌ Certains alias manquants")
            else:
                print("⚠️  Aucune note pour ce lead")
        else:
            print(f"❌ Erreur récupération détail: {detail_resp.status_code}")
    else:
        print("⚠️  Aucun lead dans la base")
else:
    print(f"❌ Erreur: {leads_resp.status_code}")

print("\n" + "="*70)
print("FIN DES TESTS")
print("="*70)
