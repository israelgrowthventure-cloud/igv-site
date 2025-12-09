"""
Script d'initialisation complète des pages CMS pour IGV

Ce script crée/met à jour toutes les pages principales du site :
- Accueil (/)
- Qui sommes-nous (/qui-sommes-nous)
- Nos Packs (/packs)
- Le Commerce de Demain (/le-commerce-de-demain)
- Contact (/contact)
- Étude 360° (/etude-implantation-360) - sans phrase "Contenu éditable..."
- Merci Étude 360° (/etude-implantation-merci) - contenu enrichi

Usage:
    python init_all_cms_pages.py

Variables d'environnement requises:
    MONGO_URL - URL de connexion MongoDB
    DB_NAME - Nom de la base de données
"""

import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import asyncio

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'IGV-Cluster')

if not MONGO_URL:
    print("❌ ERREUR: Variable MONGO_URL non définie")
    sys.exit(1)

# Définition de toutes les pages principales
PAGES_CONFIG = [
    {
        "slug": "home",
        "path": "/",
        "title_fr": "Accueil - Israel Growth Venture",
        "title_en": "Home - Israel Growth Venture",
        "title_he": "דף הבית - Israel Growth Venture",
        "content_html": """
<section class="hero bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
    <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
            Israel Growth Venture
        </h1>
        <p class="text-2xl mb-8 text-blue-100">
            Votre partenaire stratégique pour réussir en Israël
        </p>
        <p class="text-xl max-w-3xl mx-auto">
            Nous accompagnons les entreprises françaises dans leur expansion en Israël avec expertise et engagement.
        </p>
    </div>
</section>

<section class="py-16 px-4 bg-white">
    <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-gray-900">Nos Services</h2>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-gray-50 rounded-lg">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-2xl font-bold mb-4">Stratégie d'Implantation</h3>
                <p class="text-gray-700">Analyse de marché et plan d'action personnalisé</p>
            </div>
            <div class="text-center p-6 bg-gray-50 rounded-lg">
                <div class="text-5xl mb-4">🤝</div>
                <h3 class="text-2xl font-bold mb-4">Accompagnement Local</h3>
                <p class="text-gray-700">Support opérationnel et réseau de partenaires</p>
            </div>
            <div class="text-center p-6 bg-gray-50 rounded-lg">
                <div class="text-5xl mb-4">📈</div>
                <h3 class="text-2xl font-bold mb-4">Développement Commercial</h3>
                <p class="text-gray-700">Mise en relation et croissance sur le marché israélien</p>
            </div>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "qui-sommes-nous",
        "path": "/qui-sommes-nous",
        "title_fr": "Qui sommes-nous - IGV",
        "title_en": "About Us - IGV",
        "title_he": "אודותינו - IGV",
        "content_html": """
<section class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold mb-8 text-center text-gray-900">Qui sommes-nous ?</h1>
        <div class="prose prose-lg max-w-none">
            <p class="text-xl text-gray-700 mb-6">
                Israel Growth Venture (IGV) est une société de conseil en développement commercial spécialisée 
                dans l'accompagnement des entreprises françaises vers le marché israélien.
            </p>
            <h2 class="text-3xl font-bold mt-12 mb-6">Notre Mission</h2>
            <p class="text-lg text-gray-700 mb-6">
                Faciliter l'implantation et le développement des entreprises françaises en Israël grâce à 
                notre expertise locale, notre réseau établi et notre connaissance approfondie du marché.
            </p>
            <h2 class="text-3xl font-bold mt-12 mb-6">Notre Expertise</h2>
            <ul class="space-y-4 text-lg text-gray-700">
                <li>✅ Plus de 15 ans d'expérience sur le marché israélien</li>
                <li>✅ Réseau étendu de partenaires locaux (juridique, comptable, immobilier)</li>
                <li>✅ Accompagnement de dizaines d'entreprises françaises</li>
                <li>✅ Connaissance approfondie des secteurs retail, tech et services</li>
            </ul>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "packs",
        "path": "/packs",
        "title_fr": "Nos Packs - IGV",
        "title_en": "Our Packs - IGV",
        "title_he": "החבילות שלנו - IGV",
        "content_html": """
<section class="py-20 px-4 bg-gray-50">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-5xl font-bold mb-4 text-center text-gray-900">Nos Packs d'Accompagnement</h1>
        <p class="text-xl text-center text-gray-600 mb-12">
            Choisissez la formule adaptée à votre projet d'implantation en Israël
        </p>
        <div class="text-center text-gray-700 text-lg">
            <p>Les packs détaillés avec tarifs géolocalisés sont affichés ci-dessous.</p>
            <p class="mt-4">Contactez-nous pour un devis personnalisé adapté à vos besoins spécifiques.</p>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "le-commerce-de-demain",
        "path": "/le-commerce-de-demain",
        "title_fr": "Le Commerce de Demain - IGV",
        "title_en": "Future of Commerce - IGV",
        "title_he": "המסחר של המחר - IGV",
        "content_html": """
<section class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold mb-8 text-center text-gray-900">Le Commerce de Demain</h1>
        <div class="prose prose-lg max-w-none">
            <p class="text-xl text-gray-700 mb-6">
                Israël est un laboratoire d'innovation pour le commerce de demain. Entre tech startups, 
                retail innovant et nouvelles habitudes de consommation, le marché israélien offre des 
                opportunités uniques pour les marques visionnaires.
            </p>
            <h2 class="text-3xl font-bold mt-12 mb-6">Pourquoi Israël ?</h2>
            <ul class="space-y-4 text-lg text-gray-700">
                <li>💡 Écosystème tech parmi les plus dynamiques au monde</li>
                <li>🌍 Porte d'entrée vers le Moyen-Orient</li>
                <li>👥 Population connectée et early adopter</li>
                <li>📱 Taux de pénétration mobile et e-commerce très élevé</li>
                <li>🚀 Culture entrepreneuriale forte</li>
            </ul>
            <h2 class="text-3xl font-bold mt-12 mb-6">Les Tendances Clés</h2>
            <p class="text-lg text-gray-700 mb-6">
                Omnicanal, personalisation, durabilité : le commerce israélien innove sur tous les fronts. 
                Nos experts vous guident pour capitaliser sur ces tendances.
            </p>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "contact",
        "path": "/contact",
        "title_fr": "Contact - IGV",
        "title_en": "Contact - IGV",
        "title_he": "צור קשר - IGV",
        "content_html": """
<section class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold mb-8 text-center text-gray-900">Contactez-nous</h1>
        <p class="text-xl text-center text-gray-600 mb-12">
            Une question ? Un projet ? Notre équipe est à votre écoute.
        </p>
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-900">📧 Email</h3>
                    <p class="text-lg text-gray-700">postmaster@israelgrowthventure.com</p>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-900">🌍 Localisation</h3>
                    <p class="text-lg text-gray-700">Israël - France</p>
                </div>
            </div>
            <p class="text-center text-gray-600">
                Le formulaire de contact interactif est affiché ci-dessous.
            </p>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "etude-implantation-360",
        "path": "/etude-implantation-360",
        "title_fr": "Étude d'Implantation IGV – Israël 360°",
        "title_en": "IGV Implementation Study – Israel 360°",
        "title_he": "מחקר יישום IGV - ישראל 360°",
        "content_html": """
<section class="hero bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
            Étude d'Implantation IGV<br/>Israël 360°
        </h1>
        <p class="text-2xl mb-8 text-blue-100">
            Une analyse complète et personnalisée pour réussir votre implantation en Israël
        </p>
    </div>
</section>

<section class="py-16 px-4 bg-white">
    <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-gray-900">
            Pourquoi une étude 360° ?
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-gray-50 p-6 rounded-lg">
                <div class="text-4xl mb-4">📊</div>
                <h3 class="text-xl font-bold mb-3 text-gray-900">Analyse Complète</h3>
                <p class="text-gray-700">
                    Évaluation détaillée de votre secteur d'activité et des opportunités de marché.
                </p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
                <div class="text-4xl mb-4">🎯</div>
                <h3 class="text-xl font-bold mb-3 text-gray-900">Stratégie Personnalisée</h3>
                <p class="text-gray-700">
                    Plan d'action sur-mesure adapté à vos objectifs et votre budget.
                </p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
                <div class="text-4xl mb-4">🤝</div>
                <h3 class="text-xl font-bold mb-3 text-gray-900">Accompagnement Expert</h3>
                <p class="text-gray-700">
                    Support continu de nos experts locaux pour maximiser votre succès.
                </p>
            </div>
        </div>
    </div>
</section>
"""
    },
    {
        "slug": "etude-implantation-merci",
        "path": "/etude-implantation-360/merci",
        "title_fr": "Merci, nous vous recontactons personnellement sous 24h",
        "title_en": "Thank you, we will contact you within 24 hours",
        "title_he": "תודה, ניצור איתך קשר תוך 24 שעות",
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
"""
    }
]

