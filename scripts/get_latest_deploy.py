import os, requests
key = os.getenv('RENDER_API_KEY')
resp = requests.get(
    'https://api.render.com/v1/services/srv-d4no5dc9c44c73d1opgg/deploys?limit=1',
    headers={'Authorization': f'Bearer {key}'}
)
data = resp.json()
if isinstance(data, list) and len(data) > 0:
    latest = data[0].get('deploy', data[0])
else:
    latest = data
print(f"Deploy ID: {latest.get('id', 'N/A')}")
print(f"Status: {latest.get('status', 'N/A')}")
print(f"Commit: {latest.get('commit', {}).get('id', 'N/A')[:8]}")
