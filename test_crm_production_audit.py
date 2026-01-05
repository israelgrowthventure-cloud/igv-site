"""
TEST CRM PRODUCTION AUDIT - Audit complet avec preuves brutes
Environnement: https://israelgrowthventure.com
"""
import requests
import json
import uuid
import time
from datetime import datetime
from urllib.parse import urljoin

# Configuration
FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"
API_BASE = f"{BACKEND_URL}/api"  # Backend réel
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

# Stockage des résultats
results = {
    "api_base": None,
    "login_token": None,
    "tests": [],
    "bugs": [],
    "incoherences": []
}

def log_result(test_name, status, details="", payload="", response="", status_code=None):
    """Log un résultat de test"""
    result = {
        "test": test_name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "details": details,
        "payload": payload,
        "response": response,
        "status_code": status_code
    }
    results["tests"].append(result)
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"Status: {status}")
    if status_code:
        print(f"HTTP Status: {status_code}")
    if payload:
        print(f"Payload: {json.dumps(payload, indent=2, ensure_ascii=False)[:500]}")
    if response:
        print(f"Response: {response[:1000]}")
    if details:
        print(f"Details: {details}")
    print(f"{'='*80}")

def test_1_identify_api_base():
    """1) Identifier l'API_BASE réellement utilisée"""
    log_result("1. Identify API_BASE", "EXECUTING")
    
    # Utiliser directement le backend connu
    backend_url = "https://igv-cms-backend.onrender.com"
    api_base = f"{backend_url}/api"
    
    # Test 1.1: OpenAPI endpoint
    try:
        resp = requests.get(f"{api_base}/openapi.json", timeout=10)
        if resp.status_code == 200:
            content_type = resp.headers.get('content-type', '')
            if 'json' in content_type.lower():
                log_result("1.1 OpenAPI endpoint", "PASS", f"API_BASE: {api_base}", status_code=200, response=f"JSON response ({len(resp.text)} bytes)")
                results["api_base"] = api_base
                return api_base
    except Exception as e:
        pass
    
    # Test 1.2: Login endpoint pour confirmer
    try:
        resp = requests.post(f"{api_base}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        if resp.status_code in [200, 401, 503]:
            log_result("1.2 Login endpoint test", "PASS", f"API_BASE confirmed: {api_base}", status_code=resp.status_code)
            results["api_base"] = api_base
            return api_base
    except Exception as e:
        pass
    
    log_result("1. Identify API_BASE", "FAIL", "Could not identify API_BASE")
    return None

def test_2_openapi_json():
    """2.A) GET openapi.json"""
    api_base = results["api_base"] or API_BASE
    url = f"{api_base}/openapi.json"
    log_result("2.A OpenAPI JSON", "EXECUTING")
    
    try:
        resp = requests.get(url, timeout=15)
        response_text = resp.text[:500] if resp.text else "Empty response"
        try:
            # Essayer de décoder en UTF-8
            if isinstance(response_text, bytes):
                response_text = response_text.decode('utf-8', errors='ignore')
        except:
            pass
        log_result("2.A OpenAPI JSON", "PASS" if resp.status_code == 200 else "FAIL",
                  f"URL: {url}",
                  status_code=resp.status_code,
                  response=response_text)
        return resp.status_code == 200
    except Exception as e:
        log_result("2.A OpenAPI JSON", "FAIL", f"Exception: {str(e)}")
        return False

def test_3_admin_login():
    """2.B) POST admin/login"""
    api_base = results["api_base"] or API_BASE
    url = f"{api_base}/admin/login"
    log_result("3. Admin Login", "EXECUTING")
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=15)
        response_text = resp.text[:1000] if resp.text else "Empty response"
        
        if resp.status_code == 200:
            try:
                data = resp.json()
                token = data.get("access_token")
                if token:
                    results["login_token"] = token
                    log_result("3. Admin Login", "PASS",
                              f"Token obtained: {token[:30]}...",
                              payload=payload,
                              response=json.dumps(data, indent=2, ensure_ascii=False)[:500],
                              status_code=200)
                    return True
            except json.JSONDecodeError:
                log_result("3. Admin Login", "FAIL",
                          f"Invalid JSON response",
                          payload=payload,
                          response=response_text,
                          status_code=resp.status_code)
                return False
        else:
            log_result("3. Admin Login", "FAIL",
                      f"Login failed",
                      payload=payload,
                      response=response_text,
                      status_code=resp.status_code)
            return False
    except Exception as e:
        log_result("3. Admin Login", "FAIL", f"Exception: {str(e)}")
        return False

