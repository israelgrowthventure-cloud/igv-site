import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

print("🔍 Checking Syntax for auth_routes...")

try:
    import auth_routes
    print("✅ auth_routes imported successfully!")
    print(f"User model: {auth_routes.User}")
except Exception as e:
    print(f"❌ Error importing auth_routes: {e}")
    import traceback
    traceback.print_exc()

print("\n🔍 Checking Syntax for server...")
try:
    import server
    print("✅ server imported successfully!")
except Exception as e:
    print(f"❌ Error importing server: {e}")
    import traceback
    traceback.print_exc()
