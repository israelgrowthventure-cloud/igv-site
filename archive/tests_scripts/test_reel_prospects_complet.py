"""
TEST RÉEL COMPLET - MODULE PROSPECTS
Tests sur https://igv-cms-backend.onrender.com/api (production)
Date: 6 janvier 2026
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

results = {
    "date": datetime.now().isoformat(),
    "tests": [],
    "summary": {}
}

def log(test_name, status, details=""):
    result = {"test": test_name, "status": status, "details": details}
    results["tests"].append(result)
    emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{emoji} {test_name}: {details}")
    return status == "PASS"

print("="*70)
print("TESTS RÉELS - MODULE PROSPECTS")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"API: {BASE_URL}")
print("="*70)

# ============================================================
# AUTH
# ============================================================
print("\n[1/7] AUTHENTIFICATION")
print("-"*40)

login_resp = requests.post(f"{BASE_URL}/admin/login", 
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)

if login_resp.status_code == 200:
    TOKEN = login_resp.json().get("token") or login_resp.json().get("access_token")
    HEADERS = {"Authorization": f"Bearer {TOKEN}"}
    log("Auth", "PASS", "Connexion admin OK")
else:
    log("Auth", "FAIL", f"Échec login: {login_resp.status_code}")
    print(json.dumps(results, indent=2))
    exit(1)

# ============================================================
# TEST 1: LISTE PROSPECTS
# ============================================================
print("\n[2/7] LISTE PROSPECTS")
print("-"*40)

# Liste
leads_resp = requests.get(f"{BASE_URL}/crm/leads", headers=HEADERS, timeout=30)
if leads_resp.status_code == 200:
    leads_data = leads_resp.json()
    log("Liste prospects", "PASS", f"{leads_data.get('total', 0)} prospects")
else:
    log("Liste prospects", "FAIL", f"Status {leads_resp.status_code}")

# Recherche
search_resp = requests.get(f"{BASE_URL}/crm/leads?search=test", headers=HEADERS, timeout=30)
if search_resp.status_code == 200:
    log("Recherche", "PASS", f"{search_resp.json().get('total', 0)} résultats pour 'test'")
else:
    log("Recherche", "FAIL", f"Status {search_resp.status_code}")

# Export CSV
export_resp = requests.get(f"{BASE_URL}/crm/leads/export/csv", headers=HEADERS, timeout=30)
if export_resp.status_code == 200:
    csv_data = export_resp.json()
    log("Export CSV", "PASS", f"{csv_data.get('count', 0)} lignes exportées")
else:
    log("Export CSV", "FAIL", f"Status {export_resp.status_code}")

# Création prospect test
test_ts = int(time.time())
test_lead = {
    "email": f"audit_reel_{test_ts}@test.igv",
    "brand_name": f"Audit Réel {test_ts}",
    "name": "Test Audit Réel",
    "phone": "+33600000000",
    "language": "fr"
}
create_resp = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead, timeout=30)
if create_resp.status_code in [200, 201]:
    TEST_LEAD_ID = create_resp.json().get("lead_id")
    log("Création prospect", "PASS", f"ID: {TEST_LEAD_ID}")
else:
    log("Création prospect", "FAIL", f"Status {create_resp.status_code}: {create_resp.text[:200]}")
    TEST_LEAD_ID = None

# ============================================================
# TEST 2: NOTES
# ============================================================
print("\n[3/7] NOTES")
print("-"*40)

if TEST_LEAD_ID:
    # Ajouter note avec note_text (format frontend)
    note_content = f"Note audit réel - {datetime.now().isoformat()}"
    note_resp = requests.post(
        f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}/notes",
        headers=HEADERS,
        json={"note_text": note_content},
        timeout=30
    )
    if note_resp.status_code == 200:
        log("Ajout note (note_text)", "PASS", "Note ajoutée")
    else:
        log("Ajout note (note_text)", "FAIL", f"Status {note_resp.status_code}: {note_resp.text[:200]}")
    
    # Vérifier persistance
    time.sleep(1)
    lead_detail = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS, timeout=30)
    if lead_detail.status_code == 200:
        lead_data = lead_detail.json()
        notes = lead_data.get("notes", [])
        if notes and len(notes) > 0:
            log("Persistance notes", "PASS", f"{len(notes)} note(s) - '{notes[0].get('note_text', '')[:40]}...'")
        else:
            # Vérifier dans activities
            activities = lead_data.get("activities", [])
            note_acts = [a for a in activities if a.get("type") == "note"]
            if note_acts:
                log("Persistance notes", "WARN", f"Notes dans activities ({len(note_acts)}) mais pas dans notes[]")
            else:
                log("Persistance notes", "FAIL", "Aucune note trouvée")
    else:
        log("Persistance notes", "FAIL", f"Impossible de récupérer le lead: {lead_detail.status_code}")
else:
    log("Notes", "SKIP", "Pas de lead test")

# ============================================================
# TEST 3: CONVERSION PROSPECT -> CONTACT
# ============================================================
print("\n[4/7] CONVERSION PROSPECT -> CONTACT")
print("-"*40)

CONTACT_ID = None
if TEST_LEAD_ID:
    convert_resp = requests.post(
        f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}/convert-to-contact",
        headers=HEADERS,
        timeout=30
    )
    if convert_resp.status_code == 200:
        convert_data = convert_resp.json()
        CONTACT_ID = convert_data.get("contact_id")
        log("Conversion", "PASS", f"Contact ID: {CONTACT_ID}")
        
        # Vérifier contact accessible
        if CONTACT_ID:
            contact_resp = requests.get(f"{BASE_URL}/crm/contacts/{CONTACT_ID}", headers=HEADERS, timeout=30)
            if contact_resp.status_code == 200:
                contact_data = contact_resp.json()
                log("Contact accessible", "PASS", f"Email: {contact_data.get('email')}")
            else:
                log("Contact accessible", "FAIL", f"Status {contact_resp.status_code}")
        
        # Vérifier statut prospect
        lead_after = requests.get(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS, timeout=30)
        if lead_after.status_code == 200:
            lead_status = lead_after.json().get("status")
            converted_ref = lead_after.json().get("converted_to_contact_id")
            if lead_status == "CONVERTED":
                log("Statut CONVERTED", "PASS", f"Status={lead_status}, ref={converted_ref}")
            else:
                log("Statut CONVERTED", "FAIL", f"Status={lead_status} (attendu: CONVERTED)")
        else:
            log("Statut CONVERTED", "FAIL", "Impossible de vérifier")
    else:
        log("Conversion", "FAIL", f"Status {convert_resp.status_code}: {convert_resp.text[:200]}")
else:
    log("Conversion", "SKIP", "Pas de lead test")

# ============================================================
# TEST 4: EMAIL TEMPLATES
# ============================================================
print("\n[5/7] EMAIL TEMPLATES")
print("-"*40)

templates_resp = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp.status_code == 200:
    templates = templates_resp.json().get("templates", [])
    log("Templates disponibles", "PASS", f"{len(templates)} template(s)")
    
    for t in templates:
        body = t.get("body", "")
        has_date = "[DATE]" in body
        has_heure = "[HEURE]" in body
        has_placeholders = "{{" in body
        print(f"   Template: {t.get('name')}")
        print(f"   - [DATE] présent: {has_date}")
        print(f"   - [HEURE] présent: {has_heure}")
        print(f"   - Variables {{}}: {has_placeholders}")
else:
    log("Templates", "FAIL", f"Status {templates_resp.status_code}")

# Test envoi email (vers contact@israelgrowthventure.com)
print("\n   Test envoi email...")
email_test = {
    "to_email": "contact@israelgrowthventure.com",
    "subject": f"[TEST AUDIT] Email test {datetime.now().strftime('%H:%M:%S')}",
    "message": f"""Ceci est un email de test automatique.
    
