"""
Get Render service logs to identify import errors
"""
import requests
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Test imports locally to identify the error
print("=" * 70)
print("LOCAL IMPORT TEST - Identifying the error")
print("=" * 70)

import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

errors = []

# Test each new router import
test_imports = [
    ("invoice_routes", "Invoice router"),
    ("monetico_routes", "Monetico router"),
    ("models.invoice_models", "Invoice models")
]

for module_name, description in test_imports:
    try:
        __import__(module_name)
        print(f"✓ {description}: OK")
    except Exception as e:
        print(f"✗ {description}: FAILED")
        print(f"  Error: {str(e)}")
        errors.append((description, str(e)))

if errors:
    print("\n" + "=" * 70)
    print("ERRORS FOUND:")
    print("=" * 70)
    for desc, error in errors:
        print(f"\n{desc}:")
        print(f"  {error}")
else:
    print("\n" + "=" * 70)
    print("ALL IMPORTS OK - Issue must be in server.py")
    print("=" * 70)
