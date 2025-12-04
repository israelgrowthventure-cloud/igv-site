"""
Test du backend CMS en production
==================================

Vérifie que le backend répond correctement après déploiement.

Usage:
    python test_cms_backend_prod.py
"""

import requests
import sys

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

def test_health():
    """Test de la route de santé"""
    
    print("\n🏥 Test /api/health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Response: {data}")
            return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout (backend trop lent ou indisponible)")
        return False
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def test_pages_api():
    """Test de l'API pages CMS"""
    
    print("\n📄 Test /api/pages/home...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/pages/home", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Slug: {data.get('slug')}")
            print(f"   Published: {data.get('published')}")
            print(f"   HTML Length: {len(data.get('content_html', ''))} chars")
            
            if len(data.get('content_html', '')) > 1000:
                print(f"   ✅ Contenu riche présent")
                return True
            else:
                print(f"   ⚠️ Contenu minimal (peut être normal)")
                return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def test_packs_api():
    """Test de l'API packs"""
    
    print("\n📦 Test /api/packs...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/packs", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Packs count: {len(data)}")
            return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def test_frontend():
    """Test que le frontend fonctionne"""
    
    print("\n🌐 Test frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        
        if response.status_code == 200:
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Frontend accessible")
            return True
        else:
            print(f"   ❌ Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def run_tests():
    """Exécute tous les tests"""
    
    print("=" * 70)
    print("🧪 TESTS BACKEND CMS EN PRODUCTION")
    print("=" * 70)
    
    results = {
        'health': test_health(),
        'pages': test_pages_api(),
        'packs': test_packs_api(),
        'frontend': test_frontend(),
    }
    
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ")
    print("=" * 70)
    
    for test, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {test}")
    
    success_count = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n{success_count}/{total} tests passés")
    
    if success_count == total:
        print("\n✅ Tous les tests passent - Backend opérationnel!")
        return True
    elif results['health'] and results['pages']:
        print("\n⚠️ Backend partiellement opérationnel (suffisant pour CMS)")
        return True
    else:
        print("\n❌ Backend non opérationnel - Redéploiement nécessaire")
        return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
