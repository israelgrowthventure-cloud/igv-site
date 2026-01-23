#!/usr/bin/env python3
"""Capture visual proofs for CRM reconstruction - HE and EN versions"""

import asyncio
import os
from datetime import datetime
from playwright.async_api import async_playwright

FRONTEND_URL = "https://israelgrowthventure.com"
OUTPUT_DIR = r"C:\Users\PC\Desktop\IGV\igv site\igv-site\visual_proofs"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def capture_crm_proofs():
    print("=" * 60)
    print("   Visual Proof Capture - CRM Reconstruction")
    print("=" * 60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Test HE version
        print("\n🇮🇱 Capturing Hebrew (HE) version...")
        context_he = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="he-IL"
        )
        page_he = await context_he.new_page()
        
        # Add language parameter
        await page_he.goto(f"{FRONTEND_URL}?lang=he", wait_until="networkidle", timeout=60000)
        await page_he.wait_for_timeout(2000)
        
        # Homepage HE
        await page_he.screenshot(path=os.path.join(OUTPUT_DIR, "01_homepage_HE.png"), full_page=False)
        print("   ✅ 01_homepage_HE.png")
        
        # Try to navigate to CRM (need login)
        # First check if there's a login link
        login_visible = await page_he.locator('a[href*="login"], button:has-text("Login"), a:has-text("Login")').count()
        if login_visible > 0:
            print("   ℹ️  Login required for CRM access")
            # Take screenshot of whatever is available
            await page_he.screenshot(path=os.path.join(OUTPUT_DIR, "02_needs_login_HE.png"), full_page=False)
        
        await context_he.close()
        
        # Test EN version
        print("\n🇺🇸 Capturing English (EN) version...")
        context_en = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="en-US"
        )
        page_en = await context_en.new_page()
        
        await page_en.goto(f"{FRONTEND_URL}?lang=en", wait_until="networkidle", timeout=60000)
        await page_en.wait_for_timeout(2000)
        
        # Homepage EN
        await page_en.screenshot(path=os.path.join(OUTPUT_DIR, "03_homepage_EN.png"), full_page=False)
        print("   ✅ 03_homepage_EN.png")
        
        await context_en.close()
        
        # Test FR version for comparison
        print("\n🇫🇷 Capturing French (FR) version...")
        context_fr = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR"
        )
        page_fr = await context_fr.new_page()
        
        await page_fr.goto(f"{FRONTEND_URL}?lang=fr", wait_until="networkidle", timeout=60000)
        await page_fr.wait_for_timeout(2000)
        
        # Homepage FR
        await page_fr.screenshot(path=os.path.join(OUTPUT_DIR, "04_homepage_FR.png"), full_page=False)
        print("   ✅ 04_homepage_FR.png")
        
        await context_fr.close()
        await browser.close()
        
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
    asyncio.run(capture_crm_proofs())
