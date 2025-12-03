#!/usr/bin/env python3
"""Get detailed build events to understand failure"""
import requests
import json

API_KEY = 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q'
BACKEND_ID = 'srv-d4ka5q63jp1c738n6b2g'

headers = {'Authorization': f'Bearer {API_KEY}'}

# Get recent events
resp = requests.get(
    f'https://api.render.com/v1/services/{BACKEND_ID}/events?limit=20',
    headers=headers
)

if resp.status_code == 200:
    events = resp.json()
    
    print("=" * 80)
    print("ÉVÉNEMENTS RÉCENTS BACKEND (20 derniers)")
    print("=" * 80)
    
    for item in events[:20]:
        event = item.get('event', {})
        event_type = event.get('type', 'unknown')
        timestamp = event.get('timestamp', 'N/A')
        details = event.get('details', {})
        
        print(f"\n[{timestamp}] {event_type}")
        
        if event_type == 'build_ended':
            build_status = details.get('buildStatus', 'unknown')
            reason = details.get('reason', {})
            print(f"  Build Status: {build_status}")
            if reason:
                print(f"  Reason: {json.dumps(reason, indent=4)}")
        
        elif event_type == 'deploy_ended':
            deploy_status = details.get('deployStatus', 'unknown')
            reason = details.get('reason', {})
            print(f"  Deploy Status: {deploy_status}")
            if reason:
                print(f"  Reason: {json.dumps(reason, indent=4)}")
        
        print("  " + "-" * 76)
else:
    print(f"Error: {resp.status_code}")
    print(resp.text)
