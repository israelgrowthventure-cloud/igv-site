#!/usr/bin/env python3
"""Capture visual proof of notes section in CRM"""

import os
from datetime import datetime
from playwright.sync_api import sync_playwright

FRONTEND_URL = "https://israelgrowthventure.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"
OUTPUT_DIR = os.path.dirname(__file__)

def capture():
    print("=" * 60)
    print("   CAPTURE NOTES SECTION - VISUAL PROOF")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use very tall viewport to capture everything
        page = browser.new_page(viewport={"width": 1920, "height": 3000})
        
        # Login
        print("\n[1] Login...")
        page.goto(f"{FRONTEND_URL}/admin/login", wait_until="networkidle", timeout=60000)
        page.fill('input[type="email"]', ADMIN_EMAIL)
        page.fill('input[type="password"]', ADMIN_PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_timeout(4000)
        print("    OK")
        
        # Navigate to leads
        print("[2] Navigate to /admin/crm/leads...")
        page.goto(f"{FRONTEND_URL}/admin/crm/leads", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(3000)
        print("    OK")
        
        # Click on first lead row
        print("[3] Click on first lead...")
        rows = page.locator('table tbody tr')
        if rows.count() > 0:
            rows.first.click()
            page.wait_for_timeout(4000)
            print(f"    OK - clicked first lead")
        else:
            print("    ERROR: No leads found")
            browser.close()
            return
        
        # Take full page screenshot
        print("[4] Taking FULL PAGE screenshot...")
        full_path = os.path.join(OUTPUT_DIR, "NOTES_PROOF_FULL_PAGE.png")
        page.screenshot(path=full_path, full_page=True)
        print(f"    Saved: {full_path}")
        print(f"    Size: {os.path.getsize(full_path):,} bytes")
        
        # Look for notes section and scroll to it
        print("[5] Looking for Notes section...")
        notes_header = page.locator('h3:has-text("Notes"), h3:has-text("notes")')
        if notes_header.count() > 0:
            print("    FOUND Notes header!")
            notes_header.first.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)
            
            # Screenshot focused on notes area
            notes_path = os.path.join(OUTPUT_DIR, "NOTES_PROOF_SECTION.png")
            page.screenshot(path=notes_path)
            print(f"    Saved: {notes_path}")
            print(f"    Size: {os.path.getsize(notes_path):,} bytes")
        else:
            print("    WARNING: Notes header not found!")
            # Check what's on the page
            all_h3 = page.locator('h3').all()
            print(f"    Found {len(all_h3)} h3 elements on page")
            for i, h3 in enumerate(all_h3[:5]):
                try:
                    text = h3.inner_text()
                    print(f"      h3[{i}]: {text[:50]}")
                except:
                    pass
        
        # Check for note input field
        print("[6] Checking for note input field...")
        note_inputs = page.locator('input[placeholder*="note"], input[placeholder*="Note"]')
        if note_inputs.count() > 0:
            print(f"    FOUND {note_inputs.count()} note input field(s)")
        else:
            print("    Note input field NOT found")
            # List all inputs
            all_inputs = page.locator('input[type="text"]').all()
            print(f"    Found {len(all_inputs)} text inputs total")
        
        # Check for existing notes (div with notes content)
        print("[7] Checking for existing notes...")
        note_items = page.locator('.bg-gray-50.rounded-lg p.text-sm')
        if note_items.count() > 0:
            print(f"    FOUND {note_items.count()} note item(s)")
        else:
            no_notes = page.locator('text=Aucune note, text=No notes')
            if no_notes.count() > 0:
                print("    'No notes' message displayed")
            else:
                print("    No note items found")
        
        browser.close()
    
    print("\n" + "=" * 60)
    print("   DONE - Check screenshots in:")
    print(f"   {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    capture()
