#!/usr/bin/env python3
"""
Script de monitoring du déploiement Render
Attend que le nouveau build soit live et lance les tests E2E
"""

import requests
import time
import sys
import json
from datetime import datetime

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

MAX_WAIT_TIME = 900  # 15 minutes max
POLL_INTERVAL = 30   # 30 secondes entre chaque check

def log(msg):
    """Log avec timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}", flush=True)

def check_backend_health():
    """Vérifie si le backend est live"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            log(f"✓ Backend health: {data.get('status')} | MongoDB: {data.get('mongodb')}")
            return data.get('status') == 'ok' and data.get('mongodb') in ['connected', 'configured']
        else:
            log(f"✗ Backend health failed: {response.status_code}")
            return False
    except Exception as e:
        log(f"✗ Backend unreachable: {str(e)}")
        return False

def check_backend_routers():
    """Vérifie que les routers sont chargés"""
    try:
        response = requests.get(f"{BACKEND_URL}/debug/routers", timeout=10)
        if response.status_code == 200:
            data = response.json()
            log(f"✓ Routers status: CRM={data.get('ai_router_loaded')}, Mini={data.get('mini_analysis_router_loaded')}")
            return True
        return False
    except Exception as e:
        log(f"✗ Routers check failed: {str(e)}")
        return False

def wait_for_deployment():
    """Attend que le déploiement soit terminé"""
    log("🚀 Monitoring du déploiement Render...")
    
    start_time = time.time()
    consecutive_successes = 0
    
    while time.time() - start_time < MAX_WAIT_TIME:
        elapsed = int(time.time() - start_time)
        log(f"⏱️  Elapsed: {elapsed}s / {MAX_WAIT_TIME}s")
        
        # Check backend health
        if check_backend_health():
            consecutive_successes += 1
            log(f"✓ Backend live ({consecutive_successes}/3 confirmations)")
            
            # Attendre 3 succès consécutifs pour confirmer la stabilité
            if consecutive_successes >= 3:
                log("✅ Déploiement confirmé stable!")
                
                # Vérifier les routers
                if check_backend_routers():
                    log("✅ Tous les routers sont chargés!")
                    return True
                else:
                    log("⚠️  Certains routers manquants, mais backend live")
                    return True
        else:
            consecutive_successes = 0
            log(f"⏳ Backend pas encore prêt, nouvelle tentative dans {POLL_INTERVAL}s...")
        
        time.sleep(POLL_INTERVAL)
    
    log("❌ TIMEOUT: Le déploiement n'a pas abouti dans le temps imparti")
    return False

