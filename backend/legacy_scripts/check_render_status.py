#!/usr/bin/env python3
"""
Script de diagnostic Render - Vérifie le statut réel des services en production
Version: 2025-12-03
"""

import requests
import sys
from typing import Dict, List, Tuple

# URLs des services Render
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    """Affiche un en-tête stylisé"""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.CYAN}{Colors.BOLD}{'='*70}{Colors.RESET}\n")

def check_endpoint(name: str, url: str, timeout: int = 10) -> Tuple[bool, str, Dict]:
    """
    Vérifie un endpoint et retourne (success, message, data)
    """
    try:
        print(f"{Colors.BLUE}🔍 Test: {name}{Colors.RESET}")
        print(f"   URL: {url}")
        
        response = requests.get(url, timeout=timeout)
        
        if response.status_code == 200:
            print(f"   {Colors.GREEN}✅ Status: {response.status_code} OK{Colors.RESET}")
            try:
                data = response.json()
                return True, f"{name}: OK (200)", data
            except:
                return True, f"{name}: OK (200)", {}
        else:
            print(f"   {Colors.RED}❌ Status: {response.status_code}{Colors.RESET}")
            return False, f"{name}: HTTP {response.status_code}", {}
            
    except requests.exceptions.Timeout:
        print(f"   {Colors.RED}❌ Timeout après {timeout}s{Colors.RESET}")
        return False, f"{name}: Timeout", {}
    except requests.exceptions.ConnectionError as e:
        print(f"   {Colors.RED}❌ Erreur de connexion{Colors.RESET}")
        return False, f"{name}: Connection Error - Service probablement DOWN", {}
    except Exception as e:
        print(f"   {Colors.RED}❌ Erreur: {str(e)}{Colors.RESET}")
        return False, f"{name}: {str(e)}", {}

