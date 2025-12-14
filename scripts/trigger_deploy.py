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
    # Lecture clé avec fallback
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        api_key = os.getenv('RENDER_API_TOKEN')  # Fallback ancien nom
        if api_key:
            print("WARN: Fallback RENDER_API_TOKEN utilisé (préférer RENDER_API_KEY)", file=sys.stderr)
    
    if not api_key:
        print("ERROR: RENDER_API_KEY manquant (ni RENDER_API_KEY ni RENDER_API_TOKEN)", file=sys.stderr)
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
            body = resp.read()
            if not body or len(body) == 0:
                print("✓ Déploiement créé (pas de réponse API)", file=sys.stderr)
                return {"status": "triggered"}
            result = json.loads(body)
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
