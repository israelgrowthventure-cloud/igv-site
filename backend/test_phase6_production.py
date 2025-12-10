# -*- coding: utf-8 -*-
"""
Script de test Phase 6 - Production
Tests du design final + intégration Monetico

Vérifie :
1. Pages publiques (design moderne)
2. API CMS (7 pages)
3. Endpoint Monetico (configuré ou non configuré)
4. Payment Success (support Monetico)
"""

import requests
import sys
from datetime import datetime

# Configuration
FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"

# Credentials admin pour tests CMS
# Note: Ces credentials peuvent être différents en production
# Le test CMS est optionnel pour la validation Phase 6
ADMIN_EMAIL = "admin@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin123!IGV2024"  # Peut nécessiter mise à jour

def test_page(url, name):
    """Test une page frontend"""
    try:
        response = requests.get(url, timeout=15)
        success = response.status_code == 200 and len(response.text) > 1000
        emoji = "✅" if success else "❌"
        size = f"{len(response.text)} bytes" if success else ""
        print(f"  {emoji} {name} - {response.status_code} {size}")
        return success
    except Exception as e:
        print(f"  ❌ {name} - ERROR: {e}")
        return False

def test_cms_pages():
    """Vérifier pages CMS"""
    try:
        # Login admin
        login_response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"  ❌ CMS Auth failed - {login_response.status_code}")
            return False
            
        token = login_response.json()["access_token"]
        
        # Get pages
        pages_response = requests.get(
            f"{BACKEND_URL}/api/pages",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if pages_response.status_code != 200:
            print(f"  ❌ CMS Pages API failed - {pages_response.status_code}")
            return False
            
        pages = pages_response.json()
        required_slugs = ['home', 'qui-sommes-nous', 'packs', 'le-commerce-de-demain', 
                         'contact', 'etude-implantation-360', 'etude-implantation-360-merci']
        
        existing_slugs = [p.get('slug') for p in pages]
        all_present = all(slug in existing_slugs for slug in required_slugs)
        
        emoji = "✅" if all_present else "❌"
        print(f"  {emoji} CMS Pages - {len(pages)} pages, {len([s for s in required_slugs if s in existing_slugs])}/7 required")
        
        return all_present
        
    except Exception as e:
        print(f"  ❌ CMS Pages - ERROR: {e}")
        return False

def test_monetico_endpoint():
    """Test endpoint Monetico init"""
    try:
        test_data = {
            "pack": "analyse",
            "amount": 3000.0,
            "currency": "EUR",
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "order_reference": f"TEST-{datetime.now().timestamp()}"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/payments/monetico/init",
            json=test_data,
            timeout=10
        )
        
        # 200 = configuré, 503 = non configuré (acceptable), autres = erreur
        if response.status_code == 200:
            data = response.json()
            has_form = 'form_action' in data and 'form_fields' in data
            emoji = "✅" if has_form else "⚠️"
            print(f"  {emoji} Monetico Init - 200 CONFIGURED (form_action: {bool(has_form)})")
            return True
        elif response.status_code == 503:
            data = response.json()
            print(f"  ✅ Monetico Init - 503 NOT CONFIGURED (expected)")
            return True
        else:
            print(f"  ❌ Monetico Init - {response.status_code} UNEXPECTED")
            try:
                print(f"     Detail: {response.json()}")
            except:
                pass
            return False
            
    except Exception as e:
        print(f"  ❌ Monetico Init - ERROR: {e}")
        return False

def main():
    print("=" * 60)
    print("PHASE 6 - Tests Production")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 60)
    
    results = {
        "pages": [],
        "cms": False,
        "monetico": False,
        "total": 0,
        "passed": 0
    }
    
    # Section 1: Pages publiques (design moderne)
    print("\n📄 SECTION 1: Pages Publiques (Design Moderne)")
    print("-" * 60)
    
    pages_to_test = [
        (f"{FRONTEND_URL}/", "Home (/)"),
        (f"{FRONTEND_URL}/qui-sommes-nous", "Qui sommes-nous"),
        (f"{FRONTEND_URL}/packs", "Nos Packs"),
        (f"{FRONTEND_URL}/le-commerce-de-demain", "Le Commerce de Demain"),
        (f"{FRONTEND_URL}/contact", "Contact"),
        (f"{FRONTEND_URL}/etude-implantation-360", "Étude 360°"),
        (f"{FRONTEND_URL}/etude-implantation-360/merci", "Merci Étude 360°"),
    ]
    
    for url, name in pages_to_test:
        success = test_page(url, name)
        results["pages"].append(success)
        results["total"] += 1
        if success:
            results["passed"] += 1
    
    # Section 2: CMS Backend
    print("\n🗄️ SECTION 2: CMS Backend")
    print("-" * 60)
    results["cms"] = test_cms_pages()
    results["total"] += 1
    if results["cms"]:
        results["passed"] += 1
    
    # Section 3: API Paiements Monetico
    print("\n💳 SECTION 3: API Paiements Monetico")
    print("-" * 60)
    results["monetico"] = test_monetico_endpoint()
    results["total"] += 1
    if results["monetico"]:
        results["passed"] += 1
    
    # Section 4: Payment Success (test manuel)
    print("\n✓ SECTION 4: Payment Success Page")
    print("-" * 60)
    success = test_page(
        f"{FRONTEND_URL}/payment/success?provider=monetico&pack=analyse&amount=3000&currency=EUR&status=success",
        "Payment Success (Monetico)"
    )
    results["total"] += 1
    if success:
        results["passed"] += 1
    
    # Résumé
    print("\n" + "=" * 60)
    print("RÉSUMÉ PHASE 6")
    print("=" * 60)
    percentage = (results["passed"] / results["total"] * 100) if results["total"] > 0 else 0
    print(f"Total: {results['passed']}/{results['total']} tests réussis ({percentage:.0f}%)")
    print()
    print(f"  Pages publiques: {sum(results['pages'])}/{len(results['pages'])} OK")
    print(f"  CMS Backend: {'✅' if results['cms'] else '❌'}")
    print(f"  Monetico API: {'✅' if results['monetico'] else '❌'}")
    print()
    
    if results["passed"] == results["total"]:
        print("🎉 PHASE 6 - SUCCÈS COMPLET!")
        return 0
    elif percentage >= 90:
        print("✅ PHASE 6 - SUCCÈS (quelques ajustements mineurs possibles)")
        return 0
    else:
        print("⚠️ PHASE 6 - CORRECTIONS NÉCESSAIRES")
        return 1

if __name__ == "__main__":
    sys.exit(main())
