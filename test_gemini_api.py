#!/usr/bin/env python3
"""Test direct de l'API Google Gemini pour comprendre la vraie syntaxe"""
import os
import sys

# Test 1: Import
print("🔍 Test 1: Import google.genai")
try:
    import google.genai as genai
    print("✅ Import réussi")
    print(f"   Version: {genai.__version__ if hasattr(genai, '__version__') else 'inconnue'}")
except Exception as e:
    print(f"❌ Import échoué: {e}")
    sys.exit(1)

# Test 2: Créer un client
print("\n🔍 Test 2: Création du client Gemini")
API_KEY = os.getenv('GEMINI_API_KEY', 'test-key')
print(f"   API Key length: {len(API_KEY)}")

try:
    client = genai.Client(api_key=API_KEY)
    print(f"✅ Client créé: {type(client)}")
    print(f"   Attributs: {[a for a in dir(client) if not a.startswith('_')][:10]}")
except Exception as e:
    print(f"❌ Erreur création client: {e}")
    sys.exit(1)

# Test 3: Vérifier la méthode generate_content
print("\n🔍 Test 3: Vérifier models.generate_content")
try:
    if hasattr(client, 'models'):
        print(f"✅ client.models existe: {type(client.models)}")
        if hasattr(client.models, 'generate_content'):
            import inspect
            sig = inspect.signature(client.models.generate_content)
            print(f"✅ generate_content signature: {sig}")
        else:
            print("❌ generate_content n'existe pas sur models")
            print(f"   Méthodes disponibles: {[m for m in dir(client.models) if not m.startswith('_')]}")
    else:
        print("❌ client.models n'existe pas")
        print(f"   Attributs client: {[a for a in dir(client) if not a.startswith('_')]}")
except Exception as e:
    print(f"❌ Erreur: {e}")

# Test 4: Essayer un appel réel (si on a une vraie clé)
if len(API_KEY) > 20 and API_KEY != 'test-key':
    print("\n🔍 Test 4: Appel réel à l'API")
    try:
        # CRITICAL: contents MUST be a list
        print("   Tentative: client.models.generate_content(model=..., contents=[...])")
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=['Dis bonjour en 5 mots']  # List, not string!
        )
        print(f"✅ Réponse reçue: {type(response)}")
        print(f"   Attributs: {[a for a in dir(response) if not a.startswith('_')][:15]}")
        if hasattr(response, 'text'):
            print(f"✅ response.text: {response.text[:100]}")
        elif hasattr(response, 'candidates'):
            print(f"✅ response.candidates: {len(response.candidates)} candidat(s)")
            if response.candidates:
                cand = response.candidates[0]
                print(f"   Candidat 0 type: {type(cand)}")
                print(f"   Candidat 0 attrs: {[a for a in dir(cand) if not a.startswith('_')][:10]}")
    except Exception as e:
        print(f"❌ Erreur appel API: {e}")
        print(f"   Type: {type(e).__name__}")
else:
    print("\n⚠️ Test 4 skipped: pas de vraie API key")
    print("   Set GEMINI_API_KEY env var pour tester l'appel réel")
