#!/usr/bin/env python3
"""Test Google Genai API syntax"""
import os

# Test import
print("1. Testing import...")
try:
    import google.genai as genai
    print("✅ Import successful")
except Exception as e:
    print(f"❌ Import failed: {e}")
    exit(1)

# Test client creation
print("\n2. Testing client creation...")
api_key = "test_key_123"  # Fake key for structure test
try:
    client = genai.Client(api_key=api_key)
    print(f"✅ Client created: {type(client)}")
    print(f"   Client attributes: {dir(client)[:10]}")
except Exception as e:
    print(f"❌ Client creation failed: {e}")

# Check correct method
print("\n3. Checking available methods...")
try:
    if hasattr(client, 'models'):
        print(f"✅ client.models exists: {type(client.models)}")
        print(f"   models attributes: {[x for x in dir(client.models) if not x.startswith('_')][:10]}")
    else:
        print("❌ client.models does NOT exist")
        print(f"   Available: {[x for x in dir(client) if not x.startswith('_')]}")
except Exception as e:
    print(f"Error: {e}")
