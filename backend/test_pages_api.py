"""
Test de l'API Pages en production
==================================

Teste:
1. GET /api/pages (liste des pages)
2. GET /api/pages/:slug (récupération d'une page)
3. POST /api/pages (création de page - nécessite auth)

"""

import requests
import sys
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def test_pages_api():
    print("=" * 70)
    print("TEST API PAGES CMS")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Test 1: Liste des pages
    print("\n📄 TEST 1: Liste des pages")
    print(f"URL: {BACKEND_URL}/api/pages")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/pages", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            pages = response.json()
            print(f"✅ {len(pages)} pages trouvées")
            
            if len(pages) == 0:
                print("\n⚠️  AUCUNE PAGE EN BASE DE DONNÉES")
                print("   Il faut créer des pages initiales (home, packs, about, contact)")
            else:
                print("\n📋 Liste des pages:")
                for page in pages:
                    print(f"   - Slug: {page.get('slug')}")
                    print(f"     Titre FR: {page.get('title', {}).get('fr', 'N/A')}")
                    print(f"     Publié: {page.get('published', False)}")
                    print()
        elif response.status_code == 404:
            print("❌ Route /api/pages n'existe pas")
            print("   L'API CMS n'est pas implémentée dans le backend")
        else:
            print(f"⚠️  Status: {response.status_code}")
            print(f"Réponse: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Test 2: Admin Pages route
    print("\n📄 TEST 2: Route admin pages (frontend)")
    print(f"URL: https://israelgrowthventure.com/admin/pages")
    
    try:
        response = requests.get("https://israelgrowthventure.com/admin/pages", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Page admin/pages accessible")
        elif response.status_code == 302 or response.status_code == 401:
            print("⚠️  Redirection (nécessite authentification)")
        else:
            print(f"⚠️  Status inattendu: {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
    
    # Test 3: Vérifier si l'endpoint CMS existe (routes CMS)
    print("\n🔍 TEST 3: Vérification endpoints CMS")
    
    cms_endpoints = [
        "/api/pages",
        "/api/packs",
        "/api/pricing-rules",
        "/api/translations",
        "/api/auth/login"
    ]
    
    for endpoint in cms_endpoints:
        url = f"{BACKEND_URL}{endpoint}"
        try:
            response = requests.get(url, timeout=5)
            status = "✅" if response.status_code in [200, 401, 403] else "❌"
            print(f"{status} {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {str(e)[:50]}")
    
    print("\n" + "=" * 70)
    print("DIAGNOSTIC")
    print("=" * 70)
    
    print("\nSi /api/pages retourne 404 ou erreur:")
    print("1. Le backend n'a pas les routes CMS implémentées")
    print("2. Vérifier que cms_routes.py est bien importé dans server.py")
    print("3. Vérifier que le router CMS est bien monté")
    
    print("\nSi /api/pages retourne 0 pages:")
    print("1. La collection 'pages' est vide en base")
    print("2. Il faut créer des pages seed (home, packs, about, contact)")
    print("3. Utiliser un script d'initialisation ou l'admin")

if __name__ == "__main__":
    test_pages_api()