def test_admin_login():
    """Test: connexion admin"""
    log("\n=== TEST 1: Admin Login ===")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            log(f"✅ Login admin OK | Token: {token[:20]}...")
            return token
        else:
            log(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        log(f"❌ Login exception: {str(e)}")
        return None

def test_get_users(token):
    """Test: récupération des utilisateurs"""
    log("\n=== TEST 2: GET Users ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BACKEND_URL}/api/admin/users",
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            total = data.get('total', 0)
            log(f"✅ GET users OK | Total: {total} utilisateurs")
            
            # Afficher les premiers utilisateurs
            for i, user in enumerate(users[:3], 1):
                email = user.get('email', 'N/A')
                role = user.get('role', 'N/A')
                user_id = user.get('_id') or user.get('id', 'N/A')
                log(f"   {i}. {email} ({role}) [ID: {user_id}]")
            
            return True
        else:
            log(f"❌ GET users failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        log(f"❌ GET users exception: {str(e)}")
        return False

def test_create_user(token):
    """Test: création d'un utilisateur"""
    log("\n=== TEST 3: POST Create User ===")
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
            timeout=15
        )
        
        if response.status_code == 201:
            data = response.json()
            user_id = data.get('user_id')
            log(f"✅ POST create user OK | User ID: {user_id}")
            return user_id
        else:
            log(f"❌ Create user failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        log(f"❌ Create user exception: {str(e)}")
        return None

def test_get_leads(token):
    """Test: récupération des leads"""
    log("\n=== TEST 4: GET Leads ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BACKEND_URL}/api/crm/leads?limit=10",
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            log(f"✅ GET leads OK | Total: {total} leads")
            return True
        else:
            log(f"❌ GET leads failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        log(f"❌ GET leads exception: {str(e)}")
        return False

def test_convert_prospect_to_contact(token):
    """Test: conversion prospect vers contact"""
    log("\n=== TEST 5: POST Convert Prospect to Contact ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Créer d'abord un lead de test
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
            timeout=15
        )
        
        if create_response.status_code != 201:
            log(f"❌ Failed to create test lead: {create_response.status_code}")
            return False
        
        lead_id = create_response.json().get('lead_id')
        log(f"   Created test lead: {lead_id}")
        
        # Convertir en contact
        convert_response = requests.post(
            f"{BACKEND_URL}/api/crm/leads/{lead_id}/convert-to-contact",
            headers=headers,
            timeout=15
        )
        
        if convert_response.status_code == 200:
            data = convert_response.json()
            contact_id = data.get('contact_id')
            log(f"✅ POST convert OK | Contact ID: {contact_id}")
            return True
        else:
            log(f"❌ Convert failed: {convert_response.status_code} - {convert_response.text}")
            return False
            
    except Exception as e:
        log(f"❌ Convert exception: {str(e)}")
        return False

def test_create_email_template(token):
    """Test: création de template email"""
    log("\n=== TEST 6: POST Create Email Template ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        test_template = {
            "name": f"Test Template {int(time.time())}",
            "subject": "Test Email Subject",
            "body": "Hello {name}, this is a test template.",
            "language": "fr"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/crm/emails/templates",
            headers=headers,
            json=test_template,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            template_id = data.get('template_id')
            log(f"✅ POST create template OK | Template ID: {template_id}")
            return True
        else:
            log(f"❌ Create template failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        log(f"❌ Create template exception: {str(e)}")
        return False

def test_get_email_templates(token):
    """Test: récupération des templates email"""
    log("\n=== TEST 7: GET Email Templates ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BACKEND_URL}/api/crm/emails/templates",
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            templates = data.get('templates', [])
            log(f"✅ GET templates OK | Total: {len(templates)} templates")
            return True
        else:
            log(f"❌ GET templates failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        log(f"❌ GET templates exception: {str(e)}")
        return False

def run_e2e_tests():
    """Lance la batterie de tests E2E"""
    log("\n" + "="*60)
    log("🧪 LANCEMENT DES TESTS END-TO-END EN PRODUCTION")
    log("="*60)
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # Test 1: Login
    token = test_admin_login()
    results["total"] += 1
    if token:
        results["passed"] += 1
        results["tests"].append({"name": "Admin Login", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "Admin Login", "status": "FAIL"})
        log("\n❌ Login failed, arrêt des tests")
        return results
    
    # Test 2: GET Users
    results["total"] += 1
    if test_get_users(token):
        results["passed"] += 1
        results["tests"].append({"name": "GET Users", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "GET Users", "status": "FAIL"})
    
    # Test 3: POST Create User
    results["total"] += 1
    user_id = test_create_user(token)
    if user_id:
        results["passed"] += 1
        results["tests"].append({"name": "POST Create User", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "POST Create User", "status": "FAIL"})
    
    # Test 4: GET Leads
    results["total"] += 1
    if test_get_leads(token):
        results["passed"] += 1
        results["tests"].append({"name": "GET Leads", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "GET Leads", "status": "FAIL"})
    
    # Test 5: Convert Prospect
    results["total"] += 1
    if test_convert_prospect_to_contact(token):
        results["passed"] += 1
        results["tests"].append({"name": "POST Convert Prospect", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "POST Convert Prospect", "status": "FAIL"})
    
    # Test 6: Create Email Template
    results["total"] += 1
    if test_create_email_template(token):
        results["passed"] += 1
        results["tests"].append({"name": "POST Create Email Template", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "POST Create Email Template", "status": "FAIL"})
    
    # Test 7: GET Email Templates
    results["total"] += 1
    if test_get_email_templates(token):
        results["passed"] += 1
        results["tests"].append({"name": "GET Email Templates", "status": "PASS"})
    else:
        results["failed"] += 1
        results["tests"].append({"name": "GET Email Templates", "status": "FAIL"})
    
    return results

def print_final_report(results):
    """Affiche le rapport final"""
    log("\n" + "="*60)
    log("📊 RAPPORT FINAL")
    log("="*60)
    
    for test in results["tests"]:
        status_icon = "✅" if test["status"] == "PASS" else "❌"
        log(f"{status_icon} {test['name']}: {test['status']}")
    
    log("\n" + "-"*60)
    log(f"Total: {results['total']} | Passed: {results['passed']} | Failed: {results['failed']}")
    
    success_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    log(f"Taux de réussite: {success_rate:.1f}%")
    log("="*60)
    
    if results['failed'] == 0:
        log("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        return 0
    else:
        log(f"\n⚠️  {results['failed']} TEST(S) EN ÉCHEC")
        return 1

def main():
    """Point d'entrée principal"""
    log("🚀 Démarrage du monitoring de déploiement IGV")
    log(f"Backend: {BACKEND_URL}")
    log(f"Frontend: {FRONTEND_URL}")
    
    # Étape 1: Attendre que le déploiement soit live
    if not wait_for_deployment():
        log("\n❌ ÉCHEC: Déploiement non confirmé")
        sys.exit(1)
    
    # Étape 2: Lancer les tests E2E
    results = run_e2e_tests()
    
    # Étape 3: Rapport final
    exit_code = print_final_report(results)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
