#!/usr/bin/env python3
"""Récupère les logs du backend Render pour voir l'erreur 500"""
import requests
import os
from datetime import datetime

# Render API token (depuis ENV_TEMPLATE.md ou Dashboard)
API_KEY = os.getenv('RENDER_API_KEY', 'rnd_7gQ2BqlZnL4kfHK7xZqV3vVvKJph')  # Depuis conversation précédente
SERVICE_ID = 'srv-d4ka5q63jp1c738n6b2g'  # Backend service ID

def get_recent_logs():
    """Récupère les logs récents du service"""
    print(f"[INFO] Recuperation des logs pour {SERVICE_ID}")
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json'
    }
    
    # Get service info first
    url_service = f"https://api.render.com/v1/services/{SERVICE_ID}"
    try:
        response = requests.get(url_service, headers=headers)
        if response.status_code == 200:
            service = response.json()
            print(f"[OK] Service: {service.get('name', 'N/A')}")
            print(f"     Status: {service.get('serviceDetails', {}).get('health', 'N/A')}")
            print(f"     URL: {service.get('serviceDetails', {}).get('url', 'N/A')}")
        else:
            print(f"[WARN] Impossible de recuperer les infos du service: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Erreur API: {e}")
    
    # Get logs
    url_logs = f"https://api.render.com/v1/services/{SERVICE_ID}/logs"
    try:
        response = requests.get(url_logs, headers=headers, params={'limit': 50})
        if response.status_code == 200:
            logs = response.json()
            print(f"\n[LOGS] DERNIERS LOGS (50 lignes):")
            print("=" * 80)
            for log in logs:
                timestamp = log.get('timestamp', '')
                message = log.get('message', '')
                print(f"{timestamp} | {message}")
        else:
            print(f"[WARN] Impossible de recuperer les logs: {response.status_code}")
            print(f"       Response: {response.text[:200]}")
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")

def check_env_vars():
    """Vérifie les variables d'environnement"""
    print(f"\n[CONFIG] Verification des variables d'environnement")
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json'
    }
    
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/env-vars"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            env_vars = response.json()
            print(f"[OK] Variables d'environnement:")
            for var in env_vars:
                key = var.get('key', '')
                if 'GEMINI' in key:
                    print(f"     {key}: {'[SET]' if var.get('value') else '[NOT SET]'}")
                elif 'MONGO' in key:
                    print(f"     {key}: {'[SET]' if var.get('value') else '[NOT SET]'}")
        else:
            print(f"[WARN] Code: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Erreur: {e}")

if __name__ == "__main__":
    print("[DIAGNOSTIC] RENDER BACKEND")
    print("=" * 80)
    get_recent_logs()
    check_env_vars()
    
    print("\n" + "=" * 80)
    print("[INFO] SI GEMINI_API_KEY est SET mais le service crash:")
    print("       -> Le backend a ete deploye AVANT l'ajout de la variable")
    print("       -> Il faut faire un Manual Deploy pour charger la nouvelle config")
    print("\n[ACTION] REQUISE:")
    print("       1. https://dashboard.render.com -> igv-cms-backend")
    print("       2. Manual Deploy -> Deploy latest commit")
    print("       3. Attendre 2-3 minutes")
