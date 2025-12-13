"""
TEST SUITE - IGV V3 Backend
Run with: pytest test_backend.py
"""
import pytest
from fastapi.testclient import TestClient
from server import app
import os

# Set test environment
os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
os.environ['DB_NAME'] = 'igv_test'
os.environ['JWT_SECRET'] = 'test-secret-key'

client = TestClient(app)

def test_root_endpoint():
    """Test root API endpoint"""
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json()["version"] == "3.0"

def test_packs_endpoint():
    """Test packs listing"""
    response = client.get("/api/packs")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 3  # 3 packs

def test_pricing_endpoint():
    """Test pricing calculation"""
    response = client.get("/api/pricing/analyse/EU")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["data"]["zone"] == "EU"
    assert data["data"]["currency"] == "EUR"

def test_geolocation_endpoint():
    """Test geolocation detection"""
    response = client.get("/api/detect-location")
    assert response.status_code == 200
    data = response.json()
    assert "zone" in data
    assert "currency" in data

def test_login_endpoint():
    """Test admin login"""
    response = client.post("/auth/login", json={
        "email": "admin@israelgrowthventure.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]

def test_crm_stats():
    """Test CRM statistics endpoint"""
    token = test_login_endpoint()
    response = client.get(
        "/crm/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_leads" in data

def test_monetico_config():
    """Test Monetico configuration endpoint"""
    response = client.get("/payment/test-config")
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data

def test_cms_pages_unauthorized():
    """Test CMS requires authentication"""
    response = client.get("/cms/pages")
    assert response.status_code == 403  # Forbidden without auth

def test_cms_pages_authorized():
    """Test CMS pages with authentication"""
    token = test_login_endpoint()
    response = client.get(
        "/cms/pages",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

if __name__ == "__main__":
    print("Running backend tests...")
    print("\n✓ Testing root endpoint...")
    test_root_endpoint()
    print("✓ Testing packs endpoint...")
    test_packs_endpoint()
    print("✓ Testing pricing endpoint...")
    test_pricing_endpoint()
    print("✓ Testing geolocation...")
    test_geolocation_endpoint()
    print("✓ Testing login...")
    test_login_endpoint()
    print("✓ Testing CRM stats...")
    test_crm_stats()
    print("✓ Testing Monetico config...")
    test_monetico_config()
    print("✓ Testing CMS unauthorized...")
    test_cms_pages_unauthorized()
    print("✓ Testing CMS authorized...")
    test_cms_pages_authorized()
    print("\n✅ All tests passed!")
