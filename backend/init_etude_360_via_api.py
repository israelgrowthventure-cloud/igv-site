"""
Script pour initialiser les pages CMS Étude 360° en production via Render

Ce script utilise l'API du backend Render pour créer les pages via les endpoints CMS.
"""

import requests
import json
import os

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'postmaster@israelgrowthventure.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')

if not ADMIN_PASSWORD:
    print("⚠️  ADMIN_PASSWORD non défini, utilisation du mot de passe par défaut")
    ADMIN_PASSWORD = input("Entrez le mot de passe admin : ")

# Données des pages
LANDING_PAGE_DATA = {
    "slug": "etude-implantation-360",
    "title": {
        "fr": "Étude d'Implantation IGV – Israël 360°",
        "en": "IGV Implementation Study – Israel 360°",
        "he": "מחקר יישום IGV – ישראל 360°"
    },
    "content_html": """
<div class="etude-360-landing">
  <section class="hero bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-5xl md:text-6xl font-bold mb-6">
        Étude d'Implantation IGV<br/>Israël 360°
      </h1>
      <p class="text-2xl mb-8 text-blue-100">
        Une analyse complète et personnalisée pour réussir votre implantation en Israël
      </p>
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
        <p class="text-lg mb-4">
          Notre équipe d'experts vous accompagne avec une étude sur-mesure incluant :
        </p>
        <ul class="text-left space-y-3 mb-6">
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Analyse complète du marché et de la concurrence</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Stratégie d'implantation et choix de localisation</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Accompagnement juridique et fiscal personnalisé</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Plan d'action détaillé sur 12 mois</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Suivi personnalisé pendant 6 mois</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="py-16 px-4 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        Pourquoi choisir IGV pour votre implantation ?
      </h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-3">🎯 Expertise locale</h3>
          <p class="text-gray-700">
            Plus de 15 ans d'expérience dans l'accompagnement d'entreprises françaises en Israël.
          </p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-3">📊 Analyse approfondie</h3>
          <p class="text-gray-700">
            Une méthodologie éprouvée basée sur des données de marché actualisées.
          </p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-3">🤝 Réseau établi</h3>
          <p class="text-gray-700">
            Accès à notre réseau de partenaires locaux (juridique, comptable, immobilier).
          </p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-3">✅ Garantie résultat</h3>
          <p class="text-gray-700">
            Un plan d'action concret et personnalisé pour maximiser vos chances de succès.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-16 px-4 bg-blue-50">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">
        Prêt à franchir le pas ?
      </h2>
      <p class="text-xl text-gray-700 mb-8">
        Contactez-nous dès aujourd'hui pour une première consultation gratuite.
      </p>
      <a href="/contact" class="inline-block px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors">
        Demander un rendez-vous
      </a>
    </div>
  </section>
</div>
""",
    "content_css": """
.etude-360-landing {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.etude-360-landing section {
  animation: fadeIn 0.6s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.etude-360-landing h1 {
  line-height: 1.2;
}
.etude-360-landing ul li {
  transition: transform 0.2s ease;
}
.etude-360-landing ul li:hover {
  transform: translateX(5px);
}
""",
    "content_json": {},
    "published": True,
    "meta": {
        "description": {
            "fr": "Une analyse complète et personnalisée pour réussir votre implantation en Israël"
        }
    }
}

THANK_YOU_PAGE_DATA = {
    "slug": "etude-implantation-merci",
    "title": {
        "fr": "Merci pour votre intérêt",
        "en": "Thank you for your interest",
        "he": "תודה על ההתעניינות"
    },
    "content_html": """
<div class="thank-you-page min-h-screen flex items-center justify-center py-20 px-4">
  <div class="max-w-2xl mx-auto text-center">
    <div class="mb-8">
      <svg class="w-24 h-24 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>
    
    <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
      Merci pour votre intérêt !
    </h1>
    
    <p class="text-xl text-gray-700 mb-4">
      Nous avons bien reçu votre demande concernant l'Étude d'Implantation IGV – Israël 360°.
    </p>
    
    <div class="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 text-left">
      <p class="text-lg text-gray-800">
        <strong>Notre engagement :</strong> Un membre de notre équipe vous recontactera personnellement sous 24 heures pour discuter de votre projet et répondre à toutes vos questions.
      </p>
    </div>
    
    <div class="space-y-4 mb-8">
      <p class="text-gray-700">
        En attendant, n'hésitez pas à :
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/about" class="inline-block px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors">
          En savoir plus sur IGV
        </a>
        <a href="/packs" class="inline-block px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors">
          Découvrir nos packs
        </a>
      </div>
    </div>
    
    <div class="border-t border-gray-300 pt-8">
      <p class="text-gray-600">
        Des questions urgentes ? Contactez-nous au
        <a href="tel:+972123456789" class="text-blue-600 font-semibold hover:underline">+972 12 345 6789</a>
      </p>
    </div>
  </div>
</div>
""",
    "content_css": """
.thank-you-page {
  background: linear-gradient(to bottom right, #f0f9ff, #e0f2fe);
  min-height: 100vh;
}
.thank-you-page svg {
  filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.3));
  animation: scaleIn 0.6s ease-out;
}
@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
.thank-you-page h1 {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}
.thank-you-page p, .thank-you-page div {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
""",
    "content_json": {},
    "published": True,
    "meta": {
        "description": {
            "fr": "Nous vous recontacterons sous 24h"
        }
    }
}

def login():
    """Authentification admin"""
    print("🔐 Authentification...")
    response = requests.post(
        f"{BACKEND_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    
    if response.status_code == 200:
        token = response.json().get('access_token')
        print("✅ Authentification réussie")
        return token
    else:
        print(f"❌ Échec authentification: {response.status_code}")
        print(response.text)
        return None

def create_page(token, page_data):
    """Créer une page via l'API"""
    slug = page_data['slug']
    
    # Vérifier si la page existe déjà
    response = requests.get(
        f"{BACKEND_URL}/api/pages/{slug}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        print(f"⚠️  Page '{slug}' existe déjà")
        return True
    
    # Créer la page
    response = requests.post(
        f"{BACKEND_URL}/api/pages",
        headers={"Authorization": f"Bearer {token}"},
        json=page_data
    )
    
    if response.status_code in [200, 201]:
        print(f"✅ Page '{slug}' créée")
        return True
    else:
        print(f"❌ Échec création '{slug}': {response.status_code}")
        print(response.text)
        return False

def main():
    print("🚀 Initialisation des pages Étude 360° en production\n")
    
    # Authentification
    token = login()
    if not token:
        print("❌ Impossible de continuer sans authentification")
        return
    
    # Créer les pages
    print("\n📄 Création des pages...")
    success1 = create_page(token, LANDING_PAGE_DATA)
    success2 = create_page(token, THANK_YOU_PAGE_DATA)
    
    if success1 and success2:
        print("\n✨ Initialisation terminée !")
        print(f"📄 Landing: {BACKEND_URL.replace('igv-cms-backend.onrender.com', 'israelgrowthventure.com')}/etude-implantation-360")
        print(f"📄 Merci: {BACKEND_URL.replace('igv-cms-backend.onrender.com', 'israelgrowthventure.com')}/etude-implantation-360/merci")
    else:
        print("\n⚠️  Certaines pages n'ont pas pu être créées")

if __name__ == "__main__":
    main()
