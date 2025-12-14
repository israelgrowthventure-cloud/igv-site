
import os
import sys
from unittest.mock import MagicMock

# Mock Environment
os.environ['MONGO_URL'] = "mongodb://localhost:27017" # Dummy
os.environ['DB_NAME'] = "test_db"
os.environ['JWT_SECRET'] = "test_secret"
os.environ['RENDER_API_KEY'] = "test_key"

print("🔍 Testing Backend Import and Startup...")

try:
    # Try importing server
    import backend.server as server
    print("✅ server.py imported successfully")
    
    # Check app instance
    if getattr(server, 'app', None):
        print("✅ app instance found")
    else:
        print("❌ app instance NOT found in server.py")
        sys.exit(1)
        
    print("🚀 Startup Test Passed (Syntax/Import OK)")
    sys.exit(0)

except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Startup Error: {e}")
    sys.exit(1)
