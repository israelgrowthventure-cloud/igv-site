#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor Render Deploy - Surveillance temps réel des déploiements
Poll le statut toutes les 10s jusqu'à deployed/failed
Affiche logs en temps réel
"""
import os
import sys
import time
import requests
from datetime import datetime, timezone

# Force UTF-8 Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Lecture clé API avec fallback
RENDER_API_KEY = os.getenv('RENDER_API_KEY')
if not RENDER_API_KEY:
    RENDER_API_KEY = os.getenv('RENDER_API_TOKEN')
    if RENDER_API_KEY:
        print("WARN: Fallback RENDER_API_TOKEN utilisé", file=sys.stderr)

if not RENDER_API_KEY:
    print("ERROR: RENDER_API_KEY manquant", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Accept': 'application/json'
}

def get_latest_deploy_id(service_id):
    """Récupère l'ID du dernier déploiement via la liste"""
    url = f'https://api.render.com/v1/services/{service_id}/deploys'
    params = {'limit': 1}
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        # Structure Render: [{"deploy": {...}, "cursor": "..."}]
        if isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            if isinstance(first_item, dict):
                deploy = first_item.get('deploy', first_item)
                return deploy.get('id')
        
        print("ERROR: Aucun déploiement trouvé", file=sys.stderr)
        return None
    except requests.exceptions.RequestException as e:
        print(f"ERROR API get_latest_deploy_id: {e}", file=sys.stderr)
        return None

def get_deploy_status(service_id, deploy_id):
    """Récupère le statut d'un déploiement"""
    url = f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}'
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get('deploy', data)
    except requests.exceptions.RequestException as e:
        print(f"ERROR API: {e}", file=sys.stderr)
        return None

def get_deploy_logs(service_id, deploy_id, limit=50):
    """Récupère les derniers logs d'un déploiement"""
    url = f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}/logs'
    params = {'limit': limit}
    
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        # API peut retourner liste directe ou objet avec clé 'logs'
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return data.get('logs', [])
        return []
    except requests.exceptions.RequestException as e:
        print(f"WARN: Logs inaccessibles: {e}", file=sys.stderr)
        return []

