#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Surveille le statut d'un déploiement Render."""

import json
import os
import sys
import time
import urllib.request

# Force UTF-8 pour Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def get_deploy_status(service_id, deploy_id):
    """Récupère le statut d'un déploiement."""
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY non définie", file=sys.stderr)
        sys.exit(1)
    
    req = urllib.request.Request(
        f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def main():
    if len(sys.argv) < 3:
        print("Usage: python wait_deploy.py <service_id> <deploy_id> [max_wait_seconds]")
        sys.exit(1)
    
    service_id = sys.argv[1]
    deploy_id = sys.argv[2]
    max_wait = int(sys.argv[3]) if len(sys.argv) > 3 else 600  # 10 minutes par défaut
    
    start_time = time.time()
    last_status = None
    
    print(f"Surveillance déploiement {deploy_id[:12]}...")
    
    while (time.time() - start_time) < max_wait:
        try:
            data = get_deploy_status(service_id, deploy_id)
            status = data.get('status', 'unknown')
            
            if status != last_status:
                elapsed = int(time.time() - start_time)
                print(f"[{elapsed}s] Status: {status}")
                last_status = status
            
            if status == 'live':
                print(f"✓ Déploiement réussi en {int(time.time() - start_time)}s")
                return 0
            elif status in ['build_failed', 'canceled', 'deactivated']:
                print(f"✗ Déploiement échoué: {status}", file=sys.stderr)
                return 1
            
            time.sleep(5)
            
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            return 1
    
    print(f"TIMEOUT après {max_wait}s", file=sys.stderr)
    return 1

if __name__ == '__main__':
    sys.exit(main())
