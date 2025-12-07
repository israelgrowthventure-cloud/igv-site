#!/usr/bin/env python3
"""
Capture les erreurs JavaScript console sur /admin avec Selenium
"""

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import time
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("⚠️  Selenium not installed. Install with: pip install selenium")
    print("   Also need Chrome/ChromeDriver installed")

PROD_URL = "https://israelgrowthventure.com"

def capture_console_errors():
    """Capture les erreurs console de /admin"""
    if not SELENIUM_AVAILABLE:
        print("\n❌ Cannot run - Selenium not available")
        return
    
    print("\n🔍 CAPTURING CONSOLE ERRORS FROM /admin\n")
    print("="*70)
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = None
    try:
        print("🚀 Starting Chrome WebDriver...")
        driver = webdriver.Chrome(options=chrome_options)
        
        print(f"📡 Loading {PROD_URL}/admin...")
        driver.get(f"{PROD_URL}/admin")
        
        # Wait for page to load
        time.sleep(5)
        
        # Get page title
        print(f"📄 Page title: {driver.title}")
        
        # Check if root div is populated
        try:
            root = driver.find_element(By.ID, 'root')
            root_html = root.get_attribute('innerHTML')
            print(f"📦 Root div content: {len(root_html)} chars")
            if len(root_html) < 100:
                print(f"   ⚠️  Root appears empty!")
                print(f"   Content: {root_html[:200]}")
        except Exception as e:
            print(f"   ❌ Could not find root div: {e}")
        
        # Get console logs
        print("\n📜 CONSOLE LOGS:")
        print("="*70)
        logs = driver.get_log('browser')
        
        if not logs:
            print("   ✅ No console logs (good or bad)")
        else:
            errors = []
            warnings = []
            infos = []
            
            for entry in logs:
                level = entry['level']
                message = entry['message']
                
                if level == 'SEVERE':
                    errors.append(message)
                    print(f"   🔴 ERROR: {message}")
                elif level == 'WARNING':
                    warnings.append(message)
                    print(f"   ⚠️  WARNING: {message}")
                else:
                    infos.append(message)
            
            print(f"\n📊 Summary: {len(errors)} errors, {len(warnings)} warnings, {len(infos)} infos")
            
            if errors:
                print("\n🔴 CRITICAL ERRORS FOUND:")
                for err in errors[:5]:  # Show first 5
                    print(f"   - {err[:200]}")
        
        # Take screenshot
        try:
            screenshot_path = "admin_screenshot.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot saved: {screenshot_path}")
        except:
            pass
        
        print("\n" + "="*70)
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
    finally:
        if driver:
            driver.quit()
            print("✅ WebDriver closed")

if __name__ == "__main__":
    if SELENIUM_AVAILABLE:
        capture_console_errors()
    else:
        print("\n" + "="*70)
        print("ALTERNATIVE: Manual Console Check")
        print("="*70)
        print("\n1. Ouvrir https://israelgrowthventure.com/admin")
        print("2. F12 → Console tab")
        print("3. Copier toutes les erreurs rouges ici")
        print("\nOu installer Selenium:")
        print("   pip install selenium")
        print("   + ChromeDriver: https://chromedriver.chromium.org/")
