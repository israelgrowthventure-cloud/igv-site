"""
Script de création des pages initiales du CMS
==============================================

Crée 4 pages de base:
1. Home (Accueil)
2. Packs (Services)
3. About Us (À propos)
4. Contact

Chaque page a:
- Slug unique
- Titre multilingue (FR/EN/HE)
- Contenu HTML de base
- Status publié

IMPORTANT: Ce script s'exécute directement sur la base MongoDB de production
"""

import os
import sys
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

# Configuration MongoDB (même que le backend)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0')
DB_NAME = os.environ.get('DB_NAME', 'igv_cms_db')

# Pages à créer
INITIAL_PAGES = [
    {
        "slug": "home",
        "title": {
            "fr": "Accueil",
            "en": "Home",
            "he": "בית"
        },
        "description": {
            "fr": "Page d'accueil d'Israel Growth Venture",
            "en": "Israel Growth Venture homepage",
            "he": "דף הבית של Israel Growth Venture"
        },
        "content_html": """
        <div style="padding: 40px; text-align: center;">
            <h1>Bienvenue sur Israel Growth Venture</h1>
            <p>Votre partenaire pour le développement en Israël</p>
            <a href="/packs" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0052CC; color: white; text-decoration: none; border-radius: 8px;">
                Découvrir nos packs
            </a>
        </div>
        """,
        "content_css": "",
        "content_json": "{}",
        "published": True
    },
    {
        "slug": "packs",
        "title": {
            "fr": "Nos Packs",
            "en": "Our Packs",
            "he": "החבילות שלנו"
        },
        "description": {
            "fr": "Découvrez nos packs de services",
            "en": "Discover our service packs",
            "he": "גלה את חבילות השירותים שלנו"
        },
        "content_html": """
        <div style="padding: 40px;">
            <h1>Nos Packs de Services</h1>
            <p>Israel Growth Venture vous accompagne dans votre développement en Israël avec des packs adaptés à vos besoins.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px;">
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                    <h3>Pack Analyse</h3>
                    <p>Analyse complète du potentiel de votre marque en Israël</p>
                    <a href="/checkout/analyse" style="display: inline-block; margin-top: 16px; padding: 8px 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 4px;">
                        Commander
                    </a>
                </div>
                
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                    <h3>Pack Succursales</h3>
                    <p>Solution clé en main pour l'ouverture de succursales</p>
                    <a href="/checkout/succursales" style="display: inline-block; margin-top: 16px; padding: 8px 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 4px;">
                        Commander
                    </a>
                </div>
                
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                    <h3>Pack Franchise</h3>
                    <p>Développement complet de votre réseau de franchise</p>
                    <a href="/checkout/franchise" style="display: inline-block; margin-top: 16px; padding: 8px 16px; background: #0052CC; color: white; text-decoration: none; border-radius: 4px;">
                        Commander
                    </a>
                </div>
            </div>
        </div>
        """,
        "content_css": "",
        "content_json": "{}",
        "published": True
    },
    {
        "slug": "about-us",
        "title": {
            "fr": "À Propos",
            "en": "About Us",
            "he": "אודות"
        },
        "description": {
            "fr": "Découvrez Israel Growth Venture",
            "en": "Discover Israel Growth Venture",
            "he": "גלה את Israel Growth Venture"
        },
        "content_html": """
        <div style="padding: 40px; max-width: 1200px; margin: 0 auto;">
            <h1>À Propos d'Israel Growth Venture</h1>
            
            <section style="margin-top: 40px;">
                <h2>Notre Mission</h2>
                <p>Israel Growth Venture accompagne les entreprises internationales dans leur développement sur le marché israélien. Nous offrons une expertise complète pour assurer le succès de votre implantation.</p>
            </section>
            
            <section style="margin-top: 40px;">
                <h2>Notre Expertise</h2>
                <ul style="list-style: disc; margin-left: 20px;">
                    <li>Analyse de marché approfondie</li>
                    <li>Stratégie d'implantation personnalisée</li>
                    <li>Accompagnement opérationnel</li>
                    <li>Réseau de partenaires locaux</li>
                </ul>
            </section>
            
            <section style="margin-top: 40px;">
                <h2>Pourquoi Israël ?</h2>
                <p>Israël représente un marché dynamique avec un fort pouvoir d'achat et une population avide de nouveautés. Notre connaissance du terrain vous garantit une entrée réussie sur ce marché unique.</p>
            </section>
        </div>
        """,
        "content_css": "",
        "content_json": "{}",
        "published": True
    },
    {
        "slug": "contact",
        "title": {
            "fr": "Contact",
            "en": "Contact",
            "he": "צור קשר"
        },
        "description": {
            "fr": "Contactez-nous",
            "en": "Contact us",
            "he": "צור איתנו קשר"
        },
        "content_html": """
        <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1>Contactez-Nous</h1>
            
            <p style="margin-top: 24px;">Vous avez un projet de développement en Israël ? Nous sommes là pour vous accompagner.</p>
            
            <div style="margin-top: 40px; background: #f5f5f5; padding: 32px; border-radius: 8px;">
                <h3>Informations de Contact</h3>
                
                <div style="margin-top: 20px;">
                    <p><strong>Email:</strong> israel.growth.venture@gmail.com</p>
                    <p style="margin-top: 12px;"><strong>Téléphone:</strong> +972 XX XXX XXXX</p>
                </div>
                
                <div style="margin-top: 32px;">
                    <a href="mailto:israel.growth.venture@gmail.com" style="display: inline-block; padding: 12px 24px; background: #0052CC; color: white; text-decoration: none; border-radius: 8px;">
                        Nous écrire
                    </a>
                </div>
            </div>
            
            <div style="margin-top: 40px;">
                <h3>Prendre Rendez-vous</h3>
                <p>Pour discuter de votre projet, n'hésitez pas à prendre rendez-vous avec notre équipe.</p>
                
                <a href="/packs" style="display: inline-block; margin-top: 16px; padding: 10px 20px; border: 2px solid #0052CC; color: #0052CC; text-decoration: none; border-radius: 8px;">
                    Découvrir nos services
                </a>
            </div>
        </div>
        """,
        "content_css": "",
        "content_json": "{}",
        "published": True
    }
]

