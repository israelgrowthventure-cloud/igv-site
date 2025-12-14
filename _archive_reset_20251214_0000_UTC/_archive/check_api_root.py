import requests
try:
    r = requests.get("https://igv-cms-backend.onrender.com/api/", timeout=5)
    print(f"Status: {r.status_code}")
    print(f"Content: {r.text}")
except Exception as e:
    print(f"Error: {e}")
