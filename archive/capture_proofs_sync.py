#!/usr/bin/env python3
"""Capture visual proofs for CRM reconstruction - synchronous version"""

import os
from datetime import datetime
from playwright.sync_api import sync_playwright

FRONTEND_URL = "https://israelgrowthventure.com"
OUTPUT_DIR = r"C:\Users\PC\Desktop\IGV\igv site\igv-site\visual_proofs"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def capture_crm_proofs():
    print("=" * 60)
    print("   Visual Proof Capture - CRM Reconstruction")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Test HE version
        print("\n🇮🇱 Capturing Hebrew (HE) version...")
        page_he = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        page_he.goto(f"{FRONTEND_URL}?lang=he", wait_until="networkidle", timeout=60000)
        page_he.wait_for_timeout(1000)
        
        # Homepage HE
        page_he.screenshot(path=os.path.join(OUTPUT_DIR, "01_homepage_HE.png"))
        print("   ✅ 01_homepage_HE.png")
        page_he.close()
        
        # Test EN version
        print("\n🇺🇸 Capturing English (EN) version...")
        page_en = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        page_en.goto(f"{FRONTEND_URL}?lang=en", wait_until="networkidle", timeout=60000)
        page_en.wait_for_timeout(1000)
        
        # Homepage EN
        page_en.screenshot(path=os.path.join(OUTPUT_DIR, "02_homepage_EN.png"))
        print("   ✅ 02_homepage_EN.png")
        page_en.close()
        
        # Test FR version for comparison
        print("\n🇫🇷 Capturing French (FR) version...")
        page_fr = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        page_fr.goto(f"{FRONTEND_URL}?lang=fr", wait_until="networkidle", timeout=60000)
        page_fr.wait_for_timeout(1000)
        
        # Homepage FR
        page_fr.screenshot(path=os.path.join(OUTPUT_DIR, "03_homepage_FR.png"))
        print("   ✅ 03_homepage_FR.png")
        page_fr.close()
        
        browser.close()
        
    print("\n" + "=" * 60)
    print(f"   Screenshots saved to: {OUTPUT_DIR}")
    print("=" * 60)
    
    # List files
    files = os.listdir(OUTPUT_DIR)
    print(f"\n📁 Captured files:")
    for f in sorted(files):
        full_path = os.path.join(OUTPUT_DIR, f)
        size = os.path.getsize(full_path)
        print(f"   - {f} ({size:,} bytes)")

if __name__ == "__main__":
    capture_crm_proofs()
