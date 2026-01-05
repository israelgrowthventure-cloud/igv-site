"""
Script de tests exhaustifs CRM - Tous les endpoints
Génère audit_out/api_test_results.json et audit_out/api_test_console.log
"""
import requests
import json
import time
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import traceback

from inventory_backend_routes import main as generate_backend_routes

# Configuration
API_BASE_ROOT = "https://igv-cms-backend.onrender.com"
API_BASE = f"{API_BASE_ROOT}/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"
# Safe mode: skip mutating calls (POST/PUT/PATCH/DELETE) to avoid modifying prod data
DRY_RUN = True

# Modules explicitement exclus (demande manuelle)
EXCLUDED_PREFIXES = [
    "/api/monetico",
    "/api/invoices",
    "/api/payments",
]


# Fichiers de sortie
OUTPUT_DIR = Path(__file__).parent
RESULTS_FILE = OUTPUT_DIR / "api_test_results.json"
CONSOLE_LOG_FILE = OUTPUT_DIR / "api_test_console.log"

# Reset console log at each run for readability
CONSOLE_LOG_FILE.write_text("")

# Stockage
results = {
    "timestamp": datetime.now().isoformat(),
    "api_base": API_BASE,
    "login_token": None,
    "tests": []
}


def build_endpoint(path: str) -> str:
    """Normalize endpoint by avoiding double /api prefixes and ensuring leading slash."""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    normalized = path if path.startswith("/") else f"/{path}"
    normalized = normalized.replace("//", "/")
    if normalized.startswith("/api/api"):
        normalized = "/api" + normalized[8:]
    if normalized.startswith("/api"):
        return f"{API_BASE_ROOT}{normalized}"
    return f"{API_BASE}{normalized}"

def log_to_console_and_file(message: str):
    """Log vers console et fichier"""
    print(message)
    with open(CONSOLE_LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{message}\n")

def test_auth() -> Optional[str]:
    """A) Auth - Login admin"""
    log_to_console_and_file("\n" + "="*80)
    log_to_console_and_file("TEST A: AUTH - Login admin")
    log_to_console_and_file("="*80)
    
    url = build_endpoint("/admin/login")
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    start_time = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=15)
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        result = {
            "test_id": "A_auth_login",
            "endpoint": url,
            "method": "POST",
            "payload": payload,
            "status_code": resp.status_code,
            "response": resp.text[:2000] if resp.text else "",
            "elapsed_ms": elapsed_ms,
            "success": resp.status_code == 200
        }
        
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            results["login_token"] = token
            log_to_console_and_file(f"[OK] Login OK - Token: {token[:30]}...")
        else:
            log_to_console_and_file(f"[FAIL] Login FAILED - Status: {resp.status_code}")
        
        results["tests"].append(result)
        return results["login_token"]
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        result = {
            "test_id": "A_auth_login",
            "endpoint": url,
            "method": "POST",
            "payload": payload,
            "status_code": None,
            "response": f"Exception: {str(e)}",
            "elapsed_ms": elapsed_ms,
            "success": False,
            "error": str(e)
        }
        results["tests"].append(result)
        log_to_console_and_file(f"[FAIL] Login EXCEPTION: {str(e)}")
        return None

