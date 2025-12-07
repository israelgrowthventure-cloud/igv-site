"""
Script d'initialisation Phase 1ter
===================================

Ce script initialise:
1. Suppression de tous les anciens comptes admin
2. Création d'un admin unique: postmaster@israelgrowthventure.com
3. Création des pages CMS pour l'Étude 360°:
   - /etude-implantation-360
   - /etude-implantation-merci

USAGE:
    python init_admin_and_pages.py

VARIABLES D'ENVIRONNEMENT REQUISES:
    - MONGO_URL: URL de connexion MongoDB Atlas
    - DB_NAME: Nom de la base de données (défaut: igv_db)
"""

import os
import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'igv_db')
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable must be set")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_database():
    """Initialize database with admin user and CMS pages"""
    print(f"🔗 Connexion à MongoDB: {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Test de connexion
        await client.admin.command('ping')
        print("✅ Connexion MongoDB OK")
        
        # 1. Supprimer tous les anciens comptes admin
        print("\n🗑️  Suppression des anciens comptes admin...")
        result = await db.users.delete_many({})
        print(f"   Supprimé: {result.deleted_count} compte(s)")
        
        # 2. Créer le compte admin unique
        print(f"\n👤 Création du compte admin unique: {ADMIN_EMAIL}")
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hashed_password,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print(f"✅ Admin créé avec succès")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Mot de passe initial: {ADMIN_PASSWORD}")
        
        # 3. Créer les pages CMS Étude 360°
        print("\n📄 Création des pages CMS Étude 360°...")
        
        # Page 1: Landing Étude 360°
        page_etude = {
            "id": str(uuid.uuid4()),
            "slug": "etude-implantation-360",
            "title": {
                "fr": "Étude d'Implantation IGV – Israël 360°",
                "en": "IGV Implementation Study – Israel 360°",
                "he": "מחקר יישום IGV – ישראל 360°"
            },
            "content_html": """
<section class="hero-section" style="padding: 80px 20px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; text-align: center;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 24px;">
            Étude d'Implantation IGV – Israël 360°
        </h1>
        <p style="font-size: 1.5rem; margin-bottom: 32px; opacity: 0.95;">
            Analysez votre projet d'implantation en Israël avec nos experts
        </p>
        <div style="display: inline-block; padding: 16px 48px; background: white; color: #1e3a8a; border-radius: 8px; font-size: 1.25rem; font-weight: 600; cursor: pointer;">
            Démarrer l'analyse
        </div>
    </div>
</section>

<section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
    <h2 style="font-size: 2.5rem; margin-bottom: 40px; text-align: center; color: #1e3a8a;">
        Pourquoi une étude 360° ?
    </h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">📊 Analyse Complète</h3>
            <p style="color: #475569; line-height: 1.6;">
                Évaluation détaillée de votre secteur d'activité, de la réglementation locale et des opportunités de marché.
            </p>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">🎯 Stratégie Personnalisée</h3>
            <p style="color: #475569; line-height: 1.6;">
                Plan d'action sur-mesure adapté à vos objectifs, votre budget et votre timeline.
            </p>
        </div>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h3 style="font-size: 1.5rem; margin-bottom: 16px; color: #1e3a8a;">🤝 Accompagnement Expert</h3>
            <p style="color: #475569; line-height: 1.6;">
                Support continu de nos experts locaux pour maximiser vos chances de succès.
            </p>
        </div>
    </div>
</section>

<section style="padding: 80px 20px; background: #f8fafc;">
    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2.5rem; margin-bottom: 24px; color: #1e3a8a;">
            Prêt à démarrer ?
        </h2>
        <p style="font-size: 1.25rem; margin-bottom: 32px; color: #475569;">
            Nos experts vous recontactent personnellement sous 24h
        </p>
        <div style="display: inline-block; padding: 16px 48px; background: #3b82f6; color: white; border-radius: 8px; font-size: 1.25rem; font-weight: 600; cursor: pointer;">
            Demander mon étude gratuite
        </div>
    </div>
</section>
            """,
            "content_css": """
.hero-section h1 {
    animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
            """,
            "content_json": "{}",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Vérifier si la page existe déjà
        existing_etude = await db.pages.find_one({"slug": "etude-implantation-360"})
        if existing_etude:
            await db.pages.replace_one({"slug": "etude-implantation-360"}, page_etude)
            print("   ✅ Page 'etude-implantation-360' mise à jour")
        else:
            await db.pages.insert_one(page_etude)
            print("   ✅ Page 'etude-implantation-360' créée")
        
        # Page 2: Merci
        page_merci = {
            "id": str(uuid.uuid4()),
            "slug": "etude-implantation-merci",
            "title": {
                "fr": "Merci, nous vous recontactons sous 24h",
                "en": "Thank you, we'll contact you within 24h",
                "he": "תודה, ניצור קשר תוך 24 שעות"
            },
            "content_html": """
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
            pour discuter de votre projet et définir ensemble la meilleure stratégie.
        </p>
        <div style="padding: 32px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6; text-align: left;">
            <h3 style="font-size: 1.25rem; margin-bottom: 16px; color: #1e3a8a;">📋 Prochaines étapes :</h3>
            <ul style="color: #475569; line-height: 2;">
                <li>Analyse de votre demande par notre équipe</li>
                <li>Appel de qualification avec un expert</li>
                <li>Proposition d'étude personnalisée</li>
                <li>Démarrage de votre accompagnement</li>
            </ul>
        </div>
        <div style="margin-top: 48px;">
            <a href="/" style="display: inline-block; padding: 16px 48px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-size: 1.125rem; font-weight: 600;">
                Retour à l'accueil
            </a>
        </div>
    </div>
</section>
            """,
            "content_css": "",
            "content_json": "{}",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        existing_merci = await db.pages.find_one({"slug": "etude-implantation-merci"})
        if existing_merci:
            await db.pages.replace_one({"slug": "etude-implantation-merci"}, page_merci)
            print("   ✅ Page 'etude-implantation-merci' mise à jour")
        else:
            await db.pages.insert_one(page_merci)
            print("   ✅ Page 'etude-implantation-merci' créée")
        
        print("\n✨ Initialisation terminée avec succès !")
        print("\n📝 Résumé:")
        print(f"   - Admin: {ADMIN_EMAIL}")
        print(f"   - Pages CMS: etude-implantation-360, etude-implantation-merci")
        print(f"   - Base de données: {DB_NAME}")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de l'initialisation: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(init_database())
