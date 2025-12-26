#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test UNIQUE pour EN - 1 quota seulement"""

import requests
import time

BACKEND = "https://igv-cms-backend.onrender.com"

print("\n" + "="*70)
print("TEST MISSION 3 - ENGLISH ANALYSIS (1 quota)")
print("="*70)

brand = f"EnglishTest_{int(time.time())}"

payload = {
    "email": "test@igv.com",
    "nom_de_marque": brand,
    "secteur": "Technology",
    "statut_alimentaire": "",
    "anciennete": "5 years",
    "pays_dorigine": "USA",
    "concept": "AI SaaS platform",
    "positionnement": "Premium enterprise",
    "modele_actuel": "Subscription",
    "differenciation": "Advanced ML algorithms",
    "objectif_israel": "Access tech ecosystem & R&D talent",
    "contraintes": "Budget limitations",
    "language": "en"
}

print(f"\nBrand: {brand}")
print("Sending request to Gemini (EN prompt)...")

try:
    r = requests.post(f"{BACKEND}/api/mini-analysis", json=payload, timeout=120)
    
    if r.status_code == 200:
        data = r.json()
        analysis = data.get("analysis", "")
        
        print(f"\n✅ Status: 200")
        print(f"Language header: {r.headers.get('X-IGV-Lang-Used', 'N/A')}")
        print(f"Analysis length: {len(analysis)} chars")
        
        # Extraire début
        preview = analysis[:200].replace("\n", " ")
        print(f"\nFirst 200 chars:\n{preview}...")
        
        # Check pour français
        french = ["entreprise", "marché", "société", "croissance"]
        has_fr = any(w in analysis.lower() for w in french)
        
        print(f"\n{'❌ FRENCH DETECTED' if has_fr else '✅ NO FRENCH'}")
        print(f"{'❌ LANG_FAIL in text' if 'LANG_FAIL' in analysis else '✅ NO LANG_FAIL'}")
        
        # Verdict
        if not has_fr and 'LANG_FAIL' not in analysis:
            print("\n" + "="*70)
            print("✅ MISSION 3A: ENGLISH ANALYSIS - OK")
            print("="*70)
        else:
            print("\n❌ FAILED: French detected or LANG_FAIL")
    else:
        print(f"\n❌ Error {r.status_code}: {r.text[:300]}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")

print("\n" + "="*70)
print("1 quota Gemini consumed")
print("="*70)
