#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Orchestrateur complet: build → deploy → test → boucle jusqu'à succès."""

import json
import os
import subprocess
import sys
import time

# Force UTF-8
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(ROOT, 'frontend')
FRONTEND_SERVICE_ID = 'srv-d4no5dc9c44c73d1opgg'  # igv-site-web
BACKEND_SERVICE_ID = 'srv-d4ka5q63jp1c738n6b2g'  # igv-cms-backend
MAX_ATTEMPTS = 3

def run_command(cmd, cwd=None):
    """Execute une commande et retourne le résultat."""
    print(f"[CMD] {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[ERROR] Command failed: {result.stderr}")
    return result.returncode == 0, result.stdout, result.stderr

def build_frontend():
    """Build le frontend React."""
    print("\n=== BUILD FRONTEND ===")
    success, stdout, stderr = run_command(['npm', 'run', 'build'], cwd=FRONTEND_DIR)
    if not success:
        print(f"Build échoué:\n{stderr}")
        return False
    print("✓ Build réussi")
    return True

def commit_and_push():
    """Commit et push les changements."""
    print("\n=== GIT COMMIT & PUSH ===")
    
    # Check si changements
    success, stdout, _ = run_command(['git', 'status', '--porcelain'], cwd=ROOT)
    if not stdout.strip():
        print("Aucun changement à commiter")
        return True
    
    # Add all
    run_command(['git', 'add', '-A'], cwd=ROOT)
    
    # Commit
    success, _, _ = run_command([
        'git', 'commit', '-m', 
        'Auto-deploy: TypeScript 5.3.3 + Express server + corrections'
    ], cwd=ROOT)
    
    # Push
    success, _, _ = run_command(['git', 'push', 'origin', 'main'], cwd=ROOT)
    
    if success:
        print("✓ Push réussi")
    return success

def trigger_render_deploy(service_id):
    """Déclenche un déploiement Render."""
    print(f"\n=== DEPLOY RENDER {service_id} ===")
    
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("ERROR: RENDER_API_KEY manquant")
        return None
    
    import urllib.request
    
    req = urllib.request.Request(
        f'https://api.render.com/v1/services/{service_id}/deploys',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        data=json.dumps({'clearCache': 'clear'}).encode(),
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            deploy_id = result.get('id')
            print(f"✓ Déploiement créé: {deploy_id}")
            return deploy_id
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def wait_for_deploy(service_id, deploy_id, timeout=600):
    """Attend la fin d'un déploiement."""
    print(f"\n=== ATTENTE DEPLOY {deploy_id[:12]}... ===")
    
    api_key = os.getenv('RENDER_API_KEY')
    start = time.time()
    
    import urllib.request
    
    while (time.time() - start) < timeout:
        try:
            req = urllib.request.Request(
                f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}',
                headers={'Authorization': f'Bearer {api_key}'}
            )
            
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read())
                status = data.get('status')
                
                if status == 'live':
                    print(f"✓ Déploiement live après {int(time.time() - start)}s")
                    return True
                elif status in ['build_failed', 'canceled']:
                    print(f"✗ Déploiement échoué: {status}")
                    return False
                
                print(f"  Status: {status}...")
                time.sleep(10)
                
        except Exception as e:
            print(f"ERROR: {e}")
            return False
    
    print("TIMEOUT")
    return False

def test_production():
    """Execute les tests production."""
    print("\n=== TESTS PRODUCTION ===")
    
    # Test HTTP
    success, stdout, _ = run_command([
        sys.executable, 
        os.path.join(ROOT, 'scripts', 'test_production_http.py')
    ], cwd=ROOT)
    
    if success:
        print("✓ Tests HTTP PASS")
        print(stdout)
        return True
    else:
        print("✗ Tests HTTP FAIL")
        print(stdout)
        return False

def main():
    print("=== ORCHESTRATEUR AUTONOME IGV V3 ===\n")
    
    for attempt in range(1, MAX_ATTEMPTS + 1):
        print(f"\n{'='*60}")
        print(f"TENTATIVE {attempt}/{MAX_ATTEMPTS}")
        print(f"{'='*60}")
        
        # 1. Build frontend
        if not build_frontend():
            print("Build échoué, nouvelle tentative...")
            continue
        
        # 2. Commit & Push
        if not commit_and_push():
            print("Push échoué, nouvelle tentative...")
            continue
        
        # 3. Deploy backend
        backend_deploy = trigger_render_deploy(BACKEND_SERVICE_ID)
        if not backend_deploy:
            print("Deploy backend échoué")
            continue
        
        # 4. Deploy frontend
        frontend_deploy = trigger_render_deploy(FRONTEND_SERVICE_ID)
        if not frontend_deploy:
            print("Deploy frontend échoué")
            continue
        
        # 5. Attendre déploiements
        print("\nAttente déploiements...")
        backend_ok = wait_for_deploy(BACKEND_SERVICE_ID, backend_deploy)
        frontend_ok = wait_for_deploy(FRONTEND_SERVICE_ID, frontend_deploy)
        
        if not (backend_ok and frontend_ok):
            print("Déploiement échoué")
            continue
        
        # 6. Tests production
        # Attendre 30s pour propagation DNS/CDN
        print("\nAttente propagation (30s)...")
        time.sleep(30)
        
        if test_production():
            print("\n" + "="*60)
            print("✓✓✓ MISSION ACCOMPLIE ✓✓✓")
            print("="*60)
            return 0
        
        print("\nTests échoués, nouvelle tentative...")
    
    print("\n" + "="*60)
    print("✗ ÉCHEC APRÈS TOUTES TENTATIVES")
    print("="*60)
    return 1

if __name__ == '__main__':
    sys.exit(main())