def test_4a_list_users():
    """4.A.1) Lister users"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.A.1 List Users", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/admin/users"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code == 200:
            data = resp.json()
            users = data.get("users", [])
            log_result("4.A.1 List Users", "PASS",
                      f"Total users: {len(users)}",
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=200)
            return users
        else:
            log_result("4.A.1 List Users", "FAIL",
                      f"Status {resp.status_code}",
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.A.1 List Users", "FAIL", f"Exception: {str(e)}")
        return None

def test_4a_create_user(role="commercial", test_id=""):
    """4.A.2) Créer user"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result(f"4.A.2 Create User ({role})", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/admin/users"
    headers = {"Authorization": f"Bearer {token}"}
    
    user_email = f"test_user_{role}_{test_id}_{int(time.time())}@igvtest.com"
    payload = {
        "email": user_email,
        "first_name": f"Test{role.capitalize()}",
        "last_name": f"User{test_id}",
        "password": "TestPass123!",
        "role": role
    }
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code in [200, 201]:
            data = resp.json()
            user_id = data.get("user_id") or data.get("user", {}).get("id") or data.get("id")
            log_result(f"4.A.2 Create User ({role})", "PASS",
                      f"User created: {user_id}",
                      payload=payload,
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=resp.status_code)
            return {"user_id": user_id, "email": user_email, "payload": payload}
        else:
            log_result(f"4.A.2 Create User ({role})", "FAIL",
                      f"Status {resp.status_code}",
                      payload=payload,
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result(f"4.A.2 Create User ({role})", "FAIL", f"Exception: {str(e)}")
        return None

def test_4a_update_user(user_id, user_email):
    """4.A.3) Modifier user"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.A.3 Update User", "SKIPPED", "No token (login failed)")
        return False
    
    url = f"{api_base}/admin/users/{user_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "first_name": "UpdatedFirst",
        "last_name": "UpdatedLast"
    }
    
    try:
        resp = requests.put(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        log_result("4.A.3 Update User", "PASS" if resp.status_code == 200 else "FAIL",
                  f"User ID: {user_id}",
                  payload=payload,
                  response=response_text,
                  status_code=resp.status_code)
        return resp.status_code == 200
    except Exception as e:
        log_result("4.A.3 Update User", "FAIL", f"Exception: {str(e)}")
        return False

def test_4a_delete_user(user_id, user_email):
    """4.A.4) Supprimer user"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.A.4 Delete User", "SKIPPED", "No token (login failed)")
        return False
    
    url = f"{api_base}/admin/users/{user_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.delete(url, headers=headers, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        log_result("4.A.4 Delete User", "PASS" if resp.status_code == 200 else "FAIL",
                  f"User ID: {user_id}, Email: {user_email}",
                  response=response_text,
                  status_code=resp.status_code)
        return resp.status_code == 200
    except Exception as e:
        log_result("4.A.4 Delete User", "FAIL", f"Exception: {str(e)}")
        return False

