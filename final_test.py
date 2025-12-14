import os
import requests
import time

api_key = os.getenv('RENDER_API_KEY')
service_id = 'srv-d4ka5q63jp1c738n6b2g'
deploy_id = 'dep-d4v9ul0gjchc73co6ndg'

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
        print("\nWaiting 30s for CDN propagation...")
        time.sleep(30)
        
        # Test production
        print("\n=== TESTING PRODUCTION ===")
        html = requests.get('https://israelgrowthventure.com/').text
        import re
        match = re.search(r'main\.([a-z0-9]+)\.js', html)
        if match:
            hash_found = match.group(1)
            print(f"Hash found: {hash_found}")
            
            # Download JS and check for Future
            js_url = f'https://israelgrowthventure.com/static/js/main.{hash_found}.js'
            js = requests.get(js_url).text
            if 'Future' in js:
                print("❌ JS contains 'Future' - STILL BROKEN")
            else:
                print("✅ JS OK, no 'Future' - SUCCESS!")
        break
    if 'failed' in status:
        print("❌ DEPLOY FAILED!")
        break
    
    time.sleep(10)
