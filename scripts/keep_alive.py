"""
Keep-Alive Service for IGV Backend
Pings the backend every 10 minutes to prevent Render sleep
"""
import requests
import time
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)

BACKEND_URL = "https://igv-cms-backend.onrender.com"
PING_INTERVAL = 600  # 10 minutes

def ping_backend():
    """Ping the backend health endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            logging.info(f"✅ Backend alive at {datetime.now()}")
            return True
        else:
            logging.warning(f"⚠️ Backend returned {response.status_code}")
            return False
    except Exception as e:
        logging.error(f"❌ Backend ping failed: {str(e)}")
        return False

def main():
    """Main keep-alive loop"""
    logging.info("🚀 Keep-Alive service started")
    logging.info(f"Pinging {BACKEND_URL} every {PING_INTERVAL} seconds")
    
    while True:
        ping_backend()
        time.sleep(PING_INTERVAL)

if __name__ == "__main__":
    main()
