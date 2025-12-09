"""
Script d'initialisation CMS via API - Production

Ce script crée/met à jour les pages CMS via l'API backend déployée.
Il nécessite une authentification admin.

Usage:
    python init_cms_via_api.py
"""

import requests
import json
from datetime import datetime

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

# Pages à créer/mettre à jour (seulement etude-implantation-360 et merci pour nettoyage/enrichissement)
PAGES_CONFIG = [
    {
        "slug": "etude-implantation-360",
        "path": "/etude-implantation-360",
        "title": {"fr": "Étude d'Implantation IGV – Israël 360°", "en": "IGV Implementation Study – Israel 360°", "he": "מחקר יישום IGV - ישראל 360°"},
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
""",
        "published": True
    },
    {
        "slug": "etude-implantation-merci",
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
]

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
            else:
                print(f"❌ Token non trouvé dans la réponse")
                print(f"Response: {response.text}")
                return None
        else:
            print(f"❌ Échec authentification: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur lors de l'authentification: {e}")
        return None

def get_page(token, slug):
    """Récupère une page par son slug"""
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/pages/{slug}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return None
        else:
            print(f"⚠️ Erreur lors de la récupération de {slug}: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"⚠️ Erreur lors de la récupération de {slug}: {e}")
        return None

def create_or_update_page(token, page_config):
    """Crée ou met à jour une page"""
    slug = page_config["slug"]
    print(f"\n📄 Traitement de la page: {slug}")
    
    # Vérifier si la page existe
    existing = get_page(token, slug)
    
    if existing:
        print(f"   ℹ️  Page existe déjà")
        
        # Vérifier si nettoyage nécessaire
        if "Contenu éditable via l'admin IGV" in existing.get("content_html", ""):
            print(f"   🧹 Nettoyage de la phrase 'Contenu éditable...'")
            cleaned_content = existing["content_html"].replace(
                "Contenu éditable via l'admin IGV - Pages CMS", ""
            ).strip()
            
            # Mise à jour
            try:
                response = requests.put(
                    f"{BACKEND_URL}/api/pages/{slug}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "content_html": cleaned_content
                    },
                    timeout=15
                )
                
                if response.status_code in [200, 204]:
                    print(f"   ✅ Page nettoyée")
                else:
                    print(f"   ⚠️ Échec mise à jour: {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Erreur mise à jour: {e}")
        else:
            print(f"   ✓ Pas de modification nécessaire")
    else:
        print(f"   ➕ Création de la page...")
        
        # Créer la page
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/pages",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=page_config,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                print(f"   ✅ Page créée")
            else:
                print(f"   ❌ Échec création: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except Exception as e:
            print(f"   ❌ Erreur création: {e}")

def main():
    """Point d'entrée principal"""
    print(f"\n{'#'*60}")
    print(f"# Initialisation CMS via API")
    print(f"# {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*60}")
    
    # Authentification
    token = login()
    
    if not token:
        print(f"\n❌ Impossible de continuer sans authentification")
        return False
    
    # Traiter chaque page
    print(f"\n{'='*60}")
    print(f"Traitement des pages CMS")
    print(f"{'='*60}")
    
    for page_config in PAGES_CONFIG:
        create_or_update_page(token, page_config)
    
    # Résumé
    print(f"\n{'='*60}")
    print(f"✨ Initialisation terminée")
    print(f"{'='*60}")
    print(f"\n📊 Résumé:")
    print(f"   - Pages traitées: {len(PAGES_CONFIG)}")
    print(f"   - Backend: {BACKEND_URL}")
    print(f"\n🔐 Admin CMS: {BACKEND_URL}/admin/pages")
    print(f"{'='*60}\n")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
