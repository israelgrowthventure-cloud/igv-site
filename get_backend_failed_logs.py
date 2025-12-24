import os
import httpx

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'  # Backend
deploy_id = 'dep-d566ta63jp1c73eo3010'   # Failed deploy

url = f"https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}/logs"

response = httpx.get(
    url,
    headers={'Authorization': f'Bearer {api_key}'},
    timeout=30.0
)

if response.status_code == 200:
    logs = response.text
    print("=== BACKEND DEPLOY LOGS (last 100 lines) ===")
    lines = logs.split('\n')
    for line in lines[-100:]:
        print(line)
else:
    print(f"Error {response.status_code}: {response.text}")
