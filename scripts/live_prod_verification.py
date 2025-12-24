"""
LIVE PRODUCTION VERIFICATION - Multilingual Mini-Analysis + PDF Header
============================================================================
This script calls the PRODUCTION API exactly like the frontend does,
generates 6 real mini-analyses, downloads PDFs, and provides proof.

Brands tested: "tubi" and "tubo" in FR/EN/HE
"""

import httpx
import json
import os
from pathlib import Path
from datetime import datetime
import sys

# Force UTF-8 on Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Production endpoints (matching frontend exactly)
BACKEND_URL = "https://igv-cms-backend.onrender.com"
MINI_ANALYSIS_ENDPOINT = f"{BACKEND_URL}/api/mini-analysis"
PDF_GENERATE_ENDPOINT = f"{BACKEND_URL}/api/pdf/generate"

# Output directory for PDFs
OUTPUT_DIR = Path("out")
OUTPUT_DIR.mkdir(exist_ok=True)

# Test configurations
TEST_CONFIGS = [
    # Brand "tubi"
    {
        "brand": "tubi",
        "language": "fr",
        "data": {
            "email": "test-tubi-fr@igv.com",
            "nom_de_marque": "tubi",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Kasher",
            "anciennete": "5 ans",
            "pays_dorigine": "France",
            "concept": "Fast-food moderne",
            "positionnement": "Casual dining",
            "modele_actuel": "Franchise",
            "differenciation": "Qualité premium",
            "objectif_israel": "Expansion régionale",
            "contraintes": "Budget limité",
            "language": "fr"
        }
    },
    {
        "brand": "tubi",
        "language": "en",
        "data": {
            "email": "test-tubi-en@igv.com",
            "nom_de_marque": "tubi",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Kosher",
            "anciennete": "5 years",
            "pays_dorigine": "France",
            "concept": "Modern fast-food",
            "positionnement": "Casual dining",
            "modele_actuel": "Franchise",
            "differenciation": "Premium quality",
            "objectif_israel": "Regional expansion",
            "contraintes": "Limited budget",
            "language": "en"
        }
    },
    {
        "brand": "tubi",
        "language": "he",
        "data": {
            "email": "test-tubi-he@igv.com",
            "nom_de_marque": "tubi",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Kosher",
            "anciennete": "5 years",
            "pays_dorigine": "France",
            "concept": "Modern fast-food",
            "positionnement": "Casual dining",
            "modele_actuel": "Franchise",
            "differenciation": "Premium quality",
            "objectif_israel": "Regional expansion",
            "contraintes": "Limited budget",
            "language": "he"
        }
    },
    # Brand "tubo"
    {
        "brand": "tubo",
        "language": "fr",
        "data": {
            "email": "test-tubo-fr@igv.com",
            "nom_de_marque": "tubo",
            "secteur": "Retail (hors food)",
            "statut_alimentaire": "",
            "anciennete": "3 ans",
            "pays_dorigine": "Italie",
            "concept": "Mode urbaine",
            "positionnement": "Premium",
            "modele_actuel": "Corporate",
            "differenciation": "Design unique",
            "objectif_israel": "Premier magasin",
            "contraintes": "Logistique",
            "language": "fr"
        }
    },
    {
        "brand": "tubo",
        "language": "en",
        "data": {
            "email": "test-tubo-en@igv.com",
            "nom_de_marque": "tubo",
            "secteur": "Retail (hors food)",
            "statut_alimentaire": "",
            "anciennete": "3 years",
            "pays_dorigine": "Italy",
            "concept": "Urban fashion",
            "positionnement": "Premium",
            "modele_actuel": "Corporate",
            "differenciation": "Unique design",
            "objectif_israel": "First store",
            "contraintes": "Logistics",
            "language": "en"
        }
    },
    {
        "brand": "tubo",
        "language": "he",
        "data": {
            "email": "test-tubo-he@igv.com",
            "nom_de_marque": "tubo",
            "secteur": "Retail (hors food)",
            "statut_alimentaire": "",
            "anciennete": "3 years",
            "pays_dorigine": "Italy",
            "concept": "Urban fashion",
            "positionnement": "Premium",
            "modele_actuel": "Corporate",
            "differenciation": "Unique design",
            "objectif_israel": "First store",
            "contraintes": "Logistics",
            "language": "he"
        }
    }
]

