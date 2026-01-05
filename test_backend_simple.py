"""Test simple backend Render"""
import requests

BACKEND = "https://igv-cms-backend.onrender.com"

print("Test 1: Health check")
try:
    r = requests.get(f"{BACKEND}/health", timeout=5)
    print(f"  Status: {r.status_code}")
    print(f"  Body: {r.text[:200]}")
except Exception as e:
    print(f"  ERROR: {e}")

print("\nTest 2: Admin login endpoint")
try:
    r = requests.post(
        f"{BACKEND}/admin/login",
        json={"email": "test@test.com", "password": "test"},
        timeout=5
    )
    print(f"  Status: {r.status_code}")
    print(f"  Body: {r.text[:200]}")
except Exception as e:
    print(f"  ERROR: {e}")
