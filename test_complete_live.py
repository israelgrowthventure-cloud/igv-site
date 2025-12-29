# -*- coding: utf-8 -*-
"""
TEST COMPLET LIVE - TOUS LES MODULES
Exécution: python test_complete_live.py
"""
import requests
import sys
import json
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = "https://igv-cms-backend.onrender.com"
RESULTS = {"passed": [], "failed": [], "warnings": []}

def test(name, func):
    """Execute test and track result"""
    try:
        func()
        RESULTS["passed"].append(name)
        print(f"✅ {name}")
        return True
    except AssertionError as e:
        RESULTS["failed"].append(f"{name}: {str(e)}")
        print(f"❌ {name}: {str(e)}")
        return False
    except Exception as e:
        RESULTS["failed"].append(f"{name}: {str(e)}")
        print(f"❌ {name}: {str(e)}")
        return False

def warn(message):
    """Track warning"""
    RESULTS["warnings"].append(message)
    print(f"⚠️  {message}")

print("=" * 80)
print("TEST COMPLET LIVE IGV - TOUS LES MODULES")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)

# ============================================================================
# 1. HEALTH & BUILD VERIFICATION
# ============================================================================
print("\n[1] HEALTH & BUILD VERIFICATION")
print("-" * 80)

def test_health():
    r = requests.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    assert data.get("status") == "ok", "Health status not ok"

