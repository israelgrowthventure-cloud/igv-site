"""
Script pour synchroniser les pages réelles du site vers le CMS
================================================================

Ce script crée ou met à jour les pages CMS avec le contenu complet
qui correspond aux pages publiques actuellement visibles sur le site.

Pages à synchroniser:
- home (/)
- packs (/packs)
- about-us (/about)
- contact (/contact)
- le-commerce-de-demain (/le-commerce-de-demain)

Le contenu HTML est une représentation complète des pages React,
convertie en HTML statique pour l'édition dans GrapesJS.
"""

import requests
import json

# Configuration
BACKEND_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

def login_admin():
    """Authentification admin"""
    print("🔐 Authentification admin...")
    response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Authentifié avec succès")
        return token
    else:
        print(f"❌ Erreur d'authentification: {response.status_code}")
        return None

def create_or_update_page(token, page_data):
    """Crée ou met à jour une page CMS"""
    headers = {"Authorization": f"Bearer {token}"}
    slug = page_data["slug"]
    
    # Vérifier si la page existe
    print(f"\n📄 Traitement de la page: {slug}")
    check_response = requests.get(f"{BACKEND_URL}/pages/{slug}")
    
    if check_response.status_code == 200:
        # Mettre à jour
        print(f"   Page existante trouvée, mise à jour...")
        response = requests.put(
            f"{BACKEND_URL}/pages/{slug}",
            headers=headers,
            json=page_data
        )
    else:
        # Créer
        print(f"   Page non trouvée, création...")
        response = requests.post(
            f"{BACKEND_URL}/pages",
            headers=headers,
            json=page_data
        )
    
    if response.status_code in [200, 201]:
        print(f"   ✅ Page {slug} synchronisée avec succès")
        return True
    else:
        print(f"   ❌ Erreur {response.status_code}: {response.text}")
        return False

# ========================================
# CONTENU DES PAGES
# ========================================

HOME_PAGE = {
    "slug": "home",
    "title": {
        "fr": "Accueil - Israel Growth Venture",
        "en": "Home - Israel Growth Venture",
        "he": "בית - Israel Growth Venture"
    },
    "content_html": """
    <section style="padding: 120px 20px 80px; background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);">
        <div style="max-width: 1280px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
                <div>
                    <h1 style="font-size: 56px; font-weight: 700; color: #1a202c; line-height: 1.1; margin-bottom: 24px;">
                        Développez votre entreprise en Israël
                    </h1>
                    <p style="font-size: 22px; color: #4a5568; margin-bottom: 20px; line-height: 1.6;">
                        Votre partenaire pour une expansion réussie sur le marché israélien
                    </p>
                    <p style="font-size: 18px; color: #718096; margin-bottom: 40px; line-height: 1.7;">
                        Israel Growth Venture vous accompagne à chaque étape de votre développement : 
                        de l'analyse de marché à l'ouverture de vos points de vente, en passant par la 
                        recherche d'emplacements stratégiques et le support opérationnel.
                    </p>
                    <div style="display: flex; gap: 16px;">
                        <a href="/appointment" style="display: inline-flex; align-items: center; padding: 16px 32px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,82,204,0.3);">
                            Prendre rendez-vous →
                        </a>
                        <a href="/about" style="display: inline-flex; align-items: center; padding: 16px 32px; background: transparent; color: #0052CC; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; border: 2px solid #0052CC; transition: all 0.3s;">
                            En savoir plus
                        </a>
                    </div>
                </div>
                <div style="position: relative;">
                    <div style="width: 100%; height: 400px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,82,204,0.3);"></div>
                </div>
            </div>
        </div>
    </section>

    <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 1280px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 700; text-align: center; color: #1a202c; margin-bottom: 60px;">
                Notre processus en 3 étapes
            </h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
                <div style="background: #f7fafc; padding: 40px; border-radius: 16px; text-align: center;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 24px; background: #0052CC; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700;">1</div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Analyse de marché</h3>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Étude complète du marché israélien et identification des opportunités pour votre secteur</p>
                </div>
                <div style="background: #f7fafc; padding: 40px; border-radius: 16px; text-align: center;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 24px; background: #0052CC; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700;">2</div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Recherche d'emplacements</h3>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Sélection des meilleurs emplacements stratégiques pour votre activité</p>
                </div>
                <div style="background: #f7fafc; padding: 40px; border-radius: 16px; text-align: center;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 24px; background: #0052CC; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700;">3</div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Accompagnement opérationnel</h3>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Support complet jusqu'à l'ouverture et au-delà</p>
                </div>
            </div>
        </div>
    </section>

    <section style="padding: 80px 20px; background: #f7fafc;">
        <div style="max-width: 1280px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 42px; font-weight: 700; color: #1a202c; margin-bottom: 32px;">
                Découvrez nos packs d'accompagnement
            </h2>
            <p style="font-size: 20px; color: #4a5568; margin-bottom: 48px; max-width: 800px; margin-left: auto; margin-right: auto;">
                Des solutions complètes adaptées à vos besoins, de l'analyse de marché au déploiement de votre réseau
            </p>
            <a href="/packs" style="display: inline-flex; align-items: center; padding: 18px 40px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 20px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,82,204,0.3);">
                Voir nos packs →
            </a>
        </div>
    </section>
    """,
    "content_css": "",
    "content_json": "{}",
    "published": True
}

