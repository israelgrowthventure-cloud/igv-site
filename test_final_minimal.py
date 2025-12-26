#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test FINAL Mission 3 - MINIMAL (1 quota only)"""

import requests
import json
import time
import base64

BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

print("=" * 70)
print("TEST FINAL MISSION 3 - israelgrowthventure.com")
print("=" * 70)

# TEST 1: UNE SEULE mini-analyse EN (consomme 1 quota)
print("\n1. Mini-analyse EN (1 quota)")
brand_name = f"FinalTest_{int(time.time())}"
payload_analysis = {
    "email": "test@igv.com",
    "nom_de_marque": brand_name,
    "secteur": "Restauration / Food",  # Use RESTAURATION which has EN/HE prompts
    "statut_alimentaire": "Healthy",
    "anciennete": "3 years",
    "pays_dorigine": "France",
    "concept": "AI Solutions",
    "positionnement": "Premium B2B",
    "modele_actuel": "SaaS",
    "differenciation": "Advanced AI",
    "objectif_israel": "Tech ecosystem access",
    "contraintes": "Budget constraints",
    "language": "en"
}

try:
    response = requests.post(f"{BACKEND_URL}/api/mini-analysis", json=payload_analysis, timeout=120)
    if response.status_code == 200:
        data = response.json()
        analysis_text = data.get("analysis", "")
        
        # Extraire verdict (premiers 150 caractères)
        verdict = analysis_text[:150].replace("\n", " ")
        
        print(f"   Status: {response.status_code}")
        print(f"   Langue: {response.headers.get('X-IGV-Lang-Used', 'N/A')}")
        print(f"   Verdict: {verdict}...")
        
        # Vérifier pas de français
        french_words = ["entreprise", "marché", "société"]
        has_french = any(word in analysis_text.lower() for word in french_words)
        print(f"   French detected: {'YES - FAIL' if has_french else 'NO - OK'}")
        
        # TEST 2: PDF avec ce texte (0 quota)
        print("\n2. PDF Download (0 quota)")
        payload_pdf = {
            "brandName": brand_name,
            "sector": "Technology",
            "origin": "France",
            "email": "test@igv.com",
            "analysis": analysis_text,
            "language": "en"
        }
        
        r_pdf = requests.post(f"{BACKEND_URL}/api/pdf/generate", json=payload_pdf, timeout=30)
        if r_pdf.status_code == 200:
            pdf_data = r_pdf.json()
            pdf_b64 = pdf_data.get("pdfBase64", "")
            filename = pdf_data.get("filename", "unknown.pdf")
            
            print(f"   Status: {r_pdf.status_code}")
            print(f"   Filename: {filename}")
            print(f"   Size: {len(pdf_b64)} chars")
            
            # Sauvegarder
            if pdf_b64:
                pdf_bytes = base64.b64decode(pdf_b64)
                output_path = "test_final_mission3.pdf"
                with open(output_path, "wb") as f:
                    f.write(pdf_bytes)
                print(f"   Saved: {output_path}")
                print(f"   VERIF MANUELLE: Ouvrir le PDF et confirmer entete IGV visible")
        else:
            print(f"   PDF Error: {r_pdf.status_code}")
            
    else:
        print(f"   Analysis Error: {response.status_code} - {response.text[:200]}")
except Exception as e:
    print(f"   Exception: {e}")

# TEST 3: /packs geolocation (0 quota)
print("\n3. /packs Pricing (0 quota)")
r_packs = requests.get(f"{FRONTEND_URL}/packs", timeout=10)
print(f"   Status: {r_packs.status_code}")
print(f"   Attendu pour Israel: 7000 shekel, 55000 shekel, 55000 shekel")
print(f"   VERIF MANUELLE: Ouvrir https://israelgrowthventure.com/packs")

print("\n" + "=" * 70)
print("TESTS TERMINES - 1 quota Gemini consomme")
print("=" * 70)
