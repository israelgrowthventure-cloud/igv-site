"""Get deployment error details from Render"""
import os
import requests
import sys

RENDER_API_KEY = os.getenv('RENDER_API_KEY', 'rnd_HEnI4fb65T3b1RAlso77w2g6ftEz')

def get_deploy_error(service_id, deploy_id):
    """Get detailed error from failed deployment"""
    headers = {
        'Authorization': f'Bearer {RENDER_API_KEY}',
        'Accept': 'application/json'
    }
    
    # Get deploy details
    url = f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        deploy = response.json()
        
        print(f"Deploy ID: {deploy.get('id')}")
        print(f"Status: {deploy.get('status')}")
        print(f"Created: {deploy.get('createdAt')}")
        print(f"Updated: {deploy.get('updatedAt')}")
        
        if 'finishedAt' in deploy:
            print(f"Finished: {deploy.get('finishedAt')}")
        
        # Show commit info
        commit = deploy.get('commit', {})
        print(f"\nCommit: {commit.get('id', 'N/A')[:8]}")
        print(f"Message: {commit.get('message', 'N/A')[:100]}")
        
        # Get build logs if available
        print("\n=== Attempting to get logs ===")
        logs_url = f'https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}/logs'
        logs_response = requests.get(logs_url, headers=headers)
        
        if logs_response.status_code == 200:
            print("Build logs:")
            print(logs_response.text[:2000])  # First 2000 chars
        else:
            print(f"Could not get logs: {logs_response.status_code}")
        
        return deploy
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    service_id = sys.argv[1] if len(sys.argv) > 1 else "srv-d4no5dc9c44c73d1opgg"
    deploy_id = sys.argv[2] if len(sys.argv) > 2 else "dep-d565kmchg0os73agateg"
    
    get_deploy_error(service_id, deploy_id)
