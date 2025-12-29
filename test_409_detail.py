# -*- coding: utf-8 -*-
"""Test mini-analyse avec détail 409"""
import requests
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = "https://igv-cms-backend.onrender.com"

print("TEST MINI-ANALYSE FR - Détail 409")
print("=" * 80)

payload = {
    "email": "test-fr-unique-12345@example.com",  # Email unique pour éviter conflict
    "company_name": "TestCompanyFR-Unique-12345",
    "secteur": "Food",
    "language": "fr"
}

print(f"Payload: {json.dumps(payload, indent=2)}")

r = requests.post(f"{BASE}/api/mini-analysis", json=payload, timeout=60)
print(f"\nStatus: {r.status_code}")
print(f"Response: {r.text[:1000]}")
