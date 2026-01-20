"""
Test Mini-Analyse HE - PDF Download + Email en PRODUCTION
Reproduire le bug exactement comme l'utilisateur
"""
import requests
import json
import base64

BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TEST MINI-ANALYSE HE - PDF DOWNLOAD + EMAIL")
print("=" * 80)

# Exemple d'analyse en hébreu (simulé)
analysis_text_he = """
אנליזה שוק ישראלי למותג

הזדמנויות:
- שוק ישראלי דינמי
- צמיחה חזקה בסקטור

אתגרים:
- תחרות גבוהה
- רגולציה מורכבת
"""

# Test 1: PDF Generate (HE)
print("\n[1] TEST PDF GENERATE (language=he)...")
pdf_payload = {
    "email": "test@example.com",
    "brandName": "TestBrand",
    "sector": "Tech",
    "origin": "France",
    "analysis": analysis_text_he,
    "language": "he"
}

try:
    pdf_response = requests.post(
        f"{BACKEND_URL}/api/pdf/generate",
        json=pdf_payload,
        timeout=30
    )
    print(f"Status: {pdf_response.status_code}")
    
    if pdf_response.status_code == 200:
        pdf_data = pdf_response.json()
        print(f"✅ Response keys: {list(pdf_data.keys())}")
        
        if "pdfBase64" in pdf_data:
            pdf_b64 = pdf_data["pdfBase64"]
            print(f"✅ pdfBase64 présent: {len(pdf_b64)} chars")
            print(f"   Début: {pdf_b64[:50]}...")
            
            # Vérifier que c'est du base64 valide
            try:
                pdf_bytes = base64.b64decode(pdf_b64)
                print(f"✅ Base64 valide: {len(pdf_bytes)} bytes")
                
                # Vérifier header PDF
                if pdf_bytes[:4] == b'%PDF':
                    print(f"✅ Fichier PDF valide (header: %PDF)")
                else:
                    print(f"❌ Header invalide: {pdf_bytes[:10]}")
            except Exception as e:
                print(f"❌ Base64 decode error: {e}")
        else:
            print(f"❌ Pas de pdfBase64 dans la réponse")
            print(f"   Response: {json.dumps(pdf_data, indent=2, ensure_ascii=False)[:500]}")
    else:
        print(f"❌ Erreur HTTP {pdf_response.status_code}")
        print(f"   Response: {pdf_response.text[:500]}")
        
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {str(e)}")

# Test 2: Email Send PDF (HE)
print("\n[2] TEST EMAIL SEND PDF (language=he)...")
email_payload = {
    "email": "contact@israelgrowthventure.com",
    "brandName": "TestBrand",
    "sector": "Tech",
    "origin": "France",
    "analysis": analysis_text_he,
    "language": "he"
}

try:
    email_response = requests.post(
        f"{BACKEND_URL}/api/email/send-pdf",
        json=email_payload,
        timeout=30
    )
    print(f"Status: {email_response.status_code}")
    
    if email_response.status_code == 200:
        email_data = email_response.json()
        print(f"✅ Response: {json.dumps(email_data, indent=2, ensure_ascii=False)}")
    else:
        print(f"❌ Erreur HTTP {email_response.status_code}")
        print(f"   Response: {email_response.text[:500]}")
        
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {str(e)}")

# Test 3: Comparer avec FR (qui marche)
print("\n[3] TEST PDF GENERATE (language=fr) - COMPARAISON...")
pdf_payload_fr = {**pdf_payload, "language": "fr", "analysis": "Analyse en français\n\nTest"}

try:
    pdf_response_fr = requests.post(
        f"{BACKEND_URL}/api/pdf/generate",
        json=pdf_payload_fr,
        timeout=30
    )
    print(f"Status: {pdf_response_fr.status_code}")
    
    if pdf_response_fr.status_code == 200:
        pdf_data_fr = pdf_response_fr.json()
        print(f"✅ FR fonctionne - keys: {list(pdf_data_fr.keys())}")
    else:
        print(f"❌ FR aussi en erreur: {pdf_response_fr.status_code}")
        
except Exception as e:
    print(f"❌ Exception FR: {e}")

print("\n" + "=" * 80)
print("CONCLUSION:")
print("  - Si HE retourne 500 et FR retourne 200: problème génération PDF HE")
print("  - Si HE+FR retournent 200 mais frontend dit erreur: problème frontend")
print("=" * 80)
