#!/usr/bin/env python3
"""
Script de tests PROD Phase 6 TER
Vérifie que toutes les pages publiques sont opérationnelles
et contiennent les marqueurs du design Emergent + CMS
"""

import requests
from datetime import datetime

URLS_TO_TEST = [
    {
        "url": "https://israelgrowthventure.com/",
        "name": "Home",
        "markers": ["gradient", "500+", "15+", "98%", "Développez votre entreprise"]
    },
    {
        "url": "https://israelgrowthventure.com/about",
        "name": "About",
        "markers": ["gradient", "Qui sommes-nous", "Expertise Locale", "Accompagnement"]
    },
    {
        "url": "https://israelgrowthventure.com/future-commerce",
        "name": "Future Commerce",
        "markers": ["gradient", "commerce", "mort", "Israël"]
    },
    {
        "url": "https://israelgrowthventure.com/packs",
        "name": "Packs",
        "markers": ["Pack", "Analyse", "Succursales", "Franchise"]
    },
    {
        "url": "https://israelgrowthventure.com/contact",
        "name": "Contact",
        "markers": ["gradient", "contact", "form", "email"]
    }
]

def test_page(page_info):
    """Teste une page et retourne les résultats"""
    url = page_info['url']
    name = page_info['name']
    markers = page_info['markers']
    
    print(f"\n{'='*70}")
    print(f"🔍 Test: {name}")
    print(f"URL: {url}")
    print('-' * 70)
    
    try:
        response = requests.get(url, timeout=15)
        status_code = response.status_code
        content = response.text.lower()
        content_length = len(response.text)
        
        print(f"✅ HTTP Status: {status_code}")
        print(f"📄 Content Length: {content_length} bytes")
        
        if status_code != 200:
            print(f"❌ ÉCHEC: Status code {status_code} au lieu de 200")
            return False
        
        if content_length < 5000:
            print(f"⚠️ AVERTISSEMENT: Contenu trop court ({content_length} bytes)")
        
        # Vérifier les marqueurs
        markers_found = []
        markers_missing = []
        
        for marker in markers:
            if marker.lower() in content:
                markers_found.append(marker)
            else:
                markers_missing.append(marker)
        
        print(f"\n🎯 Marqueurs trouvés: {len(markers_found)}/{len(markers)}")
        for marker in markers_found:
            print(f"  ✅ {marker}")
        
        if markers_missing:
            print(f"\n⚠️ Marqueurs manquants: {len(markers_missing)}")
            for marker in markers_missing:
                print(f"  ❌ {marker}")
        
        # Vérifier les éléments critiques du design Emergent
        critical_elements = {
            "React": "main.js" in content or "react" in content,
            "Tailwind/Gradient": "gradient" in content,
            "Navigation": "nav" in content or "header" in content,
        }
        
        print(f"\n🏗️ Éléments du design:")
        for element, present in critical_elements.items():
            status = "✅" if present else "❌"
            print(f"  {status} {element}")
        
        # Résultat final
        success = (
            status_code == 200 and
            content_length > 2000 and
            len(markers_missing) <= 1  # Tolérer 1 marqueur manquant
        )
        
        if success:
            print(f"\n✅ Test {name}: PASS")
        else:
            print(f"\n❌ Test {name}: FAIL")
        
        return success
        
    except requests.exceptions.Timeout:
        print(f"❌ ÉCHEC: Timeout après 15 secondes")
        return False
    except Exception as e:
        print(f"❌ ÉCHEC: {str(e)}")
        return False

def main():
    print("=" * 70)
    print("🧪 TESTS PRODUCTION - PHASE 6 TER")
    print("=" * 70)
    print(f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print(f"Mission: Restauration design Emergent + CMS hybride textes/images")
    print("=" * 70)
    
    results = []
    
    for page_info in URLS_TO_TEST:
        success = test_page(page_info)
        results.append({
            'name': page_info['name'],
            'url': page_info['url'],
            'success': success
        })
    
    # Résumé final
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 70)
    
    total = len(results)
    passed = sum(1 for r in results if r['success'])
    failed = total - passed
    
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"{status} - {result['name']}: {result['url']}")
    
    print("-" * 70)
    print(f"Total: {total} | Passed: {passed} | Failed: {failed}")
    
    success_rate = (passed / total * 100) if total > 0 else 0
    print(f"Taux de réussite: {success_rate:.1f}%")
    
    print("=" * 70)
    
    if failed == 0:
        print("✅ TOUS LES TESTS SONT PASSÉS - Production opérationnelle")
        return 0
    else:
        print(f"⚠️ {failed} TEST(S) ÉCHOUÉ(S) - Vérifier les logs ci-dessus")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
