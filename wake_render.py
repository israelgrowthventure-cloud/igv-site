# -*- coding: utf-8 -*-
"""Wake up Render service from cold start"""
import sys
import requests
import time

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=== WAKE UP RENDER SERVICE ===\n")
print("Render Free Tier: Cold start = ~50 secondes...\n")

for attempt in range(1, 4):
    print(f"Tentative {attempt}/3...")
    try:
        r = requests.get('https://igv-cms-backend.onrender.com/health', timeout=70)
        print(f"✅ Status: {r.status_code}")
        print(f"Response: {r.text[:150]}")
        if r.status_code == 200:
            print("\n✅ SERVICE ACTIF!")
            break
    except requests.exceptions.ReadTimeout:
        print("⏱️  Timeout (cold start en cours...)")
        if attempt < 3:
            print("Attente 10s avant retry...")
            time.sleep(10)
    except Exception as e:
        print(f"❌ Error: {str(e)[:150]}")
        if attempt < 3:
            time.sleep(5)
else:
    print("\n❌ Service ne répond pas après 3 tentatives")
