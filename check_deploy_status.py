import os
import requests
import json

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'

r = requests.get(
    f'https://api.render.com/v1/services/{service_id}/deploys',
    headers={'Authorization': f'Bearer {api_key}'}
)

data = r.json()
print("Response structure:")
print(json.dumps(data, indent=2)[:1500])  # First 1500 chars
