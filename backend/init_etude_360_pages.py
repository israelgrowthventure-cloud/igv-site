"""
Script d'initialisation des pages CMS pour l'Étude d'Implantation 360°

Ce script crée deux pages dans le CMS :
1. Landing page de l'étude d'implantation (/etude-implantation-360)
2. Page de remerciement (/etude-implantation-360/merci)

Usage:
    python init_etude_360_pages.py

Variables d'environnement requises:
    MONGO_URL - URL de connexion MongoDB
    DB_NAME - Nom de la base de données (défaut: igv_db)
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'igv_db')

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is required")

# Contenu de la landing page
LANDING_PAGE_HTML = """
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
"""

LANDING_PAGE_CSS = """
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
"""

# Contenu de la page de remerciement
THANK_YOU_PAGE_HTML = """
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
"""

THANK_YOU_PAGE_CSS = """
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
"""

async def init_pages():
    """Initialise les pages CMS pour l'Étude 360°"""
    client = None
    try:
        # Connexion MongoDB
        print(f"🔌 Connexion à MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        pages_collection = db.pages
        
        # Page 1: Landing Étude 360°
        landing_slug = "etude-implantation-360"
        existing_landing = await pages_collection.find_one({"slug": landing_slug})
        
        if existing_landing:
            print(f"⚠️  Page '{landing_slug}' existe déjà (ID: {existing_landing['_id']})")
        else:
            landing_page = {
                "slug": landing_slug,
                "title": {
                    "fr": "Étude d'Implantation IGV – Israël 360°",
                    "en": "IGV Implementation Study – Israel 360°",
                    "he": "מחקר יישום IGV – ישראל 360°"
                },
                "content_html": LANDING_PAGE_HTML,
                "content_css": LANDING_PAGE_CSS,
                "content_json": {},
                "published": True,
                "meta": {
                    "description": {
                        "fr": "Une analyse complète et personnalisée pour réussir votre implantation en Israël",
                        "en": "A complete and personalized analysis to succeed in your implementation in Israel",
                        "he": "ניתוח מלא ומותאם אישית להצליח ביישום שלך בישראל"
                    },
                    "keywords": ["implantation", "israël", "étude", "accompagnement", "business"]
                },
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            result = await pages_collection.insert_one(landing_page)
            print(f"✅ Page '{landing_slug}' créée (ID: {result.inserted_id})")
        
        # Page 2: Merci
        thank_you_slug = "etude-implantation-merci"
        existing_thank_you = await pages_collection.find_one({"slug": thank_you_slug})
        
        if existing_thank_you:
            print(f"⚠️  Page '{thank_you_slug}' existe déjà (ID: {existing_thank_you['_id']})")
        else:
            thank_you_page = {
                "slug": thank_you_slug,
                "title": {
                    "fr": "Merci pour votre intérêt",
                    "en": "Thank you for your interest",
                    "he": "תודה על ההתעניינות"
                },
                "content_html": THANK_YOU_PAGE_HTML,
                "content_css": THANK_YOU_PAGE_CSS,
                "content_json": {},
                "published": True,
                "meta": {
                    "description": {
                        "fr": "Nous vous recontacterons sous 24h",
                        "en": "We will contact you within 24 hours",
                        "he": "ניצור איתך קשר תוך 24 שעות"
                    },
                    "keywords": ["merci", "confirmation", "contact"]
                },
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            result = await pages_collection.insert_one(thank_you_page)
            print(f"✅ Page '{thank_you_slug}' créée (ID: {result.inserted_id})")
        
        print("\n✨ Initialisation des pages Étude 360° terminée !")
        print(f"📄 Landing: /etude-implantation-360")
        print(f"📄 Merci: /etude-implantation-360/merci")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise
    finally:
        if client:
            client.close()
            print("🔌 Connexion MongoDB fermée")

if __name__ == "__main__":
    asyncio.run(init_pages())
