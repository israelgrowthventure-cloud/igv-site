"""
Script d'initialisation admin unique + pages CMS Étude 360° - Production
=========================================================================

Ce script initialise la base de données MongoDB de PRODUCTION avec:
1. Un seul compte admin: postmaster@israelgrowthventure.com
2. Les pages CMS pour le funnel Étude 360°

USAGE:
    python init_admin_prod_once.py

VARIABLES D'ENVIRONNEMENT:
    - MONGO_URL: URL MongoDB de production (Atlas)
    - DB_NAME: Nom de la base (défaut: igv_database)

IMPORTANT: Ce script est idempotent et peut être relancé sans danger.
"""

import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient
from passlib.context import CryptContext

# Configuration
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def init_admin_and_pages():
    """Initialize admin user and CMS pages in production database"""
    
    # Get MongoDB URL
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        print("❌ ERREUR: Variable d'environnement MONGO_URL non définie")
        print("   Veuillez définir MONGO_URL avec l'URL MongoDB de production")
        sys.exit(1)
    
    db_name = os.environ.get('DB_NAME', 'igv_database')
    
    print(f"🔗 Connexion à MongoDB: {db_name}")
    print(f"   URL: {mongo_url[:20]}...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=10000)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connexion MongoDB OK")
        
        db = client[db_name]
        users_collection = db['users']
        pages_collection = db['pages']
        
        # ============================================================
        # 1. ADMIN USER - Ensure single admin account
        # ============================================================
        print(f"\n👤 Configuration admin unique: {ADMIN_EMAIL}")
        
        # Hash password
        hashed_password = hash_password(ADMIN_PASSWORD)
        
        # Remove other admin accounts (keep only our main admin)
        delete_result = users_collection.delete_many({
            "role": "admin",
            "email": {"$ne": ADMIN_EMAIL}
        })
        if delete_result.deleted_count > 0:
            print(f"   🗑️  Supprimé {delete_result.deleted_count} ancien(s) compte(s) admin")
        
        # Upsert main admin
        result = users_collection.update_one(
            {"email": ADMIN_EMAIL},
            {
                "$set": {
                    "email": ADMIN_EMAIL,
                    "hashed_password": hashed_password,  # Fixed: was password_hash
                    "role": "admin",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                },
                "$setOnInsert": {
                    "id": ADMIN_EMAIL,  # Use email as ID for consistency
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        if result.upserted_id:
            print(f"   ✅ Admin créé: {ADMIN_EMAIL}")
        else:
            print(f"   ✅ Admin mis à jour: {ADMIN_EMAIL}")
        
        print(f"   📧 Email: {ADMIN_EMAIL}")
        print(f"   🔑 Mot de passe: {ADMIN_PASSWORD}")
        
        # ============================================================
        # 2. CMS PAGES - Étude 360°
        # ============================================================
        print("\n📄 Configuration pages CMS Étude 360°")
        
        def upsert_page(slug, title_fr, content_html):
            """Upsert a CMS page"""
            result = pages_collection.update_one(
                {"slug": slug},
                {
                    "$set": {
                        "slug": slug,
                        "title": {
                            "fr": title_fr,
                            "en": title_fr,  # Fallback to FR for now
                            "he": title_fr
                        },
                        "content_html": content_html,
                        "content_json": "{}",
                        "content_css": "",
                        "published": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    },
                    "$setOnInsert": {
                        "id": slug,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }
                },
                upsert=True
            )
            return result
        
        # Page 1: Landing Étude 360°
        result1 = upsert_page(
            slug="etude-implantation-360",
            title_fr="Étude d'Implantation IGV – Israël 360°",
            content_html="""
<section style="padding: 80px 20px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; text-align: center;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 24px;">
            Étude d'Implantation IGV – Israël 360°
        </h1>
        <p style="font-size: 1.5rem; margin-bottom: 32px; opacity: 0.95;">
            Analysez votre projet d'implantation en Israël avec nos experts
        </p>
        <p style="font-size: 1.125rem; opacity: 0.9;">
            Contenu éditable via l'admin IGV - Pages CMS
        </p>
    </div>
</section>

<section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
    <h2 style="font-size: 2.5rem; margin-bottom: 40px; text-align: center; color: #1e3a8a;">
        Pourquoi une étude 360° ?
    </h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">📊 Analyse Complète</h3>
            <p style="color: #475569; line-height: 1.6;">
                Évaluation détaillée de votre secteur d'activité et des opportunités de marché.
            </p>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">🎯 Stratégie Personnalisée</h3>
            <p style="color: #475569; line-height: 1.6;">
                Plan d'action sur-mesure adapté à vos objectifs et votre budget.
            </p>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">🤝 Accompagnement Expert</h3>
            <p style="color: #475569; line-height: 1.6;">
                Support continu de nos experts locaux pour maximiser votre succès.
            </p>
        </div>
    </div>
</section>
            """
        )
        
        if result1.upserted_id:
            print("   ✅ Page 'etude-implantation-360' créée")
        else:
            print("   ✅ Page 'etude-implantation-360' mise à jour")
        
        # Page 2: Thank you page
        result2 = upsert_page(
            slug="etude-implantation-merci",
            title_fr="Merci, nous vous recontactons personnellement sous 24h",
            content_html="""
<section style="padding: 120px 20px; min-height: 80vh; display: flex; align-items: center; justify-content: center;">
    <div style="max-width: 800px; text-align: center;">
        <div style="font-size: 5rem; margin-bottom: 32px;">✅</div>
        <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 24px; color: #1e3a8a;">
            Demande bien reçue !
        </h1>
        <p style="font-size: 1.5rem; margin-bottom: 32px; color: #475569; line-height: 1.6;">
            Merci pour votre intérêt pour notre Étude d'Implantation 360°.
        </p>
        <p style="font-size: 1.25rem; margin-bottom: 48px; color: #64748b;">
            Un de nos experts vous recontactera personnellement <strong>sous 24 heures</strong> 
            pour discuter de votre projet.
        </p>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px; text-align: left;">
            <h3 style="font-size: 1.25rem; margin-bottom: 16px; color: #1e3a8a;">📋 Prochaines étapes :</h3>
            <ul style="color: #475569; line-height: 2;">
                <li>Analyse de votre demande par notre équipe</li>
                <li>Appel de qualification avec un expert</li>
                <li>Proposition d'étude personnalisée</li>
                <li>Démarrage de votre accompagnement</li>
            </ul>
        </div>
        <div style="margin-top: 48px;">
            <a href="/" style="display: inline-block; padding: 16px 48px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Retour à l'accueil
            </a>
        </div>
    </div>
</section>
            """
        )
        
        if result2.upserted_id:
            print("   ✅ Page 'etude-implantation-merci' créée")
        else:
            print("   ✅ Page 'etude-implantation-merci' mise à jour")
        
        # ============================================================
        # SUMMARY
        # ============================================================
        print("\n✨ Initialisation terminée avec succès !")
        print("\n📝 Résumé:")
        print(f"   - Admin: {ADMIN_EMAIL}")
        print(f"   - Mot de passe: {ADMIN_PASSWORD}")
        print(f"   - Pages CMS: etude-implantation-360, etude-implantation-merci")
        print(f"   - Base de données: {db_name}")
        print("\n🔐 Vous pouvez maintenant vous connecter à /admin/login")
        print("   Et modifier ces pages via /admin/pages")
        
    except Exception as e:
        print(f"\n❌ ERREUR lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("INITIALISATION PRODUCTION - Admin + Pages Étude 360°")
    print("=" * 60)
    init_admin_and_pages()
