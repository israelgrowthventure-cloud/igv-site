# -*- coding: utf-8 -*-
"""
Poll Render every 15 seconds to detect when deploy starts
"""
import requests
import time
import sys
from datetime import datetime

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

URL = "https://igv-cms-backend.onrender.com/debug/routers"

print("Polling Render every 15 seconds...")
print("Waiting for build_timestamp = '2025-12-29T15:45:00Z'")
print("Press Ctrl+C to stop")
print("=" * 60)

for i in range(40):  # 10 minutes max
    try:
        r = requests.get(URL, timeout=5)
        data = r.json()
        
        build_ts = data.get('build_timestamp', 'OLD')
        invoice_loaded = data.get('invoice_router_loaded', False)
        invoice_error = data.get('invoice_router_error')
        monetico_loaded = data.get('monetico_router_loaded', False)
        monetico_error = data.get('monetico_router_error')
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if build_ts == '2025-12-29T15:45:00Z':
            print(f"\n[{timestamp}] NEW BUILD DETECTED!")
            print(f"  Invoice: {invoice_loaded} | Error: {invoice_error}")
            print(f"  Monetico: {monetico_loaded} | Error: {monetico_error}")
            
            if invoice_loaded and monetico_loaded:
                print("\nSUCCESS: All new routers loaded!")
                break
            elif invoice_error or monetico_error:
                print("\nERROR: Routers failed to load:")
                print(f"  Invoice error: {invoice_error}")
                print(f"  Monetico error: {monetico_error}")
                break
        else:
            print(f"[{timestamp}] Old build (waiting...) - Build: {build_ts}", end='\r')
        
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Error: {str(e)[:50]}")
    
    time.sleep(15)

print("\n" + "=" * 60)
print("Polling stopped")
