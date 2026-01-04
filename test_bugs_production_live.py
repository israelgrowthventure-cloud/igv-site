"""
Test des bugs en production - LIVE
Reproduction des bugs avec capture des erreurs exactes
Date: 2026-01-04
"""

import requests
import json
import sys
from datetime import datetime

# PROD URLs
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Admin credentials
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def print_test(name, success, details=""):
    status = "✅ OK" if success else "❌ FAIL"
    print(f"{status} | {name}")
    if details:
        print(f"    {details}")

def login_admin():
    """Login et récupération du token admin"""
    print_section("AUTHENTIFICATION ADMIN")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print_test("Login admin", True, f"Token obtenu (longueur: {len(token) if token else 0})")
            return token
        else:
            print_test("Login admin", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print_test("Login admin", False, str(e))
        return None

def test_mini_analyse_he_download():
    """Test Télécharger PDF en HE"""
    print_section("BUG #1: Mini-Analyse HE - Télécharger PDF")
    
    # Test data
    payload = {
        "email": "test@example.com",
        "brandName": "מותג בדיקה",
        "sector": "Restauration / Food",
        "origin": "France",
        "analysis": "זוהי אנליזה לבדיקה. טקסט עברי ארוך יותר עם מספר שורות.\n\nפסקה נוספת עם תוכן.",
        "language": "he"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/pdf/generate",
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {data.keys()}")
            
            has_pdf_url = "pdfUrl" in data
            has_pdf_base64 = "pdfBase64" in data
            
            print_test("Réponse 200", True)
            print_test("Contient pdfUrl", has_pdf_url, f"Value: {data.get('pdfUrl', 'N/A')}")
            print_test("Contient pdfBase64", has_pdf_base64, f"Length: {len(data.get('pdfBase64', '')) if has_pdf_base64 else 0}")
            
            # Le frontend vérifie pdfUrl en premier
            if not has_pdf_url and has_pdf_base64:
                print("\n⚠️  PROBLÈME DÉTECTÉ:")
                print("    Le frontend vérifie pdfUrl en premier, mais le backend ne retourne que pdfBase64")
                print("    Cela peut causer une erreur même si le PDF est généré correctement")
        else:
            print_test("Génération PDF HE", False, f"Status {response.status_code}: {response.text[:200]}")
            
    except Exception as e:
        print_test("Génération PDF HE", False, str(e))

def test_mini_analyse_he_email():
    """Test Envoyer par mail en HE"""
    print_section("BUG #2: Mini-Analyse HE - Envoyer par mail")
    
    payload = {
        "email": "test@example.com",
        "brandName": "מותג בדיקה",
        "sector": "Restauration / Food",
        "origin": "France",
        "analysis": "זוהי אנליזה לבדיקה.",
        "language": "he"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/email/send-pdf",
            json=payload,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            print_test("Envoi email HE", data.get("success", False), f"Message: {data.get('message')}")
        else:
            print_test("Envoi email HE", False, f"Status {response.status_code}: {response.text[:200]}")
            
    except Exception as e:
        print_test("Envoi email HE", False, str(e))

def test_crm_convert_prospect(token):
    """Test Conversion Prospect → Contact"""
    print_section("BUG #3: CRM - Conversion Prospect → Contact")
    
    if not token:
        print("⚠️  Impossible de tester sans token admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Récupérer un prospect
        response = requests.get(
            f"{BACKEND_URL}/api/crm/leads",
            headers=headers,
            params={"limit": 1, "status": "NEW"},
            timeout=30
        )
        
        if response.status_code != 200:
            print_test("Récupération prospect", False, f"Status {response.status_code}")
            return
        
        leads_data = response.json()
        leads = leads_data.get("leads", [])
        
        if not leads:
            print("⚠️  Aucun prospect disponible pour le test")
            return
        
        lead = leads[0]
        lead_id = lead.get("_id") or lead.get("id") or lead.get("lead_id")
        
        print(f"Prospect trouvé: {lead.get('email')}")
        print(f"  - _id: {lead.get('_id')}")
        print(f"  - id: {lead.get('id')}")
        print(f"  - lead_id: {lead.get('lead_id')}")
        print(f"  → Utilisation de: {lead_id}")
        
        # Tenter la conversion
        response = requests.post(
            f"{BACKEND_URL}/api/crm/leads/{lead_id}/convert-to-contact",
            headers=headers,
            timeout=30
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            print_test("Conversion Prospect → Contact", True, f"Contact ID: {data.get('contact_id')}")
        else:
            print_test("Conversion Prospect → Contact", False, f"Status {response.status_code}")
            
    except Exception as e:
        print_test("Conversion Prospect → Contact", False, str(e))

def test_crm_send_email(token):
    """Test Envoi email CRM"""
    print_section("BUG #4: CRM - Envoi email")
    
    if not token:
        print("⚠️  Impossible de tester sans token admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Récupérer un contact
        response = requests.get(
            f"{BACKEND_URL}/api/crm/contacts",
            headers=headers,
            params={"limit": 1},
            timeout=30
        )
        
        if response.status_code != 200:
            print_test("Récupération contact", False, f"Status {response.status_code}")
            return
        
        contacts_data = response.json()
        contacts = contacts_data.get("contacts", [])
        
        if not contacts:
            print("⚠️  Aucun contact disponible pour le test")
            return
        
        contact = contacts[0]
        contact_id = contact.get("_id") or contact.get("id") or contact.get("contact_id")
        contact_email = contact.get("email")
        
        print(f"Contact trouvé: {contact_email}")
        print(f"  - _id: {contact.get('_id')}")
        print(f"  - id: {contact.get('id')}")
        print(f"  - contact_id: {contact.get('contact_id')}")
        print(f"  → Utilisation de: {contact_id}")
        
        # Tenter l'envoi d'email
        email_payload = {
            "contact_id": contact_id,
            "to_email": contact_email,
            "subject": "Test depuis diagnostic",
            "body": "Ceci est un test d'envoi d'email depuis le CRM.",
            "template_id": None
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/crm/emails/send",
            headers=headers,
            json=email_payload,
            timeout=60
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            print_test("Envoi email CRM", data.get("success", False), f"Message: {data.get('message')}")
        else:
            print_test("Envoi email CRM", False, f"Status {response.status_code}")
            
    except Exception as e:
        print_test("Envoi email CRM", False, str(e))

def test_crm_delete_user(token):
    """Test Suppression user"""
    print_section("BUG #5: CRM - Suppression user")
    
    if not token:
        print("⚠️  Impossible de tester sans token admin")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Récupérer la liste des users
        response = requests.get(
            f"{BACKEND_URL}/api/admin/users",
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            print_test("Récupération users", False, f"Status {response.status_code}")
            return
        
        users_data = response.json()
        users = users_data.get("users", [])
        
        print(f"Nombre d'utilisateurs: {len(users)}")
        
        # Afficher la structure des IDs
        if users:
            user = users[0]
            print(f"\nStructure ID du premier user:")
            print(f"  - _id: {user.get('_id')}")
            print(f"  - id: {user.get('id')}")
            print(f"  - email: {user.get('email')}")
            
            # Ne pas supprimer réellement en test, juste montrer ce qui serait envoyé
            user_id = user.get("id")
            print(f"\n⚠️  Pour supprimer, le frontend enverrait: DELETE /api/admin/users/{user_id}")
            print("    (Test non exécuté pour éviter suppression accidentelle)")
            
    except Exception as e:
        print_test("Diagnostic suppression user", False, str(e))

def main():
    print(f"\n{'#'*80}")
    print(f"  TEST DES BUGS EN PRODUCTION - LIVE")
    print(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Backend: {BACKEND_URL}")
    print(f"{'#'*80}")
    
    # Login admin
    token = login_admin()
    
    # Tests Mini-Analyse HE
    test_mini_analyse_he_download()
    test_mini_analyse_he_email()
    
    # Tests CRM
    if token:
        test_crm_convert_prospect(token)
        test_crm_send_email(token)
        test_crm_delete_user(token)
    else:
        print("\n⚠️  Impossible de tester les fonctions CRM sans authentification")
    
    print_section("RÉSUMÉ")
    print("Les tests ont été exécutés. Consultez les résultats ci-dessus.")
    print("Les corrections seront appliquées en fonction des erreurs détectées.")

if __name__ == "__main__":
    main()