PACKS_PAGE = {
    "slug": "packs",
    "title": {
        "fr": "Nos Packs - Israel Growth Venture",
        "en": "Our Packs - Israel Growth Venture",
        "he": "החבילות שלנו - Israel Growth Venture"
    },
    "content_html": """
    <section style="padding: 80px 20px; background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);">
        <div style="max-width: 1280px; margin: 0 auto; text-center;">
            <h1 style="font-size: 52px; font-weight: 700; color: #1a202c; margin-bottom: 24px;">
                Nos packs d'accompagnement
            </h1>
            <p style="font-size: 22px; color: #4a5568; max-width: 800px; margin: 0 auto 60px;">
                Des solutions complètes et personnalisées pour votre expansion en Israël
            </p>
        </div>
    </section>

    <section style="padding: 60px 20px 100px; background: white;">
        <div style="max-width: 1280px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
                <!-- Pack Analyse -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; transition: all 0.3s; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0052CC 0%, #0065FF 100%);"></div>
                    <h3 style="font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 16px;">Pack Analyse</h3>
                    <p style="font-size: 18px; color: #4a5568; margin-bottom: 32px; line-height: 1.6;">
                        Étude de marché complète et analyse de faisabilité pour votre projet
                    </p>
                    <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Analyse de marché détaillée</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Étude de la concurrence</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Recommandations stratégiques</li>
                        <li style="padding: 12px 0; font-size: 16px; color: #2d3748;">✓ Rapport complet</li>
                    </ul>
                    <a href="/checkout/analyse" style="display: block; text-align: center; padding: 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s;">
                        Choisir ce pack
                    </a>
                </div>

                <!-- Pack Succursales -->
                <div style="background: white; border: 2px solid #0052CC; border-radius: 16px; padding: 40px; transition: all 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(0,82,204,0.15);">
                    <div style="position: absolute; top: 20px; right: 20px; background: #0052CC; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">POPULAIRE</div>
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0052CC 0%, #0065FF 100%);"></div>
                    <h3 style="font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 16px;">Pack Succursales</h3>
                    <p style="font-size: 18px; color: #4a5568; margin-bottom: 32px; line-height: 1.6;">
                        Déploiement de 2 à 5 points de vente avec accompagnement complet
                    </p>
                    <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Tout du Pack Analyse</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Recherche d'emplacements</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Négociation baux commerciaux</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Gestion administrative</li>
                        <li style="padding: 12px 0; font-size: 16px; color: #2d3748;">✓ Support opérationnel</li>
                    </ul>
                    <a href="/checkout/succursales" style="display: block; text-align: center; padding: 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s;">
                        Choisir ce pack
                    </a>
                </div>

                <!-- Pack Franchise -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; transition: all 0.3s; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0052CC 0%, #0065FF 100%);"></div>
                    <h3 style="font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 16px;">Pack Franchise</h3>
                    <p style="font-size: 18px; color: #4a5568; margin-bottom: 32px; line-height: 1.6;">
                        Développement d'un réseau complet de franchise en Israël
                    </p>
                    <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Tout du Pack Succursales</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Structuration juridique</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Recherche de franchisés</li>
                        <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 16px; color: #2d3748;">✓ Formation et support</li>
                        <li style="padding: 12px 0; font-size: 16px; color: #2d3748;">✓ Gestion du réseau</li>
                    </ul>
                    <a href="/checkout/franchise" style="display: block; text-align: center; padding: 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s;">
                        Choisir ce pack
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section style="padding: 80px 20px; background: #f7fafc;">
        <div style="max-width: 900px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">
                Besoin d'un pack sur mesure ?
            </h2>
            <p style="font-size: 18px; color: #4a5568; margin-bottom: 32px;">
                Chaque projet est unique. Contactez-nous pour discuter de vos besoins spécifiques.
            </p>
            <a href="mailto:contact@israelgrowthventure.com" style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 32px; background: #0052CC; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s;">
                📧 Nous contacter
            </a>
        </div>
    </section>
    """,
    "content_css": "",
    "content_json": "{}",
    "published": True
}

