"""
Test envoi email CRM en PRODUCTION
"""
import requests
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL = "postmaster@israelgrowthventure.com"
PASSWORD = "Admin@igv2025#"

print("=" * 80)
print("TEST ENVOI EMAIL CRM")
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

# Envoyer un email de test
print("\n[2] Envoi email CRM...")

email_payload = {
    "to_email": "contact@israelgrowthventure.com",
    "subject": "Test Email CRM - Vérification Fonctionnement",
    "message": "Ceci est un email de test envoyé depuis le CRM IGV.\n\nSi vous recevez cet email, le système d'envoi fonctionne correctement.\n\nCordialement,\nIGV Team",
    "contact_id": None
}

print(f"\nPayload:")
print(f"  To: {email_payload['to_email']}")
print(f"  Subject: {email_payload['subject']}")
print(f"  Message length: {len(email_payload['message'])} chars")

send_response = requests.post(
    f"{BACKEND_URL}/api/crm/emails/send",
    headers=headers,
    json=email_payload,
    timeout=30
)

print(f"\nStatus: {send_response.status_code}")
print(f"Response: {send_response.text}")

if send_response.status_code == 200:
    data = send_response.json()
    print(f"\n✅ EMAIL ENVOYÉ AVEC SUCCÈS!")
    print(f"   Message: {data.get('message')}")
    print(f"   Success: {data.get('success')}")
else:
    print(f"\n❌ ÉCHEC ENVOI EMAIL")
    try:
        error = send_response.json()
        print(f"   Detail: {error.get('detail')}")
    except:
        pass

print("\n" + "=" * 80)