async def init_pages():
    """Initialise toutes les pages CMS"""
    client = None
    try:
        print(f"\n{'='*60}")
        print(f"Initialisation des pages CMS IGV")
        print(f"{'='*60}")
        print(f"\nConnexion à MongoDB...")
        print(f"Base de données: {DB_NAME}")
        
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        
        # Test connexion
        await client.admin.command('ping')
        print(f"✅ Connexion MongoDB établie\n")
        
        # Traiter chaque page
        for page_config in PAGES_CONFIG:
            slug = page_config["slug"]
            print(f"📄 Traitement de la page: {slug}")
            
            # Vérifier si la page existe
            existing_page = await db.pages.find_one({"slug": slug})
            
            if existing_page:
                # Page existe : mise à jour conditionnelle
                update_needed = False
                update_doc = {}
                
                # Vérifier si le contenu contient la phrase à supprimer
                if existing_page.get("content_html") and "Contenu éditable via l'admin IGV" in existing_page.get("content_html", ""):
                    # Supprimer la phrase
                    cleaned_content = existing_page["content_html"].replace(
                        "Contenu éditable via l'admin IGV - Pages CMS", ""
                    ).strip()
                    update_doc["content_html"] = cleaned_content
                    update_needed = True
                    print(f"   🧹 Suppression de la phrase 'Contenu éditable...'")
                
                # Pour la page merci, vérifier si le contenu est vide ou minimal
                if slug == "etude-implantation-merci":
                    current_content = existing_page.get("content_html", "")
                    if len(current_content) < 500:  # Contenu trop court = placeholder
                        update_doc["content_html"] = page_config["content_html"]
                        update_needed = True
                        print(f"   📝 Enrichissement du contenu (trop court)")
                
                # Mise à jour des métadonnées manquantes
                if not existing_page.get("path"):
                    update_doc["path"] = page_config["path"]
                    update_needed = True
                
                if update_needed:
                    update_doc["updated_at"] = datetime.now(timezone.utc)
                    await db.pages.update_one({"slug": slug}, {"$set": update_doc})
                    print(f"   ✅ Page mise à jour")
                else:
                    print(f"   ℹ️  Page OK (pas de modification nécessaire)")
            else:
                # Page n'existe pas : création
                page_doc = {
                    "slug": slug,
                    "path": page_config["path"],
                    "title": page_config["title_fr"],
                    "content_html": page_config["content_html"],
                    "content_css": "",
                    "content_json": {},
                    "translations": {
                        "fr": {"title": page_config["title_fr"]},
                        "en": {"title": page_config.get("title_en", page_config["title_fr"])},
                        "he": {"title": page_config.get("title_he", page_config["title_fr"])}
                    },
                    "published": True,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                
                await db.pages.insert_one(page_doc)
                print(f"   ✅ Page créée")
        
        # Résumé
        print(f"\n{'='*60}")
        print(f"✨ Initialisation terminée avec succès !")
        print(f"{'='*60}")
        print(f"\n📊 Résumé:")
        print(f"   - Pages traitées: {len(PAGES_CONFIG)}")
        print(f"   - Base de données: {DB_NAME}")
        print(f"\n🎯 Pages disponibles:")
        for page_config in PAGES_CONFIG:
            print(f"   - {page_config['path']} ({page_config['slug']})")
        print(f"\n🔐 Admin CMS: https://israelgrowthventure.com/admin/pages")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ ERREUR lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    asyncio.run(init_pages())
