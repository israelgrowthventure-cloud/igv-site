#!/usr/bin/env python3
"""
Test des endpoints après correction du bug checkout
"""
import requests
import time

BASE_URL_BACKEND = "https://igv-cms-backend.onrender.com/api"
BASE_URL_FRONTEND = "https://israelgrowthventure.com"

print("=" * 80)
print("TEST POST-FIX CHECKOUT")
print("=" * 80)

# 1. Test backend health
print("\n1. Backend Health Check...")
try:
    r = requests.get(f"{BASE_URL_BACKEND}/health", timeout=10)
    if r.status_code == 200:
        print(f"✓ Backend OK (200)")
    else:
        print(f"✗ Backend: {r.status_code}")
except Exception as e:
    print(f"✗ Backend inaccessible: {e}")

# 2. Test récupération packs
print("\n2. Récupération des packs...")
try:
    r = requests.get(f"{BASE_URL_BACKEND}/packs", timeout=10)
    if r.status_code == 200:
        packs = r.json()
        print(f"✓ {len(packs)} packs récupérés")
        
        # 3. Test pricing pour chaque pack avec SLUG
        print("\n3. Test Pricing API avec slugs...")
        slug_map = {
            'Pack Analyse': 'analyse',
            'Pack Succursales': 'succursales',
            'Pack Franchise': 'franchise'
        }
        
        for pack in packs:
            nom = pack['name']['fr']
            slug = slug_map.get(nom)
            
            if slug:
                try:
                    pr = requests.get(
                        f"{BASE_URL_BACKEND}/pricing",
                        params={"packId": slug, "zone": "IL"},
                        timeout=10
                    )
                    if pr.status_code == 200:
                        data = pr.json()
                        print(f"  ✓ {nom}: {data['total_price']} {data['currency']}")
                    else:
                        print(f"  ✗ {nom}: {pr.status_code}")
                except Exception as e:
                    print(f"  ✗ {nom}: {e}")
    else:
        print(f"✗ Packs: {r.status_code}")
except Exception as e:
    print(f"✗ Erreur packs: {e}")

# 4. Test frontend
print("\n4. Test Frontend...")
try:
    r = requests.get(BASE_URL_FRONTEND, timeout=10)
    if r.status_code == 200:
        print(f"✓ Homepage OK (200)")
    else:
        print(f"✗ Homepage: {r.status_code}")
except Exception as e:
    print(f"✗ Frontend inaccessible: {e}")

# 5. Test page checkout (juste le chargement HTML, pas le pricing)
print("\n5. Test Page Checkout (HTML)...")
try:
    r = requests.get(f"{BASE_URL_FRONTEND}/checkout/succursales", timeout=10)
    if r.status_code == 200:
        print(f"✓ Page checkout accessible (200)")
    else:
        print(f"✗ Page checkout: {r.status_code}")
except Exception as e:
    print(f"✗ Page checkout: {e}")

# 6. Test admin login page
print("\n6. Test Admin Pages...")
try:
    r = requests.get(f"{BASE_URL_FRONTEND}/admin/login", timeout=10)
    if r.status_code == 200:
        print(f"✓ Admin login page OK (200)")
    else:
        print(f"✗ Admin login: {r.status_code}")
        
    r2 = requests.get(f"{BASE_URL_FRONTEND}/admin/pages", timeout=10)
    if r2.status_code in [200, 302, 401]:  # 302 redirect to login or 401 unauthorized is OK
        print(f"✓ Admin pages route exists ({r2.status_code})")
    else:
        print(f"✗ Admin pages: {r2.status_code}")
except Exception as e:
    print(f"✗ Admin: {e}")

print("\n" + "=" * 80)
print("RÉSUMÉ")
print("=" * 80)
print("\nSi tous les tests backend passent mais frontend échoue:")
print("  → Les services Render sont peut-être en train de redémarrer")
print("  → Attendre 2-3 minutes et réessayer")
print("\nAccès CMS Drag & Drop:")
print("  1. Login: https://israelgrowthventure.com/admin/login")
print("  2. Pages: https://israelgrowthventure.com/admin/pages")
print("  3. Créer/Éditer: https://israelgrowthventure.com/admin/pages/new")
print("\n" + "=" * 80)