def main():
    print_header("DIAGNOSTIC RENDER - Services IGV")
    print(f"{Colors.YELLOW}📅 Date: 2025-12-03{Colors.RESET}")
    print(f"{Colors.YELLOW}🎯 Objectif: Vérifier statut réel des déploiements{Colors.RESET}\n")
    
    results = []
    all_success = True
    
    # ============================================================
    # 1. Backend Health Check
    # ============================================================
    print_header("1️⃣  BACKEND - Health Check")
    success, msg, data = check_endpoint(
        "Backend Health",
        f"{BACKEND_URL}/api/health"
    )
    results.append((success, msg))
    if not success:
        all_success = False
        print(f"\n{Colors.RED}🚨 BACKEND EST DOWN - Service igv-cms-backend en FAILED DEPLOY{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}✅ Backend est LIVE{Colors.RESET}")
        if data:
            print(f"   MongoDB: {data.get('mongodb', 'N/A')}")
            print(f"   Timestamp: {data.get('timestamp', 'N/A')}")
    
    # ============================================================
    # 2. Frontend Health Check
    # ============================================================
    print_header("2️⃣  FRONTEND - Health Check")
    success, msg, data = check_endpoint(
        "Frontend Health",
        f"{FRONTEND_URL}/api/health"
    )
    results.append((success, msg))
    if not success:
        all_success = False
        print(f"\n{Colors.RED}🚨 FRONTEND EST DOWN - Service igv-site-web en FAILED DEPLOY{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}✅ Frontend est LIVE{Colors.RESET}")
        if data:
            print(f"   Version: {data.get('version', 'N/A')}")
            print(f"   Build exists: {data.get('indexExists', 'N/A')}")
    
    # ============================================================
    # 3. Frontend Homepage
    # ============================================================
    print_header("3️⃣  FRONTEND - Homepage")
    success, msg, _ = check_endpoint(
        "Homepage",
        FRONTEND_URL
    )
    results.append((success, msg))
    if not success:
        all_success = False
    
    # ============================================================
    # 4. API Packs
    # ============================================================
    print_header("4️⃣  API - Packs")
    success, msg, data = check_endpoint(
        "API Packs",
        f"{BACKEND_URL}/api/packs"
    )
    results.append((success, msg))
    if success and data:
        packs_count = len(data) if isinstance(data, list) else 0
        print(f"   {Colors.GREEN}📦 {packs_count} packs disponibles{Colors.RESET}")
    
    # ============================================================
    # 5. API Pages (CMS)
    # ============================================================
    print_header("5️⃣  API - Pages CMS")
    success, msg, data = check_endpoint(
        "API Pages",
        f"{BACKEND_URL}/api/pages"
    )
    results.append((success, msg))
    if success and data:
        pages_count = len(data) if isinstance(data, list) else 0
        print(f"   {Colors.GREEN}📄 {pages_count} pages disponibles{Colors.RESET}")
        if pages_count > 0:
            print(f"   Pages: {', '.join([p.get('slug', 'N/A') for p in data[:5]])}")
    
    # ============================================================
    # 6. API Pricing (test avec un slug)
    # ============================================================
    print_header("6️⃣  API - Pricing")
    success, msg, data = check_endpoint(
        "API Pricing (analyse)",
        f"{BACKEND_URL}/api/pricing?pack_id=analyse"
    )
    results.append((success, msg))
    if success and data:
        print(f"   {Colors.GREEN}💰 Prix: {data.get('price', 'N/A')}{Colors.RESET}")
    
    # ============================================================
    # 7. Admin Route
    # ============================================================
    print_header("7️⃣  FRONTEND - Admin Route")
    success, msg, _ = check_endpoint(
        "Admin Page",
        f"{FRONTEND_URL}/admin"
    )
    results.append((success, msg))
    
    # ============================================================
    # RÉSUMÉ FINAL
    # ============================================================
    print_header("📊 RÉSUMÉ DIAGNOSTIC")
    
    success_count = sum(1 for s, _ in results if s)
    total_count = len(results)
    success_rate = (success_count / total_count * 100) if total_count > 0 else 0
    
    print(f"Tests réussis: {Colors.GREEN if success_count == total_count else Colors.RED}{success_count}/{total_count}{Colors.RESET}")
    print(f"Taux de réussite: {Colors.GREEN if success_rate == 100 else Colors.RED}{success_rate:.1f}%{Colors.RESET}\n")
    
    print(f"{Colors.BOLD}Détails:{Colors.RESET}")
    for success, msg in results:
        status = f"{Colors.GREEN}✅" if success else f"{Colors.RED}❌"
        print(f"{status} {msg}{Colors.RESET}")
    
    # ============================================================
    # DIAGNOSTIC DES CAUSES
    # ============================================================
    if not all_success:
        print_header("🔧 DIAGNOSTIC DES CAUSES DE FAILED DEPLOY")
        
        if not results[0][0]:  # Backend health failed
            print(f"{Colors.RED}🚨 BACKEND (igv-cms-backend) EST DOWN{Colors.RESET}")
            print(f"\n{Colors.YELLOW}Causes possibles:{Colors.RESET}")
            print("  1. Erreur dans requirements.txt (dépendances manquantes/incompatibles)")
            print("  2. Variable d'environnement MONGO_URL manquante ou invalide")
            print("  3. Erreur dans server.py au démarrage")
            print("  4. Version Python incorrecte (attendu: 3.11.0)")
            print("  5. Commande start incorrecte dans render.yaml")
            print("  6. Port binding échoué")
            print("\n💡 Actions requises:")
            print("  → Consulter les logs Render: https://dashboard.render.com/web/srv-xxx/logs")
            print("  → Vérifier les variables d'environnement sur Render Dashboard")
            print("  → Vérifier requirements.txt et runtime.txt")
        
        if not results[1][0]:  # Frontend health failed
            print(f"\n{Colors.RED}🚨 FRONTEND (igv-site-web) EST DOWN{Colors.RESET}")
            print(f"\n{Colors.YELLOW}Causes possibles:{Colors.RESET}")
            print("  1. Build échoué (npm run build a planté)")
            print("  2. Dossier build/ manquant après le build")
            print("  3. server.js ne démarre pas correctement")
            print("  4. Version Node incorrecte (attendu: 18.17.0)")
            print("  5. Dépendances npm manquantes")
            print("  6. Port binding échoué")
            print("\n💡 Actions requises:")
            print("  → Consulter les logs Render: https://dashboard.render.com/web/srv-xxx/logs")
            print("  → Vérifier buildCommand: npm install && npm run build")
            print("  → Vérifier startCommand: node server.js")
            print("  → Vérifier package.json scripts")
        
        print(f"\n{Colors.RED}{Colors.BOLD}❌ MISSION NON ACCOMPLIE - Services en FAILED DEPLOY{Colors.RESET}")
        print(f"{Colors.YELLOW}⚠️  Il est INTERDIT de déclarer la mission terminée tant que les 2 services ne sont pas Live.{Colors.RESET}\n")
        return 1
    else:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ TOUS LES SERVICES SONT LIVE ET OPÉRATIONNELS{Colors.RESET}")
        print(f"{Colors.GREEN}✅ igv-cms-backend: Live / Healthy{Colors.RESET}")
        print(f"{Colors.GREEN}✅ igv-site-web: Live / Healthy{Colors.RESET}")
        print(f"\n{Colors.GREEN}🎉 Les services Render sont déployés avec succès!{Colors.RESET}\n")
        return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
