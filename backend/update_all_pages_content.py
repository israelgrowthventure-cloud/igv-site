"""
Script pour mettre à jour le contenu de toutes les pages principales
====================================================================

Met à jour les pages: home, packs, about, contact
"""

import os
import sys
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Configuration MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/IGV-Cluster?appName=Cluster0')
DB_NAME = os.environ.get('DB_NAME', 'igv_cms_db')

# Note: Le contenu détaillé de home est dans update_home_content.py
# Ici on met à jour les autres pages avec un contenu minimal mais visible

PAGES_CONTENT = {
    "about-us": {
        "content_html": """
<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: 800;">À Propos d'IGV</h1>
    <p style="font-size: 22px; opacity: 0.95; line-height: 1.7;">Votre partenaire de confiance pour le développement en Israël</p>
  </div>
</section>

<section style="padding: 100px 20px; background: white;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <h2 style="font-size: 42px; margin-bottom: 32px; color: #1a202c; font-weight: 800;">Notre Mission</h2>
    <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 32px;">
      Israel Growth Venture accompagne les entreprises françaises et internationales dans leur développement en Israël. 
      Nous combinons une expertise locale approfondie avec une compréhension des enjeux business internationaux.
    </p>
    <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 32px;">
      Notre équipe pluridisciplinaire vous guide à chaque étape : de l'analyse de marché initiale jusqu'à l'opérationnel complet, 
      en passant par les aspects juridiques, fiscaux et RH.
    </p>
  </div>
</section>

<section style="padding: 100px 20px; background: #f7fafc;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <h2 style="text-align: center; font-size: 42px; margin-bottom: 80px; color: #1a202c; font-weight: 800;">Notre Expertise</h2>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px;">
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #0052CC; font-weight: 700;">🎯 Stratégie</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Analyse de marché, positionnement, identification des opportunités et élaboration de votre stratégie d'implantation.</p>
      </div>
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #0052CC; font-weight: 700;">⚖️ Juridique</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Constitution de société, contrats, propriété intellectuelle et conformité réglementaire locale.</p>
      </div>
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #0052CC; font-weight: 700;">🚀 Opérationnel</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Recherche de locaux, recrutement, mise en place des processus et démarrage des activités.</p>
      </div>
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <h3 style="font-size: 26px; margin-bottom: 16px; color: #0052CC; font-weight: 700;">🤝 Réseau</h3>
        <p style="color: #4a5568; line-height: 1.8; font-size: 16px;">Accès à notre réseau de partenaires, investisseurs et acteurs clés de l'écosystème israélien.</p>
      </div>
    </div>
  </div>
</section>

<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 80px 20px; text-align: center; color: white;">
  <div style="max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 42px; margin-bottom: 20px; font-weight: 800;">Travaillons Ensemble</h2>
    <p style="font-size: 20px; margin-bottom: 40px; opacity: 0.95;">Prêt à développer votre activité en Israël ?</p>
    <a href="/contact" style="display: inline-block; padding: 18px 48px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">Contactez-nous</a>
  </div>
</section>
""",
        "content_css": "",
    },
    "contact": {
        "content_html": """
<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: 800;">Contactez-Nous</h1>
    <p style="font-size: 22px; opacity: 0.95; line-height: 1.7;">Discutons de votre projet d'implantation en Israël</p>
  </div>
</section>

<section style="padding: 100px 20px; background: white;">
  <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px;">
    <div>
      <h2 style="font-size: 36px; margin-bottom: 32px; color: #1a202c; font-weight: 800;">Envoyez-nous un Message</h2>
      <form style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Nom complet *</label>
          <input type="text" placeholder="Jean Dupont" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; font-family: inherit;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Email *</label>
          <input type="email" placeholder="jean@entreprise.com" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; font-family: inherit;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Téléphone</label>
          <input type="tel" placeholder="+33 6 XX XX XX XX" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; font-family: inherit;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Entreprise</label>
          <input type="text" placeholder="Nom de votre entreprise" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; font-family: inherit;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Message *</label>
          <textarea placeholder="Décrivez votre projet..." rows="6" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; resize: vertical; font-family: inherit;"></textarea>
        </div>
        <button type="submit" style="padding: 18px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0,82,204,0.3);">Envoyer le message</button>
      </form>
    </div>
    
    <div>
      <h2 style="font-size: 36px; margin-bottom: 32px; color: #1a202c; font-weight: 800;">Nos Coordonnées</h2>
      
      <div style="background: #f7fafc; padding: 32px; border-radius: 16px; margin-bottom: 32px;">
        <h3 style="font-size: 20px; margin-bottom: 16px; color: #0052CC; font-weight: 700; display: flex; align-items: center; gap: 12px;">
          📧 Email
        </h3>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          <a href="mailto:contact@israelgrowthventure.com" style="color: #0052CC; text-decoration: none;">contact@israelgrowthventure.com</a>
        </p>
      </div>
      
      <div style="background: #f7fafc; padding: 32px; border-radius: 16px; margin-bottom: 32px;">
        <h3 style="font-size: 20px; margin-bottom: 16px; color: #0052CC; font-weight: 700; display: flex; align-items: center; gap: 12px;">
          📍 Localisation
        </h3>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          Tel Aviv, Israël<br>
          Paris, France
        </p>
      </div>
      
      <div style="background: #f7fafc; padding: 32px; border-radius: 16px;">
        <h3 style="font-size: 20px; margin-bottom: 16px; color: #0052CC; font-weight: 700; display: flex; align-items: center; gap: 12px;">
          ⏰ Disponibilité
        </h3>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
          Lundi - Vendredi: 9h - 18h<br>
          Réponse sous 24h
        </p>
      </div>
    </div>
  </div>
</section>

<section style="padding: 80px 20px; background: #f7fafc; text-align: center;">
  <div style="max-width: 900px; margin: 0 auto;">
    <h2 style="font-size: 36px; margin-bottom: 20px; color: #1a202c; font-weight: 800;">Vous Préférez Prendre Rendez-vous ?</h2>
    <p style="font-size: 18px; color: #718096; margin-bottom: 32px; line-height: 1.7;">
      Réservez un créneau pour un échange téléphonique ou en visioconférence avec notre équipe.
    </p>
    <a href="/appointment" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(0,82,204,0.3);">Prendre rendez-vous</a>
  </div>
</section>
""",
        "content_css": "",
    }
}

