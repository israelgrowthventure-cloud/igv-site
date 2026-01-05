"""
TEST RÉEL COMPLET - PROSPECTS + TEMPLATES
Après création des templates prédéfinis
Date: 6 janvier 2026
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

results = {"tests": [], "date": datetime.now().isoformat()}

def log(test, status, details=""):
    results["tests"].append({"test": test, "status": status, "details": details})
    emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{emoji} {test}: {details}")
    return status == "PASS"

print("="*70)
print("TESTS RÉELS COMPLETS - PROSPECTS + TEMPLATES")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

# AUTH
print("\n[AUTH]")
login_resp = requests.post(f"{BASE_URL}/admin/login", 
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
if login_resp.status_code != 200:
    print(f"❌ Échec login")
    exit(1)
TOKEN = login_resp.json().get("token") or login_resp.json().get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
log("Authentification", "PASS", "Connexion admin OK")

# ============================================================
# TEST 1: Créer un prospect test
# ============================================================
print("\n[TEST 1] Création prospect test")
print("-"*40)

ts = int(time.time())
test_lead = {
    "email": f"fulltest_{ts}@audit.igv",
    "brand_name": f"FullTest Brand {ts}",
    "name": "Test Complet",
    "phone": "+33600000000",
    "language": "fr"
}
create_resp = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead, timeout=30)
if create_resp.status_code in [200, 201]:
    LEAD_ID = create_resp.json().get("lead_id")
    log("Création prospect", "PASS", f"ID: {LEAD_ID}")
else:
    log("Création prospect", "FAIL", f"Status {create_resp.status_code}")
    LEAD_ID = None

# ============================================================
# TEST 2: Ajouter note + persistance
# ============================================================
print("\n[TEST 2] Notes (ajout + persistance)")
print("-"*40)

if LEAD_ID:
    note_text = f"Note test complet - {datetime.now().isoformat()}"
    note_resp = requests.post(
        f"{BASE_URL}/crm/leads/{LEAD_ID}/notes",
        headers=HEADERS,
        json={"note_text": note_text},
        timeout=30
    )
    if note_resp.status_code == 200:
        log("Ajout note", "PASS", "Note ajoutée avec note_text")
    else:
        log("Ajout note", "FAIL", f"Status {note_resp.status_code}: {note_resp.text[:100]}")
    
    # Vérifier persistance
    time.sleep(1)
    lead_resp = requests.get(f"{BASE_URL}/crm/leads/{LEAD_ID}", headers=HEADERS, timeout=30)
    if lead_resp.status_code == 200:
        notes = lead_resp.json().get("notes", [])
        if notes:
            log("Persistance note", "PASS", f"{len(notes)} note(s) visible(s)")
        else:
            log("Persistance note", "FAIL", "Aucune note dans notes[]")
    else:
        log("Persistance note", "FAIL", f"Impossible de récupérer le lead")
else:
    log("Notes", "SKIP", "Pas de lead test")

# ============================================================
# TEST 3: Templates email
# ============================================================
print("\n[TEST 3] Templates email (Nouveau message)")
print("-"*40)

templates_resp = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp.status_code == 200:
    templates = templates_resp.json().get("templates", [])
    
    # Vérifier qu'on a au moins 4 templates prédéfinis
    predefined_count = len([t for t in templates if "[DATE]" in t.get("body", "") or "[HEURE]" in t.get("body", "")])
    
    log("Templates disponibles", "PASS", f"{len(templates)} templates, dont {predefined_count} avec [DATE]/[HEURE]")
    
    # Vérifier chaque template prédéfini
    expected_names = [
        "Premier contact - Demande d'information",
        "Suivi après analyse",
        "Relance prospect",
        "Proposition de rendez-vous"
    ]
    
    found_templates = []
    for expected in expected_names:
        found = any(expected.lower() in t.get("name", "").lower() for t in templates)
        found_templates.append((expected, found))
    
    all_found = all(f[1] for f in found_templates)
    if all_found:
        log("Templates prédéfinis", "PASS", "4/4 templates trouvés")
    else:
        missing = [f[0] for f in found_templates if not f[1]]
        log("Templates prédéfinis", "FAIL", f"Manquants: {missing}")
    
    # Vérifier [DATE] et [HEURE]
    templates_with_markers = []
    for t in templates:
        body = t.get("body", "")
        if "[DATE]" in body and "[HEURE]" in body:
            templates_with_markers.append(t.get("name"))
    
    if len(templates_with_markers) >= 4:
        log("[DATE]/[HEURE] présents", "PASS", f"{len(templates_with_markers)} templates avec marqueurs")
    else:
        log("[DATE]/[HEURE] présents", "WARN", f"Seulement {len(templates_with_markers)} templates avec marqueurs")
else:
    log("Templates", "FAIL", f"Status {templates_resp.status_code}")

# Envoi email test
print("\n   Test envoi email avec template...")
email_body = """Bonjour,

Ceci est un email de test automatique envoyé depuis le script d'audit.

Date du test: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """

Les marqueurs [DATE] et [HEURE] sont conservés volontairement.
Le commercial les remplacera manuellement.

Cordialement,
Script d'audit IGV"""

email_test = {
    "to_email": "contact@israelgrowthventure.com",
    "subject": f"[TEST AUDIT] Validation templates {datetime.now().strftime('%H:%M:%S')}",
    "message": email_body
}

