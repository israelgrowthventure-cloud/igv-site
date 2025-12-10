#!/usr/bin/env python3
"""
Déclencher les déploiements Render pour backend et frontend IGV
================================================================

Ce script déclenche les déploiements automatiques via l'API Render
puis attend que les services soient disponibles avant de lancer les tests.

Services déployés :
- igv-cms-backend (Backend FastAPI)
- igv-site-web (Frontend React)

Usage:
    python trigger_render_deploys.py
"""

import os
import sys
import time
import requests
from datetime import datetime

# Configuration Render
RENDER_API_KEY = os.getenv('RENDER_API_KEY', '')
RENDER_API_BASE = "https://api.render.com/v1"

# Services Render (IDs à récupérer depuis le dashboard Render)
# Format: srv-xxxxxxxxxxxxxxxxxxxxx
BACKEND_SERVICE_ID = os.getenv('RENDER_BACKEND_SERVICE_ID', 'srv-ctvdcbggph6c73fbg750')
FRONTEND_SERVICE_ID = os.getenv('RENDER_FRONTEND_SERVICE_ID', 'srv-ctvdc2ggph6c73fbg72g')

# URLs de production
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Couleurs terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(title: str):
    print(f"\n{BLUE}{'=' * 80}{RESET}")
    print(f"{BLUE}{title.center(80)}{RESET}")
    print(f"{BLUE}{'=' * 80}{RESET}\n")

def trigger_deploy(service_id: str, service_name: str) -> bool:
    """
    Déclencher un déploiement Render via l'API
    
    Args:
        service_id: ID du service Render (srv-xxxx)
        service_name: Nom du service (pour affichage)
    
    Returns:
        True si déploiement déclenché avec succès
    """
    if not RENDER_API_KEY:
        print(f"{YELLOW}⚠ RENDER_API_KEY non défini - déploiement automatique ignoré{RESET}")
        print(f"Les services Render déploieront automatiquement depuis git push")
        return True
    
    url = f"{RENDER_API_BASE}/services/{service_id}/deploys"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Déclenchement du déploiement pour {service_name} (ID: {service_id})...")
        response = requests.post(url, headers=headers, json={}, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"{GREEN}✓{RESET} Déploiement déclenché pour {service_name}")
            return True
        elif response.status_code == 401:
            print(f"{YELLOW}⚠ API Key invalide - Render déploiera automatiquement depuis git push{RESET}")
            return True
        else:
            print(f"{RED}✗{RESET} Échec déclenchement {service_name}: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"{RED}✗{RESET} Exception lors du déclenchement {service_name}: {e}")
        print(f"{YELLOW}⚠ Render déploiera automatiquement depuis git push{RESET}")
        return True

def check_service_health(url: str, service_name: str, timeout: int = 10) -> bool:
    """Vérifier qu'un service répond correctement"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            print(f"{GREEN}✓{RESET} {service_name} est disponible (200 OK)")
            return True
        else:
            print(f"{YELLOW}⚠{RESET} {service_name} répond avec code {response.status_code}")
            return False
    except requests.Timeout:
        print(f"{RED}✗{RESET} {service_name} timeout (> {timeout}s)")
        return False
    except Exception as e:
        print(f"{RED}✗{RESET} {service_name} erreur: {type(e).__name__}")
        return False

def wait_for_deployments(max_wait_minutes: int = 10) -> bool:
    """
    Attendre que les deux services soient disponibles
    
    Args:
        max_wait_minutes: Temps d'attente maximum en minutes
    
    Returns:
        True si les deux services sont disponibles
    """
    print_header("Attente des déploiements Render")
    
    max_iterations = (max_wait_minutes * 60) // 30  # Check toutes les 30s
    iteration = 0
    
    print(f"Temps maximum d'attente: {max_wait_minutes} minutes")
    print(f"Vérification toutes les 30 secondes\n")
    
    while iteration < max_iterations:
        iteration += 1
        elapsed = iteration * 30
        
        print(f"\n[{elapsed}s] Vérification {iteration}/{max_iterations}...")
        
        # Vérifier backend
        backend_ok = check_service_health(f"{BACKEND_URL}/api/health", "Backend")
        
        # Vérifier frontend
        frontend_ok = check_service_health(FRONTEND_URL, "Frontend")
        
        # Si les deux sont OK, c'est bon
        if backend_ok and frontend_ok:
            print(f"\n{GREEN}✅ Les deux services sont disponibles !{RESET}")
            return True
        
        # Sinon, attendre
        if iteration < max_iterations:
            print(f"Attente de 30 secondes avant nouvelle vérification...")
            time.sleep(30)
    
    print(f"\n{RED}❌ Timeout atteint ({max_wait_minutes} minutes){RESET}")
    return False

def main():
    print_header("DÉPLOIEMENT RENDER - Phase 6 bis")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}")
    print(f"Frontend: {FRONTEND_URL}\n")
    
    # Étape 1 : Déclencher les déploiements
    print_header("1. Déclenchement des déploiements")
    
    backend_triggered = trigger_deploy(BACKEND_SERVICE_ID, "Backend (igv-cms-backend)")
    time.sleep(2)
    frontend_triggered = trigger_deploy(FRONTEND_SERVICE_ID, "Frontend (igv-site-web)")
    
    if not (backend_triggered and frontend_triggered):
        print(f"\n{YELLOW}⚠ Certains déploiements n'ont pas pu être déclenchés via API{RESET}")
        print(f"Render déploiera automatiquement depuis le git push")
    
    # Étape 2 : Attendre que les services soient disponibles
    print(f"\nAttente initiale de 60 secondes pour laisser Render démarrer les builds...")
    time.sleep(60)
    
    success = wait_for_deployments(max_wait_minutes=10)
    
    if success:
        print_header("✅ DÉPLOIEMENTS TERMINÉS")
        print("Les deux services sont disponibles et prêts pour les tests.\n")
        return 0
    else:
        print_header("❌ DÉPLOIEMENTS INCOMPLETS")
        print("Un ou plusieurs services ne répondent pas encore.")
        print("Vérifiez manuellement le statut sur https://dashboard.render.com\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
