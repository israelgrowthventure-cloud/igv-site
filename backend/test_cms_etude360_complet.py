"""
Script de test production complet - Phase CMS + Étude 360°

Ce script teste :
1. Pages CMS principales branchées (Accueil, Qui sommes-nous, Packs, etc.)
2. Landing Étude 360° (sans phrase "Contenu éditable...")
3. Formulaire Étude 360° (envoi + validation)
4. Page Merci enrichie
5. Non-régression (paiements, admin)

Usage:
    python test_cms_etude360_complet.py
"""

import requests
import json
from datetime import datetime
import time

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Résultats de tests
results = []

def test_step(name, url, method="GET", json_data=None, expected_status=200, check_content=None, should_not_contain=None):
    """Exécute un test et enregistre le résultat"""
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{timestamp}] {name}")
    print(f"  URL: {url}")
    print(f"  Méthode: {method}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=15, allow_redirects=True)
        elif method == "POST":
            print(f"  Payload: {json.dumps(json_data, indent=2, ensure_ascii=False)}")
            response = requests.post(url, json=json_data, timeout=15)
        else:
            raise ValueError(f"Méthode non supportée: {method}")
        
        print(f"  Status: {response.status_code}")
        
        # Vérifier le status code
        status_match = response.status_code == expected_status
        
        # Vérifier le contenu si spécifié
        content_check_passed = True
        if check_content:
            content_found = check_content in response.text
            content_check_passed = content_found
            print(f"  Contient '{check_content[:50]}...': {content_found}")
        
        # Vérifier l'absence de contenu si spécifié
        should_not_contain_check = True
        if should_not_contain:
            content_not_found = should_not_contain not in response.text
            should_not_contain_check = content_not_found
            print(f"  Ne contient PAS '{should_not_contain[:50]}...': {content_not_found}")
        
        # Résultat global
        success = status_match and content_check_passed and should_not_contain_check
        
        if success:
            print(f"  Résultat: ✅ PASS")
        else:
            print(f"  Résultat: ❌ FAIL")
            if not status_match:
                print(f"    Status attendu {expected_status}, reçu {response.status_code}")
            if not content_check_passed:
                print(f"    Contenu attendu non trouvé")
            if not should_not_contain_check:
                print(f"    Contenu indésirable trouvé")
        
        results.append({
            "name": name,
            "success": success,
            "status_code": response.status_code,
            "expected_status": expected_status
        })
        
        return success
        
    except Exception as e:
        print(f"  Résultat: ❌ ERREUR - {e}")
        results.append({
            "name": name,
            "success": False,
            "error": str(e)
        })
        return False

def run_tests():
    """Exécute tous les tests de production"""
    
    print(f"\n{'#'*60}")
    print(f"# Suite de tests - Phase CMS + Étude 360°")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*60}")
    
    # ========== SECTION 1: Santé des services ==========
    print(f"\n{'='*60}")
    print(f"SECTION 1: Santé des services")
    print(f"{'='*60}")
    
    test_step(
        name="1.1 - Backend Health Check",
        url=f"{BACKEND_URL}/api/health",
        method="GET",
        expected_status=200
    )
    
    test_step(
        name="1.2 - Frontend Health Check",
        url=FRONTEND_URL,
        method="GET",
        expected_status=200
    )
    
    # ========== SECTION 2: Pages CMS principales ==========
    print(f"\n{'='*60}")
    print(f"SECTION 2: Pages CMS principales branchées")
    print(f"{'='*60}")
    
    pages_cms = [
        ("/", "Accueil"),
        ("/qui-sommes-nous", "Qui sommes-nous"),
        ("/packs", "Packs"),
        ("/le-commerce-de-demain", "Commerce de Demain"),
        ("/contact", "Contact")
    ]
    
    for path, name in pages_cms:
        test_step(
            name=f"2.{pages_cms.index((path, name)) + 1} - Page CMS: {name}",
            url=f"{FRONTEND_URL}{path}",
            method="GET",
            expected_status=200
        )
    
    # ========== SECTION 3: Étude 360° - Landing ==========
    print(f"\n{'='*60}")
    print(f"SECTION 3: Landing Étude 360° (nettoyage)")
    print(f"{'='*60}")
    
    test_step(
        name="3.1 - Page Étude 360° accessible",
        url=f"{FRONTEND_URL}/etude-implantation-360",
        method="GET",
        expected_status=200,
        should_not_contain="Contenu éditable via l'admin IGV"
    )
    
    # ========== SECTION 4: Étude 360° - Formulaire ==========
    print(f"\n{'='*60}")
    print(f"SECTION 4: Formulaire Étude 360°")
    print(f"{'='*60}")
    
    # Créer un payload de test unique
    test_timestamp = int(datetime.now().timestamp())
    test_payload = {
        "full_name": f"TEST_CMS_PHASE_{test_timestamp}",
        "work_email": f"test+cms-phase-{test_timestamp}@israelgrowthventure.com",
        "role": "Test Automatisé - Phase CMS",
        "brand_group": "Suite de Tests IGV",
        "implantation_horizon": "unknown",
        "source": "test_cms_production",
        "locale": "fr"
    }
    
    test_step(
        name="4.1 - API POST création lead",
        url=f"{BACKEND_URL}/api/leads/etude-implantation-360",
        method="POST",
        json_data=test_payload,
        expected_status=201
    )
    
    # ========== SECTION 5: Page Merci enrichie ==========
    print(f"\n{'='*60}")
    print(f"SECTION 5: Page Merci Étude 360° (enrichie)")
    print(f"{'='*60}")
    
    test_step(
        name="5.1 - Page Merci accessible",
        url=f"{FRONTEND_URL}/etude-implantation-360/merci",
        method="GET",
        expected_status=200,
        check_content="Demande bien reçue"
    )
    
    test_step(
        name="5.2 - Page Merci (route alternative)",
        url=f"{FRONTEND_URL}/etude-implantation-merci",
        method="GET",
        expected_status=200,
        check_content="24 heures"
    )
    
    # ========== SECTION 6: Non-régression ==========
    print(f"\n{'='*60}")
    print(f"SECTION 6: Non-régression (paiements, admin)")
    print(f"{'='*60}")
    
    test_step(
        name="6.1 - Admin Login accessible",
        url=f"{FRONTEND_URL}/admin/login",
        method="GET",
        expected_status=200
    )
    
    test_step(
        name="6.2 - Payment Success accessible",
        url=f"{FRONTEND_URL}/payment/success?session_id=test",
        method="GET",
        expected_status=200
    )
    
    # ========== RÉSUMÉ ==========
    print(f"\n{'='*60}")
    print(f"RÉSUMÉ DES TESTS")
    print(f"{'='*60}")
    
    total = len(results)
    passed = sum(1 for r in results if r["success"])
    failed = total - passed
    
    print(f"\nTotal: {total} tests")
    print(f"Réussis: {passed} ✅")
    print(f"Échoués: {failed} ❌")
    
    if failed > 0:
        print(f"\n❌ Tests échoués:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['name']}")
                if "error" in r:
                    print(f"    Erreur: {r['error']}")
                else:
                    print(f"    Status: {r.get('status_code')} (attendu {r.get('expected_status')})")
    
    print(f"\n{'='*60}")
    
    if passed == total:
        print(f"\n✅ Tous les tests ont réussi - Phase CMS prête pour production !")
        return True
    else:
        print(f"\n⚠️ Certains tests ont échoué - Investigation requise")
        return False

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
