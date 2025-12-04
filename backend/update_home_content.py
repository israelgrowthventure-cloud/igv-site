"""
Script pour mettre à jour le contenu de la page home avec le HTML du site réel
===============================================================================

Ce script met à jour la page 'home' dans le CMS avec un contenu HTML riche
qui correspond à ce qui est visible sur le site public.
"""

import os
import sys
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Configuration MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0')
DB_NAME = os.environ.get('DB_NAME', 'igv_cms_db')

# Contenu HTML riche pour la page home
HOME_HTML_CONTENT = """
<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 120px 20px; text-align: center; color: white; position: relative; overflow: hidden;">
  <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 10;">
    <h1 style="font-size: 64px; margin-bottom: 28px; font-weight: 800; line-height: 1.1;">Développez Votre Activité en Israël</h1>
    <p style="font-size: 24px; margin-bottom: 48px; opacity: 0.95; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.7;">Israel Growth Venture vous accompagne dans votre implantation et votre croissance sur le marché israélien avec une expertise reconnue.</p>
    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
      <a href="/packs" style="display: inline-block; padding: 20px 56px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">Découvrir nos packs</a>
      <a href="/contact" style="display: inline-block; padding: 20px 56px; background: transparent; border: 3px solid white; color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; transition: all 0.3s;">Nous contacter</a>
    </div>
  </div>
</section>

<section style="padding: 100px 20px; background: white;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 48px; margin-bottom: 24px; color: #1a202c; font-weight: 800;">Pourquoi Choisir IGV ?</h2>
    <p style="text-align: center; font-size: 20px; color: #718096; margin-bottom: 80px; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.8;">Nous vous offrons un accompagnement complet et personnalisé pour réussir votre implantation en Israël.</p>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
      <div style="text-align: center; padding: 32px;">
        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 24px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 12px 32px rgba(0,82,204,0.3);">🎯</div>
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Expertise Locale</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Une connaissance approfondie du marché israélien et de ses spécificités pour vous guider efficacement.</p>
      </div>
      
      <div style="text-align: center; padding: 32px;">
        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 24px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 12px 32px rgba(0,82,204,0.3);">🚀</div>
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Accompagnement Complet</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">De l'analyse initiale à l'opérationnel, nous vous accompagnons à chaque étape de votre projet.</p>
      </div>
      
      <div style="text-align: center; padding: 32px;">
        <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 24px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 12px 32px rgba(0,82,204,0.3);">💼</div>
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Réseau Étendu</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Accédez à notre réseau de partenaires et d'experts pour maximiser vos chances de succès.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding: 100px 20px; background: #f7fafc;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 48px; margin-bottom: 24px; color: #1a202c; font-weight: 800;">Nos Services</h2>
    <p style="text-align: center; font-size: 20px; color: #718096; margin-bottom: 80px; max-width: 800px; margin-left: auto; margin-right: auto;">Des solutions adaptées à chaque phase de votre développement.</p>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
      <div style="background: white; padding: 48px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s;">
        <h3 style="font-size: 28px; margin-bottom: 20px; color: #0052CC; font-weight: 700;">Pack Analyse</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 28px;">Analyse complète du potentiel de votre marque sur le marché israélien avec recommandations stratégiques.</p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; color: #4a5568;">
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Étude de marché détaillée</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Analyse concurrentielle</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Recommandations stratégiques</span>
          </li>
        </ul>
        <a href="/packs#analyse" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s;">En savoir plus</a>
      </div>
      
      <div style="background: white; padding: 48px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s;">
        <h3 style="font-size: 28px; margin-bottom: 20px; color: #0052CC; font-weight: 700;">Pack Succursales</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 28px;">Solution clé en main pour l'ouverture et la gestion de succursales en Israël.</p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; color: #4a5568;">
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Recherche de locaux</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Démarches administratives</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Mise en place opérationnelle</span>
          </li>
        </ul>
        <a href="/packs#succursales" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s;">En savoir plus</a>
      </div>
      
      <div style="background: white; padding: 48px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s;">
        <h3 style="font-size: 28px; margin-bottom: 20px; color: #0052CC; font-weight: 700;">Pack Franchise</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px; margin-bottom: 28px;">Développement complet de votre réseau de franchise avec accompagnement juridique et opérationnel.</p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; color: #4a5568;">
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Cadre juridique complet</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Recrutement franchisés</span>
          </li>
          <li style="padding: 8px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #48bb78; font-size: 20px;">✓</span>
            <span>Formation et support</span>
          </li>
        </ul>
        <a href="/packs#franchise" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s;">En savoir plus</a>
      </div>
    </div>
  </div>
</section>

<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white;">
  <div style="max-width: 900px; margin: 0 auto;">
    <h2 style="font-size: 48px; margin-bottom: 24px; font-weight: 800;">Prêt à Vous Lancer ?</h2>
    <p style="font-size: 22px; margin-bottom: 48px; opacity: 0.95; line-height: 1.7;">Contactez-nous dès aujourd'hui pour discuter de votre projet et découvrir comment nous pouvons vous aider à réussir en Israël.</p>
    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
      <a href="/contact" style="display: inline-block; padding: 20px 56px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">Prendre contact</a>
      <a href="/about" style="display: inline-block; padding: 20px 56px; background: transparent; border: 3px solid white; color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; transition: all 0.3s;">À propos de nous</a>
    </div>
  </div>
</section>
"""

HOME_CSS_CONTENT = """
/* Styles additionnels pour la page home */
@media (max-width: 768px) {
  section h1 {
    font-size: 36px !important;
  }
  section h2 {
    font-size: 32px !important;
  }
  section > div > div {
    grid-template-columns: 1fr !important;
  }
}
"""

async def update_home_page():
    """Met à jour le contenu de la page home"""
    
    print("🔄 Connexion à MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    pages_collection = db.pages
    
    try:
        # Chercher la page home
        existing_page = await pages_collection.find_one({"slug": "home"})
        
        if not existing_page:
            print("❌ Page 'home' non trouvée dans la base de données")
            print("💡 Exécutez d'abord: python create_initial_pages.py")
            return False
        
        print(f"✅ Page 'home' trouvée (ID: {existing_page['_id']})")
        print(f"   Contenu actuel: {len(existing_page.get('content_html', ''))} caractères HTML")
        
        # Mettre à jour le contenu
        update_data = {
            "content_html": HOME_HTML_CONTENT.strip(),
            "content_css": HOME_CSS_CONTENT.strip(),
            "content_json": "{}",  # Réinitialiser le JSON pour forcer l'utilisation du HTML
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = await pages_collection.update_one(
            {"slug": "home"},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            print("✅ Page 'home' mise à jour avec succès!")
            print(f"   Nouveau contenu: {len(HOME_HTML_CONTENT)} caractères HTML")
            print(f"   + {len(HOME_CSS_CONTENT)} caractères CSS")
            print("\n🎉 La page home affichera maintenant le contenu riche dans l'éditeur")
            return True
        else:
            print("⚠️ Aucune modification effectuée (contenu déjà identique)")
            return True
            
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {e}")
        return False
    finally:
        client.close()

if __name__ == '__main__':
    print("=" * 70)
    print("🏠 MISE À JOUR DU CONTENU DE LA PAGE HOME")
    print("=" * 70)
    print()
    
    result = asyncio.run(update_home_page())
    
    if result:
        print("\n✅ Script terminé avec succès")
        print("🔍 Testez maintenant: https://israelgrowthventure.com/admin/pages/home")
        sys.exit(0)
    else:
        print("\n❌ Échec de la mise à jour")
        sys.exit(1)
