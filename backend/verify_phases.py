import os
import sys

def check_file_content(path, must_contain=None, must_not_contain=None, encoding='utf-8'):
    if not os.path.exists(path):
        print(f"❌ File missing: {path}")
        return False
    
    try:
        with open(path, 'r', encoding=encoding) as f:
            content = f.read()
            
        success = True
        
        if must_contain:
            for term in must_contain:
                if term not in content:
                    print(f"❌ Missing term in {path}: '{term}'")
                    success = False
        
        if must_not_contain:
            for term in must_not_contain:
                if term in content:
                    print(f"❌ Forbidden term found in {path}: '{term}'")
                    success = False
                    
        if success:
            print(f"✅ Verified: {path}")
        return success
        
    except Exception as e:
        print(f"❌ Error reading {path}: {str(e)}")
        return False

def verify_project():
    print("🚀 Starting Pre-Deployment Verification (Phases 1-4)\n")
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # 1. JSX & UTF-8 Fixes
    print("--- Phase 1: JSX & UTF-8 ---")
    
    # Home.js - Should NOT have duplicate closing tags
    # We look for the specific pattern that was causing issues
    home_js = os.path.join(root_dir, 'frontend', 'src', 'pages', 'Home.js')
    check_file_content(
        home_js,
        must_contain=['20+'],  # Updated: matches { value: '20+' }
        must_not_contain=['</div>\n      </div>\n    </div>\n    </div>']
    )
    
    # Contact.js - UTF-8
    contact_js = os.path.join(root_dir, 'frontend', 'src', 'pages', 'Contact.js')
    check_file_content(contact_js, must_contain=['Fermé'])
    
    # FutureCommerce.js - UTF-8 & TOC
    future_js = os.path.join(root_dir, 'frontend', 'src', 'pages', 'FutureCommerce.js')
    check_file_content(future_js, must_contain=['Prêt à', 'Israël', 'Table of Contents'])

    # 2. Geolocation & Logic
    print("\n--- Phase 2: Geolocation ---")
    geo_context = os.path.join(root_dir, 'frontend', 'src', 'context', 'GeoContext.js')
    check_file_content(geo_context, must_contain=['Promise.race', 'setTimeout', 'setZoneManually'])
    
    packs_js = os.path.join(root_dir, 'frontend', 'src', 'pages', 'Packs.js')
    check_file_content(packs_js, must_contain=['ZoneSelector'])

    # 3. Design & UI/UX
    print("\n--- Phase 3: Design ---")
    # Checked Home.js above
    # Check CTA reduction (we now look for btn-emergent class)
    check_file_content(packs_js, must_contain=['btn-emergent']) # Reduced padding via class
    
    # 4. Finalization (Technical)
    print("\n--- Phase 4: Technical ---")
    
    # PaymentSuccess
    payment_success = os.path.join(root_dir, 'frontend', 'src', 'pages', 'PaymentSuccess.js')
    check_file_content(payment_success, must_contain=['PaymentSuccess', 'Download'])
    
    # Backend Monetico HMAC
    server_py = os.path.join(root_dir, 'backend', 'server.py')
    check_file_content(server_py, must_contain=['bytes.fromhex(self.key)', 'HTTPS Redirect Middleware'])
    
    # SEO
    sitemap = os.path.join(root_dir, 'frontend', 'public', 'sitemap.xml')
    check_file_content(sitemap, must_contain=['?lang=en'])
    
    seo_js = os.path.join(root_dir, 'frontend', 'src', 'components', 'SEO.js')
    check_file_content(seo_js, must_contain=['?lang='])
    
    # Docs
    env_template = os.path.join(root_dir, 'max_env_template_check.tmp') # Just kidding, checking the real one
    env_template_path = os.path.join(root_dir, 'ENV_TEMPLATE.md')
    check_file_content(env_template_path, must_contain=['MONETICO_KEY'])

if __name__ == "__main__":
    verify_project()
