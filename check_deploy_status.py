import os
import requests

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'

r = requests.get(
    f'https://api.render.com/v1/services/{service_id}/deploys',
    headers={'Authorization': f'Bearer {api_key}'}
)

latest = r.json()[0]['deploy']
print(f"Latest deploy: {latest['id']}")
print(f"Status: {latest['status']}")
print(f"Commit: {latest['commit']['id'][:8]} - {latest['commit']['message']}")
print(f"CreatedAt: {latest['createdAt']}")