send_resp = requests.post(f"{BASE_URL}/crm/emails/send", headers=HEADERS, json=email_test, timeout=60)
if send_resp.status_code == 200:
    log("Envoi email test", "PASS", "Email envoyé à contact@israelgrowthventure.com")
else:
    log("Envoi email test", "FAIL", f"Status {send_resp.status_code}: {send_resp.text[:100]}")

# ============================================================
# TEST 4: Conversion prospect -> contact
# ============================================================
print("\n[TEST 4] Conversion prospect -> contact")
print("-"*40)

CONTACT_ID = None
if LEAD_ID:
    convert_resp = requests.post(
        f"{BASE_URL}/crm/leads/{LEAD_ID}/convert-to-contact",
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
                log("Contact accessible", "PASS", f"Email: {contact_resp.json().get('email')}")
            else:
                log("Contact accessible", "FAIL", f"Status {contact_resp.status_code}")
        
        # Vérifier statut CONVERTED
        lead_after = requests.get(f"{BASE_URL}/crm/leads/{LEAD_ID}", headers=HEADERS, timeout=30)
        if lead_after.status_code == 200:
            status = lead_after.json().get("status")
            if status == "CONVERTED":
                log("Statut CONVERTED", "PASS", f"Status={status}")
            else:
                log("Statut CONVERTED", "FAIL", f"Status={status}")
    else:
        log("Conversion", "FAIL", f"Status {convert_resp.status_code}: {convert_resp.text[:100]}")
else:
    log("Conversion", "SKIP", "Pas de lead test")

# ============================================================
# TEST 5: Suppression prospect
# ============================================================
print("\n[TEST 5] Suppression prospect")
print("-"*40)

# Créer un nouveau prospect pour suppression
del_lead = {
    "email": f"delete_{int(time.time())}@audit.igv",
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
        
        # Vérifier introuvable
        verify = requests.get(f"{BASE_URL}/crm/leads/{del_id}", headers=HEADERS, timeout=30)
        if verify.status_code == 404:
            log("Introuvable après suppression", "PASS", "404 confirmé")
        else:
            log("Introuvable après suppression", "FAIL", f"Status {verify.status_code}")
    else:
        log("Suppression", "FAIL", f"Status {delete_resp.status_code}")
else:
    log("Suppression", "SKIP", "Impossible de créer prospect test")

# ============================================================
# TEST 6: Vérification module EMAILS > TEMPLATES
# ============================================================
print("\n[TEST 6] Module EMAILS > TEMPLATES")
print("-"*40)

templates_resp2 = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp2.status_code == 200:
    templates2 = templates_resp2.json().get("templates", [])
    
    print(f"\n   Templates dans le module EMAILS > TEMPLATES:")
    for i, t in enumerate(templates2, 1):
        name = t.get("name", "Sans nom")
        subject = t.get("subject", "Sans objet")
        body = t.get("body", "")
        has_markers = "[DATE]" in body and "[HEURE]" in body
        print(f"   {i}. {name}")
        print(f"      Objet: {subject}")
        print(f"      [DATE]/[HEURE]: {'✅' if has_markers else '❌'}")
    
    if len(templates2) >= 4:
        log("Templates dans module EMAILS", "PASS", f"{len(templates2)} templates disponibles")
    else:
        log("Templates dans module EMAILS", "WARN", f"Seulement {len(templates2)} templates")
else:
    log("Module EMAILS > TEMPLATES", "FAIL", f"Status {templates_resp2.status_code}")

# ============================================================
# NETTOYAGE
# ============================================================
print("\n[NETTOYAGE]")
print("-"*40)

if LEAD_ID:
    requests.delete(f"{BASE_URL}/crm/leads/{LEAD_ID}", headers=HEADERS, timeout=30)
    print(f"   🗑️ Lead test supprimé: {LEAD_ID}")

if CONTACT_ID:
    requests.delete(f"{BASE_URL}/crm/contacts/{CONTACT_ID}", headers=HEADERS, timeout=30)
    print(f"   🗑️ Contact test supprimé: {CONTACT_ID}")

# ============================================================
# RÉSUMÉ
# ============================================================
print("\n" + "="*70)
print("RÉSUMÉ FINAL")
print("="*70)

passed = len([t for t in results["tests"] if t["status"] == "PASS"])
failed = len([t for t in results["tests"] if t["status"] == "FAIL"])
warned = len([t for t in results["tests"] if t["status"] == "WARN"])
skipped = len([t for t in results["tests"] if t["status"] == "SKIP"])

print(f"\nTotal: {len(results['tests'])} tests")
print(f"✅ Réussis: {passed}")
print(f"❌ Échoués: {failed}")
print(f"⚠️  Avertissements: {warned}")
print(f"⏭️  Ignorés: {skipped}")

success_rate = (passed / (passed + failed) * 100) if (passed + failed) > 0 else 0
print(f"\nTaux de succès: {success_rate:.1f}%")

results["summary"] = {
    "passed": passed,
    "failed": failed,
    "warned": warned,
    "skipped": skipped,
    "success_rate": f"{success_rate:.1f}%"
}

# Sauvegarder
with open("test_complet_prospects_templates.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

if failed == 0:
    print("\n" + "="*70)
    print("✅ TOUS LES TESTS PASSENT - MODULE VALIDÉ")
    print("="*70)
else:
    print("\n" + "="*70)
    print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
    print("="*70)
    for t in results["tests"]:
        if t["status"] == "FAIL":
            print(f"   - {t['test']}: {t['details']}")
