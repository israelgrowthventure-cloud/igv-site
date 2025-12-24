"""
Get Recent Render Logs - Simple Version
"""

import os
import httpx

RENDER_API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = "srv-d4no5dc9c44c73d1opgg"  # Backend service

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json"
}

# Get recent logs
url = f"https://api.render.com/v1/services/{SERVICE_ID}/logs"
params = {
    "tail": 100  # Last 100 lines
}

try:
    print(f"Fetching logs from {SERVICE_ID}...")
    
    response = httpx.get(url, headers=headers, params=params, timeout=30.0)
    
    if response.status_code == 200:
        # Logs are returned as text
        logs = response.text
        
        print(f"\n{'='*80}")
        print("RECENT LOGS (last 100 lines)")
        print(f"{'='*80}\n")
        
        # Filter for relevant lines
        relevant_keywords = [
            "LANG_REQUESTED",
            "LANG_USED",
            "HEADER_",
            "GEMINI_TEST",
            "test_gemini_multilang",
            "MODEL=",
            "TOKENS="
        ]
        
        all_lines = logs.split('\n')
        
        print(f"Total lines: {len(all_lines)}")
        print(f"\nFiltered lines (containing keywords):\n")
        
        for line in all_lines:
            if any(keyword in line for keyword in relevant_keywords):
                print(line)
        
        # Also show last 20 lines regardless
        print(f"\n{'='*80}")
        print("LAST 20 LINES (unfiltered)")
        print(f"{'='*80}\n")
        
        for line in all_lines[-20:]:
            if line.strip():
                print(line)
        
    else:
        print(f"Error: HTTP {response.status_code}")
        print(response.text[:500])
        
except Exception as e:
    print(f"Exception: {str(e)}")
    import traceback
    traceback.print_exc()
