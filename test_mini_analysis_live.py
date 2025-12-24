#!/usr/bin/env python3
"""Test mini-analysis endpoint en production"""
import requests
import json

url = "https://igv-cms-backend.onrender.com/api/mini-analysis"
data = {
    "email": "test@igv.com",
    "nom_de_marque": "TestCafe999",
    "secteur": "Restauration / Food",
    "statut_alimentaire": "Halal",
    "anciennete": "1-3 ans",
    "pays_dorigine": "France",
    "concept": "Café moderne bio",
    "positionnement": "Premium",
    "modele_actuel": "Indépendant",
    "differenciation": "Produits biologiques locaux",
    "objectif_israel": "Tester le marché israélien",
    "contraintes": "Budget limité"
}

print("📤 Envoi requête POST mini-analysis...")
print(f"Data: {json.dumps(data, indent=2, ensure_ascii=False)}\n")

try:
    response = requests.post(url, json=data, timeout=60)
    print(f"✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success: {result.get('success')}")
        print(f"✅ Brand: {result.get('brand_name')}")
        print(f"✅ Secteur: {result.get('secteur')}")
        analysis = result.get('analysis', '')
        print(f"✅ Analyse générée: {len(analysis)} caractères")
        print(f"\n📝 Aperçu (500 premiers caractères):")
        print(analysis[:500])
    else:
        print(f"❌ Erreur {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.Timeout:
    print("❌ Timeout après 60 secondes")
except Exception as e:
    print(f"❌ Exception: {e}")
