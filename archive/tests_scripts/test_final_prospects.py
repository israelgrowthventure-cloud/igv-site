"""
Test FINAL du module PROSPECTS après déploiement
Vérifie que tous les objectifs fonctionnels sont atteints
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

print("="*70)
print("TEST FINAL MODULE PROSPECTS - POST DEPLOYMENT")
print(f"Date: {datetime.now().isoformat()}")
print("="*70)

# Login
print("\n[AUTH] Connexion admin...")
login_response = requests.post(
    f"{BASE_URL}/admin/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    timeout=30
)

if login_response.status_code != 200:
    print(f"❌ ÉCHEC LOGIN: {login_response.status_code}")
    exit(1)

login_data = login_response.json()
TOKEN = login_data.get("token") or login_data.get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
print("✅ Connecté")

# =====================================================
# OBJECTIF 1: Liste prospects
# =====================================================
print("\n" + "="*70)
print("OBJECTIF 1: Liste des prospects")
print("="*70)

leads_resp = requests.get(f"{BASE_URL}/crm/leads", headers=HEADERS, timeout=30)
if leads_resp.status_code == 200:
    data = leads_resp.json()
    print(f"✅ Liste OK - {data.get('total', 0)} prospects")
else:
    print(f"❌ ÉCHEC: {leads_resp.status_code}")

# =====================================================
# OBJECTIF 2: Notes (avec note_text)
# =====================================================
print("\n" + "="*70)
print("OBJECTIF 2: Notes - test avec note_text field")
print("="*70)

# Créer un prospect test
test_lead = {
    "email": f"final_test_{int(time.time())}@audit.com",
    "brand_name": f"Final Test Brand {int(time.time())}",
    "name": "Final Test",
    "language": "fr"
}

create_resp = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead, timeout=30)
if create_resp.status_code not in [200, 201]:
    print(f"❌ Impossible de créer le prospect test: {create_resp.status_code}")
    print(create_resp.text)
    exit(1)

lead_id = create_resp.json().get("lead_id")
print(f"✅ Prospect test créé: {lead_id}")

# Test ajout note avec note_text (format frontend)
note_resp = requests.post(
    f"{BASE_URL}/crm/leads/{lead_id}/notes",
    headers=HEADERS,
    json={"note_text": f"Note test audit - {datetime.now().isoformat()}"},
    timeout=30
)

if note_resp.status_code == 200:
    print("✅ Note ajoutée avec note_text field")
else:
    print(f"❌ Échec ajout note: {note_resp.status_code} - {note_resp.text}")

# Vérifier persistance de la note
time.sleep(1)
lead_detail = requests.get(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS, timeout=30)
if lead_detail.status_code == 200:
    lead_data = lead_detail.json()
    notes = lead_data.get("notes", [])
    if notes:
        print(f"✅ Notes persistées: {len(notes)} note(s)")
        print(f"   Dernière note: {notes[0].get('note_text', 'N/A')[:50]}...")
    else:
        print("⚠️  Aucune note trouvée dans le champ 'notes'")
        # Vérifier dans activities
        activities = lead_data.get("activities", [])
        note_activities = [a for a in activities if a.get("type") == "note"]
        print(f"   Notes dans activities: {len(note_activities)}")
else:
    print(f"❌ Impossible de récupérer le prospect: {lead_detail.status_code}")

# =====================================================
# OBJECTIF 3: Conversion prospect -> contact
# =====================================================
print("\n" + "="*70)
print("OBJECTIF 3: Conversion prospect -> contact")
print("="*70)

convert_resp = requests.post(
    f"{BASE_URL}/crm/leads/{lead_id}/convert-to-contact",
    headers=HEADERS,
    timeout=30
)

if convert_resp.status_code == 200:
    convert_data = convert_resp.json()
    contact_id = convert_data.get("contact_id")
    print(f"✅ Conversion réussie - Contact ID: {contact_id}")
    
    # Vérifier que le contact est accessible
    contact_resp = requests.get(f"{BASE_URL}/crm/contacts/{contact_id}", headers=HEADERS, timeout=30)
    if contact_resp.status_code == 200:
        contact_data = contact_resp.json()
        print(f"✅ Contact accessible: {contact_data.get('email')}")
    else:
        print(f"❌ Contact inaccessible: {contact_resp.status_code}")
    
    # Vérifier le statut du prospect
    lead_after = requests.get(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS, timeout=30)
    if lead_after.status_code == 200:
        lead_data_after = lead_after.json()
        status = lead_data_after.get("status")
        converted_id = lead_data_after.get("converted_to_contact_id")
        if status == "CONVERTED":
            print(f"✅ Statut prospect: CONVERTED")
        else:
            print(f"⚠️  Statut prospect: {status} (attendu: CONVERTED)")
        if converted_id:
            print(f"✅ Référence contact: {converted_id}")
        else:
            print("⚠️  Pas de référence converted_to_contact_id")
else:
    print(f"❌ Échec conversion: {convert_resp.status_code} - {convert_resp.text}")
    contact_id = None

# =====================================================
# OBJECTIF 4: Suppression prospect
# =====================================================
print("\n" + "="*70)
print("OBJECTIF 4: Suppression prospect")
print("="*70)

# Créer un nouveau prospect pour tester la suppression
test_lead_del = {
    "email": f"delete_test_{int(time.time())}@audit.com",
    "brand_name": f"Delete Test {int(time.time())}",
    "language": "fr"
}
create_del = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead_del, timeout=30)
if create_del.status_code in [200, 201]:
    del_lead_id = create_del.json().get("lead_id")
    print(f"✅ Prospect à supprimer créé: {del_lead_id}")
    
    # Supprimer
    delete_resp = requests.delete(f"{BASE_URL}/crm/leads/{del_lead_id}", headers=HEADERS, timeout=30)
    if delete_resp.status_code in [200, 204]:
        print("✅ Suppression réussie")
        
        # Vérifier que le prospect n'existe plus
        verify = requests.get(f"{BASE_URL}/crm/leads/{del_lead_id}", headers=HEADERS, timeout=30)
        if verify.status_code == 404:
            print("✅ Vérification: prospect bien supprimé (404)")
        else:
            print(f"⚠️  Vérification: statut {verify.status_code} (attendu: 404)")
    else:
        print(f"❌ Échec suppression: {delete_resp.status_code}")
else:
    print(f"❌ Impossible de créer prospect pour test suppression")

# =====================================================
# OBJECTIF 5: Templates email
# =====================================================
print("\n" + "="*70)
print("OBJECTIF 5: Templates email")
print("="*70)

templates_resp = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp.status_code == 200:
    templates = templates_resp.json().get("templates", [])
    print(f"✅ {len(templates)} template(s) disponible(s)")
    for t in templates[:3]:
        print(f"   - {t.get('name')}: {t.get('subject')}")
else:
    print(f"❌ Échec récupération templates: {templates_resp.status_code}")

# =====================================================
# Nettoyage
# =====================================================
print("\n" + "="*70)
print("NETTOYAGE")
print("="*70)

# Supprimer le prospect test initial (converti)
requests.delete(f"{BASE_URL}/crm/leads/{lead_id}", headers=HEADERS, timeout=30)
print(f"🗑️  Prospect test supprimé: {lead_id}")

# Supprimer le contact créé
if contact_id:
    requests.delete(f"{BASE_URL}/crm/contacts/{contact_id}", headers=HEADERS, timeout=30)
    print(f"🗑️  Contact test supprimé: {contact_id}")

# =====================================================
# RÉSUMÉ
# =====================================================
print("\n" + "="*70)
print("RÉSUMÉ DU TEST")
print("="*70)
print("""
✅ = Fonctionnel
⚠️  = Partiellement fonctionnel
❌ = Non fonctionnel

Objectifs testés:
1. Liste prospects
2. Ajout notes (avec note_text)
3. Conversion prospect -> contact
4. Suppression prospect
5. Templates email

Fin du test.
""")
