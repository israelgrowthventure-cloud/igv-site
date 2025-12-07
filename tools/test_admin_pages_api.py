#!/usr/bin/env python3
"""
Teste l'API backend pour les slugs CMS : home, packs, about-us, contact, le-commerce-de-demain
Vérifie que chaque slug renvoie du contenu exploitable
"""
import requests

BASE_URL = "https://israelgrowthventure.com/api/pages/"
SLUGS = ["home", "packs", "about-us", "contact", "le-commerce-de-demain"]

for slug in SLUGS:
    url = BASE_URL + slug
    print(f"\n🔍 GET {url}")
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            html = data.get("content_html", "")
            print(f"   HTML length: {len(html)}")
            print(f"   Preview: {html[:120].replace(chr(10), ' ')}...")
            if not html:
                print("   ⚠️  Pas de contenu HTML pour ce slug !")
        else:
            print(f"   ❌ Erreur HTTP: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Exception: {str(e)[:100]}")
