import requests
import json

# Login
login = requests.post('https://igv-cms-backend.onrender.com/api/admin/login', 
    json={'email': 'postmaster@israelgrowthventure.com', 'password': 'Admin@igv2025#'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Test email CRM avec une VRAIE adresse
payload = {
    'contact_id': '6959d8a7e6cb5fd535a33a08',
    'to_email': 'contact@israelgrowthventure.com',
    'subject': 'Test CRM apres correction bug',
    'message': 'Ceci est un test de validation. Le bug est corrige : le champ message est maintenant envoye correctement.',
    'template_id': None
}

print('Envoi email CRM a contact@israelgrowthventure.com...\n')
print('Payload:', json.dumps(payload, indent=2, ensure_ascii=False))

response = requests.post('https://igv-cms-backend.onrender.com/api/crm/emails/send',
    headers=headers, json=payload, timeout=60)

print(f'\nStatus Code: {response.status_code}')
print(f'Response: {response.text}')

if response.status_code == 200:
    print('\nTEST REUSSI: Email CRM envoye avec succes!')
    print('Verifiez inbox de contact@israelgrowthventure.com')
else:
    print(f'\nTEST ECHOUE: {response.status_code}')
