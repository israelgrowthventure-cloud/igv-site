#!/usr/bin/env python3
"""
Script pour corriger le path de la page etude-implantation-360
Le slug etude-implantation-360 doit avoir path="/etude-implantation-360/merci"
car c'est la page de remerciement après soumission formulaire.

NON, erreur ! Après relecture:
- etude-implantation-360 = landing page avec formulaire (path="/etude-implantation-360")
- Page merci devrait être un slug séparé avec path="/etude-implantation-360/merci"

Mais nous venons de supprimer etude-implantation-merci. Il faut RE-CRÉER une page
avec slug="etude-implantation-360-merci" et path="/etude-implantation-360/merci"
"""
import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

PAGE_MERCI_CONFIG = {
    "slug": "etude-implantation-360-merci",
    "path": "/etude-implantation-360/merci",
    "title": {"fr": "Merci, nous vous recontactons personnellement sous 24h", "en": "Thank you, we will contact you within 24 hours", "he": "תודה, ניצור איתך קשר תוך 24 שעות"},
    "content_html": """
<section class="py-20 px-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
    <div class="max-w-3xl mx-auto text-center">
        <div class="text-8xl mb-8">✅</div>
        <h1 class="text-5xl font-bold mb-6 text-gray-900">
            Demande bien reçue !
        </h1>
        <p class="text-2xl mb-8 text-gray-700">
            Merci pour votre intérêt pour notre Étude d'Implantation 360°.
        </p>
        
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p class="text-xl text-gray-700 mb-6">
                Nous avons bien reçu votre demande d'étude d'implantation IGV – Israël 360°. 
                Un membre de notre équipe va analyser vos informations et <strong>revenir vers vous 
                sous 24 heures</strong> (jours ouvrés).
            </p>
            
            <div class="bg-blue-50 rounded-lg p-6 mb-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-900">📋 Prochaines étapes</h2>
                <ul class="space-y-3 text-left text-lg text-gray-700">
                    <li class="flex items-start">
                        <span class="text-blue-600 mr-3">1.</span>
                        <span>Analyse de votre demande par notre équipe</span>
                    </li>
                    <li class="flex items-start">
                        <span class="text-blue-600 mr-3">2.</span>
                        <span>Appel de qualification avec un expert (clarification des objectifs, horizon, priorités)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="text-blue-600 mr-3">3.</span>
                        <span>Proposition d'étude personnalisée</span>
                    </li>
                    <li class="flex items-start">
                        <span class="text-blue-600 mr-3">4.</span>
                        <span>Démarrage de l'analyse 360° (durée : 30 jours)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="text-blue-600 mr-3">5.</span>
                        <span>Remise des recommandations concrètes et plan d'action</span>
                    </li>
                </ul>
            </div>
            
            <p class="text-lg text-gray-600 italic">
                💡 <strong>Conseil :</strong> Vous pouvez préparer en amont les éléments clés de votre projet 
                (données de performance, études internes, benchmarks) que nous intégrerons à l'analyse.
            </p>
        </div>
        
        <a href="/" class="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Retour à l'accueil
        </a>
    </div>
</section>
""",
    "published": True
}

def login():
    """Authentification admin"""
    print(f"\n{'='*60}")
    print(f"Authentification admin...")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("token")
            if token:
                print(f"✅ Authentification réussie")
                return token
        return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def create_merci_page(token):
    """Crée la page merci canonique"""
    print(f"\n{'='*60}")
    print(f"Création page merci canonique")
    print(f"Slug: {PAGE_MERCI_CONFIG['slug']}")
    print(f"Path: {PAGE_MERCI_CONFIG['path']}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/pages",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=PAGE_MERCI_CONFIG,
            timeout=15
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ Page créée avec succès")
            return True
        else:
            print(f"❌ Échec création: {response.status_code}")
            print(f"Response: {response.text[:300]}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    print(f"\n{'#'*60}")
    print(f"# Création page Merci canonique")
    print(f"# /etude-implantation-360/merci")
    print(f"{'#'*60}")
    
    token = login()
    if not token:
        print(f"\n❌ Authentification échouée")
        return False
    
    success = create_merci_page(token)
    
    if success:
        print(f"\n{'='*60}")
        print(f"✨ Page merci créée !")
        print(f"{'='*60}")
        print(f"\n📌 URL: https://israelgrowthventure.com/etude-implantation-360/merci")
        print(f"{'='*60}\n")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
