#!/usr/bin/env python3
"""
Script autonome pour récupérer les logs Render des déploiements échoués
Utilise RENDER_API_KEY pour accéder à l'API Render
"""

import os
import sys
import requests
from typing import List, Dict, Optional
from datetime import datetime

RENDER_API_BASE = "https://api.render.com/v1"

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def get_api_key() -> Optional[str]:
    """Récupère la clé API Render depuis l'environnement"""
    api_key = os.environ.get('RENDER_API_KEY')
    if not api_key:
        print(f"{Colors.RED}❌ RENDER_API_KEY non définie{Colors.RESET}")
        print(f"{Colors.YELLOW}Définissez-la avec:{Colors.RESET}")
        print(f'{Colors.CYAN}  set RENDER_API_KEY=rnd_votre_cle{Colors.RESET}')
        print(f"{Colors.YELLOW}Obtenez votre clé: https://dashboard.render.com/account/api-keys{Colors.RESET}\n")
        return None
    return api_key

def get_headers(api_key: str) -> Dict[str, str]:
    """Retourne les headers pour les requêtes API"""
    return {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json'
    }

def get_services(api_key: str) -> List[Dict]:
    """Récupère tous les services Render"""
    headers = get_headers(api_key)
    try:
        response = requests.get(f"{RENDER_API_BASE}/services", headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"{Colors.RED}❌ Erreur lors de la récupération des services: {e}{Colors.RESET}")
        return []

def get_service_deploys(api_key: str, service_id: str, limit: int = 5) -> List[Dict]:
    """Récupère les derniers déploiements d'un service"""
    headers = get_headers(api_key)
    try:
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}/deploys",
            headers=headers,
            params={'limit': limit},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"{Colors.RED}❌ Erreur lors de la récupération des déploiements: {e}{Colors.RESET}")
        return []

def get_deploy_logs(api_key: str, service_id: str, deploy_id: str) -> Optional[str]:
    """Récupère les logs d'un déploiement spécifique"""
    headers = get_headers(api_key)
    try:
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}/deploys/{deploy_id}/logs",
            headers=headers,
            timeout=60
        )
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"{Colors.RED}❌ Erreur lors de la récupération des logs: {e}{Colors.RESET}")
        return None

def analyze_logs(logs: str, service_name: str) -> Dict[str, List[str]]:
    """Analyse les logs pour extraire les erreurs critiques"""
    errors = []
    warnings = []
    
    for line in logs.split('\n'):
        line_lower = line.lower()
        
        # Erreurs critiques
        if any(keyword in line_lower for keyword in ['error:', 'failed', 'exception', 'traceback', 'fatal']):
            errors.append(line.strip())
        
        # Warnings importants
        elif any(keyword in line_lower for keyword in ['warning:', 'deprecated', 'missing']):
            warnings.append(line.strip())
    
    return {
        'errors': errors[-20:],  # Garde les 20 dernières erreurs
        'warnings': warnings[-10:]  # Garde les 10 derniers warnings
    }