Date du test: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Module testé: PROSPECTS

[DATE] et [HEURE] sont laissés volontairement pour saisie manuelle.

Cordialement,
Script d'audit automatique"""
}

send_resp = requests.post(f"{BASE_URL}/crm/emails/send", headers=HEADERS, json=email_test, timeout=60)
if send_resp.status_code == 200:
    log("Envoi email test", "PASS", f"Email envoyé à contact@israelgrowthventure.com")
else:
    log("Envoi email test", "FAIL", f"Status {send_resp.status_code}: {send_resp.text[:200]}")

# ============================================================
# TEST 5: SUPPRESSION PROSPECT
# ============================================================
print("\n[6/7] SUPPRESSION PROSPECT")
print("-"*40)

# Créer un prospect pour le supprimer
del_lead = {
    "email": f"delete_test_{int(time.time())}@test.igv",
    "brand_name": f"Delete Test {int(time.time())}",
    "language": "fr"
}
create_del = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=del_lead, timeout=30)
if create_del.status_code in [200, 201]:
    del_id = create_del.json().get("lead_id")
    log("Création pour suppression", "PASS", f"ID: {del_id}")
    
    # Supprimer
    delete_resp = requests.delete(f"{BASE_URL}/crm/leads/{del_id}", headers=HEADERS, timeout=30)
    if delete_resp.status_code in [200, 204]:
        log("Suppression", "PASS", "Prospect supprimé")
        
        # Vérifier disparition
        verify = requests.get(f"{BASE_URL}/crm/leads/{del_id}", headers=HEADERS, timeout=30)
        if verify.status_code == 404:
            log("Vérification suppression", "PASS", "Prospect introuvable (404)")
        else:
            log("Vérification suppression", "FAIL", f"Status {verify.status_code} (attendu: 404)")
    else:
        log("Suppression", "FAIL", f"Status {delete_resp.status_code}")
