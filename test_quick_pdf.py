"""
Quick PDF Test - Generate 3 PDFs with unique brands
"""

import httpx
import base64
from pathlib import Path
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

BACKEND_URL = "https://igv-cms-backend.onrender.com"
OUTPUT_DIR = Path("out_live_pdfs")
OUTPUT_DIR.mkdir(exist_ok=True)

# Use unique brand names to avoid duplicate errors
TEST_CASES = [
    {"brand": "CafeNeuf24", "language": "fr", "sector": "Restauration / Food", "food_status": "Kasher"},
    {"brand": "TeaHouse24", "language": "en", "sector": "Restaurant / Food", "food_status": "Kosher"},
    {"brand": "קפה24", "language": "he", "sector": "Restauration / Food", "food_status": "Kasher"},
]

def generate_analysis_and_pdf(brand, language, sector, food_status):
    print(f"\n{'='*80}")
    print(f"TEST: {brand} / {language.upper()}")
    print(f"{'='*80}")
    
    # Step 1: Generate analysis
    print(f"→ Generating analysis...")
    
    analysis_payload = {
        "email": f"test-{brand.lower()}@igv.com",
        "nom_de_marque": brand,
        "secteur": sector,
        "statut_alimentaire": food_status,
        "anciennete": "2-5 ans",
        "pays_dorigine": "France",
        "concept": "Premium concept",
        "positionnement": "High-end",
        "modele_actuel": "Franchise",
        "differenciation": "Innovation",
        "objectif_israel": "Market entry",
        "contraintes": "Budget",
        "language": language
    }
    
    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/mini-analysis",
            json=analysis_payload,
            timeout=120.0
        )
        
        print(f"← Analysis status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Analysis failed: {response.text[:200]}")
            return False
        
        data = response.json()
        analysis_text = data.get('analysis', '')
        
        print(f"✅ Analysis received: {len(analysis_text)} chars")
        print(f"   Preview: {analysis_text[:150]}...")
        
    except Exception as e:
        print(f"❌ Analysis exception: {str(e)}")
        return False
    
    # Step 2: Generate PDF
    print(f"\n→ Generating PDF...")
    
    pdf_payload = {
        "email": f"test-{brand.lower()}@igv.com",
        "brandName": brand,
        "sector": sector,
        "country": "France",
        "analysisText": analysis_text,
        "language": language
    }
    
    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/pdf/generate",
            json=pdf_payload,
            timeout=120.0
        )
        
        print(f"← PDF status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ PDF failed: {response.text[:200]}")
            return False
        
        data = response.json()
        pdf_base64 = data.get('pdfBase64')
        
        if not pdf_base64:
            print(f"❌ No PDF data")
            return False
        
        # Save PDF
        pdf_bytes = base64.b64decode(pdf_base64)
        output_file = OUTPUT_DIR / f"{brand}_{language}.pdf"
        output_file.write_bytes(pdf_bytes)
        
        print(f"✅ PDF SAVED: {output_file}")
        print(f"   Size: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024:.1f} KB)")
        
        return True
        
    except Exception as e:
        print(f"❌ PDF exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print(f"\n{'#'*80}")
    print(f"# QUICK PDF TEST - 3 UNIQUE BRANDS")
    print(f"{'#'*80}\n")
    
    results = []
    
    for test_case in TEST_CASES:
        success = generate_analysis_and_pdf(
            test_case['brand'],
            test_case['language'],
            test_case['sector'],
            test_case['food_status']
        )
        results.append({
            "brand": test_case['brand'],
            "language": test_case['language'],
            "success": success
        })
    
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}\n")
    
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['brand']} / {result['language'].upper()}")
    
    # List PDFs
    pdfs = list(OUTPUT_DIR.glob("*.pdf"))
    print(f"\n{'='*80}")
    print(f"ALL PDFs ({len(pdfs)} files)")
    print(f"{'='*80}\n")
    
    for pdf in sorted(pdfs):
        print(f"  {pdf.name} - {pdf.stat().st_size} bytes")
    
    print(f"\n✅ Open PDFs in {OUTPUT_DIR}/ to verify header visibility")
    print(f"✅ Check israel.growth.venture@gmail.com for auto-sent emails")
    
    return 0 if all(r['success'] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
