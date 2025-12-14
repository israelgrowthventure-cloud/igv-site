#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Render Inventory - Liste tous les services + mapping domaine->service
Source of Truth pour deployment IGV V3
"""
import os
import sys
import json
import requests
from datetime import datetime, timezone

# Force UTF-8 sur Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Lecture clé Render avec fallback
RENDER_API_KEY = os.getenv('RENDER_API_KEY')
if not RENDER_API_KEY:
    RENDER_API_KEY = os.getenv('RENDER_API_TOKEN')  # Fallback ancien nom
    if RENDER_API_KEY:
        print("WARN: Fallback RENDER_API_TOKEN utilise (preferer RENDER_API_KEY)")

if not RENDER_API_KEY:
    print("ERREUR: RENDER_API_KEY manquant (ni RENDER_API_KEY ni RENDER_API_TOKEN)")
    sys.exit(1)

HEADERS = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Accept': 'application/json'
}

def get_all_services():
    """Recupere tous les services Render"""
    url = 'https://api.render.com/v1/services'
    params = {'limit': 100}
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        # API Render retourne liste de {cursor, service}
        if isinstance(data, list):
            # Extraire les objets 'service' de chaque item
            return [item['service'] for item in data if 'service' in item]
        elif isinstance(data, dict):
            # Fallback si format change
            return data.get('services', [])
        return []
    except requests.exceptions.RequestException as e:
        print(f"ERREUR API services: {e}")
        return []

def get_service_details(service_id):
    """Recupere details + domaines pour un service"""
    url = f'https://api.render.com/v1/services/{service_id}'
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        details = resp.json()
        
        # Récupérer custom domains via endpoint dédié
        try:
            domains_resp = requests.get(
                f'https://api.render.com/v1/services/{service_id}/custom-domains',
                headers=HEADERS,
                timeout=30
            )
            if domains_resp.status_code == 200:
                domains_data = domains_resp.json()
                if isinstance(domains_data, list):
                    custom_domains = [
                        item['customDomain']['name']
                        for item in domains_data
                        if 'customDomain' in item and 'name' in item['customDomain']
                    ]
                    details['customDomains'] = custom_domains
        except:
            pass  # Ignore erreurs custom domains
        
        return details
    except requests.exceptions.RequestException as e:
        print(f"WARN: Details {service_id} inaccessibles: {e}")
        return {}

def get_latest_deploy(service_id):
    """Recupere dernier deploy successful"""
    url = f'https://api.render.com/v1/services/{service_id}/deploys'
    params = {'limit': 5}
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        deploys = data if isinstance(data, list) else data.get('deploys', [])
        
        for deploy in deploys:
            if deploy.get('status') in ['live', 'succeeded']:
                return {
                    'id': deploy.get('id'),
                    'status': deploy.get('status'),
                    'commit': deploy.get('commit', {}).get('id', 'N/A')[:8],
                    'createdAt': deploy.get('createdAt', 'N/A')
                }
        return None
    except requests.exceptions.RequestException:
        return None

def main():
    print("=" * 80)
    print("RENDER INVENTORY - SOURCE OF TRUTH")
    print(f"Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print("=" * 80)
    print()
    
    services_data = get_all_services()
    
    # get_all_services retourne toujours une liste
    if not isinstance(services_data, list):
        print("ERREUR: Format reponse API invalide")
        sys.exit(1)
    
    services = services_data
    
    if not services:
        print("ERREUR: Aucun service trouve")
        sys.exit(1)
    
    inventory = []
    domain_map = {}
    
    print(f"Services trouves: {len(services)}\n")
    
    for svc in services:
        svc_id = svc.get('id', 'N/A')
        svc_name = svc.get('name', 'N/A')
        svc_type = svc.get('type', 'N/A')
        
        # Details complets
        details = get_service_details(svc_id)
        
        # Extract key fields
        repo_url = svc.get('repo', details.get('repo', 'N/A'))
        branch = svc.get('branch', details.get('branch', 'N/A'))
        auto_deploy = svc.get('autoDeploy', details.get('autoDeploy', 'N/A'))
        root_dir = svc.get('rootDir', details.get('rootDir', '.'))
        build_cmd = svc.get('buildCommand', details.get('buildCommand', 'N/A'))
        start_cmd = svc.get('startCommand', details.get('startCommand', 'N/A'))
        static_path = svc.get('staticPublishPath', details.get('staticPublishPath', 'N/A'))
        region = svc.get('region', details.get('region', 'N/A'))
        
        # Custom domains
        custom_domains = details.get('customDomains', [])
        if isinstance(custom_domains, list) and len(custom_domains) > 0:
            domains_list = custom_domains
        else:
            domains_list = []
        
        # Default Render domain
        service_details = details.get('serviceDetails', {})
        default_url = service_details.get('url', f"https://{svc_name}.onrender.com")
        
        all_domains = domains_list + [default_url]
        
        # Latest deploy
        latest_deploy = get_latest_deploy(svc_id)
        
        service_info = {
            'id': svc_id,
            'name': svc_name,
            'type': svc_type,
            'region': region,
            'repo': repo_url,
            'branch': branch,
            'autoDeploy': auto_deploy,
            'rootDir': root_dir,
            'buildCommand': build_cmd,
            'startCommand': start_cmd,
            'staticPublishPath': static_path,
            'domains': all_domains,
            'latestDeploy': latest_deploy
        }
        
        inventory.append(service_info)
        
        # Map domaines
        for domain in all_domains:
            domain_clean = domain.replace('https://', '').replace('http://', '')
            domain_map[domain_clean] = {
                'service_id': svc_id,
                'service_name': svc_name,
                'service_type': svc_type
            }
        
        # Display
        print(f"SERVICE: {svc_name}")
        print(f"  ID: {svc_id}")
        print(f"  Type: {svc_type}")
        print(f"  Region: {region}")
        print(f"  Repo: {repo_url}")
        print(f"  Branch: {branch}")
        print(f"  AutoDeploy: {auto_deploy}")
        print(f"  RootDir: {root_dir}")
        print(f"  BuildCmd: {build_cmd}")
        print(f"  StartCmd: {start_cmd}")
        print(f"  StaticPath: {static_path}")
        print(f"  Domains: {', '.join(all_domains) if all_domains else 'None'}")
        if latest_deploy:
            print(f"  Latest Deploy: {latest_deploy['status']} (commit {latest_deploy['commit']}) at {latest_deploy['createdAt']}")
        else:
            print(f"  Latest Deploy: N/A")
        print()
    
    # Save JSON
    output_data = {
        'timestamp': datetime.now(timezone.utc).isoformat() + 'Z',
        'services': inventory,
        'domain_mapping': domain_map
    }
    
    json_path = os.path.join(os.path.dirname(__file__), 'render_inventory.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print("=" * 80)
    print("SOURCE OF TRUTH - DOMAIN MAPPING")
    print("=" * 80)
    
    # Focus sur israelgrowthventure.com
    target_domains = ['israelgrowthventure.com', 'www.israelgrowthventure.com', 'igv-site-web.onrender.com']
    
    for domain in target_domains:
        if domain in domain_map:
            mapping = domain_map[domain]
            print(f"\nDOMAIN: {domain}")
            print(f"  -> SERVICE_ID: {mapping['service_id']}")
            print(f"  -> SERVICE_NAME: {mapping['service_name']}")
            print(f"  -> TYPE: {mapping['service_type']}")
            
            # Trouver le service complet
            svc_full = next((s for s in inventory if s['id'] == mapping['service_id']), None)
            if svc_full:
                print(f"  -> REPO: {svc_full['repo']}")
                print(f"  -> BRANCH: {svc_full['branch']}")
                if svc_full['latestDeploy']:
                    print(f"  -> LAST COMMIT: {svc_full['latestDeploy']['commit']}")
                    print(f"  -> STATUS: {svc_full['latestDeploy']['status']}")
        else:
            print(f"\nDOMAIN: {domain} -> NOT FOUND IN RENDER")
    
    print("\n" + "=" * 80)
    print(f"Inventaire sauvegarde: {json_path}")
    print("=" * 80)

if __name__ == '__main__':
    main()
