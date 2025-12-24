#!/usr/bin/env python3
"""Test direct de la clé Gemini API"""
import sys

try:
    import google.generativeai as genai
except ImportError:
    print("❌ Module google-generativeai non installé")
    print("Installation: pip install google-generativeai")
    sys.exit(1)

# Clé API visible sur Render Dashboard (nouvelle clé créée 24/12/2025)
GEMINI_API_KEY = "AIzaSyAGP_n7YbhcJQgwhgxHMPsZ7sZ1b3MpwmU"

print("🔑 Test de la clé Gemini API")
print(f"Clé: {GEMINI_API_KEY[:20]}...{GEMINI_API_KEY[-10:]}\n")

try:
    # Configure l'API
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Test avec gemini-1.5-flash
    print("📡 Test modèle: gemini-1.5-flash")
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    response = model.generate_content("Test simple: réponds juste 'OK'")
    
    print("✅ GEMINI FONCTIONNE !")
    print(f"Réponse: {response.text}")
    print(f"\nModèle utilisé: {model.model_name}")
    
except Exception as e:
    print(f"❌ ERREUR GEMINI: {type(e).__name__}")
    print(f"Message: {str(e)}")
    print("\nPossibles causes:")
    print("1. Clé API invalide ou révoquée")
    print("2. Quota dépassé")
    print("3. Modèle non disponible")
    print("4. Problème réseau/firewall")
    sys.exit(1)
