#!/usr/bin/env python3
"""
Script pour vérifier le contenu de la page merci
"""
import requests

def check_page(url, search_phrases):
    print(f"\n{'='*60}")
    print(f"Vérification: {url}")
    print(f"{'='*60}")
    
    try:
        r = requests.get(url, timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code == 200:
            content = r.text
            print(f"Content length: {len(content)} chars")
            
            print(f"\n--- Recherche des phrases clés ---")
            for phrase in search_phrases:
                found = phrase in content
                symbol = "✅" if found else "❌"
                print(f"{symbol} '{phrase}': {found}")
            
            # Afficher un extrait autour de "merci" ou "reçue"
            print(f"\n--- Extraits pertinents ---")
            keywords = ["merci", "reçu", "24", "étape"]
            for keyword in keywords:
                idx = content.lower().find(keyword.lower())
                if idx != -1:
                    start = max(0, idx - 100)
                    end = min(len(content), idx + 200)
                    excerpt = content[start:end].replace('\n', ' ').replace('\r', '')
                    print(f"\nAutour de '{keyword}':")
                    print(f"...{excerpt}...")
                    break  # Un seul extrait suffit
        else:
            print(f"❌ Erreur HTTP: {r.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    urls = [
        "https://israelgrowthventure.com/etude-implantation-360/merci",
        "https://israelgrowthventure.com/etude-implantation-merci"
    ]
    
    search_phrases = [
        "Demande bien reçue",
        "Demande bien recue",
        "24 heures",
        "recontactons",
        "Prochaines étapes"
    ]
    
    for url in urls:
        check_page(url, search_phrases)
