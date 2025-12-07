import json

with open('render_backend_events.json', 'r', encoding='utf-8') as f:
    backend_events = json.load(f)

with open('render_frontend_events.json', 'r', encoding='utf-8') as f:
    frontend_events = json.load(f)

print("="*80)
print("DIAGNOSTIC COMPLET - BACKEND")
print("="*80)

for evt_data in backend_events[:20]:
    evt = evt_data.get('event', {})
    typ = evt.get('type')
    details = evt.get('details', {})
    ts = evt.get('timestamp', '')[:19]
    
    if typ == 'deploy_started':
        trigger = details.get('trigger', {})
        commit = trigger.get('newCommit', 'N/A')[:7]
        print(f"\n[{ts}] DEPLOY_STARTED - Commit: {commit}")
        
    elif typ == 'build_ended':
        status = details.get('buildStatus')
        build_id = details.get('buildId', '')
        print(f"[{ts}] BUILD_ENDED - Status: {status}")
        if status == 'failed':
            reason = details.get('reason', {})
            print(f"  Raison: {reason}")
            
    elif typ == 'deploy_ended':
        status = details.get('deployStatus')
        print(f"[{ts}] DEPLOY_ENDED - Status: {status}")

print("\n" + "="*80)
print("DIAGNOSTIC COMPLET - FRONTEND")
print("="*80)

for evt_data in frontend_events[:20]:
    evt = evt_data.get('event', {})
    typ = evt.get('type')
    details = evt.get('details', {})
    ts = evt.get('timestamp', '')[:19]
    
    if typ == 'deploy_started':
        trigger = details.get('trigger', {})
        commit = trigger.get('newCommit', 'N/A')[:7]
        print(f"\n[{ts}] DEPLOY_STARTED - Commit: {commit}")
        
    elif typ == 'build_ended':
        status = details.get('buildStatus')
        print(f"[{ts}] BUILD_ENDED - Status: {status}")
        if status == 'failed':
            reason = details.get('reason', {})
            print(f"  Raison: {reason}")
            
    elif typ == 'deploy_ended':
        status = details.get('deployStatus')
        print(f"[{ts}] DEPLOY_ENDED - Status: {status}")
