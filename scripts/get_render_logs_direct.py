"""
Get Render logs directly via API
"""
import os
import requests
import sys

RENDER_API_KEY = os.getenv('RENDER_API_KEY')

def get_logs(service_id, limit=100):
    """Get recent logs from Render service"""
    if not RENDER_API_KEY:
        print("ERROR: RENDER_API_KEY not set")
        return None
    
    url = f"https://api.render.com/v1/services/{service_id}/logs"
    headers = {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json"
    }
    
    params = {
        "limit": limit
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        logs = response.json()
        
        # Print logs
        for log in logs:
            timestamp = log.get('timestamp', '')
            message = log.get('message', '')
            print(f"{timestamp}: {message}")
        
        return logs
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        if hasattr(e, 'response'):
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    service_id = sys.argv[1] if len(sys.argv) > 1 else "srv-d4no5dc9c44c73d1opgg"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    print(f"Getting {limit} logs for {service_id}...")
    get_logs(service_id, limit)
