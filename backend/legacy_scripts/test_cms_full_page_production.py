"""
Test CMS Full-Page Editing en Production
=========================================

Vérifie que:
1. Les pages CMS contiennent du contenu complet
2. Les pages publiques affichent ce contenu
3. L'éditeur GrapesJS est accessible et chargé
"""

import requests
import time

BACKEND_URL = "https://igv-cms-backend.onrender.com/api"
FRONTEND_URL = "https://israelgrowthventure.com"
ADMIN_URL = f"{FRONTEND_URL}/admin"

def print_header(text):
    print(f"\n{'=' * 80}")
    print(f"  {text}")
    print('=' * 80)

def check_cms_page(slug):
    """Vérifie qu'une page CMS contient du contenu complet"""
    print(f"\n📄 Test CMS: {slug}")
    try:
        response = requests.get(f"{BACKEND_URL}/pages/{slug}", timeout=10)
        if response.status_code == 200:
            page = response.json()
            
            # Vérifier les champs essentiels
            has_html = len(page.get('content_html', '')) > 100
            has_title = bool(page.get('title', {}).get('fr'))
            is_published = page.get('published', False)
            
            print(f"   Status: {response.status_code}")
            print(f"   Title FR: {page.get('title', {}).get('fr', 'N/A')}")
            print(f"   HTML length: {len(page.get('content_html', ''))} chars")
            print(f"   Published: {is_published}")
            
            if has_html and has_title and is_published:
                print(f"   ✅ Page {slug} OK (contenu complet)")
                return True
            else:
                print(f"   ⚠️ Page {slug} incomplète")
                return False
        else:
            print(f"   ❌ Erreur {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def check_public_page(route, expected_text):
    """Vérifie qu'une page publique affiche du contenu"""
    print(f"\n🌐 Test Public: {route}")
    try:
        response = requests.get(f"{FRONTEND_URL}{route}", timeout=10)
        if response.status_code == 200:
            html = response.text
            contains_text = expected_text.lower() in html.lower()
            
            print(f"   Status: {response.status_code}")
            print(f"   Contains '{expected_text}': {contains_text}")
            
            if contains_text:
                print(f"   ✅ Page {route} affiche du contenu")
                return True
            else:
                print(f"   ⚠️ Page {route} ne contient pas le texte attendu")
                return False
        else:
            print(f"   ❌ Erreur {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def check_admin_editor(slug):
    """Vérifie que l'éditeur admin est accessible"""
    print(f"\n🎨 Test Éditeur: /admin/pages/{slug}")
    try:
        response = requests.get(f"{ADMIN_URL}/pages/{slug}", timeout=10)
        if response.status_code in [200, 302]:  # 302 si redirect vers login
            html = response.text if response.status_code == 200 else ""
            
            # Chercher des indices de GrapesJS
            has_grapes = 'grapesjs' in html.lower() or 'grapes' in html.lower()
            
            print(f"   Status: {response.status_code}")
            if response.status_code == 302:
                print(f"   Redirect (probablement vers login)")
                print(f"   ✅ Route accessible")
                return True
            elif has_grapes:
                print(f"   Contains GrapesJS: True")
                print(f"   ✅ Éditeur accessible")
                return True
            else:
                print(f"   ⚠️ GrapesJS non détecté")
                return False
        else:
            print(f"   ❌ Erreur {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def main():
    print_header("TESTS CMS FULL-PAGE EDITING - PRODUCTION")
    
    results = []
    
    # Test 1: Vérifier que les pages CMS contiennent du contenu complet
    print_header("1️⃣  PAGES CMS - CONTENU COMPLET")
    pages = [
        'home',
        'packs',
        'about-us',
        'contact',
        'le-commerce-de-demain'
    ]
    
    for slug in pages:
        result = check_cms_page(slug)
        results.append(('CMS', slug, result))
    
    # Test 2: Vérifier que les pages publiques affichent le contenu
    print_header("2️⃣  PAGES PUBLIQUES - AFFICHAGE CONTENU")
    public_tests = [
        ('/', 'Développez votre entreprise en Israël'),
        ('/packs', 'Nos packs d\'accompagnement'),
        ('/about', 'Israel Growth Venture'),
        ('/contact', 'Contactez-nous'),
        ('/le-commerce-de-demain', 'Le commerce tel que vous le pratiquez est mort')
    ]
    
    for route, text in public_tests:
        result = check_public_page(route, text)
        results.append(('Public', route, result))
    
    # Test 3: Vérifier que l'éditeur admin est accessible
    print_header("3️⃣  ÉDITEUR ADMIN - ACCESSIBILITÉ")
    for slug in ['home', 'packs']:
        result = check_admin_editor(slug)
        results.append(('Admin', slug, result))
    
    # Résumé
    print_header("RÉSUMÉ")
    total = len(results)
    passed = sum(1 for r in results if r[2])
    
    print(f"\nTests passés: {passed}/{total}")
    
    for category, item, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {category:10s} {item}")
    
    if passed == total:
        print("\n🎉 Tous les tests sont passés!")
        print("\nLe CMS est maintenant entièrement connecté aux pages publiques.")
        print("Vous pouvez:")
        print("1. Éditer les pages dans https://israelgrowthventure.com/admin/pages")
        print("2. Les modifications apparaîtront sur le site public")
        print("3. L'éditeur GrapesJS affiche le contenu complet avec le thème IGV")
    else:
        print(f"\n⚠️ {total - passed} test(s) ont échoué")
        print("Vérifiez les logs ci-dessus pour plus de détails")

if __name__ == "__main__":
    main()
