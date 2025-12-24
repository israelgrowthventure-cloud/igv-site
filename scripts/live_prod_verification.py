"""
LIVE PRODUCTION VERIFICATION SCRIPT
Teste la génération de mini-analyses + PDF avec entête en PROD
MISSION: Prouver que l'entête PDF est appliqué et que l'email auto est envoyé
"""

import httpx
import base64
import os
import sys
from pathlib import Path
from datetime import datetime

# Force UTF-8 encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
OUTPUT_DIR = Path("out_live_pdfs")

# Create output directory
OUTPUT_DIR.mkdir(exist_ok=True)

# Test cases - 6 generations as requested
TEST_CASES = [
    {"brand": "tubi", "language": "fr", "sector": "Restauration / Food", "food_status": "Kasher"},
    {"brand": "tabi", "language": "en", "sector": "Restaurant / Food", "food_status": "Kosher"},
    {"brand": "tubi", "language": "he", "sector": "Restauration / Food", "food_status": "Kasher"},
    {"brand": "tuto", "language": "fr", "sector": "Retail (hors food)", "food_status": ""},
    {"brand": "tita", "language": "en", "sector": "Retail (non-food)", "food_status": ""},
    {"brand": "tato", "language": "he", "sector": "Services", "food_status": ""},
]