ABOUT_PAGE = {
    "slug": "about-us",
    "title": {
        "fr": "À propos - Israel Growth Venture",
        "en": "About Us - Israel Growth Venture",
        "he": "אודות - Israel Growth Venture"
    },
    "content_html": """
    <section style="padding: 100px 20px 80px; background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);">
        <div style="max-width: 1280px; margin: 0 auto; text-align: center;">
            <h1 style="font-size: 52px; font-weight: 700; color: #1a202c; margin-bottom: 24px;">
                À propos d'Israel Growth Venture
            </h1>
            <p style="font-size: 22px; color: #4a5568; max-width: 900px; margin: 0 auto; line-height: 1.7;">
                Votre partenaire de confiance pour réussir votre expansion sur le marché israélien
            </p>
        </div>
    </section>

    <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <div style="font-size: 19px; color: #2d3748; line-height: 1.8; space-y: 24px;">
                <p style="margin-bottom: 24px;">
                    Israel Growth Venture est spécialisé dans l'accompagnement des entreprises internationales 
                    souhaitant se développer en Israël. Fort de plus de 20 ans d'expérience dans l'immobilier 
                    commercial et l'expansion de marques, nous maîtrisons parfaitement les spécificités du marché israélien.
                </p>
                <p style="margin-bottom: 24px;">
                    Notre expertise couvre l'ensemble du processus d'expansion : de l'analyse de marché initiale 
                    à l'ouverture de vos points de vente, en passant par la recherche d'emplacements stratégiques, 
                    la négociation de baux commerciaux et l'accompagnement opérationnel.
                </p>
                <p style="margin-bottom: 24px;">
                    Nous travaillons avec des marques de retail, de restauration et de services qui cherchent à 
                    s'implanter en Israël de manière pérenne. Notre approche sur-mesure garantit que chaque projet 
                    bénéficie d'une stratégie adaptée à ses objectifs et contraintes spécifiques.
                </p>
            </div>
        </div>
    </section>

    <section style="padding: 80px 20px; background: #f7fafc;">
        <div style="max-width: 1280px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 700; text-align: center; color: #1a202c; margin-bottom: 60px;">
                Nos valeurs
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px;">
                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="width: 60px; height: 60px; margin-bottom: 24px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        🏆
                    </div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Expertise</h3>
                    <p style="font-size: 17px; color: #4a5568; line-height: 1.7;">
                        Plus de 20 ans d'expérience dans l'immobilier commercial et l'expansion de marques en Israël
                    </p>
                </div>

                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="width: 60px; height: 60px; margin-bottom: 24px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        🎯
                    </div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Résultats</h3>
                    <p style="font-size: 17px; color: #4a5568; line-height: 1.7;">
                        Approche orientée résultats avec un taux de réussite élevé pour nos clients
                    </p>
                </div>

                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="width: 60px; height: 60px; margin-bottom: 24px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        👥
                    </div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Accompagnement</h3>
                    <p style="font-size: 17px; color: #4a5568; line-height: 1.7;">
                        Support complet de A à Z, de l'analyse initiale au suivi post-ouverture
                    </p>
                </div>

                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="width: 60px; height: 60px; margin-bottom: 24px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                        📈
                    </div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Réseau</h3>
                    <p style="font-size: 17px; color: #4a5568; line-height: 1.7;">
                        Réseau étendu de partenaires locaux et connexions avec les autorités
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section style="padding: 80px 20px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%);">
        <div style="max-width: 900px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 38px; font-weight: 700; color: white; margin-bottom: 24px;">
                Prêt à commencer votre expansion en Israël ?
            </h2>
            <p style="font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 40px;">
                Contactez-nous pour discuter de votre projet
            </p>
            <a href="/contact" style="display: inline-flex; align-items: center; padding: 18px 40px; background: white; color: #0052CC; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 20px; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                Nous contacter →
            </a>
        </div>
    </section>
    """,
    "content_css": "",
    "content_json": "{}",
    "published": True
}

