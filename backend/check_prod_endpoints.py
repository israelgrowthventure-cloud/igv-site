"""
Script de vérification des endpoints en production
Teste uniquement les routes publiques non-destructives sur https://israelgrowthventure.com
"""
import requests
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"  # Backend direct si nécessaire
TIMEOUT = 15

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

def check_get(path: str, use_backend_direct: bool = False):
    """Vérifie un endpoint GET"""
    base = BACKEND_URL if use_backend_direct else BASE_URL
    url = f"{base}{path}"
    
    try:
        print(f"\n{BLUE}Testing:{RESET} GET {path}")
        r = requests.get(url, timeout=TIMEOUT)
        
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

def check_post(path: str, json_data: dict, use_backend_direct: bool = False):
    """Vérifie un endpoint POST"""
    base = BACKEND_URL if use_backend_direct else BASE_URL
    url = f"{base}{path}"
    
    try:
        print(f"\n{BLUE}Testing:{RESET} POST {path}")
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
    print(f"Base URL: {BASE_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    results = []
    
    # Test 1: Healthcheck backend direct
    log_info("\n=== Test 1: Backend Healthcheck ===")
    results.append(("Backend /", check_get("/", use_backend_direct=True)))
    
    # Test 2: Packs (endpoint public)
    log_info("\n=== Test 2: Packs ===")
    results.append(("GET /api/packs", check_get("/api/packs", use_backend_direct=True)))
    
    # Test 3: Pricing Rules (endpoint public)
    log_info("\n=== Test 3: Pricing Rules ===")
    results.append(("GET /api/pricing-rules", check_get("/api/pricing-rules", use_backend_direct=True)))
    
    # Test 4: Pages (endpoint public)
    log_info("\n=== Test 4: Pages ===")
    results.append(("GET /api/pages", check_get("/api/pages", use_backend_direct=True)))
    
    # Test 5: Translations (endpoint public)
    log_info("\n=== Test 5: Translations ===")
    results.append(("GET /api/translations", check_get("/api/translations", use_backend_direct=True)))
    
    # Test 6: Auth Login (compte admin réel - non destructif)
    log_info("\n=== Test 6: Auth Login ===")
    log_warning("Test avec compte admin réel (postmaster@israelgrowthventure.com)")
    results.append(("POST /api/auth/login", check_post(
        "/api/auth/login",
        {
            "email": "postmaster@israelgrowthventure.com",
            "password": "Admin@igv"
        },
        use_backend_direct=True
    )))
    
    # Test 7: Pricing par pays
    log_info("\n=== Test 7: Pricing by Country ===")
    results.append(("GET /api/pricing/country/IL", check_get("/api/pricing/country/IL", use_backend_direct=True)))
    results.append(("GET /api/pricing/country/US", check_get("/api/pricing/country/US", use_backend_direct=True)))
    
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