def print_separator(title=""):
    """Print a visual separator"""
    print(f"\n{'='*80}")
    if title:
        print(f"  {title}")
        print(f"{'='*80}")

def generate_mini_analysis(config):
    """
    Generate mini-analysis by calling PROD endpoint exactly like frontend
    
    Returns: (success, analysis_text, response_data)
    """
    brand = config["brand"]
    language = config["language"]
    data = config["data"]
    
    print_separator(f"GENERATING: {brand.upper()} - {language.upper()}")
    
    print(f"\n📋 Request Details:")
    print(f"  Endpoint: POST {MINI_ANALYSIS_ENDPOINT}")
    print(f"  Brand: {brand}")
    print(f"  Language: {language}")
    print(f"  Email: {data['email']}")
    print(f"  Sector: {data['secteur']}")
    
    try:
        print(f"\n⏳ Calling production API...")
        print(f"  (May take 30-60s for cold start + Gemini API)")
        
        # Call exactly like frontend
        response = httpx.post(
            MINI_ANALYSIS_ENDPOINT,
            json=data,
            timeout=120.0,
            headers={
                "Content-Type": "application/json"
            }
        )
        
        print(f"\n✅ Response received")
        print(f"  Status: {response.status_code}")
        
        # Extract debug headers (if backend provides them)
        lang_requested = response.headers.get("X-IGV-Lang-Requested", "N/A")
        lang_used = response.headers.get("X-IGV-Lang-Used", "N/A")
        cache_hit = response.headers.get("X-IGV-Cache-Hit", "N/A")
        
        print(f"  Headers:")
        print(f"    X-IGV-Lang-Requested: {lang_requested}")
        print(f"    X-IGV-Lang-Used: {lang_used}")
        print(f"    X-IGV-Cache-Hit: {cache_hit}")
        
        if response.status_code != 200:
            print(f"\n❌ ERROR: HTTP {response.status_code}")
            error_detail = response.json().get("detail", response.text[:200])
            print(f"  Detail: {error_detail}")
            return False, None, None
        
        result = response.json()
        
        if not result.get("success"):
            print(f"\n❌ ERROR: API returned success=False")
            print(f"  Message: {result.get('message', 'Unknown error')}")
            return False, None, result
        
        analysis_text = result.get("analysis", "")
        
        if not analysis_text:
            print(f"\n❌ ERROR: Empty analysis text")
            return False, None, result
        
        print(f"\n📄 Analysis received:")
        print(f"  Length: {len(analysis_text)} characters")
        print(f"\n  First 600 characters:")
        print(f"  {'-'*76}")
        print(f"  {analysis_text[:600]}")
        print(f"  {'-'*76}")
        
        if len(analysis_text) > 600:
            print(f"  ... ({len(analysis_text) - 600} more characters)")
        
        return True, analysis_text, result
        
    except httpx.TimeoutException:
        print(f"\n❌ TIMEOUT: Request took more than 120 seconds")
        return False, None, None
        
    except Exception as e:
        print(f"\n❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None, None


def download_pdf(brand, language, analysis_text, email):
    """
    Generate and download PDF
    
    Returns: (success, pdf_path, pdf_size_bytes)
    """
    print(f"\n📥 Generating PDF for {brand} ({language})...")
    
    pdf_data = {
        "email": email,
        "brandName": brand,
        "sector": "Restauration / Food" if brand == "tubi" else "Retail (hors food)",
        "country": "France" if brand == "tubi" else "Italy",
        "analysisText": analysis_text,
        "language": language
    }
    
    try:
        response = httpx.post(
            PDF_GENERATE_ENDPOINT,
            json=pdf_data,
            timeout=60.0,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"  ❌ ERROR: HTTP {response.status_code}")
            print(f"  Detail: {response.text[:200]}")
            return False, None, 0
        
        result = response.json()
        
        if not result.get("success"):
            print(f"  ❌ ERROR: PDF generation failed")
            return False, None, 0
        
        # Get PDF as base64
        pdf_base64 = result.get("pdfBase64")
        
        if not pdf_base64:
            print(f"  ❌ ERROR: No PDF data returned")
            return False, None, 0
        
        # Decode and save
        import base64
        pdf_bytes = base64.b64decode(pdf_base64)
        
        pdf_filename = f"{brand}_{language}.pdf"
        pdf_path = OUTPUT_DIR / pdf_filename
        
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)
        
        pdf_size = len(pdf_bytes)
        
        print(f"  ✅ PDF saved: {pdf_path}")
        print(f"  Size: {pdf_size:,} bytes ({pdf_size/1024:.1f} KB)")
        
        return True, pdf_path, pdf_size
        
    except Exception as e:
        print(f"  ❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None, 0


def main():
    """Run live production verification"""
    
    print(f"\n{'#'*80}")
    print(f"# LIVE PRODUCTION VERIFICATION")
    print(f"# Backend: {BACKEND_URL}")
    print(f"# Tests: 6 mini-analyses (tubi + tubo × FR/EN/HE)")
    print(f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")
    
    results = []
    pdf_files = []
    
    # Generate all 6 analyses
    for i, config in enumerate(TEST_CONFIGS, 1):
        brand = config["brand"]
        language = config["language"]
        
        print(f"\n\n{'*'*80}")
        print(f"* TEST {i}/6: {brand.upper()} - {language.upper()}")
        print(f"{'*'*80}")
        
        # Generate analysis
        success, analysis_text, response_data = generate_mini_analysis(config)
        
        if not success:
            print(f"\n❌ FAILED: Could not generate analysis")
            results.append({
                "brand": brand,
                "language": language,
                "success": False,
                "analysis_length": 0,
                "pdf_path": None,
                "pdf_size": 0
            })
            continue
        
        # Download PDF
        pdf_success, pdf_path, pdf_size = download_pdf(
            brand, 
            language, 
            analysis_text,
            config["data"]["email"]
        )
        
        if pdf_success:
            pdf_files.append({
                "brand": brand,
                "language": language,
                "path": pdf_path,
                "size": pdf_size
            })
        
        results.append({
            "brand": brand,
            "language": language,
            "success": True,
            "analysis_length": len(analysis_text),
            "analysis_preview": analysis_text[:600],
            "pdf_path": pdf_path if pdf_success else None,
            "pdf_size": pdf_size
        })
        
        # Small delay between requests
        if i < len(TEST_CONFIGS):
            print(f"\n⏸️  Waiting 3 seconds before next request...")
            import time
            time.sleep(3)
    
    # Summary
    print_separator("FINAL SUMMARY")
    
    print(f"\n📊 Results:")
    print(f"  Total tests: {len(results)}")
    print(f"  Successful analyses: {sum(1 for r in results if r['success'])}")
    print(f"  PDFs generated: {len(pdf_files)}")
    
    print(f"\n📄 Analysis Texts (First 600 chars):")
    for result in results:
        if result["success"]:
            brand = result["brand"]
            lang = result["language"]
            preview = result["analysis_preview"]
            
            print(f"\n  {brand.upper()} ({lang.upper()}):")
            print(f"    Length: {result['analysis_length']} chars")
            print(f"    Preview: {preview[:200]}...")
    
    print(f"\n📁 PDF Files Generated:")
    if pdf_files:
        total_size = sum(f["size"] for f in pdf_files)
        print(f"  Directory: {OUTPUT_DIR.absolute()}")
        print(f"  Total size: {total_size:,} bytes ({total_size/1024:.1f} KB)")
        print(f"\n  Files:")
        for pdf in pdf_files:
            print(f"    ✅ {pdf['path'].name} - {pdf['size']:,} bytes")
    else:
        print(f"  ❌ No PDFs generated")
    
    print(f"\n{'='*80}")
    print(f"VERIFICATION COMPLETE")
    print(f"{'='*80}")
    
    print(f"\n📋 Next Steps:")
    print(f"  1. Check the PDFs in: {OUTPUT_DIR.absolute()}")
    print(f"  2. Verify IGV header is visible in each PDF")
    print(f"  3. Check Render logs for:")
    print(f"     - LANG_REQUESTED/LANG_USED")
    print(f"     - HEADER_PATH/HEADER_EXISTS/HEADER_MERGE_OK")
    print(f"  4. Provide the 6 PDFs + logs extracts as proof")
    
    return results, pdf_files


if __name__ == "__main__":
    results, pdf_files = main()