def format_duration(start_str, end_str=None):
    """Calcule durée entre deux timestamps ISO"""
    try:
        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
        if end_str:
            end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        else:
            end = datetime.now(timezone.utc)
        
        delta = end - start
        minutes = int(delta.total_seconds() // 60)
        seconds = int(delta.total_seconds() % 60)
        return f"{minutes}m{seconds}s"
    except:
        return "N/A"

def monitor_deploy(service_id, deploy_id, poll_interval=10, max_wait=600):
    """
    Monitore un déploiement jusqu'à deployed/failed
    
    Args:
        service_id: ID du service Render
        deploy_id: ID du déploiement à surveiller
        poll_interval: Intervalle entre polls (secondes)
        max_wait: Timeout max (secondes)
    
    Returns:
        True si deployed, False si failed/timeout
    """
    # Vérification initiale: déploiement déjà terminé?
    deploy = get_deploy_status(service_id, deploy_id)
    if not deploy:
        print("✗ Impossible de récupérer le statut du déploiement", file=sys.stderr)
        return False
    
    initial_status = deploy.get('status', 'unknown')
    finished_at = deploy.get('finishedAt')
    
    # Si déjà terminé (live/failed) et finishedAt existe → pas de monitoring
    if initial_status in ['live', 'deactivated', 'build_failed', 'update_failed', 'canceled'] and finished_at:
        commit_msg = deploy.get('commit', {}).get('message', 'N/A')[:60]
        commit_id = deploy.get('commit', {}).get('id', 'N/A')[:8]
        print("=" * 80)
        print("DEPLOY DÉJÀ TERMINÉ - AUCUN MONITORING ACTIF")
        print("=" * 80)
        print(f"Deploy ID: {deploy_id}")
        print(f"Status: {initial_status.upper()}")
        print(f"Commit: {commit_id} - {commit_msg}")
        print(f"Finished: {finished_at}")
        print("\nℹ️  Aucun déploiement en cours – Service déjà live.")
        return initial_status in ['live', 'deactivated']
    
    print("=" * 80)
    print("RENDER DEPLOY MONITOR - LIVE TRACKING")
    print(f"Service: {service_id}")
    print(f"Deploy: {deploy_id}")
    print(f"Poll interval: {poll_interval}s | Max wait: {max_wait}s")
    print("=" * 80)
    print()
    
    start_time = time.time()
    last_status = None
    logs_shown = set()
    
    while True:
        elapsed = time.time() - start_time
        
        if elapsed > max_wait:
            print(f"\n✗ TIMEOUT après {int(elapsed)}s")
            return False
        
        # Récupère statut actuel
        deploy = get_deploy_status(service_id, deploy_id)
        
        if not deploy:
            print(f"✗ Impossible de récupérer le statut (tentative {int(elapsed)}s)")
            time.sleep(poll_interval)
            continue
        
        status = deploy.get('status', 'unknown')
        commit_msg = deploy.get('commit', {}).get('message', 'N/A')[:60]
        commit_id = deploy.get('commit', {}).get('id', 'N/A')[:8]
        started_at = deploy.get('startedAt', 'N/A')
        finished_at = deploy.get('finishedAt')
        
        # Affiche changement de statut
        if status != last_status:
            duration = format_duration(started_at, finished_at)
            timestamp = datetime.now(timezone.utc).strftime('%H:%M:%S')
            
            status_emoji = {
                'build_in_progress': '🔨',
                'update_in_progress': '⚙️',
                'live': '✅',
                'deactivated': '⏸️',
                'build_failed': '❌',
                'update_failed': '❌',
                'canceled': '🚫'
            }.get(status, '⏳')
            
            print(f"[{timestamp}] {status_emoji} Status: {status.upper()}")
            print(f"  Commit: {commit_id} - {commit_msg}")
            print(f"  Duration: {duration}")
            
            last_status = status
        
        # Récupère et affiche nouveaux logs
        logs = get_deploy_logs(service_id, deploy_id, limit=100)
        for log_entry in logs:
            # Structure peut varier: {message, timestamp} ou juste string
            if isinstance(log_entry, dict):
                log_id = log_entry.get('id', str(log_entry))
                log_msg = log_entry.get('message', str(log_entry))
            else:
                log_id = str(log_entry)
                log_msg = str(log_entry)
            
            if log_id not in logs_shown:
                # Filtre logs importants
                if any(keyword in log_msg.lower() for keyword in [
                    'error', 'fail', 'eresolve', 'conflict', 
                    'build complete', 'starting service', 'listening'
                ]):
                    print(f"  📋 {log_msg[:150]}")
                
                logs_shown.add(log_id)
        
        # Statuts terminaux
        if status in ['live', 'deactivated']:
            print(f"\n✅ DEPLOYED SUCCESSFULLY")
            print(f"Total duration: {format_duration(started_at, finished_at)}")
            return True
        
        elif status in ['build_failed', 'update_failed', 'canceled']:
            print(f"\n✗ DEPLOY FAILED: {status}")
            print("\n=== DERNIERS LOGS (50 lignes) ===")
            recent_logs = get_deploy_logs(service_id, deploy_id, limit=50)
            for log in recent_logs[-20:]:  # Dernières 20 lignes
                if isinstance(log, dict):
                    print(f"  {log.get('message', log)}")
                else:
                    print(f"  {log}")
            return False
        
        # Continue polling
        time.sleep(poll_interval)

def main():
    if len(sys.argv) < 3:
        print("Usage: python monitor_render_deploy.py <service_id> <deploy_id|latest>")
        print("Exemple: python monitor_render_deploy.py srv-xxx dep-yyy")
        print("         python monitor_render_deploy.py srv-xxx latest")
        sys.exit(1)
    
    service_id = sys.argv[1]
    deploy_id = sys.argv[2]
    
    # Si deploy_id == "latest", récupérer le dernier deploy
    if deploy_id.lower() == 'latest':
        print("🔍 Récupération du dernier déploiement...")
        deploy_id = get_latest_deploy_id(service_id)
        if not deploy_id:
            print("✗ Impossible de récupérer le dernier déploiement", file=sys.stderr)
            sys.exit(1)
        print(f"✅ Dernier deploy trouvé: {deploy_id}\n")
    
    # Options optionnelles
    poll_interval = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    max_wait = int(sys.argv[4]) if len(sys.argv) > 4 else 600
    
    success = monitor_deploy(service_id, deploy_id, poll_interval, max_wait)
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
