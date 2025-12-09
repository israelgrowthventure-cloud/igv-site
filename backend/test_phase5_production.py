#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests Production Phase 5 - Home moderne + CMS complet + Monetico
"""

import requests
from datetime import datetime

GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def log(message, color=RESET):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{color}[{timestamp}] {message}{RESET}")

def test_url(url, name):
    """Test GET d'une URL"""
    try:
        response = requests.get(url, timeout=10)
        status = response.status_code
        length = len(response.text)
        
        if status == 200:
            log(f"✅ {name} - {status} ({length} bytes)", GREEN)
            return True
        else:
            log(f"❌ {name} - {status}", RED)
            return False
    except Exception as e:
        log(f"❌ {name} - Error: {e}", RED)
        return False

def test_monetico_init():
    """Test endpoint Monetico init (doit retourner 503 si non configuré)"""
    log("Testing Monetico init endpoint...", BLUE)
    try:
        response = requests.post(
            'https://igv-cms-backend.onrender.com/api/payments/monetico/init',
            json={
                'pack': 'analyse',
                'amount': 3000.0,
                'currency': 'EUR',
                'customer_email': 'test@test.com',
                'customer_name': 'Test User',
                'order_reference': 'TEST-001'
            },
            timeout=10
        )
        
        status = response.status_code
        
        if status == 503:
            data = response.json()
            if 'error' in data.get('detail', {}):
                log("✅ Monetico init - 503 (non configuré, message clair OK)", GREEN)
                return True
        elif status == 200:
            log("✅ Monetico init - 200 (configuré et fonctionnel)", GREEN)
            return True
        else:
            log(f"⚠️ Monetico init - {status} (inattendu)", YELLOW)
            return False
            
    except Exception as e:
        log(f"❌ Monetico init - Error: {e}", RED)
        return False

def main():
    log("=" * 60, BLUE)
    log("TESTS PRODUCTION - PHASE 5", BLUE)
    log("=" * 60, BLUE)
    log("")
    
    results = []
    
    # Section 1: Home et pages CMS
    log("SECTION 1: Home et Pages CMS", YELLOW)
    log("-" * 60)
    results.append(test_url("https://israelgrowthventure.com/", "Home (/)"))
    results.append(test_url("https://israelgrowthventure.com/qui-sommes-nous", "Qui sommes-nous"))
    results.append(test_url("https://israelgrowthventure.com/packs", "Nos Packs"))
    results.append(test_url("https://israelgrowthventure.com/le-commerce-de-demain", "Commerce de Demain"))
    results.append(test_url("https://israelgrowthventure.com/contact", "Contact"))
    results.append(test_url("https://israelgrowthventure.com/etude-implantation-360", "Étude 360°"))
    results.append(test_url("https://israelgrowthventure.com/etude-implantation-360/merci", "Merci Étude 360°"))
    log("")
    
    # Section 2: Non-régression critiques
    log("SECTION 2: Non-régression", YELLOW)
    log("-" * 60)
    results.append(test_url("https://israelgrowthventure.com/admin/login", "Admin Login"))
    results.append(test_url("https://israelgrowthventure.com/payment/success", "Payment Success"))
    log("")
    
    # Section 3: API Monetico
    log("SECTION 3: API Paiements Monetico", YELLOW)
    log("-" * 60)
    results.append(test_monetico_init())
    log("")
    
    # Résumé
    log("=" * 60, BLUE)
    log("RÉSUMÉ", BLUE)
    log("=" * 60, BLUE)
    
    passed = sum(results)
    total = len(results)
    
    log(f"Total: {passed}/{total} tests réussis", GREEN if passed == total else YELLOW)
    
    if passed == total:
        log("✅ Tous les tests passés !", GREEN)
    else:
        log(f"⚠️ {total - passed} test(s) échoué(s)", YELLOW)

if __name__ == "__main__":
    main()