def test_build_timestamp():
    r = requests.get(f"{BASE}/debug/routers", timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    build_ts = data.get("build_timestamp", "OLD")
    if build_ts == "2025-12-29T15:45:00Z":
        print(f"  ✓ Nouveau build détecté: {build_ts}")
    else:
        warn(f"Build ancien détecté: {build_ts} (attendu: 2025-12-29T15:45:00Z)")
    
    invoice_loaded = data.get("invoice_router_loaded", False)
    monetico_loaded = data.get("monetico_router_loaded", False)
    
    print(f"  Invoice router: {invoice_loaded}")
    print(f"  Monetico router: {monetico_loaded}")
    
    if not invoice_loaded:
        error = data.get("invoice_router_error", "Unknown")
        warn(f"Invoice router error: {error}")
    
    if not monetico_loaded:
        error = data.get("monetico_router_error", "Unknown")
        warn(f"Monetico router error: {error}")

test("Health check", test_health)
test("Build timestamp check", test_build_timestamp)

# ============================================================================
# 2. INVOICE MODULE
# ============================================================================
print("\n[2] INVOICE MODULE")
print("-" * 80)

def test_invoice_list():
    r = requests.get(f"{BASE}/api/invoices/", timeout=10)
    # 401 acceptable (auth required), 404 = route missing
    assert r.status_code in [200, 401], f"Status {r.status_code} (route missing?)"
    if r.status_code == 401:
        print("  ✓ Auth required (normal)")

def test_invoice_stats():
    r = requests.get(f"{BASE}/api/invoices/stats/overview", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

test("Invoice list endpoint", test_invoice_list)
test("Invoice stats endpoint", test_invoice_stats)

# ============================================================================
# 3. MONETICO MODULE
# ============================================================================
print("\n[3] MONETICO MODULE")
print("-" * 80)

def test_monetico_config():
    r = requests.get(f"{BASE}/api/monetico/config", timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    configured = data.get("configured", False)
    if not configured:
        warn("Monetico pas configuré (MONETICO_TPE/KEY manquants) - normal en dev")
    print(f"  Configured: {configured}")
    print(f"  TPE: {data.get('tpe', 'N/A')}")

def test_monetico_payments():
    r = requests.get(f"{BASE}/api/monetico/payments", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

test("Monetico config", test_monetico_config)
test("Monetico payments list", test_monetico_payments)

# ============================================================================
# 4. CRM TASKS MODULE
# ============================================================================
print("\n[4] CRM TASKS MODULE")
print("-" * 80)

def test_tasks_list():
    r = requests.get(f"{BASE}/api/crm/tasks", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code} (route missing?)"

def test_tasks_export():
    r = requests.get(f"{BASE}/api/crm/tasks/export/csv", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

test("Tasks list endpoint", test_tasks_list)
test("Tasks export CSV", test_tasks_export)

# ============================================================================
# 5. MINI-ANALYSE (MULTILINGUE)
# ============================================================================
print("\n[5] MINI-ANALYSE MULTILINGUE")
print("-" * 80)

def test_mini_analyse_fr():
    payload = {
        "email": "test@example.com",
        "company_name": "Test Company FR",
        "brand_name": "TestBrand",
        "secteur": "Food & Beverage",
        "language": "fr"
    }
    r = requests.post(f"{BASE}/api/mini-analysis", json=payload, timeout=30)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    assert "analysis" in data, "Analysis missing"
    assert len(data["analysis"]) > 100, "Analysis too short"
    print(f"  ✓ Analyse FR: {len(data['analysis'])} chars")

def test_mini_analyse_en():
    payload = {
        "email": "test@example.com",
        "company_name": "Test Company EN",
        "brand_name": "TestBrandEN",
        "secteur": "Retail",
        "language": "en"
    }
    r = requests.post(f"{BASE}/api/mini-analysis", json=payload, timeout=30)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    assert "analysis" in data, "Analysis missing"
    print(f"  ✓ Analyse EN: {len(data['analysis'])} chars")

def test_mini_analyse_he():
    payload = {
        "email": "test@example.com",
        "company_name": "Test Company HE",
        "brand_name": "TestBrandHE",
        "secteur": "Technology",
        "language": "he"
    }
    r = requests.post(f"{BASE}/api/mini-analysis", json=payload, timeout=30)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    assert "analysis" in data, "Analysis missing"
    print(f"  ✓ Analyse HE: {len(data['analysis'])} chars")

test("Mini-analyse FR", test_mini_analyse_fr)
test("Mini-analyse EN", test_mini_analyse_en)
test("Mini-analyse HE", test_mini_analyse_he)

# ============================================================================
# 6. CRM COMPLETE
# ============================================================================
print("\n[6] CRM COMPLETE")
print("-" * 80)

def test_crm_dashboard():
    r = requests.get(f"{BASE}/api/crm/dashboard/stats", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

def test_crm_leads():
    r = requests.get(f"{BASE}/api/crm/leads", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

def test_crm_contacts():
    r = requests.get(f"{BASE}/api/crm/contacts", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

def test_crm_opportunities():
    r = requests.get(f"{BASE}/api/crm/pipeline", timeout=10)
    assert r.status_code in [200, 401], f"Status {r.status_code}"

test("CRM Dashboard", test_crm_dashboard)
test("CRM Leads", test_crm_leads)
test("CRM Contacts", test_crm_contacts)
test("CRM Opportunities", test_crm_opportunities)

# ============================================================================
# 7. GEOLOCATION
# ============================================================================
print("\n[7] GEOLOCATION")
print("-" * 80)

def test_geolocation():
    r = requests.get(f"{BASE}/api/detect-location", timeout=10)
    assert r.status_code == 200, f"Status {r.status_code}"
    data = r.json()
    print(f"  Country: {data.get('country', 'N/A')}")
    print(f"  Zone: {data.get('zone', 'N/A')}")
    print(f"  Currency: {data.get('currency', 'N/A')}")

test("Geolocation detection", test_geolocation)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("RÉSUMÉ DES TESTS")
print("=" * 80)

print(f"\n✅ TESTS RÉUSSIS: {len(RESULTS['passed'])}")
for t in RESULTS['passed']:
    print(f"  • {t}")

if RESULTS['warnings']:
    print(f"\n⚠️  AVERTISSEMENTS: {len(RESULTS['warnings'])}")
    for w in RESULTS['warnings']:
        print(f"  • {w}")

if RESULTS['failed']:
    print(f"\n❌ TESTS ÉCHOUÉS: {len(RESULTS['failed'])}")
    for f in RESULTS['failed']:
        print(f"  • {f}")

print("\n" + "=" * 80)
total = len(RESULTS['passed']) + len(RESULTS['failed'])
success_rate = (len(RESULTS['passed']) / total * 100) if total > 0 else 0

if len(RESULTS['failed']) == 0:
    print(f"✅ VERDICT FINAL: OK ({success_rate:.0f}% réussite)")
    print("Tous les modules fonctionnent correctement en production!")
    sys.exit(0)
else:
    print(f"❌ VERDICT FINAL: KO ({success_rate:.0f}% réussite)")
    print(f"{len(RESULTS['failed'])} test(s) échoué(s) - Corrections requises")
    sys.exit(1)
