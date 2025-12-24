import os
import requests

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'

r = requests.post(
    f'https://api.render.com/v1/services/{service_id}/deploys',
    headers={'Authorization': f'Bearer {api_key}'},
    json={'clearCache': 'clear'}
)

deploy = r.json()
print(f"New deploy: {deploy['id']}")
print(f"Status: {deploy['status']}")
print(f"Commit: {deploy['commit']['id'][:8]} - {deploy['commit']['message']}")
