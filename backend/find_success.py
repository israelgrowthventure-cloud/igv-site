import json

with open('render_backend_events.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

print('BACKEND - RECHERCHE BUILDS REUSSIS:')
print('='*80)

for evt_data in events:
    evt = evt_data.get('event', {})
    if evt.get('type') == 'build_ended':
        details = evt.get('details', {})
        status = details.get('buildStatus')
        ts = evt.get('timestamp', '')[:19]
        
        if status == 'succeeded':
            print(f'\n[{ts}] BUILD SUCCEEDED')
            build_id = details.get('buildId')
            print(f'  Build ID: {build_id}')
            
print('\n\nFRONTEND - RECHERCHE BUILDS REUSSIS:')
print('='*80)

with open('render_frontend_events.json', 'r', encoding='utf-8') as f:
    events_fe = json.load(f)

for evt_data in events_fe:
    evt = evt_data.get('event', {})
    if evt.get('type') == 'build_ended':
        details = evt.get('details', {})
        status = details.get('buildStatus')
        ts = evt.get('timestamp', '')[:19]
        
        if status == 'succeeded':
            print(f'\n[{ts}] BUILD SUCCEEDED')
            build_id = details.get('buildId')
            print(f'  Build ID: {build_id}')
