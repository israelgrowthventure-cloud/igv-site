#!/usr/bin/env python3
"""Test rapide API GET leads"""
import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"

# Login
r_login = requests.post(
    f"{BACKEND_URL}/api/auth/login",
    json={"email": "postmaster@israelgrowthventure.com", "password": "Admin@igv2025#"},
    timeout=10
)
print(f"Login status: {r_login.status_code}")

if r_login.status_code == 200:
    token = r_login.json().get("access_token")
    print(f"Token obtenu: {token[:20]}...")
    
    # Test GET leads
    r_leads = requests.get(
        f"{BACKEND_URL}/api/leads/etude-implantation-360",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30
    )
    print(f"\nGET leads status: {r_leads.status_code}")
    print(f"Response: {r_leads.text[:500]}")