CONTACT_PAGE = {
    "slug": "contact",
    "title": {
        "fr": "Contact - Israel Growth Venture",
        "en": "Contact - Israel Growth Venture",
        "he": "צור קשר - Israel Growth Venture"
    },
    "content_html": """
    <section style="padding: 100px 20px 80px; background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);">
        <div style="max-width: 1280px; margin: 0 auto; text-align: center;">
            <h1 style="font-size: 52px; font-weight: 700; color: #1a202c; margin-bottom: 24px;">
                Contactez-nous
            </h1>
            <p style="font-size: 22px; color: #4a5568; max-width: 800px; margin: 0 auto;">
                Discutons de votre projet d'expansion en Israël
            </p>
        </div>
    </section>

    <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 1280px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;">
                <!-- Informations de contact -->
                <div>
                    <h2 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 32px;">
                        Nos coordonnées
                    </h2>
                    
                    <div style="margin-bottom: 32px;">
                        <div style="display: flex; align-items: start; gap: 20px; margin-bottom: 24px;">
                            <div style="width: 48px; height: 48px; background: #f0f7ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 24px;">
                                📧
                            </div>
                            <div>
                                <div style="font-size: 14px; color: #718096; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Email</div>
                                <a href="mailto:contact@israelgrowthventure.com" style="font-size: 18px; color: #0052CC; text-decoration: none; font-weight: 500;">
                                    contact@israelgrowthventure.com
                                </a>
                            </div>
                        </div>

                        <div style="display: flex; align-items: start; gap: 20px;">
                            <div style="width: 48px; height: 48px; background: #f0f7ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 24px;">
                                📍
                            </div>
                            <div>
                                <div style="font-size: 14px; color: #718096; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Localisation</div>
                                <div style="font-size: 18px; color: #2d3748; font-weight: 500;">
                                    Israël
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #f0f7ff; padding: 32px; border-radius: 16px; border-left: 4px solid #0052CC;">
                        <h3 style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 12px;">
                            Réponse rapide
                        </h3>
                        <p style="font-size: 16px; color: #4a5568; line-height: 1.7;">
                            Nous nous engageons à vous répondre dans les 24 heures ouvrées. 
                            Pour les demandes urgentes, n'hésitez pas à préciser "URGENT" dans l'objet de votre message.
                        </p>
                    </div>
                </div>

                <!-- Formulaire de contact -->
                <div style="background: #f7fafc; padding: 48px; border-radius: 16px;">
                    <h2 style="font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 32px;">
                        Envoyez-nous un message
                    </h2>
                    
                    <form id="contact-form" style="display: flex; flex-direction: column; gap: 24px;">
                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;">
                                Nom complet *
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                required 
                                style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: all 0.2s;"
                                placeholder="Jean Dupont"
                            />
                        </div>

                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;">
                                Email *
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: all 0.2s;"
                                placeholder="jean.dupont@example.com"
                            />
                        </div>

                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;">
                                Entreprise
                            </label>
                            <input 
                                type="text" 
                                name="company" 
                                style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: all 0.2s;"
                                placeholder="Nom de votre entreprise"
                            />
                        </div>

                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;">
                                Téléphone
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; transition: all 0.2s;"
                                placeholder="+33 6 12 34 56 78"
                            />
                        </div>

                        <div>
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;">
                                Message *
                            </label>
                            <textarea 
                                name="message" 
                                required 
                                rows="6" 
                                style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; resize: vertical; transition: all 0.2s;"
                                placeholder="Décrivez votre projet et vos besoins..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            style="width: 100%; padding: 16px; background: #0052CC; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,82,204,0.3);"
                        >
                            Envoyer le message →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>
    """,
    "content_css": """
    #contact-form input:focus,
    #contact-form textarea:focus {
        outline: none;
        border-color: #0052CC;
        box-shadow: 0 0 0 3px rgba(0,82,204,0.1);
    }
    
    #contact-form button:hover {
        background: #003D99;
        box-shadow: 0 6px 20px rgba(0,82,204,0.4);
        transform: translateY(-2px);
    }
    """,
    "content_json": "{}",
    "published": True
}

