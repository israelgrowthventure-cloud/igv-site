#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Récupère les logs d'un déploiement Render."""

import json
import os
import sys
import urllib.request

# Force UTF-8 pour Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def get_deploy_logs(service_id, deploy_id):
    """Récupère les logs d'un déploiement."""
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY non définie", file=sys.stderr)
        sys.exit(1)
    
    req = urllib.request.Request(
        f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}/logs',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode()}"}

def main():
    if len(sys.argv) < 3:
        print("Usage: python get_deploy_logs.py <service_id> <deploy_id>")
        sys.exit(1)
    
    service_id = sys.argv[1]
    deploy_id = sys.argv[2]
    
    logs = get_deploy_logs(service_id, deploy_id)
    
    if isinstance(logs, dict) and "error" in logs:
        print(logs["error"], file=sys.stderr)
        return 1
    
    # Afficher les logs
    if isinstance(logs, list):
        for entry in logs:
            timestamp = entry.get('timestamp', '')
            message = entry.get('message', '')
            print(f"[{timestamp}] {message}")
    else:
        print(json.dumps(logs, indent=2))
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
