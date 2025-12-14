#!/usr/bin/env python3
"""Récupère les détails d'un service Render spécifique."""

import json
import os
import sys
import urllib.request

def get_service_details(service_id):
    """Récupère les détails d'un service."""
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY non définie", file=sys.stderr)
        sys.exit(1)
    
    req = urllib.request.Request(
        f'https://api.render.com/v1/services/{service_id}',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def main():
    if len(sys.argv) < 2:
        print("Usage: python get_service_details.py <service_id>")
        sys.exit(1)
    
    service_id = sys.argv[1]
    data = get_service_details(service_id)
    
    print(json.dumps(data, indent=2))
    return 0

if __name__ == '__main__':
    sys.exit(main())
