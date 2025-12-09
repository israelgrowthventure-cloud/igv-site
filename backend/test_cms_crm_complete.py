#!/usr/bin/env python3
"""
Suite de tests complète - Phase CMS + CRM (Décembre 2025)

Tests couverts:
1. Santé des services (backend + frontend)
2. Pages CMS admin (vérifier 7 pages visibles)
3. Page Merci canonique (/etude-implantation-360/merci)
4. Redirection /etude-implantation-merci (TODO frontend)
5. API CRM Leads Étude 360° (GET)
6. Non-régression (admin login, paiements)
"""
import requests
from datetime import datetime
import json

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

results = []

def log(message, prefix=""):
    timestamp = datetime.now().strftime("%H:%M:%S")
    if prefix:
        print(f"{prefix}{message}")
    else:
        print(f"\n[{timestamp}] {message}")

def test_step(name, url, method="GET", expected_status=200, headers=None, json_data=None):
    """Fonction helper pour tests HTTP"""
    log(name)
    log(f"  URL: {url}", prefix="")
    log(f"  Méthode: {method}", prefix="")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        elif method == "POST":
            log(f"  Payload: {json.dumps(json_data, indent=2, ensure_ascii=False)}", prefix="")
            response = requests.post(url, json=json_data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Méthode non supportée: {method}")
        
        log(f"  Status: {response.status_code}", prefix="")
        
        success = response.status_code == expected_status
        
        if success:
            log(f"  Résultat: ✅ PASS", prefix="")
        else:
            log(f"  Résultat: ❌ FAIL", prefix="")
            log(f"    Status attendu {expected_status}, reçu {response.status_code}", prefix="")
        
        results.append({
            "name": name,
            "success": success,
            "status_code": response.status_code,
            "expected_status": expected_status
        })
        
        return response if success else None
        
    except Exception as e:
        log(f"  Résultat: ❌ ERREUR - {e}", prefix="")
        results.append({
            "name": name,
            "success": False,
            "status_code": None,
            "expected_status": expected_status
        })
        return None

def main():
    print(f"\n{'#'*60}")
    print(f"# Suite de tests - Phase CMS + CRM")
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
    
    # ========== SECTION 2: Pages CMS Admin ==========
    print(f"\n{'='*60}")
    print(f"SECTION 2: Pages CMS Admin (7 pages attendues)")
    print(f"{'='*60}")
    
    log("2.1 - Nombre de pages dans MongoDB")
    log(f"  URL: {BACKEND_URL}/api/pages", prefix="")
    try:
        response = requests.get(f"{BACKEND_URL}/api/pages", timeout=30)
        log(f"  Status: {response.status_code}", prefix="")
        
        if response.status_code == 200:
            pages = response.json()
            count = len(pages)
            log(f"  Nombre de pages: {count}", prefix="")
            
            expected_count = 7
            success = count >= expected_count
            
            if success:
                log(f"  Résultat: ✅ PASS (>= {expected_count} pages)", prefix="")
                
                # Afficher les slugs
                log(f"  Pages trouvées:", prefix="")
                for page in pages:
                    slug = page.get('slug', 'N/A')
                    log(f"    - {slug}", prefix="")
            else:
                log(f"  Résultat: ❌ FAIL (attendu >= {expected_count}, reçu {count})", prefix="")
            
            results.append({
                "name": "2.1 - Nombre de pages dans MongoDB",
                "success": success,
                "status_code": response.status_code,
                "expected_status": 200
            })
        else:
            log(f"  Résultat: ❌ FAIL", prefix="")
            results.append({
                "name": "2.1 - Nombre de pages dans MongoDB",
                "success": False,
                "status_code": response.status_code,
                "expected_status": 200
            })
    except Exception as e:
        log(f"  ❌ Erreur: {e}", prefix="")
        results.append({
            "name": "2.1 - Nombre de pages dans MongoDB",
            "success": False,
            "status_code": None,
            "expected_status": 200
        })
    
    # ========== SECTION 3: Page Merci Canonique ==========
    print(f"\n{'='*60}")
    print(f"SECTION 3: Page Merci Canonique")
    print(f"{'='*60}")
    
    test_step(
        name="3.1 - Page /etude-implantation-360/merci accessible",
        url=f"{FRONTEND_URL}/etude-implantation-360/merci",
        method="GET",
        expected_status=200
    )
    
    # ========== SECTION 4: API CRM Leads ==========
    print(f"\n{'='*60}")
    print(f"SECTION 4: API CRM Leads Étude 360°")
    print(f"{'='*60}")
    
    # Authentification admin
    log("4.1 - Authentification admin")
    log(f"  URL: {BACKEND_URL}/api/auth/login", prefix="")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        log(f"  Status: {response.status_code}", prefix="")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                log(f"  Résultat: ✅ PASS (token obtenu)", prefix="")
                results.append({
                    "name": "4.1 - Authentification admin",
                    "success": True,
                    "status_code": 200,
                    "expected_status": 200
                })
                
                # Test API GET leads
                log("4.2 - API GET /api/leads/etude-implantation-360")
                log(f"  URL: {BACKEND_URL}/api/leads/etude-implantation-360", prefix="")
                try:
                    response = requests.get(
                        f"{BACKEND_URL}/api/leads/etude-implantation-360",
                        headers={"Authorization": f"Bearer {token}"},
                        timeout=30
                    )
                    log(f"  Status: {response.status_code}", prefix="")
                    
                    if response.status_code == 200:
                        data = response.json()
                        total = data.get('total', 0)
                        log(f"  Total leads: {total}", prefix="")
                        log(f"  Résultat: ✅ PASS", prefix="")
                        results.append({
                            "name": "4.2 - API GET leads",
                            "success": True,
                            "status_code": 200,
                            "expected_status": 200
                        })
                    else:
                        log(f"  Résultat: ❌ FAIL", prefix="")
                        results.append({
                            "name": "4.2 - API GET leads",
                            "success": False,
                            "status_code": response.status_code,
                            "expected_status": 200
                        })
                except Exception as e:
                    log(f"  ❌ Erreur: {e}", prefix="")
                    results.append({
                        "name": "4.2 - API GET leads",
                        "success": False,
                        "status_code": None,
                        "expected_status": 200
                    })
            else:
                log(f"  Résultat: ❌ FAIL (token non trouvé)", prefix="")
                results.append({
                    "name": "4.1 - Authentification admin",
                    "success": False,
                    "status_code": 200,
                    "expected_status": 200
                })
        else:
            log(f"  Résultat: ❌ FAIL", prefix="")
            results.append({
                "name": "4.1 - Authentification admin",
                "success": False,
                "status_code": response.status_code,
                "expected_status": 200
            })
    except Exception as e:
        log(f"  ❌ Erreur: {e}", prefix="")
        results.append({
            "name": "4.1 - Authentification admin",
            "success": False,
            "status_code": None,
            "expected_status": 200
        })
    
    # ========== SECTION 5: Non-régression ==========
    print(f"\n{'='*60}")
    print(f"SECTION 5: Non-régression (paiements, admin, accueil)")
    print(f"{'='*60}")
    
    test_step(
        name="5.1 - Page d'accueil",
        url=FRONTEND_URL,
        method="GET",
        expected_status=200
    )
    
    test_step(
        name="5.2 - Admin Login accessible",
        url=f"{FRONTEND_URL}/admin/login",
        method="GET",
        expected_status=200
    )
    
    test_step(
        name="5.3 - Payment Success accessible",
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
                print(f"    Status: {r['status_code']} (attendu {r['expected_status']})")
    
    print(f"\n{'='*60}\n")
    
    if failed > 0:
        print(f"⚠️ Certains tests ont échoué - Investigation requise\n")
        return False
    else:
        print(f"✅ Tous les tests ont réussi - Phase CMS + CRM prête pour production !\n")
        return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
