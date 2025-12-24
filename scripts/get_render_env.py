#!/usr/bin/env python3
"""Récupérer les variables d'environnement de Render"""
import os
import requests
import sys

RENDER_API_KEY = os.getenv('RENDER_API_KEY', 'rnd_HEnI4fb65T3b1RAlso77w2g6ftEz')
SERVICE_ID = 'srv-d4ka5q63jp1c738n6b2g'  # igv-cms-backend

headers = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Accept': 'application/json'
}

print(f"📡 Récupération des variables d'environnement pour {SERVICE_ID}\n")

try:
    url = f'https://api.render.com/v1/services/{SERVICE_ID}/env-vars'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        env_vars = response.json()
        
        for var in env_vars:
            key = var.get('key', '')
            value = var.get('value', '')
            
            if key == 'GEMINI_API_KEY':
                print(f"✅ {key} trouvée:")
                print(f"   Valeur: {value[:20]}...{value[-10:]}")
                print(f"   Longueur: {len(value)} caractères\n")
                
                # Sauvegarder pour test
                with open('scripts/.gemini_key_temp', 'w') as f:
                    f.write(value)
                print("💾 Clé sauvegardée dans scripts/.gemini_key_temp pour test\n")
            elif key in ['GEMINI_MODEL', 'MONGODB_URI', 'DB_NAME']:
                print(f"ℹ️  {key}: {value[:30]}..." if len(value) > 30 else f"ℹ️  {key}: {value}")
    else:
        print(f"❌ Erreur API Render: {response.status_code}")
        print(response.text)
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Exception: {e}")
    sys.exit(1)
