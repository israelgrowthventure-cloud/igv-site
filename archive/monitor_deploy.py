import os
import requests
import time

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'
deploy_id = 'dep-d4v9o0mmcj7s73dim0i0'

print(f"Monitoring deploy {deploy_id}...")
for i in range(60):
    r = requests.get(
        f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    status = r.json()['status']
    print(f"[{time.strftime('%H:%M:%S')}] Status: {status}")
    
    if status == 'live':
        print("✅ DEPLOY LIVE!")
        break
    if 'failed' in status:
        print("❌ DEPLOY FAILED!")
        break
    
    time.sleep(10)
