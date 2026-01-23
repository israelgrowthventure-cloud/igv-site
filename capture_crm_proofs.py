#!/usr/bin/env python3
"""
Capture CRM visual proofs - Activities, Leads, Settings pages
"""

import asyncio
from playwright.async_api import async_playwright
import os

FRONTEND_URL = "https://israelgrowthventure.com"
LOGIN_EMAIL = "postmaster@israelgrowthventure.com"
LOGIN_PASSWORD = "Aa112233$"

PROOFS_DIR = r"C:\Users\PC\Desktop\IGV\igv site\igv-site\visual_proofs"

async def capture_crm():
    os.makedirs(PROOFS_DIR, exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            locale='fr-FR'
        )
        page = await context.new_page()
        
        print("1. Logging in...")
        await page.goto(f"{FRONTEND_URL}/admin/login")
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(2000)
        
        await page.fill('input[type="email"]', LOGIN_EMAIL)
        await page.fill('input[type="password"]', LOGIN_PASSWORD)
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(4000)
        
        print(f"   URL after login: {page.url}")
        
        # Leads page
        print("\n2. Capturing Leads page...")
        await page.goto(f"{FRONTEND_URL}/admin/crm/leads")
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(3000)
        await page.screenshot(
            path=os.path.join(PROOFS_DIR, "CRM_PROOF_LEADS.png"),
            full_page=True
        )
        print("   ✓ CRM_PROOF_LEADS.png")
        
        # Activities page
        print("\n3. Capturing Activities page...")
        await page.goto(f"{FRONTEND_URL}/admin/crm/activities")
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(3000)
        await page.screenshot(
            path=os.path.join(PROOFS_DIR, "CRM_PROOF_ACTIVITIES.png"),
            full_page=True
        )
        print("   ✓ CRM_PROOF_ACTIVITIES.png")
        
        # Settings page
        print("\n4. Capturing Settings page...")
        await page.goto(f"{FRONTEND_URL}/admin/crm/settings")
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(2000)
        await page.screenshot(
            path=os.path.join(PROOFS_DIR, "CRM_PROOF_SETTINGS.png"),
            full_page=True
        )
        print("   ✓ CRM_PROOF_SETTINGS.png")
        
        # Dashboard
        print("\n5. Capturing Dashboard...")
        await page.goto(f"{FRONTEND_URL}/admin/crm/dashboard")
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(2000)
        await page.screenshot(
            path=os.path.join(PROOFS_DIR, "CRM_PROOF_DASHBOARD.png"),
            full_page=True
        )
        print("   ✓ CRM_PROOF_DASHBOARD.png")
        
        await browser.close()
    
    print("\n✓ CRM proofs captured!")

if __name__ == "__main__":
    asyncio.run(capture_crm())
