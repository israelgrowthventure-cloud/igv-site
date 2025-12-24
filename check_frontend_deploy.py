import os
import requests

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4no5dc9c44c73d1opgg'  # igv-site-web (frontend)

r = requests.get(
    f'https://api.render.com/v1/services/{service_id}/deploys',
    headers={'Authorization': f'Bearer {api_key}'}
)

latest = r.json()[0]['deploy']
print(f"Frontend Deploy ID: {latest['id']}")
print(f"Status: {latest['status']}")
print(f"Commit: {latest['commit']['id'][:8]} - {latest['commit']['message']}")
print(f"CreatedAt: {latest['createdAt']}")