def test_4b_create_lead():
    """4.B.1) Créer prospect"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.B.1 Create Lead", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/crm/leads"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "email": f"testlead_{int(time.time())}@igvtest.com",
        "brand_name": f"Test Brand {int(time.time())}",
        "name": "Test Contact",
        "phone": "+972501234567",
        "language": "fr",
        "sector": "Tech"
    }
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code in [200, 201]:
            data = resp.json()
            lead_id = data.get("lead_id") or data.get("id") or data.get("_id")
            log_result("4.B.1 Create Lead", "PASS",
                      f"Lead created: {lead_id}",
                      payload=payload,
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=resp.status_code)
            return {"lead_id": lead_id, "payload": payload, "response": data}
        else:
            log_result("4.B.1 Create Lead", "FAIL",
                      f"Status {resp.status_code}",
                      payload=payload,
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.B.1 Create Lead", "FAIL", f"Exception: {str(e)}")
        return None

def test_4b_get_lead(lead_id):
    """4.B.2) Récupérer lead pour voir structure"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.B.2 Get Lead", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/crm/leads/{lead_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        response_text = resp.text[:3000] if resp.text else "Empty response"
        
        if resp.status_code == 200:
            data = resp.json()
            log_result("4.B.2 Get Lead", "PASS",
                      f"Lead structure retrieved",
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:2000],
                      status_code=200)
            return data
        else:
            log_result("4.B.2 Get Lead", "FAIL",
                      f"Status {resp.status_code}",
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.B.2 Get Lead", "FAIL", f"Exception: {str(e)}")
        return None

def test_4b_convert_lead(lead_id):
    """4.B.3) Convertir prospect → contact"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.B.3 Convert Lead", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/crm/leads/{lead_id}/convert-to-contact"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.post(url, headers=headers, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code == 200:
            data = resp.json()
            contact_id = data.get("contact_id") or data.get("id")
            log_result("4.B.3 Convert Lead", "PASS",
                      f"Contact created: {contact_id}",
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=200)
            return {"contact_id": contact_id, "response": data}
        else:
            log_result("4.B.3 Convert Lead", "FAIL",
                      f"Status {resp.status_code}",
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.B.3 Convert Lead", "FAIL", f"Exception: {str(e)}")
        return None

def test_4c_create_opportunity():
    """4.C.1) Créer opportunité"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.C.1 Create Opportunity", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/crm/opportunities"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "name": f"Test Opportunity {int(time.time())}",
        "value": 50000,
        "stage": "qualification",
        "probability": 50
    }
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code in [200, 201]:
            data = resp.json()
            opp_id = data.get("opportunity_id") or data.get("id") or data.get("_id")
            log_result("4.C.1 Create Opportunity", "PASS",
                      f"Opportunity created: {opp_id}",
                      payload=payload,
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=resp.status_code)
            return {"opp_id": opp_id, "payload": payload, "response": data}
        else:
            log_result("4.C.1 Create Opportunity", "FAIL",
                      f"Status {resp.status_code}",
                      payload=payload,
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.C.1 Create Opportunity", "FAIL", f"Exception: {str(e)}")
        return None

def test_4c_update_opportunity_stage(opp_id, new_stage="proposal"):
    """4.C.2) Mettre à jour stage opportunité"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.C.2 Update Opportunity Stage", "SKIPPED", "No token (login failed)")
        return False
    
    url = f"{api_base}/crm/opportunities/{opp_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "stage": new_stage
    }
    
    try:
        resp = requests.put(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        log_result("4.C.2 Update Opportunity Stage", "PASS" if resp.status_code == 200 else "FAIL",
                  f"Opportunity ID: {opp_id}, New stage: {new_stage}",
                  payload=payload,
                  response=response_text,
                  status_code=resp.status_code)
        return resp.status_code == 200
    except Exception as e:
        log_result("4.C.2 Update Opportunity Stage", "FAIL", f"Exception: {str(e)}")
        return False

def test_4d_create_email_template():
    """4.D.1) Créer template email"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.D.1 Create Email Template", "SKIPPED", "No token (login failed)")
        return None
    
    url = f"{api_base}/crm/emails/templates"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "name": f"Test Template {int(time.time())}",
        "subject": "Test Email Subject",
        "body": "Hello {name}, this is a test template.",
        "language": "fr"
    }
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        if resp.status_code in [200, 201]:
            data = resp.json()
            template_id = data.get("template_id") or data.get("id")
            log_result("4.D.1 Create Email Template", "PASS",
                      f"Template created: {template_id}",
                      payload=payload,
                      response=json.dumps(data, indent=2, ensure_ascii=False)[:1000],
                      status_code=resp.status_code)
            return {"template_id": template_id, "payload": payload, "response": data}
        else:
            log_result("4.D.1 Create Email Template", "FAIL",
                      f"Status {resp.status_code}",
                      payload=payload,
                      response=response_text,
                      status_code=resp.status_code)
            return None
    except Exception as e:
        log_result("4.D.1 Create Email Template", "FAIL", f"Exception: {str(e)}")
        return None

