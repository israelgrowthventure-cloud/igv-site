"""
Script de vérification des endpoints en production
Teste uniquement les routes publiques non-destructives sur https://israelgrowthventure.com
et https://igv-cms-backend.onrender.com

IMPORTANT:
- Les credentials admin sont lus depuis les variables d'environnement
- Les routes destructrices (POST/PUT/DELETE) doivent être testées MANUELLEMENT
- Ne jamais lancer ce script en boucle automatique sur la production
"""
import requests
import sys
import os
from datetime import datetime

# Configuration
FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"
TIMEOUT = 30  # Augmenté pour éviter timeouts sur cold start

# Credentials admin (lus depuis les variables d'environnement)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "postmaster@israelgrowthventure.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@igv")

# Couleurs pour le terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_success(message):
    print(f"{GREEN}✓{RESET} {message}")

def log_error(message):
    print(f"{RED}✗{RESET} {message}")

def log_warning(message):
    print(f"{YELLOW}⚠{RESET} {message}")

def log_info(message):
    print(f"{BLUE}ℹ{RESET} {message}")

def check_get(path: str, use_backend_direct: bool = False, base_url: str = None):
    """Vérifie un endpoint GET"""
    if base_url:
        base = base_url
    else:
        base = BACKEND_URL if use_backend_direct else FRONTEND_URL
    url = f"{base}{path}"
    
    try:
        print(f"\n{BLUE}Testing:{RESET} GET {url}")
        r = requests.get(url, timeout=TIMEOUT, allow_redirects=True)
        
        if r.status_code == 200:
            log_success(f"Status: {r.status_code}")
            
            # Afficher un aperçu du contenu
            try:
                data = r.json()
                if isinstance(data, list):
                    log_info(f"Response: List with {len(data)} items")
                elif isinstance(data, dict):
                    log_info(f"Response: Dict with keys: {list(data.keys())[:5]}")
            except:
                log_info(f"Response: {r.text[:100]}")
            
            return True
        else:
            log_error(f"Status: {r.status_code}")
            log_error(f"Response: {r.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        log_error(f"Timeout après {TIMEOUT}s")
        return False
    except requests.exceptions.RequestException as e:
        log_error(f"Erreur: {str(e)}")
        return False

def check_post(path: str, json_data: dict, use_backend_direct: bool = False, base_url: str = None):
    """Vérifie un endpoint POST"""
    if base_url:
        base = base_url
    else:
        base = BACKEND_URL if use_backend_direct else FRONTEND_URL
    url = f"{base}{path}"
    
    try:
        print(f"\n{BLUE}Testing:{RESET} POST {url}")
        r = requests.post(url, json=json_data, timeout=TIMEOUT)
        
        if r.status_code in [200, 201]:
            log_success(f"Status: {r.status_code}")
            
            # Afficher un aperçu du contenu
            try:
                data = r.json()
                if isinstance(data, dict):
                    log_info(f"Response: {list(data.keys())}")
                else:
                    log_info(f"Response: {str(data)[:100]}")
            except:
                log_info(f"Response: {r.text[:100]}")
            
            return True
        else:
            log_error(f"Status: {r.status_code}")
            log_error(f"Response: {r.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        log_error(f"Timeout après {TIMEOUT}s")
        return False
    except requests.exceptions.RequestException as e:
        log_error(f"Erreur: {str(e)}")
        return False

def main():
    print("=" * 80)
    print(f"{BLUE}VÉRIFICATION DES ENDPOINTS PRODUCTION{RESET}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    results = []
    
    # ========== TESTS FRONTEND ==========
    log_info("\n" + "=" * 80)
    log_info("FRONTEND - Pages publiques React")
    log_info("=" * 80)
    
    # Test F1: Homepage
    log_info("\n=== Test F1: Homepage ===")
    results.append(("Frontend GET /", check_get("/", base_url=FRONTEND_URL)))
    
    # Test F2: Packs page
    log_info("\n=== Test F2: Packs Page ===")
    results.append(("Frontend GET /packs", check_get("/packs", base_url=FRONTEND_URL)))
    
    # Test F3: About page
    log_info("\n=== Test F3: About Page ===")
    results.append(("Frontend GET /about", check_get("/about", base_url=FRONTEND_URL)))
    
    # Test F4: Contact page
    log_info("\n=== Test F4: Contact Page ===")
    results.append(("Frontend GET /contact", check_get("/contact", base_url=FRONTEND_URL)))
    
    # ========== TESTS BACKEND ==========
    log_info("\n" + "=" * 80)
    log_info("BACKEND - API endpoints")
    log_info("=" * 80)
    
    # Test B1: Healthcheck backend direct
    log_info("\n=== Test B1: Backend Root Healthcheck ===")
    results.append(("Backend GET /", check_get("/", use_backend_direct=True)))
    
    # Test B2: API Health
    log_info("\n=== Test B2: API Health ===")
    results.append(("Backend GET /api/health", check_get("/api/health", use_backend_direct=True)))
    
    # Test B3: Packs (endpoint public)
    log_info("\n=== Test B3: API Packs ===")
    results.append(("Backend GET /api/packs", check_get("/api/packs", use_backend_direct=True)))
    
    # Test B4: Pricing Rules (endpoint public)
    log_info("\n=== Test B4: API Pricing Rules ===")
    results.append(("Backend GET /api/pricing-rules", check_get("/api/pricing-rules", use_backend_direct=True)))
    
    # Test B5: Pages (endpoint public)
    log_info("\n=== Test B5: API Pages ===")
    results.append(("Backend GET /api/pages", check_get("/api/pages", use_backend_direct=True)))
    
    # Test B6: Translations (endpoint public)
    log_info("\n=== Test B6: API Translations ===")
    results.append(("Backend GET /api/translations", check_get("/api/translations", use_backend_direct=True)))
    
    # Test B7: Pricing par pays
    log_info("\n=== Test B7: API Pricing by Country (Israel) ===")
    results.append(("Backend GET /api/pricing/country/IL", check_get("/api/pricing/country/IL", use_backend_direct=True)))
    
    log_info("\n=== Test B8: API Pricing by Country (US) ===")
    results.append(("Backend GET /api/pricing/country/US", check_get("/api/pricing/country/US", use_backend_direct=True)))
    
    # Résumé
    print("\n" + "=" * 80)
    print(f"{BLUE}RÉSUMÉ{RESET}")
    print("=" * 80)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = f"{GREEN}✓ PASS{RESET}" if success else f"{RED}✗ FAIL{RESET}"
        print(f"{status} - {name}")
    
    print("\n" + "=" * 80)
    print(f"Tests réussis: {passed}/{total}")
    
    if passed == total:
        print(f"{GREEN}✓ TOUS LES TESTS PASSENT{RESET}")
        return 0
    else:
        print(f"{RED}✗ {total - passed} TEST(S) EN ÉCHEC{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
