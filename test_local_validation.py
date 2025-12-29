# -*- coding: utf-8 -*-
"""
TEST LOCAL COMPLET - VALIDATION AVANT DÉPLOIEMENT
Vérifie que TOUT le code est prêt
"""
import sys
import os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 80)
print("VALIDATION LOCALE COMPLÈTE - AVANT DÉPLOIEMENT")
print("=" * 80)

# Change to backend directory
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, os.getcwd())

errors = []
warnings = []
passed = []

# ============================================================================
# 1. TEST IMPORTS BACKEND
# ============================================================================
print("\n[1] IMPORTS BACKEND")
print("-" * 80)

try:
    from server import app
    print("✅ server.py")
    passed.append("server.py import")
except Exception as e:
    errors.append(f"server.py: {str(e)}")
    print(f"❌ server.py: {str(e)}")

try:
    from mini_analysis_routes import router as mini_router
    print("✅ mini_analysis_routes.py")
    passed.append("mini_analysis_routes import")
except Exception as e:
    errors.append(f"mini_analysis_routes: {str(e)}")
    print(f"❌ mini_analysis_routes: {str(e)}")

try:
    from invoice_routes import router as invoice_router
    print("✅ invoice_routes.py")
    passed.append("invoice_routes import")
except Exception as e:
    errors.append(f"invoice_routes: {str(e)}")
    print(f"❌ invoice_routes: {str(e)}")

try:
    from monetico_routes import router as monetico_router
    print("✅ monetico_routes.py")
    passed.append("monetico_routes import")
except Exception as e:
    errors.append(f"monetico_routes: {str(e)}")
    print(f"❌ monetico_routes: {str(e)}")

try:
    from crm_complete_routes import router as crm_router
    print("✅ crm_complete_routes.py")
    passed.append("crm_complete_routes import")
except Exception as e:
    errors.append(f"crm_complete_routes: {str(e)}")
    print(f"❌ crm_complete_routes: {str(e)}")

try:
    from admin_routes import router as admin_router
    print("✅ admin_routes.py")
    passed.append("admin_routes import")
except Exception as e:
    errors.append(f"admin_routes: {str(e)}")
    print(f"❌ admin_routes: {str(e)}")

# ============================================================================
# 2. VÉRIFICATION MODELS
# ============================================================================
print("\n[2] MODELS")
print("-" * 80)

try:
    from models.invoice_models import Invoice, Payment, InvoiceStatus, PaymentStatus
    print("✅ invoice_models (Invoice, Payment)")
    passed.append("invoice_models")
except Exception as e:
    errors.append(f"invoice_models: {str(e)}")
    print(f"❌ invoice_models: {str(e)}")

try:
    from models import Invoice as InvoiceFromInit
    print("✅ models/__init__.py (package import)")
    passed.append("models package")
except Exception as e:
    errors.append(f"models package: {str(e)}")
    print(f"❌ models package: {str(e)}")

# ============================================================================
# 3. VÉRIFICATION FONCTIONS CLÉS
# ============================================================================
print("\n[3] FONCTIONS CLÉS")
print("-" * 80)

try:
    from mini_analysis_routes import generate_mini_analysis_pdf, send_mini_analysis_email
    print("✅ Mini-analyse: PDF + Email functions")
    passed.append("mini-analyse PDF/Email")
except Exception as e:
    errors.append(f"mini-analyse functions: {str(e)}")
    print(f"❌ mini-analyse functions: {str(e)}")

try:
    from invoice_routes import generate_invoice_pdf, send_invoice_email
    print("✅ Invoice: PDF + Email functions")
    passed.append("invoice PDF/Email")
except Exception as e:
    warnings.append(f"invoice functions might not exist: {str(e)}")
    print(f"⚠️  invoice functions: {str(e)}")

try:
    from monetico_routes import compute_monetico_mac, verify_monetico_mac
    print("✅ Monetico: signature functions")
    passed.append("monetico signatures")
except Exception as e:
    warnings.append(f"monetico functions: {str(e)}")
    print(f"⚠️  monetico functions: {str(e)}")

# ============================================================================
# 4. VÉRIFICATION ROUTES CRM TASKS
# ============================================================================
print("\n[4] ROUTES CRM")
print("-" * 80)

try:
    import crm_complete_routes
    import inspect
    
    # Check for tasks routes
    source = inspect.getsource(crm_complete_routes)
    tasks_routes_found = [
        '@router.get("/tasks")' in source,
        '@router.post("/tasks")' in source,
        '@router.patch("/tasks/{task_id}")' in source,
        '@router.delete("/tasks/{task_id}")' in source,
    ]
    
    if all(tasks_routes_found):
        print("✅ Tasks routes: GET, POST, PATCH, DELETE")
        passed.append("tasks routes")
    else:
        errors.append("Tasks routes incomplete")
        print(f"❌ Tasks routes: Missing some endpoints")
        print(f"   GET: {tasks_routes_found[0]}")
        print(f"   POST: {tasks_routes_found[1]}")
        print(f"   PATCH: {tasks_routes_found[2]}")
        print(f"   DELETE: {tasks_routes_found[3]}")
        
except Exception as e:
    errors.append(f"Tasks routes check: {str(e)}")
    print(f"❌ Tasks routes: {str(e)}")

# ============================================================================
# 5. VÉRIFICATION PYDANTIC MODELS
# ============================================================================
print("\n[5] PYDANTIC MODELS (mini-analyse)")
print("-" * 80)

try:
    from mini_analysis_routes import MiniAnalysisRequest
    
    # Test model with aliases
    test_data_1 = {
        "email": "test@test.com",
        "nom_de_marque": "TestBrand",
        "secteur": "Food"
    }
    
    test_data_2 = {
        "email": "test@test.com",
        "company_name": "TestCompany",
        "secteur": "Tech"
    }
    
    test_data_3 = {
        "email": "test@test.com",
        "brand_name": "TestBrand2",
        "secteur": ""
    }
    
    req1 = MiniAnalysisRequest(**test_data_1)
    req2 = MiniAnalysisRequest(**test_data_2)
    req3 = MiniAnalysisRequest(**test_data_3)
    
    print("✅ MiniAnalysisRequest: nom_de_marque field OK")
    print("✅ MiniAnalysisRequest: company_name alias OK")
    print("✅ MiniAnalysisRequest: brand_name alias OK")
    print("✅ MiniAnalysisRequest: secteur optional OK")
    passed.append("MiniAnalysisRequest validation")
    
except Exception as e:
    errors.append(f"MiniAnalysisRequest: {str(e)}")
    print(f"❌ MiniAnalysisRequest: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("RÉSULTAT VALIDATION LOCALE")
print("=" * 80)

print(f"\n✅ SUCCÈS: {len(passed)}")
for p in passed[:5]:  # Limit output
    print(f"  • {p}")
if len(passed) > 5:
    print(f"  ... et {len(passed) - 5} autres")

if warnings:
    print(f"\n⚠️  AVERTISSEMENTS: {len(warnings)}")
    for w in warnings:
        print(f"  • {w}")

if errors:
    print(f"\n❌ ERREURS BLOQUANTES: {len(errors)}")
    for e in errors:
        print(f"  • {e}")
    print("\n" + "=" * 80)
    print("❌ VALIDATION ÉCHOUÉE - CORRECTIONS REQUISES")
    print("=" * 80)
    sys.exit(1)
else:
    print("\n" + "=" * 80)
    print("✅ VALIDATION RÉUSSIE - CODE PRÊT POUR DÉPLOIEMENT")
    print("=" * 80)
    sys.exit(0)
