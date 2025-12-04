"""
Test de l'admin CMS en production
==================================

Vérifie que l'interface admin /admin/pages/* fonctionne correctement.
"""

import requests
import sys

FRONTEND_URL = "https://israelgrowthventure.com"

def test_admin_pages():
    """Test des pages admin"""
    
    pages_to_test = [
        '/admin/pages',
        '/admin/pages/new',
        '/admin/pages/home',
        '/admin/pages/about-us',
        '/admin/pages/contact',
    ]
    
    print("=" * 70)
    print("🎨 TEST ADMIN CMS")
    print("=" * 70)
    
    results = {}
    
    for path in pages_to_test:
        print(f"\n📄 Test {path}...")
        
        try:
            response = requests.get(f"{FRONTEND_URL}{path}", timeout=10, allow_redirects=True)
            
            if response.status_code == 200:
                # Vérifier que c'est bien du HTML (pas une erreur JSON)
                content_type = response.headers.get('content-type', '')
                
                if 'text/html' in content_type:
                    print(f"   ✅ Status: {response.status_code} - Page chargée")
                    results[path] = True
                else:
                    print(f"   ⚠️ Status: {response.status_code} - Type: {content_type}")
                    results[path] = False
            else:
                print(f"   ❌ Status: {response.status_code}")
                results[path] = False
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
            results[path] = False
    
    # Résumé
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ")
    print("=" * 70)
    
    for path, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {path}")
    
    success_count = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n{success_count}/{total} pages admin accessibles")
    
    if success_count >= 3:  # Au moins 3 pages doivent marcher
        print("\n✅ Admin CMS fonctionnel!")
        print("\n🔗 Testez manuellement avec la console navigateur:")
        print(f"   {FRONTEND_URL}/admin/pages/home")
        print("   (Ouvrez DevTools > Console pour voir les logs [CMS])")
        return True
    else:
        print("\n❌ Admin CMS non fonctionnel")
        return False

if __name__ == '__main__':
    success = test_admin_pages()
    sys.exit(0 if success else 1)
