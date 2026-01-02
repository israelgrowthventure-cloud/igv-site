"""
TEST PRODUCTION COMPLET - CRM IGV
Validation autonome de TOUTES les fonctionnalités
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Admin credentials
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

def get_admin_token():
    """Login et récupération du token admin"""
    response = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_crm_routes(token):
    """Test 1: Routes CRM ne doivent PAS être 404"""
    print("\n🔍 TEST 1: CRM ROUTES")
    headers = {"Authorization": f"Bearer {token}"}
    
    routes = [
        "/api/crm/leads",
        "/api/admin/users",
    ]
    
    results = {}
    for route in routes:
        try:
            r = requests.get(f"{BASE_URL}{route}", headers=headers, timeout=10)
            results[route] = {
                "status": r.status_code,
                "ok": r.status_code in [200, 201]
            }
            status_icon = "✅" if r.status_code == 200 else "❌"
            print(f"  {status_icon} {route}: {r.status_code}")
        except Exception as e:
            results[route] = {"status": "ERROR", "error": str(e), "ok": False}
            print(f"  ❌ {route}: ERROR - {e}")
    
    return all(r["ok"] for r in results.values())

def test_dashboard_data(token):
    """Test 2: Dashboard doit avoir des données"""
    print("\n🔍 TEST 2: DASHBOARD DATA")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        r = requests.get(f"{BASE_URL}/api/crm/leads", headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            leads_count = len(data.get("leads", []))
            print(f"  ✅ Prospects: {leads_count}")
            return leads_count > 0
        else:
            print(f"  ❌ Failed: {r.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return False

def test_mini_analysis_generation():
    """Test 3: Génération mini-analyse + création prospect"""
    print("\n🔍 TEST 3: MINI-ANALYSE GENERATION")
    
    payload = {
        "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@test.com",
        "first_name": "Test",
        "last_name": "Production",
        "phone": "+33612345678",
        "nom_de_marque": "Test Brand Production",
        "secteur": "Services",
        "language": "fr"
    }
    
    try:
        r = requests.post(
            f"{BASE_URL}/api/mini-analysis",
            json=payload,
            timeout=60
        )
        
        if r.status_code == 200:
            data = r.json()
            has_analysis = bool(data.get("analysis"))
            has_pdf = bool(data.get("pdf_url"))
            has_lead_id = bool(data.get("lead_id"))
            
            print(f"  ✅ Status: 200")
            print(f"  {'✅' if has_analysis else '❌'} Analysis text: {len(data.get('analysis', ''))} chars")
            print(f"  {'✅' if has_pdf else '❌'} PDF generated: {has_pdf}")
            print(f"  {'✅' if has_lead_id else '❌'} Lead created: {data.get('lead_id', 'N/A')}")
            
            return has_analysis and has_pdf and has_lead_id
        else:
            print(f"  ❌ Failed: {r.status_code}")
            print(f"  Response: {r.text[:200]}")
            return False
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return False

def test_users_crud(token):
    """Test 4: Users CRUD (création avec first_name/last_name + suppression)"""
    print("\n🔍 TEST 4: USERS CRUD")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Création
    test_user = {
        "email": f"testuser_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
        "first_name": "Jean",
        "last_name": "Dupont",
        "password": "Test123!",
        "role": "commercial"
    }
    
    try:
        # CREATE
        r_create = requests.post(
            f"{BASE_URL}/api/admin/users",
            json=test_user,
            headers=headers,
            timeout=10
        )
        
        if r_create.status_code == 201:
            print(f"  ✅ User created: {r_create.status_code}")
            created_data = r_create.json()
            
            # Vérifier first_name/last_name dans la réponse
            has_first_name = "first_name" in created_data
            has_last_name = "last_name" in created_data
            print(f"  {'✅' if has_first_name else '❌'} first_name présent")
            print(f"  {'✅' if has_last_name else '❌'} last_name présent")
            
            # LIST pour récupérer _id
            r_list = requests.get(f"{BASE_URL}/api/admin/users", headers=headers, timeout=10)
            if r_list.status_code == 200:
                users = r_list.json().get("users", [])
                test_user_obj = next((u for u in users if u["email"] == test_user["email"]), None)
                
                if test_user_obj and "_id" in test_user_obj:
                    user_id = test_user_obj["_id"]
                    print(f"  ✅ User found in list: {user_id}")
                    
                    # DELETE
                    r_delete = requests.delete(
                        f"{BASE_URL}/api/admin/users/{user_id}",
                        headers=headers,
                        timeout=10
                    )
                    
                    if r_delete.status_code == 200:
                        print(f"  ✅ User deleted: {r_delete.status_code}")
                        
                        # Vérifier qu'il n'existe plus
                        r_verify = requests.get(f"{BASE_URL}/api/admin/users", headers=headers, timeout=10)
                        users_after = r_verify.json().get("users", [])
                        still_exists = any(u["_id"] == user_id and u.get("is_active", True) for u in users_after)
                        
                        if not still_exists:
                            print(f"  ✅ User vraiment supprimé (is_active=False ou absent)")
                            return True
                        else:
                            print(f"  ❌ User toujours actif après suppression")
                            return False
                    else:
                        print(f"  ❌ Delete failed: {r_delete.status_code}")
                        return False
                else:
                    print(f"  ❌ User not found in list after creation")
                    return False
            else:
                print(f"  ❌ List failed: {r_list.status_code}")
                return False
        else:
            print(f"  ❌ Creation failed: {r_create.status_code}")
            print(f"  Response: {r_create.text[:200]}")
            return False
            
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return False

def test_email_smtp():
    """Test 5: SMTP config (diagnostic endpoint)"""
    print("\n🔍 TEST 5: SMTP CONFIG")
    
    try:
        r = requests.get(f"{BASE_URL}/api/diag-smtp", timeout=10)
        if r.status_code == 200:
            config = r.json()
            smtp_ok = config.get("ready_to_send", False)
            smtp_server = config.get("SMTP_SERVER")
            smtp_port = config.get("SMTP_PORT")
            
            print(f"  {'✅' if smtp_ok else '❌'} SMTP Ready: {smtp_ok}")
            print(f"  Server: {smtp_server}")
            print(f"  Port: {smtp_port}")
            
            # Vérifier OVH config
            is_ovh = "ovh" in str(smtp_server).lower() if smtp_server else False
            is_465 = smtp_port == 465
            
            print(f"  {'✅' if is_ovh else '⚠️'} OVH server: {is_ovh}")
            print(f"  {'✅' if is_465 else '⚠️'} Port 465: {is_465}")
            
            return smtp_ok
        else:
            print(f"  ❌ Diagnostic failed: {r.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return False

def main():
    print("="*60)
    print("🚀 TEST PRODUCTION COMPLET - CRM IGV")
    print(f"Backend: {BASE_URL}")
    print(f"Frontend: {FRONTEND_URL}")
    print("="*60)
    
    # Login
    print("\n🔐 LOGIN ADMIN...")
    token = get_admin_token()
    if not token:
        print("❌ FATAL: Cannot login")
        return
    print("✅ Token obtained")
    
    # Run tests
    results = {
        "CRM Routes": test_crm_routes(token),
        "Dashboard Data": test_dashboard_data(token),
        "Mini-Analysis": test_mini_analysis_generation(),
        "Users CRUD": test_users_crud(token),
        "SMTP Config": test_email_smtp()
    }
    
    # Summary
    print("\n" + "="*60)
    print("📊 RÉSULTATS FINAUX")
    print("="*60)
    
    for test_name, result in results.items():
        icon = "✅" if result else "❌"
        print(f"{icon} {test_name}: {'OK' if result else 'FAIL'}")
    
    total_ok = sum(1 for r in results.values() if r)
    total = len(results)
    
    print(f"\n📈 Score: {total_ok}/{total} ({total_ok/total*100:.0f}%)")
    
    if total_ok == total:
        print("\n✅ ✅ ✅ TOUS LES TESTS PASSENT - PRODUCTION OK ✅ ✅ ✅")
    else:
        print(f"\n❌ {total - total_ok} test(s) échoué(s) - CONTINUER LES CORRECTIONS")
    
    return total_ok == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