else:
    log("Suppression", "SKIP", "Impossible de créer prospect test")

# ============================================================
# NETTOYAGE
# ============================================================
print("\n[7/7] NETTOYAGE")
print("-"*40)

if TEST_LEAD_ID:
    requests.delete(f"{BASE_URL}/crm/leads/{TEST_LEAD_ID}", headers=HEADERS, timeout=30)
    print(f"   🗑️ Lead test supprimé: {TEST_LEAD_ID}")

if CONTACT_ID:
    requests.delete(f"{BASE_URL}/crm/contacts/{CONTACT_ID}", headers=HEADERS, timeout=30)
    print(f"   🗑️ Contact test supprimé: {CONTACT_ID}")

# ============================================================
# RÉSUMÉ
# ============================================================
print("\n" + "="*70)
print("RÉSUMÉ")
print("="*70)

passed = len([t for t in results["tests"] if t["status"] == "PASS"])
failed = len([t for t in results["tests"] if t["status"] == "FAIL"])
warned = len([t for t in results["tests"] if t["status"] == "WARN"])
skipped = len([t for t in results["tests"] if t["status"] == "SKIP"])

results["summary"] = {
    "total": len(results["tests"]),
    "passed": passed,
    "failed": failed,
    "warned": warned,
    "skipped": skipped,
    "success_rate": f"{(passed/(passed+failed)*100):.1f}%" if (passed+failed) > 0 else "N/A"
}

print(f"Total: {len(results['tests'])} tests")
print(f"✅ Réussis: {passed}")
print(f"❌ Échoués: {failed}")
print(f"⚠️  Avertissements: {warned}")
print(f"⏭️  Ignorés: {skipped}")
print(f"\nTaux de succès: {results['summary']['success_rate']}")

# Sauvegarder
with open("test_reel_prospects_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n📄 Résultats sauvegardés dans test_reel_prospects_results.json")

if failed > 0:
    print("\n❌ TESTS ÉCHOUÉS - CORRECTIONS NÉCESSAIRES")
    for t in results["tests"]:
        if t["status"] == "FAIL":
            print(f"   - {t['test']}: {t['details']}")
else:
    print("\n✅ TOUS LES TESTS PASSENT")