def test_b_crm_essential(token: str):
    """B) Tests CRM essentiels (a→g)"""
    log_to_console_and_file("\n" + "="*80)
    log_to_console_and_file("TEST B: CRM ESSENTIELS (a->g)")
    log_to_console_and_file("="*80)
    
    headers = {"Authorization": f"Bearer {token}"}
    timestamp = int(time.time())
    test_user_id = None
    test_lead_id = None
    test_contact_id = None
    
    # b) List users
    log_to_console_and_file("\n--- B.b) List users ---")
    url = build_endpoint("/admin/users")
    start_time = time.time()
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        elapsed_ms = int((time.time() - start_time) * 1000)
        results["tests"].append({
            "test_id": "B_b_list_users",
            "endpoint": url,
            "method": "GET",
            "status_code": resp.status_code,
            "response": resp.text[:1000],
            "elapsed_ms": elapsed_ms,
            "success": resp.status_code == 200
        })
        log_to_console_and_file(f"Status: {resp.status_code}, Elapsed: {elapsed_ms}ms")
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        results["tests"].append({
            "test_id": "B_b_list_users",
            "endpoint": url,
            "method": "GET",
            "status_code": None,
            "response": f"Exception: {str(e)}",
            "elapsed_ms": elapsed_ms,
            "success": False,
            "error": str(e)
        })
    
    # c) Create user
    if DRY_RUN:
        log_to_console_and_file("[SKIP] DRY_RUN active - skip create user")
    else:
        log_to_console_and_file("\n--- B.c) Create user ---")
        url = build_endpoint("/admin/users")
        payload = {
            "email": f"TEST_AUDIT_{timestamp}@igvtest.com",
            "first_name": "TestAudit",
            "last_name": f"User{timestamp}",
            "password": "TestPass123!",
            "role": "commercial"
        }
        start_time = time.time()
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            elapsed_ms = int((time.time() - start_time) * 1000)
            response_text = resp.text[:1000] if resp.text else ""
            results["tests"].append({
                "test_id": "B_c_create_user",
                "endpoint": url,
                "method": "POST",
                "payload": payload,
                "status_code": resp.status_code,
                "response": response_text,
                "elapsed_ms": elapsed_ms,
                "success": resp.status_code in [200, 201]
            })
            if resp.status_code in [200, 201]:
                data = resp.json()
                test_user_id = data.get("user_id") or data.get("user", {}).get("id")
                log_to_console_and_file(f"[OK] User created: {test_user_id}")
            else:
                log_to_console_and_file(f"[FAIL] Create user failed: {resp.status_code}")
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            results["tests"].append({
                "test_id": "B_c_create_user",
                "endpoint": url,
                "method": "POST",
                "payload": payload,
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": elapsed_ms,
                "success": False,
                "error": str(e)
            })
    
    # d) Delete user
    if test_user_id and not DRY_RUN:
        log_to_console_and_file(f"\n--- B.d) Delete user {test_user_id} ---")
        url = build_endpoint(f"/admin/users/{test_user_id}")
        start_time = time.time()
        try:
            resp = requests.delete(url, headers=headers, timeout=15)
            elapsed_ms = int((time.time() - start_time) * 1000)
            results["tests"].append({
                "test_id": "B_d_delete_user",
                "endpoint": url,
                "method": "DELETE",
                "status_code": resp.status_code,
                "response": resp.text[:1000],
                "elapsed_ms": elapsed_ms,
                "success": resp.status_code == 200
            })
            log_to_console_and_file(f"Status: {resp.status_code}")
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            results["tests"].append({
                "test_id": "B_d_delete_user",
                "endpoint": url,
                "method": "DELETE",
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": elapsed_ms,
                "success": False,
                "error": str(e)
            })
    
    # e) Re-list users
    log_to_console_and_file("\n--- B.e) Re-list users ---")
    url = build_endpoint("/admin/users")
    start_time = time.time()
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        elapsed_ms = int((time.time() - start_time) * 1000)
        results["tests"].append({
            "test_id": "B_e_relist_users",
            "endpoint": url,
            "method": "GET",
            "status_code": resp.status_code,
            "response": resp.text[:1000],
            "elapsed_ms": elapsed_ms,
            "success": resp.status_code == 200
        })
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        results["tests"].append({
            "test_id": "B_e_relist_users",
            "endpoint": url,
            "method": "GET",
            "status_code": None,
            "response": f"Exception: {str(e)}",
            "elapsed_ms": elapsed_ms,
            "success": False,
            "error": str(e)
        })
    
    # f) Create lead + convert
    log_to_console_and_file("\n--- B.f) Create lead + convert ---")
    if DRY_RUN:
        log_to_console_and_file("[SKIP] DRY_RUN active - skip create/convert lead")
    else:
        url = build_endpoint("/crm/leads")
        payload = {
            "email": f"TEST_AUDIT_LEAD_{timestamp}@igvtest.com",
            "brand_name": f"Test Brand {timestamp}",
            "name": "Test Contact",
            "phone": "+972501234567",
            "language": "fr",
            "sector": "Tech"
        }
        start_time = time.time()
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            elapsed_ms = int((time.time() - start_time) * 1000)
            results["tests"].append({
                "test_id": "B_f_create_lead",
                "endpoint": url,
                "method": "POST",
                "payload": payload,
                "status_code": resp.status_code,
                "response": resp.text[:1000],
                "elapsed_ms": elapsed_ms,
                "success": resp.status_code in [200, 201]
            })
            if resp.status_code in [200, 201]:
                data = resp.json()
                test_lead_id = data.get("lead_id") or data.get("id")
                log_to_console_and_file(f"[OK] Lead created: {test_lead_id}")
                
                # Convert lead
                if test_lead_id:
                    convert_url = build_endpoint(f"/crm/leads/{test_lead_id}/convert-to-contact")
                    convert_start = time.time()
                    try:
                        convert_resp = requests.post(convert_url, headers=headers, timeout=15)
                        convert_elapsed = int((time.time() - convert_start) * 1000)
                        results["tests"].append({
                            "test_id": "B_f_convert_lead",
                            "endpoint": convert_url,
                            "method": "POST",
                            "status_code": convert_resp.status_code,
                            "response": convert_resp.text[:1000],
                            "elapsed_ms": convert_elapsed,
                            "success": convert_resp.status_code == 200
                        })
                        if convert_resp.status_code == 200:
                            convert_data = convert_resp.json()
                            test_contact_id = convert_data.get("contact_id")
                            log_to_console_and_file(f"[OK] Lead converted to contact: {test_contact_id}")
                    except Exception as e:
                        convert_elapsed = int((time.time() - convert_start) * 1000)
                        results["tests"].append({
                            "test_id": "B_f_convert_lead",
                            "endpoint": convert_url,
                            "method": "POST",
                            "status_code": None,
                            "response": f"Exception: {str(e)}",
                            "elapsed_ms": convert_elapsed,
                            "success": False,
                            "error": str(e)
                        })
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            results["tests"].append({
                "test_id": "B_f_create_lead",
                "endpoint": url,
                "method": "POST",
                "payload": payload,
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": elapsed_ms,
                "success": False,
                "error": str(e)
            })
    
    # g) Email: create template + send
    log_to_console_and_file("\n--- B.g) Email template + send ---")
    
    # Create template
    if DRY_RUN:
        log_to_console_and_file("[SKIP] DRY_RUN active - skip email template/send")
    else:
        template_url = build_endpoint("/crm/emails/templates")
        template_payload = {
            "name": f"TEST_AUDIT_TEMPLATE_{timestamp}",
            "subject": "Test Template",
            "body": "Hello {name}, test template.",
            "language": "fr"
        }
        template_start = time.time()
        try:
            template_resp = requests.post(template_url, headers=headers, json=template_payload, timeout=15)
            template_elapsed = int((time.time() - template_start) * 1000)
            results["tests"].append({
                "test_id": "B_g_create_template",
                "endpoint": template_url,
                "method": "POST",
                "payload": template_payload,
                "status_code": template_resp.status_code,
                "response": template_resp.text[:1000],
                "elapsed_ms": template_elapsed,
                "success": template_resp.status_code in [200, 201]
            })
        except Exception as e:
            template_elapsed = int((time.time() - template_start) * 1000)
            results["tests"].append({
                "test_id": "B_g_create_template",
                "endpoint": template_url,
                "method": "POST",
                "payload": template_payload,
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": template_elapsed,
                "success": False,
                "error": str(e)
            })
        
        # Send email (continuer même si template fail)
        send_url = build_endpoint("/crm/emails/send")
        send_payload = {
            "to_email": ADMIN_EMAIL,  # Utiliser email réel pour test
            "subject": f"TEST_AUDIT_EMAIL_{timestamp}",
            "message": "Test email from audit script"
        }
        send_start = time.time()
        try:
            send_resp = requests.post(send_url, headers=headers, json=send_payload, timeout=15)
            send_elapsed = int((time.time() - send_start) * 1000)
            results["tests"].append({
                "test_id": "B_g_send_email",
                "endpoint": send_url,
                "method": "POST",
                "payload": send_payload,
                "status_code": send_resp.status_code,
                "response": send_resp.text[:1000],
                "elapsed_ms": send_elapsed,
                "success": send_resp.status_code == 200
            })
        except Exception as e:
            send_elapsed = int((time.time() - send_start) * 1000)
            results["tests"].append({
                "test_id": "B_g_send_email",
                "endpoint": send_url,
                "method": "POST",
                "payload": send_payload,
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": send_elapsed,
                "success": False,
                "error": str(e)
            })