async def update_all_pages():
    """Met à jour le contenu de toutes les pages"""
    
    print("🔄 Connexion à MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    pages_collection = db.pages
    
    updated_count = 0
    failed_count = 0
    
    try:
        for slug, content_data in PAGES_CONTENT.items():
            print(f"\n📄 Traitement de la page '{slug}'...")
            
            # Chercher la page
            existing_page = await pages_collection.find_one({"slug": slug})
            
            if not existing_page:
                print(f"   ⚠️ Page '{slug}' non trouvée (sera créée lors de l'init)")
                failed_count += 1
                continue
            
            print(f"   ✅ Page trouvée (ID: {existing_page['_id']})")
            
            # Mettre à jour le contenu
            update_data = {
                "content_html": content_data["content_html"].strip(),
                "content_css": content_data.get("content_css", "").strip(),
                "content_json": "{}",
                "updated_at": datetime.now(timezone.utc)
            }
            
            result = await pages_collection.update_one(
                {"slug": slug},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                print(f"   ✅ Mise à jour réussie ({len(content_data['content_html'])} caractères)")
                updated_count += 1
            else:
                print(f"   ⚠️ Aucune modification (contenu identique)")
                updated_count += 1
        
        print(f"\n{'='*70}")
        print(f"✅ {updated_count} page(s) traitée(s) avec succès")
        if failed_count > 0:
            print(f"⚠️ {failed_count} page(s) non trouvée(s)")
        print(f"{'='*70}")
        
        return updated_count > 0
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    finally:
        client.close()

if __name__ == '__main__':
    print("=" * 70)
    print("📚 MISE À JOUR DU CONTENU DE TOUTES LES PAGES")
    print("=" * 70)
    print()
    
    result = asyncio.run(update_all_pages())
    
    if result:
        print("\n✅ Script terminé avec succès")
        print("🔍 Testez sur: https://israelgrowthventure.com/admin/pages/")
        sys.exit(0)
    else:
        print("\n❌ Échec de la mise à jour")
        sys.exit(1)