FUTURE_COMMERCE_PAGE = {
    "slug": "le-commerce-de-demain",
    "title": {
        "fr": "Le Commerce de Demain - Israel Growth Venture",
        "en": "The Future of Retail - Israel Growth Venture",
        "he": "המסחר של המחר - Israel Growth Venture"
    },
    "content_html": """
    <section style="padding: 120px 20px; background: linear-gradient(135deg, #1a1a1a 0%, #0052CC 100%); color: white; text-align: center;">
        <div style="max-width: 1280px; margin: 0 auto;">
            <h1 style="font-size: 64px; font-weight: 700; line-height: 1.1; margin-bottom: 32px;">
                Le commerce tel que vous le pratiquez est mort.
            </h1>
            <div style="font-size: 32px; font-weight: 300; line-height: 1.5; margin-bottom: 24px; color: rgba(255,255,255,0.9);">
                <p style="margin-bottom: 12px;">Pas dans 10 ans. Pas dans 5 ans.</p>
                <p><strong>Maintenant.</strong></p>
            </div>
            <p style="font-size: 22px; max-width: 900px; margin: 0 auto; line-height: 1.7; color: rgba(255,255,255,0.85);">
                Les marques qui continuent d'ouvrir des boutiques comme en 2010 s'accrochent à un modèle qui n'existe déjà plus. 
                Les consommateurs ne veulent plus acheter : ils veulent vivre, ressentir, tester, participer.
            </p>
        </div>
    </section>

    <section style="padding: 100px 20px; background: white;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <h2 style="font-size: 48px; font-weight: 700; color: #1a202c; margin-bottom: 24px; text-align: center;">
                Israël : là où le commerce du futur se crée avant les autres
            </h2>
            <p style="font-size: 22px; color: #4a5568; text-align: center; margin-bottom: 60px; font-weight: 500;">
                Israël n'est pas un marché. C'est un laboratoire.
            </p>

            <div style="display: grid; gap: 32px;">
                <div style="background: #f0f7ff; padding: 32px; border-radius: 16px; border-left: 6px solid #0052CC;">
                    <p style="font-size: 20px; color: #2d3748; line-height: 1.8; margin: 0;">
                        ✓ Le consommateur adopte en 3 mois ce que l'Europe met 3 ans à comprendre.
                    </p>
                </div>
                <div style="background: #f0f7ff; padding: 32px; border-radius: 16px; border-left: 6px solid #0052CC;">
                    <p style="font-size: 20px; color: #2d3748; line-height: 1.8; margin: 0;">
                        ✓ Les usages changent plus vite que les business plans.
                    </p>
                </div>
                <div style="background: #f0f7ff; padding: 32px; border-radius: 16px; border-left: 6px solid #0052CC;">
                    <p style="font-size: 20px; color: #2d3748; line-height: 1.8; margin: 0;">
                        ✓ Les concepts survivent uniquement s'ils sont réellement bons.
                    </p>
                </div>
                <div style="background: #f0f7ff; padding: 32px; border-radius: 16px; border-left: 6px solid #0052CC;">
                    <p style="font-size: 20px; color: #2d3748; line-height: 1.8; margin: 0;">
                        ✓ Le digital et le physique ne sont plus séparés : tout est hybride, tout est instantané.
                    </p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 60px; padding: 40px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 16px;">
                <p style="font-size: 28px; font-weight: 600; color: white; margin: 0;">
                    Si votre concept tient en Israël, il est prêt pour le futur.
                </p>
            </div>
        </div>
    </section>

    <section style="padding: 100px 20px; background: #f7fafc;">
        <div style="max-width: 1100px; margin: 0 auto;">
            <h2 style="font-size: 48px; font-weight: 700; color: #1a202c; margin-bottom: 60px; text-align: center;">
                Les réalités du terrain
            </h2>

            <div style="display: grid; gap: 48px;">
                <div style="background: white; padding: 48px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                    <h3 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">
                        Réalité 1 : Le client ne vient plus "acheter"
                    </h3>
                    <p style="font-size: 19px; color: #2d3748; line-height: 1.8;">
                        Il peut tout commander en ligne. Il vient pour une expérience qu'il ne peut pas avoir depuis son canapé. 
                        Si votre boutique n'est qu'un catalogue physique, elle est déjà obsolète.
                    </p>
                </div>

                <div style="background: white; padding: 48px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                    <h3 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">
                        Réalité 2 : Le commerce est devenu social
                    </h3>
                    <p style="font-size: 19px; color: #2d3748; line-height: 1.8;">
                        Instagram et TikTok vendent plus que certains distributeurs traditionnels. Une boutique qui n'est pas 
                        "instagrammable" perd 50% de son potentiel avant même d'ouvrir. Le produit n'est plus roi : 
                        c'est l'histoire qu'il raconte.
                    </p>
                </div>

                <div style="background: white; padding: 48px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                    <h3 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">
                        Réalité 3 : Les emplacements premium ne garantissent plus rien
                    </h3>
                    <p style="font-size: 19px; color: #2d3748; line-height: 1.8;">
                        Ce qui comptait hier (passage, visibilité, rue commerçante) ne suffit plus. Aujourd'hui, 
                        il faut être là où se créent les communautés, pas seulement là où il y a du trafic.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section style="padding: 100px 20px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%);">
        <div style="max-width: 900px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 42px; font-weight: 700; color: white; margin-bottom: 32px;">
                Prêt à tester votre concept dans le laboratoire du futur ?
            </h2>
            <p style="font-size: 22px; color: rgba(255,255,255,0.9); margin-bottom: 48px; line-height: 1.7;">
                Israel Growth Venture vous accompagne pour valider et déployer votre concept sur le marché israélien. 
                Si ça marche ici, ça marchera partout.
            </p>
            <a href="/contact" style="display: inline-flex; align-items: center; padding: 20px 48px; background: white; color: #0052CC; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 22px; transition: all 0.3s; box-shadow: 0 8px 30px rgba(0,0,0,0.2);">
                Discutons de votre projet →
            </a>
        </div>
    </section>
    """,
    "content_css": "",
    "content_json": "{}",
    "published": True
}