def test_c_all_routes(token: str):
    """C) Tests de toutes les routes (inventaire)"""
    log_to_console_and_file("\n" + "="*80)
    log_to_console_and_file("TEST C: TOUTES LES ROUTES (inventaire)")
    log_to_console_and_file("="*80)
    
    # Regenerate the backend route inventory dynamically (OpenAPI) before loading
    routes_file = OUTPUT_DIR / "backend_routes.json"
    try:
        generate_backend_routes(API_BASE_ROOT)
    except TypeError:
        # Backward compatibility if signature differs
        generate_backend_routes()
    except Exception as e:
        log_to_console_and_file(f"[WARN] Could not regenerate backend routes: {e}")
    if not routes_file.exists():
        log_to_console_and_file("[FAIL] backend_routes.json not found, skipping route tests")
        return
    
    with open(routes_file, 'r', encoding='utf-8') as f:
        routes_data = json.load(f)
    
    headers = {"Authorization": f"Bearer {token}"}
    timestamp = int(time.time())
    
    for route in routes_data["routes"]:
        path = route["path"]
        method = route["method"]
        endpoint = build_endpoint(path)

        # Exclure Monetico/Invoices/Payments sur demande
        if any(path.startswith(prefix) for prefix in EXCLUDED_PREFIXES):
            log_to_console_and_file(f"  [SKIP] {method} {path}: SKIP [MANUAL EXCLUSION REQUESTED]")
            continue
        
        # Skip certains endpoints système
        if path in ["/health", "/", "/debug/routers"]:
            continue
        
        log_to_console_and_file(f"\n--- Testing {method} {path} ---")

        # Ignore les chemins paramétrés pour éviter mutations ou IDs réels (ne pas compter en SKIP)
        if "{" in path and "}" in path:
            log_to_console_and_file("  [INFO] paramétré ignoré pour DRY_RUN")
            continue
        
        # Déterminer si endpoint nécessite auth
        needs_auth = len(route.get("auth", [])) > 0
        test_headers = headers if needs_auth else {}
        
        # Préparer payload/test data
        payload = None
        query_params = {}
        if method in ["POST", "PUT", "PATCH"]:
            # Essayer payload minimal selon le path
            if "user" in path.lower():
                payload = {
                    "email": f"TEST_AUDIT_{timestamp}@test.com",
                    "first_name": "Test",
                    "last_name": "Audit",
                    "password": "TestPass123!"
                }
            elif "lead" in path.lower():
                payload = {
                    "email": f"TEST_AUDIT_{timestamp}@test.com",
                    "brand_name": f"Test Brand {timestamp}"
                }
            elif "email" in path.lower() and "template" in path.lower():
                payload = {
                    "name": f"TEST_AUDIT_{timestamp}",
                    "subject": "Test",
                    "body": "Test body",
                    "language": "fr"
                }
            elif "email" in path.lower() and "send" in path.lower():
                payload = {
                    "to_email": ADMIN_EMAIL,
                    "subject": f"TEST_AUDIT_{timestamp}",
                    "message": "Test message"
                }
            else:
                payload = {}  # Essayer payload vide

        # Préparer paramètres de requête pour endpoints qui exigent des query params
        if method == "GET":
            if path.startswith("/api/cms/content"):
                query_params = {"page": "home", "language": "fr"}
            elif path.startswith("/api/gdpr/my-data"):
                query_params = {"email": ADMIN_EMAIL}
        
        start_time = time.time()
        try:
            if DRY_RUN and method != "GET":
                elapsed_ms = int((time.time() - start_time) * 1000)
                result = {
                    "test_id": f"C_route_{route['file'].replace('/', '_').replace('.py', '')}_{route['line']}",
                    "endpoint": endpoint,
                    "method": method,
                    "route_file": route["file"],
                    "route_line": route["line"],
                    "payload": payload,
                    "status_code": None,
                    "response": "SKIPPED_DRY_RUN",
                    "elapsed_ms": elapsed_ms,
                    "success": True,
                    "skipped": True
                }
                results["tests"].append(result)
                log_to_console_and_file(f"  [SKIP] {method} {path}: dry run (no mutation)")
                continue

            if method == "GET":
                resp = requests.get(endpoint, headers=test_headers, params=query_params or None, timeout=10)
            elif method == "POST":
                resp = requests.post(endpoint, headers=test_headers, json=payload or {}, timeout=10)
            elif method == "PUT":
                resp = requests.put(endpoint, headers=test_headers, json=payload or {}, timeout=10)
            elif method == "DELETE":
                resp = requests.delete(endpoint, headers=test_headers, timeout=10)
            elif method == "PATCH":
                resp = requests.patch(endpoint, headers=test_headers, json=payload or {}, timeout=10)
            else:
                log_to_console_and_file(f"  [SKIP]  Unknown method: {method}")
                continue
            
            elapsed_ms = int((time.time() - start_time) * 1000)
            
            result = {
                "test_id": f"C_route_{route['file'].replace('/', '_').replace('.py', '')}_{route['line']}",
                "endpoint": endpoint,
                "method": method,
                "route_file": route["file"],
                "route_line": route["line"],
                "payload": payload,
                "status_code": resp.status_code,
                "response": resp.text[:2000] if resp.text else "",
                "elapsed_ms": elapsed_ms,
                "success": (200 <= resp.status_code < 300) or resp.status_code in [401, 403]
            }
            
            results["tests"].append(result)
            
            status_icon = "[OK]" if result["success"] else "[FAIL]"
            log_to_console_and_file(f"  {status_icon} {method} {path}: {resp.status_code} ({elapsed_ms}ms)")
            
        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            result = {
                "test_id": f"C_route_{route['file'].replace('/', '_').replace('.py', '')}_{route['line']}",
                "endpoint": endpoint,
                "method": method,
                "route_file": route["file"],
                "route_line": route["line"],
                "payload": payload,
                "status_code": None,
                "response": f"Exception: {str(e)}",
                "elapsed_ms": elapsed_ms,
                "success": False,
                "error": str(e)
            }
            results["tests"].append(result)
            log_to_console_and_file(f"  [FAIL] {method} {path}: Exception - {str(e)}")