def generate_mini_analysis(brand: str, language: str, sector: str, food_status: str):
    """
    Call PROD mini-analysis endpoint (same as frontend)
    """
    print(f"\n{'='*80}")
    print(f"GENERATING: {brand} / {language.upper()} / {sector}")
    print(f"{'='*80}")
    
    url = f"{BACKEND_URL}/api/mini-analysis"
    
    # Request body (same structure as frontend api.js sendMiniAnalysis)
    payload = {
        "email": "test-live@igv.com",
        "nom_de_marque": brand,
        "secteur": sector,
        "statut_alimentaire": food_status,
        "anciennete": "2-5 ans",
        "pays_dorigine": "France",
        "concept": "Test concept for live verification",
        "positionnement": "Premium",
        "modele_actuel": "Franchise",
        "differenciation": "Innovation",
        "objectif_israel": "Expansion",
        "contraintes": "Budget",
        "language": language  # CRITICAL: language parameter
    }
    
    try:
        print(f"→ POST {url}")
        print(f"  Body: email={payload['email']}, brand={brand}, language={language}")
        
        response = httpx.post(url, json=payload, timeout=120.0)
        
        print(f"← Status: {response.status_code}")
        
        # Check for debug headers (if added)
        headers_to_check = [
            'X-IGV-Lang-Requested',
            'X-IGV-Lang-Used',
            'X-IGV-Cache-Hit',
            'X-IGV-Cache-Key'
        ]
        
        for header in headers_to_check:
            if header in response.headers:
                print(f"  {header}: {response.headers[header]}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return None
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ FAILED: success=False")
            print(f"Message: {data.get('message', 'No message')}")
            return None
        
        analysis_text = data.get('analysis', '')
        
        # Print first 600 chars
        print(f"\n✅ SUCCESS - Analysis received")
        print(f"  Length: {len(analysis_text)} chars")
        print(f"\n--- FIRST 600 CHARS ---")
        print(analysis_text[:600])
        print(f"--- END FIRST 600 CHARS ---\n")
        
        return {
            "success": True,
            "analysis": analysis_text,
            "brand": brand,
            "language": language,
            "response_data": data
        }
        
    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def generate_and_download_pdf(brand: str, language: str, analysis_text: str):
    """
    Generate PDF and download it locally
    """
    print(f"\n{'='*80}")
    print(f"GENERATING PDF: {brand} / {language.upper()}")
    print(f"{'='*80}")
    
    url = f"{BACKEND_URL}/api/pdf/generate"
    
    payload = {
        "email": "test-live@igv.com",
        "brandName": brand,
        "sector": "Test Sector",
        "country": "France",
        "analysisText": analysis_text,
        "language": language
    }
    
    try:
        print(f"→ POST {url}")
        
        response = httpx.post(url, json=payload, timeout=120.0)
        
        print(f"← Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ PDF GENERATION FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return None
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ PDF GENERATION FAILED: success=False")
            return None
        
        pdf_base64 = data.get('pdfBase64')
        filename = data.get('filename', f'{brand}_{language}.pdf')
        
        if not pdf_base64:
            print(f"❌ No PDF data in response")
            return None
        
        # Decode and save PDF
        pdf_bytes = base64.b64decode(pdf_base64)
        
        output_file = OUTPUT_DIR / f"{brand}_{language}.pdf"
        output_file.write_bytes(pdf_bytes)
        
        print(f"✅ PDF SAVED: {output_file}")
        print(f"  Size: {len(pdf_bytes)} bytes")
        
        return {
            "success": True,
            "filename": str(output_file),
            "size": len(pdf_bytes)
        }
        
    except Exception as e:
        print(f"\n❌ PDF EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    print(f"\n{'#'*80}")
    print(f"# LIVE PRODUCTION VERIFICATION")
    print(f"# Backend: {BACKEND_URL}")
    print(f"# Output: {OUTPUT_DIR}")
    print(f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")
    
    results = []
    
    for i, test_case in enumerate(TEST_CASES, 1):
        print(f"\n\n{'#'*80}")
        print(f"# TEST CASE {i}/{len(TEST_CASES)}")
        print(f"{'#'*80}")
        
        brand = test_case['brand']
        language = test_case['language']
        sector = test_case['sector']
        food_status = test_case['food_status']
        
        # Step 1: Generate mini-analysis
        analysis_result = generate_mini_analysis(brand, language, sector, food_status)
        
        if not analysis_result:
            results.append({
                "test_case": i,
                "brand": brand,
                "language": language,
                "analysis_success": False,
                "pdf_success": False
            })
            continue
        
        # Step 2: Generate and download PDF
        pdf_result = generate_and_download_pdf(
            brand, 
            language, 
            analysis_result['analysis']
        )
        
        results.append({
            "test_case": i,
            "brand": brand,
            "language": language,
            "analysis_success": True,
            "analysis_length": len(analysis_result['analysis']),
            "analysis_preview": analysis_result['analysis'][:200],
            "pdf_success": pdf_result is not None if pdf_result else False,
            "pdf_file": pdf_result['filename'] if pdf_result else None,
            "pdf_size": pdf_result['size'] if pdf_result else None
        })
    
    # Summary
    print(f"\n\n{'='*80}")
    print("FINAL SUMMARY")
    print(f"{'='*80}\n")
    
    for result in results:
        status_analysis = "✅" if result['analysis_success'] else "❌"
        status_pdf = "✅" if result['pdf_success'] else "❌"
        
        print(f"{status_analysis} Analysis | {status_pdf} PDF | {result['brand']} / {result['language'].upper()}")
        
        if result['analysis_success']:
            print(f"   Preview: {result['analysis_preview'][:100]}...")
        
        if result['pdf_success']:
            print(f"   PDF: {result['pdf_file']} ({result['pdf_size']} bytes)")
        
        print()
    
    # List all generated PDFs
    pdfs = list(OUTPUT_DIR.glob("*.pdf"))
    
    print(f"\n{'='*80}")
    print(f"GENERATED PDFs ({len(pdfs)} files)")
    print(f"{'='*80}\n")
    
    for pdf in sorted(pdfs):
        size = pdf.stat().st_size
        print(f"  {pdf.name} - {size} bytes ({size/1024:.1f} KB)")
    
    print(f"\n{'='*80}")
    print("NEXT STEPS:")
    print(f"{'='*80}")
    print(f"""
1. ✅ Open each PDF in {OUTPUT_DIR}/ and verify:
   - Header "entete igv.pdf" is visible at the top
   - Content matches the language (FR/EN/HE)
   - Professional formatting

2. ✅ Check email israel.growth.venture@gmail.com:
   - Should receive {len([r for r in results if r['pdf_success']])} emails
   - Each with PDF attached
   - Subject: "IGV Mini-Analysis PDF — {{brand}} — {{lang}} — {{timestamp}}"

3. ✅ Check Render logs (https://dashboard.render.com):
   - Search for: LANG_REQUESTED, HEADER_MERGE_OK, EMAIL_SEND_OK
   - Verify no HEADER_MERGE_FAILED or EMAIL_SEND_ERROR

4. 📋 Provide proof:
   - Paste this console output
   - Upload/share the {len(pdfs)} PDFs from {OUTPUT_DIR}/
   - Screenshot of email inbox (israel.growth.venture@gmail.com)
   - Extracts from Render logs
""")
    
    return 0 if all(r['analysis_success'] and r['pdf_success'] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
