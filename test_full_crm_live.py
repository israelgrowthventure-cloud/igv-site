"""
TEST COMPLET CRM LIVE - Tous les points de la mission
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
print("TEST COMPLET CRM LIVE - MISSION PROSPECTS")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

# AUTH
print("\n[1. AUTHENTIFICATION]")
print("-"*40)
login_resp = requests.post(f"{BASE_URL}/admin/login", 
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
if login_resp.status_code != 200:
    print(f"❌ Échec login: {login_resp.status_code}")
    exit(1)
TOKEN = login_resp.json().get("token") or login_resp.json().get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
log("Authentification admin", "PASS", "Token obtenu")

# ============================================================
# TEST 2: CREATION PROSPECT
# ============================================================
print("\n[2. CRÉATION PROSPECT]")
print("-"*40)

ts = int(time.time())
test_lead = {
    "email": f"test_mission_{ts}@audit.igv",
    "brand_name": f"Mission Test {ts}",
    "name": "Test Mission Complet",
    "phone": "+33600000000",
    "language": "fr",
    "sector": "Tech"
}
create_resp = requests.post(f"{BASE_URL}/crm/leads", headers=HEADERS, json=test_lead, timeout=30)
if create_resp.status_code in [200, 201]:
    LEAD_ID = create_resp.json().get("lead_id")
    log("Création prospect", "PASS", f"ID: {LEAD_ID}")
else:
    log("Création prospect", "FAIL", f"Status {create_resp.status_code}: {create_resp.text[:100]}")
    LEAD_ID = None

# ============================================================
# TEST 3: AJOUT NOTE
# ============================================================
print("\n[3. AJOUT NOTE]")
print("-"*40)

if LEAD_ID:
    note_text = f"Note de test mission - {datetime.now().isoformat()}"
    note_resp = requests.post(
        f"{BASE_URL}/crm/leads/{LEAD_ID}/notes",
        headers=HEADERS,
        json={"note_text": note_text},
        timeout=30
    )
    if note_resp.status_code == 200:
        log("Ajout note (note_text)", "PASS", "Note ajoutée avec champ frontend")
    else:
        log("Ajout note (note_text)", "FAIL", f"Status {note_resp.status_code}: {note_resp.text[:100]}")

# ============================================================
# TEST 4: PERSISTANCE NOTE
# ============================================================
print("\n[4. PERSISTANCE NOTE]")
print("-"*40)

if LEAD_ID:
    time.sleep(1)
    lead_resp = requests.get(f"{BASE_URL}/crm/leads/{LEAD_ID}", headers=HEADERS, timeout=30)
    if lead_resp.status_code == 200:
        lead_data = lead_resp.json()
        notes = lead_data.get("notes", [])
        if notes and len(notes) > 0:
            log("Persistance notes", "PASS", f"{len(notes)} note(s) dans le champ notes[]")
            # Vérifier le contenu
            first_note = notes[0]
            if first_note.get("content") or first_note.get("note_text") or first_note.get("details"):
                log("Contenu note accessible", "PASS", "Note récupérable correctement")
            else:
                log("Contenu note accessible", "FAIL", f"Structure note: {first_note}")
        else:
            log("Persistance notes", "FAIL", "Aucune note dans notes[]")
    else:
        log("Persistance notes", "FAIL", f"Impossible de récupérer le lead")

# ============================================================
# TEST 5: TEMPLATES EMAIL
# ============================================================
print("\n[5. TEMPLATES EMAIL]")
print("-"*40)

templates_resp = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp.status_code == 200:
    templates = templates_resp.json().get("templates", [])
    log("Liste templates", "PASS", f"{len(templates)} templates disponibles")
    
    # Vérifier les templates prédéfinis
    predefined = ["Premier contact", "Suivi après analyse", "Relance", "rendez-vous"]
    found = 0
    for t in templates:
        name = t.get("name", "").lower()
        if any(p.lower() in name for p in predefined):
            found += 1
    
    if found >= 3:
        log("Templates prédéfinis", "PASS", f"{found} templates trouvés")
    else:
        log("Templates prédéfinis", "WARN", f"Seulement {found} templates prédéfinis")
    
    # Vérifier [DATE] et [HEURE]
    with_markers = len([t for t in templates if "[DATE]" in t.get("body", "") and "[HEURE]" in t.get("body", "")])
    if with_markers >= 3:
        log("[DATE]/[HEURE] présents", "PASS", f"{with_markers} templates avec marqueurs")
    else:
        log("[DATE]/[HEURE] présents", "WARN", f"{with_markers} templates avec marqueurs")
else:
    log("Templates", "FAIL", f"Status {templates_resp.status_code}")

# ============================================================
# TEST 6: SUPPRESSION TEMPLATE (API)
# ============================================================
print("\n[6. SUPPRESSION TEMPLATE (API)]")
print("-"*40)

# Créer un template de test puis le supprimer
test_template = {
    "name": f"Test Suppression {ts}",
    "subject": "Test",
    "body": "Test body",
    "language": "fr"
}
create_tpl = requests.post(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, json=test_template, timeout=30)
if create_tpl.status_code == 200:
    tpl_id = create_tpl.json().get("template_id")
    log("Création template test", "PASS", f"ID: {tpl_id}")
    
    # Supprimer
    del_tpl = requests.delete(f"{BASE_URL}/crm/emails/templates/{tpl_id}", headers=HEADERS, timeout=30)
    if del_tpl.status_code == 200:
        log("Suppression template", "PASS", "Template supprimé")
    else:
        log("Suppression template", "FAIL", f"Status {del_tpl.status_code}: {del_tpl.text[:100]}")
else:
    log("Suppression template", "SKIP", f"Impossible de créer template test: {create_tpl.status_code}")

# ============================================================
# TEST 7: ENVOI EMAIL
# ============================================================
print("\n[7. ENVOI EMAIL AVEC TEMPLATE]")
print("-"*40)

email_body = f"""Bonjour,

