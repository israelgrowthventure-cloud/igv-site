#!/usr/bin/env python3
"""Test si server.py peut être importé et démarré"""
import os
import sys

# Set environment variables
os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
os.environ['DB_NAME'] = 'igv_test'
os.environ['JWT_SECRET'] = 'test-secret-key-32-chars-minimum-for-jwt'
os.environ['ADMIN_EMAIL'] = 'admin@test.com'
os.environ['ADMIN_PASSWORD'] = 'TestPassword123'

print('=== Testing server.py import ===')
print(f'Python: {sys.version}')
print(f'MONGO_URL: {os.environ["MONGO_URL"]}')

try:
    import server
    print('✅ server.py imported successfully')
    print('✅ FastAPI app created')
    print('✅ Routes loaded')
    
    print('\nAvailable routes:')
    for route in server.app.routes:
        methods = getattr(route, 'methods', ['*'])
        path = getattr(route, 'path', 'unknown')
        print(f'  {",".join(methods):10} {path}')
    
    print('\n✅ Backend server.py is ready to start')
    print('✅ All imports and configuration successful')
    
except Exception as e:
    print(f'\n❌ ERROR importing server.py: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
