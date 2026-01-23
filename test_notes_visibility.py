#!/usr/bin/env python3
"""Test notes visibility in CRM leads page"""

import os
from playwright.sync_api import sync_playwright

FRONTEND_URL = "https://israelgrowthventure.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"
OUTPUT_DIR = os.path.dirname(__file__)

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1200})
        
        # Login
        print("[1] Login...")
        page.goto(f"{FRONTEND_URL}/admin/login", wait_until="networkidle", timeout=60000)
        page.fill('input[type="email"]', ADMIN_EMAIL)
        page.fill('input[type="password"]', ADMIN_PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_timeout(3000)
        
        # Go to leads
        print("[2] Navigate to leads...")
        page.goto(f"{FRONTEND_URL}/admin/crm/leads", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(2000)
        
        # Click first lead
        print("[3] Click first lead...")
        page.locator('table tbody tr').first.click()
        page.wait_for_timeout(3000)
        
        # Find notes section
        print("[4] Looking for Notes section...")
        notes_h3 = page.locator('h3:has-text("Notes")').first
        
        if notes_h3.count() > 0:
            print("FOUND Notes section!")
            parent_div = notes_h3.locator('xpath=..')
            html = parent_div.inner_html()
            print("HTML content (first 1500 chars):")
            print("-" * 50)
            print(html[:1500])
            print("-" * 50)
        else:
            print("Notes section NOT found by h3 tag")
            
            # Try looking for the notes-related text
            page_text = page.inner_text('body')
            if 'Notes' in page_text or 'notes' in page_text:
                print("But 'Notes' text exists on page")
            
            # Print page structure
            print("\nLooking for border-t sections (notes is in mt-6 border-t pt-6)...")
            border_sections = page.locator('.border-t')
            print(f"Found {border_sections.count()} border-t sections")
        
        # Full page screenshot
        print("[5] Taking full page screenshot...")
        page.screenshot(path=os.path.join(OUTPUT_DIR, "FULL_PAGE_NOTES.png"), full_page=True)
        print(f"Saved to {OUTPUT_DIR}/FULL_PAGE_NOTES.png")
        
        browser.close()

if __name__ == "__main__":
    test()