def test_4d_send_email():
    """4.D.2) Envoyer email CRM"""
    api_base = results["api_base"] or API_BASE
    token = results["login_token"]
    if not token:
        log_result("4.D.2 Send Email", "SKIPPED", "No token (login failed)")
        return False
    
    url = f"{api_base}/crm/emails/send"
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "to_email": "test@example.com",
        "subject": "Test Email from CRM Audit",
        "message": "This is a test email sent from CRM audit script."
    }
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        response_text = resp.text[:2000] if resp.text else "Empty response"
        
        log_result("4.D.2 Send Email", "PASS" if resp.status_code == 200 else "FAIL",
                  f"Email send attempt",
                  payload=payload,
                  response=response_text,
                  status_code=resp.status_code)
        return resp.status_code == 200
    except Exception as e:
        log_result("4.D.2 Send Email", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("CRM PRODUCTION AUDIT - TEST ENVIRONMENT")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Frontend: {FRONTEND_URL}")
    print("="*80)
    
    # 1) Identifier API_BASE
    api_base = test_1_identify_api_base()
    
    # 2) Tests API de base
    test_2_openapi_json()
    login_success = test_3_admin_login()
    
    if not login_success:
        print("\nLOGIN FAILED - Cannot continue tests")
        return
    
    # 4.A) Tests USERS
    print("\n" + "="*80)
    print("SECTION 4.A: USERS TESTS")
    print("="*80)
    
    users_before = test_4a_list_users()
    
    # Créer 2 users
    user1 = test_4a_create_user("commercial", "1")
    user2 = test_4a_create_user("admin", "2")
    
    # Modifier user1
    if user1 and user1.get("user_id"):
        test_4a_update_user(user1["user_id"], user1["email"])
    
    # Supprimer les 2 users
    if user1 and user1.get("user_id"):
        test_4a_delete_user(user1["user_id"], user1["email"])
    if user2 and user2.get("user_id"):
        test_4a_delete_user(user2["user_id"], user2["email"])
    
    # Re-lister
    users_after = test_4a_list_users()
    
    # 4.B) Tests PROSPECTS / CONTACTS
    print("\n" + "="*80)
    print("SECTION 4.B: PROSPECTS / CONTACTS TESTS")
    print("="*80)
    
    lead_data = test_4b_create_lead()
    if lead_data and lead_data.get("lead_id"):
        lead_id = lead_data["lead_id"]
        test_4b_get_lead(lead_id)
        contact_data = test_4b_convert_lead(lead_id)
    
    # 4.C) Tests OPPORTUNITÉS
    print("\n" + "="*80)
    print("SECTION 4.C: OPPORTUNITIES TESTS")
    print("="*80)
    
    opp_data = test_4c_create_opportunity()
    if opp_data and opp_data.get("opp_id"):
        test_4c_update_opportunity_stage(opp_data["opp_id"], "proposal")
    
    # 4.D) Tests EMAILS
    print("\n" + "="*80)
    print("SECTION 4.D: EMAILS TESTS")
    print("="*80)
    
    template_data = test_4d_create_email_template()
    test_4d_send_email()
    
    # Résumé
    print("\n" + "="*80)
    print("AUDIT COMPLET")
    print("="*80)
    print(f"API_BASE: {results['api_base']}")
    print(f"Total tests: {len(results['tests'])}")
    print(f"Passed: {sum(1 for t in results['tests'] if t['status'] == 'PASS')}")
    print(f"Failed: {sum(1 for t in results['tests'] if t['status'] == 'FAIL')}")
    print(f"Skipped: {sum(1 for t in results['tests'] if t['status'] == 'SKIPPED')}")
    
    # Sauvegarder résultats
    with open("crm_audit_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nResults saved to: crm_audit_results.json")

if __name__ == "__main__":
    main()

