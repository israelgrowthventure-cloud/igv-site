"""
Script de diagnostic Render pour igv-cms-backend
=================================================

Interroge l'API Render pour récupérer les logs du dernier déploiement
et identifier la cause d'un échec.

Variables d'environnement requises:
- RENDER_API_KEY: Clé API Render (obtenue depuis dashboard)
- RENDER_SERVICE_ID_CMS_BACKEND: ID du service backend (srv-cthh9lu8ii6s73c8vbe0)

Usage:
    python render_diagnose.py

Note: Ce script est UNIQUEMENT pour diagnostic, jamais importé par server.py
"""

import os
import sys
import requests
import json
from datetime import datetime

# Configuration depuis environnement
RENDER_API_KEY = os.environ.get('RENDER_API_KEY')
SERVICE_ID = os.environ.get('RENDER_SERVICE_ID_CMS_BACKEND', 'srv-cthh9lu8ii6s73c8vbe0')

def get_latest_deploy():
    """Récupère le dernier déploiement du service"""
    
    if not RENDER_API_KEY:
        print("❌ RENDER_API_KEY non défini dans l'environnement")
        return None
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json"
    }
    
    try:
        print(f"🔍 Récupération des déploiements pour {SERVICE_ID}...")
        response = requests.get(url, headers=headers, params={"limit": 5}, timeout=30)
        
        if response.status_code == 401:
            print("❌ Erreur 401: RENDER_API_KEY invalide ou expirée")
            return None
        elif response.status_code != 200:
            print(f"❌ Erreur API: {response.status_code}")
            print(f"   {response.text}")
            return None
        
        deploys = response.json()
        
        if not deploys:
            print("⚠️ Aucun déploiement trouvé")
            return None
        
        # Trier par date de création (plus récent d'abord)
        sorted_deploys = sorted(deploys, key=lambda x: x.get('createdAt', ''), reverse=True)
        latest = sorted_deploys[0]
        
        print(f"\n📦 Dernier déploiement:")
        print(f"   ID: {latest.get('id')}")
        print(f"   Status: {latest.get('status')}")
        print(f"   Commit: {latest.get('commit', {}).get('id', 'N/A')[:7]}")
        print(f"   Message: {latest.get('commit', {}).get('message', 'N/A')[:60]}")
        print(f"   Created: {latest.get('createdAt')}")
        print(f"   Updated: {latest.get('updatedAt')}")
        
        return latest
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def get_deploy_logs(deploy_id):
    """Récupère les logs d'un déploiement spécifique"""
    
    if not RENDER_API_KEY:
        return None
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{deploy_id}/logs"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "text/plain"
    }
    
    try:
        print(f"\n📝 Récupération des logs du deploy {deploy_id}...")
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Erreur: {response.status_code}")
            return None
        
        logs = response.text
        
        # Sauvegarder dans un fichier
        with open('render_deploy_logs.txt', 'w', encoding='utf-8') as f:
            f.write(logs)
        
        print(f"✅ Logs sauvegardés dans render_deploy_logs.txt ({len(logs)} caractères)")
        
        # Analyser les erreurs
        lines = logs.split('\n')
        error_lines = [l for l in lines if 'error' in l.lower() or 'failed' in l.lower() or 'exception' in l.lower()]
        
        if error_lines:
            print(f"\n🔴 Erreurs détectées ({len(error_lines)} lignes):")
            print("="*70)
            for line in error_lines[-10:]:  # Dernières 10 erreurs
                print(f"   {line[:200]}")
        else:
            print(f"\n✅ Aucune erreur explicite détectée dans les logs")
            print("   Affichage des 20 dernières lignes:")
            print("="*70)
            for line in lines[-20:]:
                print(f"   {line[:200]}")
        
        return logs
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def diagnose():
    """Diagnostic complet"""
    
    print("=" * 70)
    print("🏥 DIAGNOSTIC RENDER - IGV CMS BACKEND")
    print("=" * 70)
    print()
    
    if not RENDER_API_KEY:
        print("⚠️ RENDER_API_KEY non défini")
        print("   Pour utiliser ce script:")
        print("   1. Récupérez votre API key depuis https://dashboard.render.com/account/api-keys")
        print("   2. Définissez: export RENDER_API_KEY=rnd_xxx (Linux/Mac)")
        print("   2. Ou: $env:RENDER_API_KEY='rnd_xxx' (PowerShell)")
        print()
        print("💡 Alternative: Consultez manuellement le dashboard Render")
        print("   https://dashboard.render.com/web/srv-cthh9lu8ii6s73c8vbe0")
        return False
    
    # Récupérer le dernier deploy
    latest = get_latest_deploy()
    
    if not latest:
        return False
    
    status = latest.get('status')
    deploy_id = latest.get('id')
    
    # Analyser le statut
    if status == 'live':
        print(f"\n✅ Service actuellement LIVE (pas de problème)")
        return True
    elif status in ['build_failed', 'deactivated', 'canceled']:
        print(f"\n❌ Deploy en échec: {status}")
        print("   Récupération des logs...")
        get_deploy_logs(deploy_id)
        return False
    elif status in ['build_in_progress', 'update_in_progress']:
        print(f"\n⏳ Deploy en cours: {status}")
        print("   Attendez la fin du build...")
        return True
    else:
        print(f"\n⚠️ Statut inconnu: {status}")
        get_deploy_logs(deploy_id)
        return False

if __name__ == '__main__':
    success = diagnose()
    sys.exit(0 if success else 1)
