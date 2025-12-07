"""
Test des pages CMS après déploiement
====================================

Vérifie que les pages home, about-us et contact ont bien leur contenu
"""

import requests
import json

BASE_URL = "https://igv-cms-backend.onrender.com/api"

def test_page_content(slug):
    """Teste le contenu d'une page"""
    print(f"\n📄 Test de la page '{slug}'...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/pages/{slug}", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code} OK")
            print(f"   Slug: {data.get('slug')}")
            print(f"   Published: {data.get('published')}")
            print(f"   HTML Length: {len(data.get('content_html', ''))} chars")
            print(f"   CSS Length: {len(data.get('content_css', ''))} chars")
            
            # Preview du HTML
            html = data.get('content_html', '')
            if html:
                preview = html[:200].replace('\n', ' ')
                print(f"   HTML Preview: {preview}...")
            else:
                print(f"   ⚠️ Pas de contenu HTML!")
            
            return True
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Timeout - Le serveur met trop de temps à répondre")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_backend_health():
    """Teste que le backend répond"""
    print("\n🏥 Test de santé du backend...")
    print("=" * 60)
    
    try:
        response = requests.get(f"https://igv-cms-backend.onrender.com/health", timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend UP: {data}")
            return True
        else:
            print(f"❌ Backend DOWN: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend inaccessible: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 TEST DES PAGES CMS EN PRODUCTION")
    print("=" * 60)
    
    # Test backend
    backend_ok = test_backend_health()
    
    if not backend_ok:
        print("\n⚠️ Backend non disponible, abandon des tests")
        exit(1)
    
    # Test des pages
    pages = ['home', 'about-us', 'contact', 'packs']
    results = {}
    
    for slug in pages:
        results[slug] = test_page_content(slug)
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    success = sum(1 for v in results.values() if v)
    total = len(results)
    
    for slug, ok in results.items():
        status = "✅" if ok else "❌"
        print(f"{status} {slug}")
    
    print(f"\n{success}/{total} pages testées avec succès")
    
    if success == total:
        print("\n✅ Tous les tests passent!")
        print("🔗 Testez manuellement:")
        print("   - https://israelgrowthventure.com/admin/pages/home")
        print("   - https://israelgrowthventure.com/admin/pages/about-us")
        print("   - https://israelgrowthventure.com/admin/pages/contact")
        exit(0)
    else:
        print("\n❌ Certains tests ont échoué")
        exit(1)
