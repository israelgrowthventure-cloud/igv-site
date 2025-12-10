#!/usr/bin/env python3
"""
TEST PRODUCTION - Phase 6 bis : Restauration design + Correction Monetico
===========================================================================

Objectifs de cette phase :
1. Vérifier que les pages publiques affichent le contenu CMS (design restauré)
2. Vérifier que l'endpoint Monetico ne renvoie JAMAIS 500 (503 OK si non configuré)
3. Vérifier que toutes les pages sont accessibles et non cassées

Tests attendus :
- Pages publiques : 200 + contenu non vide
- Endpoint Monetico : 200 (si configuré) OU 503 (si non configuré) - PAS DE 500
- Admin pages : 200 + contenu
"""

import sys
import requests
import json
from datetime import datetime
from typing import Dict, List, Tuple

# URLs de production
FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"

# Couleurs pour output terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class TestResult:
    def __init__(self, name: str, passed: bool, message: str, details: str = ""):
        self.name = name
        self.passed = passed
        self.message = message
        self.details = details

def print_header(title: str):
    print(f"\n{BLUE}{'=' * 80}{RESET}")
    print(f"{BLUE}{title.center(80)}{RESET}")
    print(f"{BLUE}{'=' * 80}{RESET}\n")

def print_test_result(result: TestResult):
    status = f"{GREEN}✓ PASS{RESET}" if result.passed else f"{RED}✗ FAIL{RESET}"
    print(f"{status} | {result.name}")
    print(f"      {result.message}")
    if result.details:
        print(f"      {YELLOW}Details:{RESET} {result.details}")
    print()

def test_frontend_page(path: str, expected_keywords: List[str] = None) -> TestResult:
    """
    Tester une page frontend (HTML complet)
    
    Args:
        path: Chemin de la page (ex: "/", "/packs")
        expected_keywords: Mots-clés attendus dans le HTML (optionnel)
    
    Returns:
        TestResult avec le statut du test
    """
    url = f"{FRONTEND_URL}{path}"
    try:
        response = requests.get(url, timeout=15, allow_redirects=True)
        
        # Vérifier le code de statut
        if response.status_code != 200:
            return TestResult(
                name=f"Frontend {path}",
                passed=False,
                message=f"Code {response.status_code} au lieu de 200",
                details=url
            )
        
        # Vérifier que le contenu n'est pas vide
        content = response.text
        if len(content) < 100:
            return TestResult(
                name=f"Frontend {path}",
                passed=False,
                message="Contenu HTML trop court (< 100 chars)",
                details=f"Length: {len(content)} chars"
            )
        
        # Vérifier les mots-clés attendus (si fournis)
        if expected_keywords:
            missing_keywords = [kw for kw in expected_keywords if kw.lower() not in content.lower()]
            if missing_keywords:
                return TestResult(
                    name=f"Frontend {path}",
                    passed=False,
                    message=f"Mots-clés manquants: {', '.join(missing_keywords)}",
                    details=url
                )
        
        return TestResult(
            name=f"Frontend {path}",
            passed=True,
            message=f"200 OK - {len(content)} chars",
            details=url
        )
        
    except requests.Timeout:
        return TestResult(
            name=f"Frontend {path}",
            passed=False,
            message="Timeout (> 15s)",
            details=url
        )
    except Exception as e:
        return TestResult(
            name=f"Frontend {path}",
            passed=False,
            message=f"Exception: {type(e).__name__}",
            details=str(e)
        )

