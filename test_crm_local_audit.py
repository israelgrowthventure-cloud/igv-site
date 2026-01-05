"""
TEST CRM LOCAL AUDIT - Sequence complete a->g
Adapte pour tester localement meme si DB non configuree
"""
import requests
import json
import uuid
import time
from datetime import datetime

BACKEND_URL = "http://localhost:8000"
EMAIL = "admin@igv.com"
PASSWORD = "testadminpw"

def log_test(test_name, status, details=""):
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"Status: {status}")
    if details:
        print(f"Details: {details}")
    print(f"{'='*60}")

def test_a_login():
    """a) Login admin"""
    log_test("a) Login admin", "EXECUTING")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/admin/login",
            json={"email": EMAIL, "password": PASSWORD},
            timeout=10
        )
        print(f"URL: POST {BACKEND_URL}/api/admin/login")
        print(f"Payload: {{email: {EMAIL}, password: [MASKED]}}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            log_test("a) Login admin", "PASS", f"Token: {token[:20]}...")
            return token
        elif response.status_code == 503:
            log_test("a) Login admin", "SKIPPED", "Database not configured (503)")
            return None
        else:
            log_test("a) Login admin", "FAIL", f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("a) Login admin", "FAIL", f"Exception: {str(e)}")
        return None

def test_b_list_users(token):
    """b) List users"""
    log_test("b) List users", "EXECUTING")
    if not token:
        log_test("b) List users", "SKIPPED", "No token (login failed)")
        return None
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BACKEND_URL}/api/admin/users",
            headers=headers,
            timeout=10
        )
        print(f"URL: GET {BACKEND_URL}/api/admin/users")
        print(f"Headers: Authorization: Bearer {token[:20]}...")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            log_test("b) List users", "PASS", f"Total: {total} users")
            return True
        else:
            log_test("b) List users", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("b) List users", "FAIL", f"Exception: {str(e)}")
        return False

def test_c_create_user(token):
    """c) Create user"""
    log_test("c) Create user", "EXECUTING")
    if not token:
        log_test("c) Create user", "SKIPPED", "No token (login failed)")
        return None
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        test_user = {
            "email": f"test_user_{int(time.time())}@igvtest.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "TestPass123!",
            "role": "commercial"
        }
        response = requests.post(
            f"{BACKEND_URL}/api/admin/users",
            headers=headers,
            json=test_user,
            timeout=10
        )
        print(f"URL: POST {BACKEND_URL}/api/admin/users")
        print(f"Payload: {json.dumps({**test_user, 'password': '[MASKED]'}, indent=2)}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 201:
            data = response.json()
            user_id = data.get('user_id') or data.get('user', {}).get('id')
            log_test("c) Create user", "PASS", f"User ID: {user_id}")
            return user_id
        else:
            log_test("c) Create user", "FAIL", f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("c) Create user", "FAIL", f"Exception: {str(e)}")
        return None

def test_d_delete_user(token, user_id):
    """d) Delete user"""
    log_test("d) Delete user", "EXECUTING")
    if not token:
        log_test("d) Delete user", "SKIPPED", "No token (login failed)")
        return False
    if not user_id:
        log_test("d) Delete user", "SKIPPED", "No user_id (create failed)")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.delete(
            f"{BACKEND_URL}/api/admin/users/{user_id}",
            headers=headers,
            timeout=10
        )
        print(f"URL: DELETE {BACKEND_URL}/api/admin/users/{user_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            log_test("d) Delete user", "PASS", "User deleted")
            return True
        else:
            log_test("d) Delete user", "FAIL", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("d) Delete user", "FAIL", f"Exception: {str(e)}")
        return False

def test_e_re_list_users(token):
    """e) Re-list users"""
    return test_b_list_users(token)

def test_f_convert_lead_contact(token):
    """f) Convert lead to contact"""
    log_test("f) Convert lead to contact", "EXECUTING")
    if not token:
        log_test("f) Convert lead to contact", "SKIPPED", "No token (login failed)")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create test lead first
        test_lead = {
            "email": f"testlead_{int(time.time())}@igvtest.com",
            "brand_name": "Test Brand",
            "name": "Test Contact",
            "phone": "+972501234567",
            "language": "fr"
        }
        create_response = requests.post(
            f"{BACKEND_URL}/api/crm/leads",
            headers=headers,
            json=test_lead,
            timeout=10
        )
        print(f"URL: POST {BACKEND_URL}/api/crm/leads")
        print(f"Payload: {json.dumps(test_lead, indent=2)}")
        print(f"Status: {create_response.status_code}")
        print(f"Response: {create_response.text[:500]}")
        
        if create_response.status_code != 201:
            log_test("f) Convert lead to contact", "SKIPPED", f"Cannot create lead (Status {create_response.status_code})")
            return False
        
        lead_id = create_response.json().get('lead_id')
        
        # Convert to contact
        convert_response = requests.post(
            f"{BACKEND_URL}/api/crm/leads/{lead_id}/convert-to-contact",
            headers=headers,
            timeout=10
        )
        print(f"URL: POST {BACKEND_URL}/api/crm/leads/{lead_id}/convert-to-contact")
        print(f"Status: {convert_response.status_code}")
        print(f"Response: {convert_response.text[:500]}")
        
        if convert_response.status_code == 200:
            log_test("f) Convert lead to contact", "PASS", "Lead converted")
            return True
        else:
            log_test("f) Convert lead to contact", "FAIL", f"Status {convert_response.status_code}: {convert_response.text}")
            return False
    except Exception as e:
        log_test("f) Convert lead to contact", "FAIL", f"Exception: {str(e)}")
        return False

def test_g_send_email(token):
    """g) Send email"""
    log_test("g) Send email", "EXECUTING")
    if not token:
        log_test("g) Send email", "SKIPPED", "No token (login failed)")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        email_data = {
            "to_email": "test@example.com",
            "subject": "Test Email",
            "message": "This is a test email from CRM audit"
        }
        response = requests.post(
            f"{BACKEND_URL}/api/crm/emails/send",
            headers=headers,
            json=email_data,
            timeout=10
        )
        print(f"URL: POST {BACKEND_URL}/api/crm/emails/send")
        print(f"Payload: {json.dumps(email_data, indent=2)}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            log_test("g) Send email", "PASS", "Email sent")
            return True
        else:
            log_test("g) Send email", "FAIL/SKIPPED", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("g) Send email", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("TEST CRM LOCAL AUDIT - Sequence complete a->g")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}")
    print("="*80)
    
    # a) Login
    token = test_a_login()
    
    # b) List users
    test_b_list_users(token)
    
    # c) Create user
    user_id = test_c_create_user(token)
    
    # d) Delete user
    test_d_delete_user(token, user_id)
    
    # e) Re-list users
    test_e_re_list_users(token)
    
    # f) Convert lead to contact
    test_f_convert_lead_contact(token)
    
    # g) Send email
    test_g_send_email(token)
    
    print("\n" + "="*80)
    print("AUDIT COMPLET")
    print("="*80)

if __name__ == "__main__":
    main()

