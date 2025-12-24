"""Test mini_analysis_routes imports"""
import sys
import os

# Set up backend path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

print("🔍 Testing mini_analysis_routes imports...")
print(f"Python path: {sys.path[0]}")
print(f"Backend path: {backend_path}")
print()

try:
    print("📦 Importing mini_analysis_routes...")
    from mini_analysis_routes import router
    print("✅ Import successful!")
    print(f"✅ Router: {router}")
    print(f"✅ Router prefix: {router.prefix}")
    print(f"✅ Router routes: {len(router.routes)} routes")
    for route in router.routes:
        print(f"   - {route.methods} {route.path}")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