def main():
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'RÉCUPÉRATION AUTONOME DES LOGS RENDER':^80}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    # Récupérer l'API key
    api_key = get_api_key()
    if not api_key:
        return 1
    
    print(f"{Colors.GREEN}✅ RENDER_API_KEY trouvée{Colors.RESET}\n")
    
    # Récupérer les services
    print(f"{Colors.YELLOW}📋 Récupération des services...{Colors.RESET}")
    services = get_services(api_key)
    
    if not services:
        print(f"{Colors.RED}❌ Aucun service trouvé{Colors.RESET}")
        return 1
    
    # Chercher nos services spécifiques
    target_services = ['igv-cms-backend', 'igv-site-web']
    found_services = [s for s in services if s.get('service', {}).get('name') in target_services]
    
    if not found_services:
        print(f"{Colors.RED}❌ Services igv-cms-backend et igv-site-web non trouvés{Colors.RESET}")
        print(f"\n{Colors.YELLOW}Services disponibles:{Colors.RESET}")
        for service in services[:10]:
            name = service.get('service', {}).get('name', 'N/A')
            print(f"  - {name}")
        return 1
    
    print(f"{Colors.GREEN}✅ {len(found_services)} service(s) trouvé(s){Colors.RESET}\n")
    
    # Pour chaque service, récupérer les déploiements
    for service_data in found_services:
        service = service_data.get('service', {})
        service_id = service.get('id')
        service_name = service.get('name')
        
        print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}")
        print(f"{Colors.CYAN}{Colors.BOLD}SERVICE: {service_name}{Colors.RESET}")
        print(f"{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}\n")
        
        print(f"  ID: {service_id}")
        print(f"  Type: {service.get('type')}")
        print(f"  Region: {service.get('region')}")
        print(f"  Branch: {service.get('branch')}")
        
        # Récupérer les derniers déploiements
        print(f"\n{Colors.YELLOW}📦 Récupération des derniers déploiements...{Colors.RESET}")
        deploys = get_service_deploys(api_key, service_id, limit=5)
        
        if not deploys:
            print(f"{Colors.RED}❌ Aucun déploiement trouvé{Colors.RESET}")
            continue
        
        # Afficher le statut des derniers déploiements
        print(f"\n{Colors.BOLD}Derniers déploiements:{Colors.RESET}")
        for idx, deploy_data in enumerate(deploys[:5], 1):
            deploy = deploy_data.get('deploy', {})
            status = deploy.get('status', 'unknown')
            created_at = deploy.get('createdAt', 'N/A')
            commit_msg = deploy.get('commit', {}).get('message', 'N/A')[:50]
            
            status_color = Colors.GREEN if status == 'live' else Colors.RED if status == 'build_failed' or status == 'deploy_failed' else Colors.YELLOW
            print(f"  {idx}. [{status_color}{status}{Colors.RESET}] {created_at[:19]} - {commit_msg}")
        
        # Récupérer les logs du dernier déploiement échoué
        failed_deploy = None
        for deploy_data in deploys:
            deploy = deploy_data.get('deploy', {})
            status = deploy.get('status', '')
            if 'failed' in status.lower():
                failed_deploy = deploy
                break
        
        if failed_deploy:
            deploy_id = failed_deploy.get('id')
            status = failed_deploy.get('status')
            
            print(f"\n{Colors.RED}{Colors.BOLD}🚨 DÉPLOIEMENT ÉCHOUÉ TROUVÉ:{Colors.RESET}")
            print(f"  Deploy ID: {deploy_id}")
            print(f"  Status: {status}")
            print(f"  Created: {failed_deploy.get('createdAt')}")
            print(f"  Commit: {failed_deploy.get('commit', {}).get('message', 'N/A')}")
            
            print(f"\n{Colors.YELLOW}📋 Récupération des logs...{Colors.RESET}")
            logs = get_deploy_logs(api_key, service_id, deploy_id)
            
            if logs:
                # Analyser les logs
                analysis = analyze_logs(logs, service_name)
                
                print(f"\n{Colors.RED}{Colors.BOLD}❌ ERREURS CRITIQUES ({len(analysis['errors'])}):{Colors.RESET}")
                if analysis['errors']:
                    for error in analysis['errors']:
                        print(f"  {Colors.RED}• {error}{Colors.RESET}")
                else:
                    print(f"  {Colors.YELLOW}(aucune erreur explicite trouvée dans les logs){Colors.RESET}")
                
                if analysis['warnings']:
                    print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  WARNINGS ({len(analysis['warnings'])}):{Colors.RESET}")
                    for warning in analysis['warnings'][:5]:
                        print(f"  {Colors.YELLOW}• {warning}{Colors.RESET}")
                
                # Sauvegarder les logs complets
                log_filename = f"render_logs_{service_name}_{deploy_id[:8]}.txt"
                with open(log_filename, 'w', encoding='utf-8') as f:
                    f.write(logs)
                print(f"\n{Colors.GREEN}✅ Logs complets sauvegardés: {log_filename}{Colors.RESET}")
            else:
                print(f"{Colors.RED}❌ Impossible de récupérer les logs{Colors.RESET}")
        else:
            last_deploy = deploys[0].get('deploy', {}) if deploys else {}
            last_status = last_deploy.get('status', 'unknown')
            
            if last_status == 'live':
                print(f"\n{Colors.GREEN}✅ Dernier déploiement: LIVE (aucune erreur){Colors.RESET}")
            else:
                print(f"\n{Colors.YELLOW}⏳ Dernier déploiement: {last_status}{Colors.RESET}")
    
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'FIN DE L\'ANALYSE':^80}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
