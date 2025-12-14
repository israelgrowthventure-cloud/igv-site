#!/usr/bin/env python3
import os
import urllib.request
import json

api_key = os.getenv('RENDER_API_KEY')
req = urllib.request.Request('https://api.render.com/v1/services', headers={'Authorization': f'Bearer {api_key}'})
resp = urllib.request.urlopen(req)
services = json.loads(resp.read())

print("Services IGV:")
for s in services:
    svc = s['service']
    if 'igv' in svc['name'].lower():
        print(f"  {svc['name']}: {svc['id']} ({svc['type']}) - {svc.get('serviceDetails', {}).get('url', 'N/A')}")
