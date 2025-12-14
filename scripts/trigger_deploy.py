#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Déclenche un déploiement manuel d'un service Render."""

import json
import os
import sys
import urllib.request

# Force UTF-8 pour Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def trigger_deploy(service_id):
    """Déclenche un déploiement manuel."""
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY non définie", file=sys.stderr)
        sys.exit(1)
    
    req = urllib.request.Request(
        f'https://api.render.com/v1/services/{service_id}/deploys',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        data=json.dumps({'clearCache': 'clear'}).encode(),
        method='POST'
    )
    
    print(f"Déclenchement déploiement service {service_id}...")
    
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            deploy_id = result.get('id', 'unknown')
            status = result.get('status', 'unknown')
            print(f"✓ Déploiement créé: {deploy_id} (status: {status})")
            return result
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"ERROR: {e.code} - {body}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python trigger_deploy.py <service_id>")
        sys.exit(1)
    
    service_id = sys.argv[1]
    result = trigger_deploy(service_id)
    print(json.dumps(result, indent=2))
    return 0

if __name__ == '__main__':
    sys.exit(main())