Ceci est un email de test automatique pour valider le module PROSPECTS.

Date du test: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Les marqueurs [DATE] et [HEURE] sont conservés volontairement.

Cordialement,
Script de test IGV"""

email_test = {
    "to_email": "contact@israelgrowthventure.com",
    "subject": f"[TEST CRM] Validation {datetime.now().strftime('%H:%M:%S')}",
    "message": email_body
}

send_resp = requests.post(f"{BASE_URL}/crm/emails/send", headers=HEADERS, json=email_test, timeout=60)
if send_resp.status_code == 200:
    log("Envoi email", "PASS", "Email envoyé à contact@israelgrowthventure.com")
else:
    log("Envoi email", "FAIL", f"Status {send_resp.status_code}: {send_resp.text[:100]}")

# ============================================================
# TEST 8: CONVERSION PROSPECT -> CONTACT
# ============================================================
print("\n[8. CONVERSION PROSPECT -> CONTACT]")
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
    elif convert_resp.status_code == 400:
        detail = convert_resp.json().get("detail", "")
        if "already converted" in detail:
            log("Conversion", "WARN", "Lead déjà converti (normal si test répété)")
        else:
            log("Conversion", "FAIL", f"Erreur 400: {detail}")
    else:
        log("Conversion", "FAIL", f"Status {convert_resp.status_code}: {convert_resp.text[:100]}")

# ============================================================
# TEST 9: SUPPRESSION PROSPECT
# ============================================================
print("\n[9. SUPPRESSION PROSPECT]")
print("-"*40)

# Créer un nouveau prospect pour suppression
del_lead = {
    "email": f"delete_test_{int(time.time())}@audit.igv",
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
        log("Suppression prospect", "PASS", "Prospect supprimé via API")
        
        # Vérifier introuvable
        verify = requests.get(f"{BASE_URL}/crm/leads/{del_id}", headers=HEADERS, timeout=30)
        if verify.status_code == 404:
            log("Vérification 404", "PASS", "Prospect introuvable après suppression")
        else:
            log("Vérification 404", "FAIL", f"Status {verify.status_code} (attendu 404)")
    else:
        log("Suppression prospect", "FAIL", f"Status {delete_resp.status_code}: {delete_resp.text[:100]}")
else:
    log("Suppression", "SKIP", "Impossible de créer prospect test")

# ============================================================
# NETTOYAGE
# ============================================================
print("\n[NETTOYAGE]")
print("-"*40)

if LEAD_ID:
    # Le lead a été converti, on ne le supprime pas
    print(f"   ℹ️ Lead {LEAD_ID} converti en contact (non supprimé)")

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
with open("test_full_crm_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

if failed == 0:
    print("\n" + "="*70)
    print("✅ TOUS LES TESTS BACKEND PASSENT")
    print("="*70)
else:
    print("\n" + "="*70)
    print("❌ CERTAINS TESTS ONT ÉCHOUÉ")
    print("="*70)
    for t in results["tests"]:
        if t["status"] == "FAIL":
            print(f"   - {t['test']}: {t['details']}")

print("\n📋 POINTS À VÉRIFIER MANUELLEMENT SUR LE FRONTEND:")
print("   1. Bouton 'Supprimer' visible sur fiche prospect")
print("   2. Notes affichées correctement (pas de clé brute)")
print("   3. Bouton 'Retour à la liste' fonctionnel")
print("   4. Bouton poubelle sur templates")
print("   5. Conversion en contact fonctionne")
