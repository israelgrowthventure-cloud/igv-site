#!/usr/bin/env python3
"""
Script de test rapide des URLs de production IGV
Vérifie que le frontend est correctement déployé et contient le bundle React
Retourne exit code 0 si OK, 1 si erreur
"""

import sys
import requests
from datetime import datetime

# Configuration
PRODUCTION_URL = 'https://israelgrowthventure.com/'
RENDER_DIRECT_URL = 'https://igv-site-web.onrender.com/'
TIMEOUT = 15  # secondes
MIN_CONTENT_LENGTH = 5000  # bytes - un build React complet doit faire plus que ça

def test_url(url, name="Site"):
    """
    Teste une URL et retourne True si OK, False sinon
    """
    print(f"\n{'='*60}")
    print(f"🔍 Test: {name}")
    print(f"URL: {url}")
    print('-'*60)
    
    try:
        response = requests.get(url, timeout=TIMEOUT, allow_redirects=True)
        status_code = response.status_code
        content = response.text
        content_length = len(content)
        content_lower = content.lower()
        
        # Vérifications
        has_200 = status_code == 200
        has_bundle = ('main.' in content and '.js' in content) or 'bundle' in content_lower
        has_react = 'react' in content_lower or has_bundle
        sufficient_length = content_length >= MIN_CONTENT_LENGTH
        
        # Affichage des résultats
        print(f"✅ HTTP Status: {status_code}" if has_200 else f"❌ HTTP Status: {status_code}")
        print(f"📄 Content Length: {content_length} bytes")
        
        if sufficient_length:
            print(f"✅ Content length sufficient (>= {MIN_CONTENT_LENGTH} bytes)")
        else:
            print(f"⚠️ Content length too short (< {MIN_CONTENT_LENGTH} bytes)")
        
        if has_bundle:
            print(f"✅ React bundle detected (main.*.js)")
        else:
            print(f"❌ React bundle NOT detected")
        
        if has_react:
            print(f"✅ React markers found")
        else:
            print(f"⚠️ React markers not found")
        
        # Critères de succès: HTTP 200 ET bundle détecté
        success = has_200 and has_bundle
        
        if success:
            print(f"\n✅ Test {name}: PASS")
        else:
            print(f"\n❌ Test {name}: FAIL")
            if not has_200:
                print(f"   Raison: HTTP {status_code} au lieu de 200")
            if not has_bundle:
                print(f"   Raison: Bundle React non détecté dans le HTML")
        
        return success
        
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT après {TIMEOUT} secondes")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("="*60)
    print("🧪 TEST RAPIDE PRODUCTION IGV")
    print("="*60)
    print(f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print("="*60)
    
    # Test du domaine custom (principal)
    prod_ok = test_url(PRODUCTION_URL, "Production (domaine custom)")
    
    # Test optionnel de l'URL Render directe
    # render_ok = test_url(RENDER_DIRECT_URL, "Render Direct")
    
    # Résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ")
    print("="*60)
    
    if prod_ok:
        print("✅ Production opérationnelle - Bundle React déployé")
        print("="*60)
        return 0
    else:
        print("❌ Production NON opérationnelle - Bundle React manquant ou erreur HTTP")
        print("="*60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