def test_monetico_endpoint() -> TestResult:
    """
    Tester l'endpoint Monetico backend
    
    Comportement attendu :
    - Si Monetico configuré : 200 + JSON avec form_action, form_fields
    - Si Monetico NON configuré : 503 + JSON avec detail/message
    - JAMAIS 500
    """
    url = f"{BACKEND_URL}/api/payments/monetico/init"
    
    # Payload de test
    payload = {
        "pack": "analyse",
        "amount": 3000.0,
        "currency": "EUR",
        "customer_email": "test@example.com",
        "customer_name": "Test User",
        "order_reference": f"TEST-{datetime.now().timestamp()}"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        status = response.status_code
        
        # 500 = ÉCHEC (objectif : plus jamais de 500)
        if status == 500:
            return TestResult(
                name="Monetico Init Endpoint",
                passed=False,
                message="ERREUR 500 détectée (inacceptable)",
                details=f"Response: {response.text[:200]}"
            )
        
        # 503 = OK (Monetico non configuré, comportement attendu)
        if status == 503:
            try:
                data = response.json()
                return TestResult(
                    name="Monetico Init Endpoint",
                    passed=True,
                    message="503 Service Unavailable (Monetico non configuré - comportement attendu)",
                    details=f"Message: {data.get('detail', {}).get('message', 'N/A')}"
                )
            except:
                return TestResult(
                    name="Monetico Init Endpoint",
                    passed=True,
                    message="503 Service Unavailable (Monetico non configuré)",
                    details="Response non-JSON mais 503 accepté"
                )
        
        # 200 = OK (Monetico configuré et fonctionnel)
        if status == 200:
            try:
                data = response.json()
                if 'form_action' in data and 'form_fields' in data:
                    return TestResult(
                        name="Monetico Init Endpoint",
                        passed=True,
                        message="200 OK - Monetico configuré et opérationnel",
                        details=f"form_action: {data.get('form_action', 'N/A')}"
                    )
                else:
                    return TestResult(
                        name="Monetico Init Endpoint",
                        passed=False,
                        message="200 mais structure JSON invalide",
                        details=f"Keys: {list(data.keys())}"
                    )
            except:
                return TestResult(
                    name="Monetico Init Endpoint",
                    passed=False,
                    message="200 mais réponse non-JSON",
                    details=response.text[:200]
                )
        
        # Autre code (400, 401, etc.)
        return TestResult(
            name="Monetico Init Endpoint",
            passed=False,
            message=f"Code inattendu: {status}",
            details=response.text[:200]
        )
        
    except requests.Timeout:
        return TestResult(
            name="Monetico Init Endpoint",
            passed=False,
            message="Timeout (> 10s)",
            details=url
        )
    except Exception as e:
        return TestResult(
            name="Monetico Init Endpoint",
            passed=False,
            message=f"Exception: {type(e).__name__}",
            details=str(e)
        )

def test_backend_health() -> TestResult:
    """Tester le health check backend"""
    url = f"{BACKEND_URL}/api/health"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return TestResult(
                name="Backend Health Check",
                passed=True,
                message="200 OK",
                details=url
            )
        else:
            return TestResult(
                name="Backend Health Check",
                passed=False,
                message=f"Code {response.status_code}",
                details=url
            )
    except Exception as e:
        return TestResult(
            name="Backend Health Check",
            passed=False,
            message=f"Exception: {type(e).__name__}",
            details=str(e)
        )

def main():
    print_header("TESTS PRODUCTION - Phase 6 bis (Restauration + Monetico)")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"Frontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")
    
    results: List[TestResult] = []
    
    # ===== BACKEND TESTS =====
    print_header("1. Backend Health & APIs")
    
    # Health check
    result = test_backend_health()
    print_test_result(result)
    results.append(result)
    
    # Monetico endpoint (CRITIQUE - plus jamais de 500)
    result = test_monetico_endpoint()
    print_test_result(result)
    results.append(result)
    
    # ===== FRONTEND TESTS =====
    print_header("2. Pages Publiques (Design Restauré)")
    
    # Home
    result = test_frontend_page("/", expected_keywords=["Israel Growth Venture"])
    print_test_result(result)
    results.append(result)
    
    # Qui sommes-nous
    result = test_frontend_page("/qui-sommes-nous", expected_keywords=["Israel Growth Venture"])
    print_test_result(result)
    results.append(result)
    
    # Packs
    result = test_frontend_page("/packs", expected_keywords=["pack"])
    print_test_result(result)
    results.append(result)
    
    # Le commerce de demain
    result = test_frontend_page("/le-commerce-de-demain")
    print_test_result(result)
    results.append(result)
    
    # Contact
    result = test_frontend_page("/contact")
    print_test_result(result)
    results.append(result)
    
    # Étude Implantation 360
    result = test_frontend_page("/etude-implantation-360")
    print_test_result(result)
    results.append(result)
    
    # Merci page (Étude 360)
    result = test_frontend_page("/etude-implantation-360/merci")
    print_test_result(result)
    results.append(result)
    
    # ===== SUMMARY =====
    print_header("RÉSUMÉ DES TESTS")
    
    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total = len(results)
    
    print(f"Total: {total} tests")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {failed}{RESET}")
    print(f"Success Rate: {(passed/total)*100:.1f}%\n")
    
    if failed > 0:
        print(f"{RED}❌ TESTS ÉCHOUÉS:{RESET}")
        for r in results:
            if not r.passed:
                print(f"  - {r.name}: {r.message}")
        print()
        sys.exit(1)
    else:
        print(f"{GREEN}✅ TOUS LES TESTS SONT PASSÉS !{RESET}\n")
        print("La Phase 6 bis est validée :")
        print("  ✓ Pages publiques accessibles (design restauré)")
        print("  ✓ Endpoint Monetico propre (503 si non configuré, pas de 500)")
        print("  ✓ Aucune régression détectée")
        print()
        sys.exit(0)

if __name__ == "__main__":
    main()
