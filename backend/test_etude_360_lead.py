"""
Test script for Étude d'Implantation 360° Lead Capture API

This script tests the POST /api/leads/etude-implantation-360 endpoint
by submitting a test lead and verifying the response.

Usage:
    python test_etude_360_lead.py

Expected Output:
    ✅ Lead creation successful
    Lead ID: <uuid>
    Status: new
    Created at: <timestamp>
"""

import requests
import json
from datetime import datetime

# API configuration
API_BASE_URL = "https://igv-cms-backend.onrender.com"
ENDPOINT = f"{API_BASE_URL}/api/leads/etude-implantation-360"

def test_create_lead():
    """Test lead creation with valid payload"""
    
    # Test payload
    payload = {
        "full_name": "TEST_ETUDE360_AUTOMATED",
        "work_email": "test+etude360-automated@israelgrowthventure.com",
        "role": "Automation Test Engineer",
        "brand_group": "IGV Test Suite",
        "implantation_horizon": "unknown",
        "source": "automated_test_script",
        "locale": "fr"
    }
    
    print(f"\n{'='*60}")
    print(f"Testing Étude 360° Lead API")
    print(f"{'='*60}")
    print(f"\nEndpoint: {ENDPOINT}")
    print(f"\nPayload:")
    print(json.dumps(payload, indent=2))
    print(f"\n{'='*60}")
    
    try:
        # Send POST request
        print(f"\nSending POST request...")
        response = requests.post(
            ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        # Check status code
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 201:
            # Parse response
            data = response.json()
            print(f"\n✅ Lead creation successful!")
            print(f"\nResponse:")
            print(json.dumps(data, indent=2, default=str))
            
            # Validate response structure
            assert "id" in data, "Missing 'id' in response"
            assert "work_email" in data, "Missing 'work_email' in response"
            assert "full_name" in data, "Missing 'full_name' in response"
            assert "created_at" in data, "Missing 'created_at' in response"
            assert "status" in data, "Missing 'status' in response"
            
            assert data["work_email"] == payload["work_email"], "Email mismatch"
            assert data["full_name"] == payload["full_name"], "Name mismatch"
            assert data["status"] == "new", "Status should be 'new'"
            
            print(f"\n✅ All validations passed!")
            print(f"\nLead Details:")
            print(f"  - ID: {data['id']}")
            print(f"  - Email: {data['work_email']}")
            print(f"  - Name: {data['full_name']}")
            print(f"  - Status: {data['status']}")
            print(f"  - Created: {data['created_at']}")
            
            return True
            
        else:
            print(f"\n❌ Unexpected status code: {response.status_code}")
            print(f"\nResponse body:")
            print(response.text)
            return False
            
    except requests.exceptions.Timeout:
        print(f"\n❌ Request timeout after 30 seconds")
        return False
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ Connection error: {e}")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_validation_errors():
    """Test API validation by sending invalid payloads"""
    
    print(f"\n{'='*60}")
    print(f"Testing Validation Errors")
    print(f"{'='*60}")
    
    # Test 1: Missing required field (full_name)
    invalid_payload_1 = {
        "work_email": "test@example.com",
        "implantation_horizon": "0-6"
    }
    
    print(f"\n\nTest 1: Missing required field (full_name)")
    print(f"Payload: {json.dumps(invalid_payload_1, indent=2)}")
    
    try:
        response = requests.post(ENDPOINT, json=invalid_payload_1, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print(f"✅ Validation error correctly returned (422)")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Invalid email format
    invalid_payload_2 = {
        "full_name": "Test User",
        "work_email": "invalid-email",
        "implantation_horizon": "6-12"
    }
    
    print(f"\n\nTest 2: Invalid email format")
    print(f"Payload: {json.dumps(invalid_payload_2, indent=2)}")
    
    try:
        response = requests.post(ENDPOINT, json=invalid_payload_2, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print(f"✅ Validation error correctly returned (422)")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Invalid implantation_horizon value
    invalid_payload_3 = {
        "full_name": "Test User",
        "work_email": "test@example.com",
        "implantation_horizon": "invalid-horizon"
    }
    
    print(f"\n\nTest 3: Invalid implantation_horizon value")
    print(f"Payload: {json.dumps(invalid_payload_3, indent=2)}")
    
    try:
        response = requests.post(ENDPOINT, json=invalid_payload_3, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print(f"✅ Validation error correctly returned (422)")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print(f"\n{'#'*60}")
    print(f"# Étude d'Implantation 360° Lead API Test Suite")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{'#'*60}")
    
    # Run tests
    success = test_create_lead()
    
    # Run validation tests
    test_validation_errors()
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Test Summary")
    print(f"{'='*60}")
    
    if success:
        print(f"\n✅ Main test passed - API is functional")
    else:
        print(f"\n❌ Main test failed - API needs investigation")
    
    print(f"\nValidation tests completed (see results above)")
    print(f"\n{'='*60}\n")
