import requests
import time

timestamp = int(time.time())

print("🧪 Test envoi email avec variables SMTP configurées...")

response = requests.post(
    'https://igv-cms-backend.onrender.com/api/mini-analysis',
    json={
        'nom_de_marque': f'Test Email {timestamp}',
        'secteur': 'Restauration',
        'statut_alimentaire': 'Kasher',
        'email': 'israel.growth.venture@gmail.com',
        'telephone': '+972501234567',
        'first_name': 'Email',
        'last_name': 'Test',
        'emplacements_possibles': 'Tel Aviv',
        'autres_activites': 'Traiteur',
        'public_cible': 'Familles',
        'language': 'fr'
    }
)

print(f"\nStatus Code: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"✅ Success: {data.get('success')}")
    print(f"📧 Email sent: {data.get('email_sent')}")
    print(f"📧 Email status: {data.get('email_status')}")
    print(f"📄 PDF URL présent: {bool(data.get('pdf_url'))}")
    print(f"🎯 Lead ID: {data.get('lead_id')}")
    
    if data.get('email_sent'):
        print("\n✅ EMAIL ENVOYÉ AVEC SUCCÈS!")
    else:
        print(f"\n❌ Email non envoyé - Vérifier les logs backend")
else:
    print(f"❌ Error: {response.text}")
