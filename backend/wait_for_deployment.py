"""
Monitor Render deployment status for IGV backend and frontend services

This script polls the health endpoints of both services to detect
when the new deployment is live.

Usage:
    python wait_for_deployment.py
"""

import requests
import time
from datetime import datetime

# Service configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
FRONTEND_URL = "https://israelgrowthventure.com"

# Polling configuration
MAX_RETRIES = 20  # 20 retries × 30s = 10 minutes max
RETRY_INTERVAL = 30  # seconds

def check_backend_health():
    """Check if backend is responsive"""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
        return response.status_code == 200
    except:
        return False

def check_frontend_health():
    """Check if frontend is responsive"""
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        return response.status_code == 200
    except:
        return False

def wait_for_deployment():
    """Wait for both services to be deployed and healthy"""
    
    print(f"\n{'='*60}")
    print(f"Monitoring Render Deployment")
    print(f"{'='*60}")
    print(f"\nBackend:  {BACKEND_URL}")
    print(f"Frontend: {FRONTEND_URL}")
    print(f"\nMax retries: {MAX_RETRIES}")
    print(f"Retry interval: {RETRY_INTERVAL}s")
    print(f"{'='*60}\n")
    
    backend_ready = False
    frontend_ready = False
    
    for attempt in range(1, MAX_RETRIES + 1):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] Attempt {attempt}/{MAX_RETRIES}")
        
        # Check backend
        if not backend_ready:
            print(f"  Checking backend... ", end="")
            backend_ready = check_backend_health()
            if backend_ready:
                print(f"✅ READY")
            else:
                print(f"❌ Not ready")
        else:
            print(f"  Backend: ✅ (already ready)")
        
        # Check frontend
        if not frontend_ready:
            print(f"  Checking frontend... ", end="")
            frontend_ready = check_frontend_health()
            if frontend_ready:
                print(f"✅ READY")
            else:
                print(f"❌ Not ready")
        else:
            print(f"  Frontend: ✅ (already ready)")
        
        # Check if both are ready
        if backend_ready and frontend_ready:
            print(f"\n{'='*60}")
            print(f"✅ Both services are READY!")
            print(f"{'='*60}\n")
            return True
        
        # Wait before next attempt
        if attempt < MAX_RETRIES:
            print(f"  Waiting {RETRY_INTERVAL}s before next check...\n")
            time.sleep(RETRY_INTERVAL)
    
    # Max retries reached
    print(f"\n{'='*60}")
    print(f"⚠️  Max retries reached")
    print(f"{'='*60}")
    print(f"\nStatus:")
    print(f"  Backend:  {'✅ READY' if backend_ready else '❌ NOT READY'}")
    print(f"  Frontend: {'✅ READY' if frontend_ready else '❌ NOT READY'}")
    print(f"\n{'='*60}\n")
    
    return backend_ready and frontend_ready

if __name__ == "__main__":
    success = wait_for_deployment()
    
    if success:
        print("\n🚀 Deployment successful - ready to run tests")
        exit(0)
    else:
        print("\n❌ Deployment incomplete - manual investigation required")
        exit(1)
