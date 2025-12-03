#!/usr/bin/env python3
"""
Récupère les logs détaillés du dernier déploiement échoué
en utilisant l'API Events de Render qui contient les logs de build
"""

import os
import requests
import json

RENDER_API_BASE = "https://api.render.com/v1"
api_key = os.environ.get('RENDER_API_KEY', 'rnd_hYIwCq86jCc2KyOTnJzFmQx1co0q')

def get_service_events(service_id: str, limit: int = 50):
    """Récupère les événements du service (contient les logs)"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}/events",
            headers=headers,
            params={'limit': limit},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return []

def analyze_build_errors(events, service_name):
    """Analyse les événements pour extraire les erreurs de build"""
    print(f"\n{'='*80}")
    print(f"ANALYSE DES ERREURS - {service_name}")
    print(f"{'='*80}\n")
    
    build_errors = []
    runtime_errors = []
    
    for event in events:
        evt_type = event.get('type', '')
        message = event.get('message', '')
        timestamp = event.get('timestamp', '')
        
        # Filtrer les événements pertinents
        if any(keyword in message.lower() for keyword in ['error', 'failed', 'fatal', 'exception']):
            if any(keyword in message.lower() for keyword in ['build', 'install', 'compile']):
                build_errors.append((timestamp, message))
            else:
                runtime_errors.append((timestamp, message))
    
    if build_errors:
        print(f"🔴 ERREURS DE BUILD ({len(build_errors)}):")
        print("-" * 80)
        for ts, msg in build_errors[-10:]:  # Dernières 10
            print(f"[{ts[:19]}] {msg}")
        print()
    
    if runtime_errors:
        print(f"🔴 ERREURS RUNTIME ({len(runtime_errors)}):")
        print("-" * 80)
        for ts, msg in runtime_errors[-10:]:  # Dernières 10
            print(f"[{ts[:19]}] {msg}")
        print()
    
    if not build_errors and not runtime_errors:
        print("ℹ️  Aucune erreur explicite trouvée dans les events")
        print("   Affichage des derniers events:")
        print("-" * 80)
        for event in events[:15]:
            evt_type = event.get('type', 'N/A')
            message = event.get('message', 'N/A')[:100]
            timestamp = event.get('timestamp', 'N/A')[:19]
            print(f"[{timestamp}] {evt_type}: {message}")
    
    return build_errors, runtime_errors

# IDs des services
backend_id = "srv-d4ka5q63jp1c738n6b2g"
frontend_id = "srv-d4no5dc9c44c73d1opgg"

print("\n" + "="*80)
print("RÉCUPÉRATION DES LOGS D'ERREUR RENDER")
print("="*80)

# Backend
print("\n📦 Récupération événements Backend...")
backend_events = get_service_events(backend_id, limit=100)
if backend_events:
    build_errs, runtime_errs = analyze_build_errors(backend_events, "igv-cms-backend")
    
    # Sauvegarder
    with open("render_backend_events.json", "w", encoding="utf-8") as f:
        json.dump(backend_events[:50], f, indent=2)
    print(f"✅ Events sauvegardés: render_backend_events.json")

# Frontend
print("\n📦 Récupération événements Frontend...")
frontend_events = get_service_events(frontend_id, limit=100)
if frontend_events:
    build_errs, runtime_errs = analyze_build_errors(frontend_events, "igv-site-web")
    
    # Sauvegarder
    with open("render_frontend_events.json", "w", encoding="utf-8") as f:
        json.dump(frontend_events[:50], f, indent=2)
    print(f"✅ Events sauvegardés: render_frontend_events.json")

print("\n" + "="*80)
print("FIN DE L'ANALYSE")
print("="*80 + "\n")