async def create_initial_pages():
    """Crée les pages initiales dans MongoDB."""
    print("=" * 70)
    print("CRÉATION DES PAGES INITIALES CMS")
    print("=" * 70)
    
    # Vérifier que MONGO_URL est défini
    if not MONGO_URL or 'mongodb+srv://' not in MONGO_URL:
        print("\n❌ ERREUR: MONGO_URL n'est pas défini correctement")
        print("\nDéfinissez la variable d'environnement MONGO_URL avant d'exécuter ce script")
        print("Exemple:")
        print('  $env:MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"')
        print('  python create_initial_pages.py')
        return False
    
    print(f"\n📊 Base de données: {DB_NAME}")
    print(f"📄 Nombre de pages à créer: {len(INITIAL_PAGES)}")
    
    try:
        # Connexion à MongoDB
        print("\n🔌 Connexion à MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        pages_collection = db['pages']
        
        # Vérifier la connexion
        await client.server_info()
        print("✅ Connexion établie")
        
        # Compter les pages existantes
        existing_count = await pages_collection.count_documents({})
        print(f"\n📋 Pages existantes: {existing_count}")
        
        if existing_count > 0:
            print("\n⚠️  Des pages existent déjà. Voulez-vous continuer ?")
            print("   Les slugs existants seront ignorés (pas de doublon)")
        
        # Créer les pages
        created_count = 0
        skipped_count = 0
        
        for page_data in INITIAL_PAGES:
            slug = page_data['slug']
            
            # Vérifier si la page existe déjà
            existing_page = await pages_collection.find_one({"slug": slug})
            
            if existing_page:
                print(f"\n⏭️  Page '{slug}' existe déjà, ignorée")
                skipped_count += 1
                continue
            
            # Ajouter les champs techniques
            page_doc = {
                **page_data,
                "id": str(uuid.uuid4()),
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            # Insérer la page
            result = await pages_collection.insert_one(page_doc)
            
            if result.inserted_id:
                print(f"\n✅ Page '{slug}' créée")
                print(f"   Titre FR: {page_data['title']['fr']}")
                print(f"   Publié: {page_data['published']}")
                created_count += 1
            else:
                print(f"\n❌ Échec création page '{slug}'")
        
        # Résumé
        print("\n" + "=" * 70)
        print("RÉSUMÉ")
        print("=" * 70)
        print(f"✅ Pages créées: {created_count}")
        print(f"⏭️  Pages ignorées: {skipped_count}")
        
        # Vérifier le total final
        final_count = await pages_collection.count_documents({})
        print(f"📊 Total pages en base: {final_count}")
        
        print("\n🎉 Les pages sont maintenant disponibles dans l'admin!")
        print("   URL: https://israelgrowthventure.com/admin/pages")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'client' in locals():
            client.close()

def main():
    """Point d'entrée du script."""
    result = asyncio.run(create_initial_pages())
    sys.exit(0 if result else 1)

if __name__ == "__main__":
    main()
