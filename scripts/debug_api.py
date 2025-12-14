#!/usr/bin/env python3
import os, requests, json, sys

key = os.getenv('RENDER_API_KEY')
if not key:
    key = os.getenv('RENDER_API_TOKEN')

if not key:
    print("ERROR: No API key")
    sys.exit(1)

resp = requests.get(
    'https://api.render.com/v1/services?limit=10',
    headers={'Authorization': f'Bearer {key}', 'Accept': 'application/json'},
    timeout=30
)

print(f'Status: {resp.status_code}')
data = resp.json()
print(f'Type: {type(data).__name__}')

if isinstance(data, list):
    print(f'Length: {len(data)}')
    if len(data) > 0:
        print(f'First item keys: {list(data[0].keys())}')
        print('\n=== FIRST SERVICE ===')
        print(json.dumps(data[0], indent=2))
elif isinstance(data, dict):
    print(f'Keys: {list(data.keys())}')
    print(json.dumps(data, indent=2)[:2000])
