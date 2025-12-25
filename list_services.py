import os
import requests

api_key = os.getenv('RENDER_API_KEY')

r = requests.get(
    'https://api.render.com/v1/services',
    headers={'Authorization': f'Bearer {api_key}'}
)

if r.status_code != 200:
    print(f"Error: {r.status_code} - {r.text}")
    exit(1)

for svc in r.json():
    service = svc.get('service', svc)
    print(f"Name: {service.get('name')}")
    print(f"  ID: {service.get('id')}")
    print(f"  Type: {service.get('type')}")
    print()