# ========================================
# MAIN
# ========================================

def main():
    print("=" * 80)
    print("SYNCHRONISATION DES PAGES RÉELLES VERS LE CMS")
    print("=" * 80)
    
    # Authentification
    token = login_admin()
    if not token:
        return
    
    # Pages à synchroniser
    pages = [
        HOME_PAGE,
        PACKS_PAGE,
        ABOUT_PAGE,
        CONTACT_PAGE,
        FUTURE_COMMERCE_PAGE
    ]
    
    # Synchroniser chaque page
    success_count = 0
    for page in pages:
        if create_or_update_page(token, page):
            success_count += 1
    
    # Résumé
    print("\n" + "=" * 80)
    print(f"✅ Synchronisation terminée : {success_count}/{len(pages)} pages")
    print("=" * 80)
    
    if success_count == len(pages):
        print("\n🎉 Toutes les pages ont été synchronisées avec succès!")
        print("\nProchaines étapes:")
        print("1. Vérifiez les pages dans l'admin : https://israelgrowthventure.com/admin/pages")
        print("2. Éditez-les dans GrapesJS pour personnaliser le contenu")
        print("3. Les pages publiques afficheront automatiquement le contenu CMS")
    else:
        print("\n⚠️ Certaines pages n'ont pas pu être synchronisées")
        print("Vérifiez les logs ci-dessus pour plus de détails")

if __name__ == "__main__":
    main()
