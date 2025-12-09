#!/usr/bin/env python3
"""
Script de diagnostic : Vérifier les pages actuellement dans MongoDB
"""
import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"

def check_pages_count():
    print(f"\n{'='*60}")
    print(f"Diagnostic: Pages CMS dans MongoDB")
    print(f"{'='*60}")
    
    try:
        # Appeler l'API GET /api/pages (sans auth, retourne toutes pages)
        url = f"{BACKEND_URL}/api/pages"
        print(f"\nAPI: {url}")
        
        r = requests.get(url, timeout=30)
        print(f"Status: {r.status_code}")
        
        if r.status_code == 200:
            pages = r.json()
            print(f"\n📊 Nombre total de pages: {len(pages)}")
            
            if pages:
                print(f"\n📄 Liste des pages:")
                for i, page in enumerate(pages, 1):
                    slug = page.get('slug', 'N/A')
                    path = page.get('path', 'N/A')
                    title = page.get('title', 'N/A')
                    published = page.get('published', False)
                    
                    status_symbol = "✅" if published else "❌"
                    print(f"   {i}. {status_symbol} {slug}")
                    print(f"      Path: {path}")
                    print(f"      Title: {title}")
                    print(f"      Published: {published}")
                    print()
            else:
                print(f"\n⚠️  Aucune page trouvée dans la collection")
        else:
            print(f"❌ Erreur HTTP: {r.status_code}")
            print(f"Response: {r.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    check_pages_count()
