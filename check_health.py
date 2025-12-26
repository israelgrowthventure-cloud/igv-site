#!/usr/bin/env python3
"""Check backend health"""
import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"

response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
