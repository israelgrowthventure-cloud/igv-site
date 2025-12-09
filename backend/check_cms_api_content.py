#!/usr/bin/env python3
"""
Script pour vérifier le contenu CMS de la page merci via l'API
"""
import requests
import json

def check_cms_api(slug):
    url = f"https://igv-cms-backend.onrender.com/api/pages/{slug}"
    print(f"\n{'='*60}")
    print(f"API CMS: {url}")
    print(f"{'='*60}")
    
    try:
        r = requests.get(url, timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code == 200:
            data = r.json()
            
            print(f"\nSlug: {data.get('slug')}")
            print(f"Title: {data.get('title')}")
            print(f"Published: {data.get('published')}")
            
            content_html = data.get('content_html', '')
            print(f"\nContent HTML length: {len(content_html)} chars")
            
            # Recherche des phrases clés
            search_phrases = [
                "Demande bien reçue",
                "24 heures",
                "recontactons",
                "Prochaines étapes"
            ]
            
            print(f"\n--- Recherche des phrases clés dans content_html ---")
            for phrase in search_phrases:
                found = phrase in content_html
                symbol = "✅" if found else "❌"
                print(f"{symbol} '{phrase}': {found}")
            
            # Afficher un extrait
            print(f"\n--- Extrait content_html (premiers 800 chars) ---")
            print(content_html[:800])
        else:
            print(f"❌ Erreur HTTP: {r.status_code}")
            print(f"Response: {r.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    slugs = [
        "etude-implantation-360",
        "etude-implantation-merci"
    ]
    
    for slug in slugs:
        check_cms_api(slug)
