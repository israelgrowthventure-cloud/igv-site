"""
Check Pages Integrity
=====================

Verifies:
1. All pages in database have proper slugs
2. All pages have titles in all languages
3. All pages have content
4. Checks for any missing or duplicate slugs
"""

import requests

BACKEND = "https://igv-cms-backend.onrender.com"

print("="*60)
print("Pages Integrity Check")
print("="*60)

# Get all pages
response = requests.get(f"{BACKEND}/api/pages")
if response.status_code != 200:
    print(f"❌ Failed to fetch pages: {response.status_code}")
    exit(1)

pages = response.json()
print(f"\n✅ Total pages: {len(pages)}")

# Check each page
print("\n" + "-"*60)
print("Page Details:")
print("-"*60)

slugs = []
issues = []

for i, page in enumerate(pages, 1):
    slug = page.get('slug', 'NO_SLUG')
    title_fr = page.get('title', {}).get('fr', 'NO_TITLE')
    title_en = page.get('title', {}).get('en', 'NO_TITLE')
    title_he = page.get('title', {}).get('he', 'NO_TITLE')
    published = page.get('published', False)
    has_content_json = bool(page.get('content_json'))
    has_content_html = bool(page.get('content_html'))
    
    print(f"\n{i}. Slug: {slug}")
    print(f"   Published: {published}")
    print(f"   Titles:")
    print(f"     - FR: {title_fr}")
    print(f"     - EN: {title_en}")
    print(f"     - HE: {title_he}")
    print(f"   Content:")
    print(f"     - JSON: {has_content_json}")
    print(f"     - HTML: {has_content_html}")
    
    # Check for issues
    if not slug or slug == 'NO_SLUG':
        issues.append(f"Page {i}: Missing slug")
    elif slug in slugs:
        issues.append(f"Page {i}: Duplicate slug '{slug}'")
    else:
        slugs.append(slug)
    
    if title_fr == 'NO_TITLE' or title_en == 'NO_TITLE' or title_he == 'NO_TITLE':
        issues.append(f"Page {i} ({slug}): Missing title translations")
    
    if not has_content_json and not has_content_html:
        issues.append(f"Page {i} ({slug}): No content")

# Summary
print("\n" + "="*60)
print("SUMMARY")
print("="*60)

if issues:
    print(f"\n⚠️  Found {len(issues)} issue(s):")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("\n✅ All pages are properly configured!")

print(f"\n📊 Statistics:")
print(f"  - Total pages: {len(pages)}")
print(f"  - Published pages: {sum(1 for p in pages if p.get('published'))}")
print(f"  - Draft pages: {sum(1 for p in pages if not p.get('published'))}")
print(f"  - Pages with content: {sum(1 for p in pages if p.get('content_html') or p.get('content_json'))}")

# Check public routes
print("\n" + "="*60)
print("PUBLIC ROUTE VERIFICATION")
print("="*60)

expected_routes = ['home', 'packs', 'about-us', 'contact']
for route in expected_routes:
    route_response = requests.get(f"{BACKEND}/api/pages/{route}")
    status = "✅" if route_response.status_code == 200 else "❌"
    print(f"{status} /api/pages/{route} - Status: {route_response.status_code}")