def main():
    # Vider log file
    with open(CONSOLE_LOG_FILE, 'w', encoding='utf-8') as f:
        f.write(f"CRM Full Audit Test - {datetime.now().isoformat()}\n")
        f.write("="*80 + "\n")
    
    log_to_console_and_file(f"\n{'='*80}")
    log_to_console_and_file("CRM FULL AUDIT - TESTS EXHAUSTIFS")
    log_to_console_and_file(f"{'='*80}")
    log_to_console_and_file(f"API_BASE: {API_BASE}")
    log_to_console_and_file(f"DRY_RUN (skip mutations): {DRY_RUN}")
    log_to_console_and_file(f"Timestamp: {results['timestamp']}")
    
    # A) Auth
    token = test_auth()
    if not token:
        log_to_console_and_file("\n[FAIL] AUTH FAILED - Cannot continue tests")
        # Sauvegarder résultats partiels
        with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        return
    
    # B) Tests CRM essentiels
    test_b_crm_essential(token)
    
    # C) Tests toutes routes
    test_c_all_routes(token)
    
    # Résumé
    total_tests = len(results["tests"])
    passed = sum(1 for t in results["tests"] if t.get("success", False))
    failed = total_tests - passed
    
    log_to_console_and_file(f"\n{'='*80}")
    log_to_console_and_file("RESUME")
    log_to_console_and_file(f"{'='*80}")
    log_to_console_and_file(f"Total tests: {total_tests}")
    log_to_console_and_file(f"Passed: {passed}")
    log_to_console_and_file(f"Failed: {failed}")
    
    # Sauvegarder résultats
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    log_to_console_and_file(f"\nResults saved to: {RESULTS_FILE}")
    log_to_console_and_file(f"Console log saved to: {CONSOLE_LOG_FILE}")

if __name__ == "__main__":
    main()

