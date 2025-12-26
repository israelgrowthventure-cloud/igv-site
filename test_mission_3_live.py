#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test LIVE pour MISSION 3 : Multilangue + PDF + Packs"""

import requests
import json
import time
import base64
import sys
import io

# Force UTF-8 encoding for console output
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Le backend est sur Render, pas sur le domaine principal
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

def test_mini_analysis_multilang():
    """TEST 1 : Mini-analyse en FR/EN/HE"""
    print("🌍 TEST 1 : Mini-analyse multilingue sur LIVE")
    print("=" * 70)
    
    import time
    brand_name = f"TestCo_{int(time.time())}"
    
    test_data = {
        "email": "test@test.com",
        "nom_de_marque": brand_name,
        "secteur": "Technology",
        "statut_alimentaire": "",
        "anciennete": "5 ans",
        "pays_dorigine": "France",
        "concept": "Innovation",
        "positionnement": "Premium",
        "modele_actuel": "B2B",
        "differenciation": "AI powered",
        "objectif_israel": "Expansion",
        "contraintes": "Budget limité"
    }
    
    for lang in ["fr", "en", "he"]:
        print(f"\n📝 Génération en {lang.upper()}...")
        response = requests.post(
            f"{BACKEND_URL}/api/mini-analysis",
            json={**test_data, "language": lang},
            timeout=120  # 2 minutes pour Gemini
        )
        
        if response.status_code == 200:
            data = response.json()
            analysis = data.get("analysis", "")
            lang_used = response.headers.get("X-IGV-Lang-Used", "unknown")
            
            # Premier extrait (100 premiers caractères)
            preview = analysis[:100].replace("\n", " ")
            print(f"   ✅ Status: 200 | Langue: {lang_used}")
            print(f"   📄 Début : {preview}...")
            
            # Vérification : Pas de FR dans EN
            if lang == "en":
                french_words = ["entreprise", "marché", "société", "croissance"]
                found_fr = any(word in analysis.lower() for word in french_words)
                if found_fr:
                    print(f"   ⚠️ FRANÇAIS détecté dans analyse EN!")
                else:
                    print(f"   ✅ Pas de français détecté")
            
            # Vérification : Pas de LANG_FAIL pour HE
            if lang == "he":
                if "LANG_FAIL" in analysis:
                    print(f"   ❌ LANG_FAIL détecté!")
                else:
                    print(f"   ✅ Pas de LANG_FAIL")
        else:
            print(f"   ❌ Erreur {response.status_code}: {response.text[:200]}")
        
        time.sleep(2)

def test_pdf_download():
    """TEST 2 : PDF avec entête IGV"""
    print("\n\n📄 TEST 2 : Téléchargement PDF avec entête")
    print("=" * 70)
    
    payload = {
        "brandName": "TestCoPDF",
        "sector": "Technology",
        "origin": "France",
        "email": "test@test.com",
        "analysis": "Analyse de test pour PDF : Votre entreprise TestCoPDF dans le secteur Technology présente un potentiel intéressant pour le marché israélien. Opportunités: Écosystème tech, innovation, R&D. Défis: Concurrence locale forte.",
        "language": "fr"
    }
    
    response = requests.post(
        f"{BACKEND_URL}/api/pdf/generate",
        json=payload,
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        pdf_b64 = data.get("pdfBase64", "")
        filename = data.get("filename", "unknown.pdf")
        header_status = response.headers.get("X-IGV-Header-Status", "unknown")
        
        print(f"   ✅ Status: 200")
        print(f"   📁 Fichier: {filename}")
        print(f"   🔖 Header status: {header_status}")
        print(f"   💾 Taille base64: {len(pdf_b64)} caractères")
        
        # Sauvegarder pour vérification manuelle
        if pdf_b64:
            pdf_bytes = base64.b64decode(pdf_b64)
            output_path = r"c:\Users\PC\Desktop\IGV\igv site\igv-site\test_pdf_live.pdf"
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
            print(f"   📥 PDF sauvegardé : {output_path}")
            print(f"   👁️ VÉRIFICATION MANUELLE REQUISE : Ouvrir le PDF et confirmer l'entête IGV")
    else:
        print(f"   ❌ Erreur {response.status_code}: {response.text[:200]}")

def test_packs_pricing():
    """TEST 3 : Prix /packs"""
    print("\n\n💰 TEST 3 : Affichage prix sur /packs")
    print("=" * 70)
    
    response = requests.get(f"{FRONTEND_URL}/packs")
    
    if response.status_code == 200:
        print(f"   ✅ Page /packs accessible (status 200)")
        print(f"   📊 Prix attendus :")
        print(f"      - Pack Analyse : 3000€ (EU) / 7000₪ (IL) / 4000$ (USA)")
        print(f"      - Pack Succursales : 15000€ (EU) / 55000₪ (IL) / 30000$ (USA)")
        print(f"      - Pack Franchise : 15000€ (EU) / 55000₪ (IL) / 30000$ (USA)")
        print(f"   👁️ VÉRIFICATION MANUELLE REQUISE : Ouvrir https://israelgrowthventure.com/packs")
    else:
        print(f"   ❌ Erreur {response.status_code}")

if __name__ == "__main__":
    print("\n🧪 TEST LIVE MISSION 3 : israelgrowthventure.com")
    print("=" * 70)
    
    test_mini_analysis_multilang()
    test_pdf_download()
    test_packs_pricing()
    
    print("\n" + "=" * 70)
    print("✅ Tests automatisés terminés")
    print("📋 Vérifications manuelles requises :")
    print("   1. Ouvrir test_pdf_live.pdf → Vérifier entête IGV visible")
    print("   2. Aller sur israelgrowthventure.com/packs → Vérifier les prix")
    print("=" * 70)
