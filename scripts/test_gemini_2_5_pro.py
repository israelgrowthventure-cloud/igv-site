#!/usr/bin/env python3
"""Test de la nouvelle clé Gemini avec Gemini 2.5 Pro"""
import sys

try:
    import google.generativeai as genai
except ImportError:
    print("❌ Module google-generativeai non installé")
    sys.exit(1)

# NOUVELLE clé API (IGV - Mini Analysis)
GEMINI_API_KEY = "AIzaSyAGP_n7YbhcJQgwhgxHMPsZ7sZlb3MpwmU"

print("🔑 Test de la nouvelle clé Gemini")
print(f"Clé: ...{GEMINI_API_KEY[-20:]}\n")

# Test avec différents modèles
models_to_test = [
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

try:
    genai.configure(api_key=GEMINI_API_KEY)
    
    for model_name in models_to_test:
        print(f"\n📡 Test modèle: {model_name}")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Réponds juste 'OK' en un mot")
            
            print(f"✅ {model_name} FONCTIONNE !")
            print(f"   Réponse: {response.text}")
            
        except Exception as e:
            print(f"❌ {model_name} ÉCHEC: {type(e).__name__}")
            print(f"   {str(e)[:100]}")
    
except Exception as e:
    print(f"\n❌ ERREUR CONFIGURATION: {type(e).__name__}")
    print(f"Message: {str(e)}")
    sys.exit(1)
