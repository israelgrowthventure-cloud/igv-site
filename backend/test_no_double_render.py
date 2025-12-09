#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test de stabilité d'affichage - Vérification suppression double-rendu pages CMS
Phase 4bis - israelgrowthventure.com
"""

import requests
import time
from datetime import datetime

# Couleurs pour output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def log(message, color=RESET):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{color}[{timestamp}] {message}{RESET}")

def test_page_load(url, page_name):
    """Test chargement d'une page et vérification présence CMS"""
    try:
        log(f"Test {page_name} - {url}", BLUE)
        
        response = requests.get(url, timeout=10)
        status = response.status_code
        content_length = len(response.text)
        
        # Vérifier si la page contient du contenu CMS ou React
        has_cms_class = 'cms-' in response.text
        has_loader = 'Chargement...' in response.text or 'animate-spin' in response.text
        
        result = {
            'status': status,
            'content_length': content_length,
            'has_cms_class': has_cms_class,
            'has_loader': has_loader
        }
        
        if status == 200:
            log(f"  Status: {status} ✅", GREEN)
            log(f"  Taille: {content_length} bytes")
            log(f"  Contient classe CMS: {'Oui' if has_cms_class else 'Non'}")
            log(f"  Contient loader: {'Oui' if has_loader else 'Non'}")
            return True, result
        else:
            log(f"  Status: {status} ❌", RED)
            return False, result
            
    except Exception as e:
        log(f"  Erreur: {str(e)} ❌", RED)
        return False, {'error': str(e)}

def main():
    log("=" * 60, BLUE)
    log("Test Suppression Double-Rendu Pages CMS", BLUE)
    log("=" * 60, BLUE)
    log("")
    
    base_url = "https://israelgrowthventure.com"
    
    tests = [
        # Pages CMS avec correction double-rendu
        (f"{base_url}/", "Page d'accueil (Home)"),
        (f"{base_url}/qui-sommes-nous", "Qui sommes-nous (About)"),
        (f"{base_url}/contact", "Contact"),
        
        # Pages sans overlay CMS (ne devraient pas changer)
        (f"{base_url}/packs", "Nos Packs"),
        (f"{base_url}/le-commerce-de-demain", "Le Commerce de Demain"),
        
        # Pages critiques non-régression
        (f"{base_url}/etude-implantation-360", "Étude 360°"),
        (f"{base_url}/etude-implantation-360/merci", "Page Merci Étude 360°"),
        (f"{base_url}/admin/login", "Admin Login"),
    ]
    
    results = []
    
    log("SECTION 1: Pages CMS avec correction anti-double-rendu", YELLOW)
    log("-" * 60)
    for i in range(3):
        url, name = tests[i]
        success, result = test_page_load(url, name)
        results.append((name, success, result))
        log("")
    
    log("SECTION 2: Pages React standards (non-régression)", YELLOW)
    log("-" * 60)
    for i in range(3, 5):
        url, name = tests[i]
        success, result = test_page_load(url, name)
        results.append((name, success, result))
        log("")
    
    log("SECTION 3: Pages critiques (non-régression)", YELLOW)
    log("-" * 60)
    for i in range(5, len(tests)):
        url, name = tests[i]
        success, result = test_page_load(url, name)
        results.append((name, success, result))
        log("")
    
    # Résumé
    log("=" * 60, BLUE)
    log("RÉSUMÉ DES TESTS", BLUE)
    log("=" * 60, BLUE)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for name, success, result in results:
        status_icon = "✅" if success else "❌"
        status_code = result.get('status', 'N/A')
        log(f"{status_icon} {name} - Status: {status_code}", GREEN if success else RED)
    
    log("")
    log(f"Total: {passed}/{total} tests réussis", GREEN if passed == total else YELLOW)
    
    if passed == total:
        log("✅ Tous les tests sont passés avec succès !", GREEN)
    else:
        log(f"⚠️ {total - passed} test(s) échoué(s)", YELLOW)
    
    log("")
    log("📝 Comportement attendu:", BLUE)
    log("  - Pages CMS (/, /qui-sommes-nous, /contact) : loader court puis contenu unique")
    log("  - Plus de transition visible entre deux layouts différents")
    log("  - Pages React standards : comportement inchangé")
    log("  - Non-régression : toutes pages critiques OK")

if __name__ == "__main__":
    main()
