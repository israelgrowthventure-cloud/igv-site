#!/usr/bin/env python3
"""Identifie les services Render IGV et extrait leurs URLs publiques."""

import json
import os
import sys
import urllib.request

def get_render_services():
    """Récupère la liste complète des services Render."""
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY non définie", file=sys.stderr)
        sys.exit(1)
    
    req = urllib.request.Request(
        'https://api.render.com/v1/services',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def extract_service_info(service_list):
    """Extrait les infos des services IGV."""
    igv_services = {}
    
    for item in service_list:
        svc = item.get('service', {})
        name = svc.get('name', '')
        
        if 'igv' not in name.lower():
            continue
        
        service_id = svc.get('id')
        service_type = svc.get('type')
        details = svc.get('serviceDetails', {})
        
        # URLs possibles
        url = details.get('url') or svc.get('dashboardUrl')
        
        # Domaines custom
        custom_domains = []
        if service_type == 'static_site':
            for domain in details.get('customDomains', []):
                if isinstance(domain, dict):
                    custom_domains.append(domain.get('domain'))
                else:
                    custom_domains.append(domain)
        
        igv_services[name] = {
            'id': service_id,
            'type': service_type,
            'url': url,
            'custom_domains': custom_domains
        }
    
    return igv_services

def main():
    services = get_render_services()
    igv = extract_service_info(services)
    
    print("=== Services IGV Render ===\n")
    
    for name, info in igv.items():
        print(f"Service: {name}")
        print(f"  ID: {info['id']}")
        print(f"  Type: {info['type']}")
        print(f"  URL: {info['url']}")
        if info['custom_domains']:
            print(f"  Domaines custom: {', '.join(info['custom_domains'])}")
        print()
    
    # Identifier le frontend
    frontend = None
    for name, info in igv.items():
        if 'frontend' in name.lower() or info['type'] == 'static_site':
            frontend = info
            break
    
    if frontend:
        print("\n=== Frontend identifié ===")
        print(f"URL production: {frontend['custom_domains'][0] if frontend['custom_domains'] else frontend['url']}")
    else:
        print("\nWARNING: Frontend non identifié", file=sys.stderr)
    
    return 0 if frontend else 1

if __name__ == '__main__':
    sys.exit(main())
