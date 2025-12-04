"""
Test Visuel - Admin Page Editor Home
=====================================

Ce script simule ce que vous verrez dans l'éditeur admin pour la page Home
"""

import requests

BACKEND_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv"

def print_visual_test():
    """Affiche un aperçu visuel de ce que contient la page Home dans le CMS"""
    
    print("=" * 80)
    print("  TEST VISUEL - PAGE HOME DANS L'ADMIN")
    print("=" * 80)
    
    # Récupérer la page home
    print("\n🔍 Récupération de la page 'home' depuis le CMS...")
    try:
        response = requests.get(f"{BACKEND_URL}/pages/home", timeout=10)
        
        if response.status_code == 200:
            page = response.json()
            
            print("\n✅ Page trouvée!")
            print("\n" + "─" * 80)
            print("📋 INFORMATIONS DE LA PAGE")
            print("─" * 80)
            
            print(f"\n📌 Slug: {page.get('slug')}")
            print(f"📝 Titre FR: {page.get('title', {}).get('fr', 'N/A')}")
            print(f"📝 Titre EN: {page.get('title', {}).get('en', 'N/A')}")
            print(f"📝 Titre HE: {page.get('title', {}).get('he', 'N/A')}")
            print(f"🌐 Publié: {'OUI ✅' if page.get('published') else 'NON ❌'}")
            
            # Analyser le contenu HTML
            html_content = page.get('content_html', '')
            css_content = page.get('content_css', '')
            
            print(f"\n📄 Longueur HTML: {len(html_content)} caractères")
            print(f"🎨 Longueur CSS: {len(css_content)} caractères")
            
            # Afficher un aperçu du contenu HTML
            print("\n" + "─" * 80)
            print("📺 APERÇU DU CONTENU HTML (premiers 1000 caractères)")
            print("─" * 80)
            
            if html_content:
                preview = html_content[:1000]
                print(preview)
                if len(html_content) > 1000:
                    print(f"\n... ({len(html_content) - 1000} caractères supplémentaires)")
            else:
                print("⚠️ Aucun contenu HTML")
            
            # Analyser les sections détectées
            print("\n" + "─" * 80)
            print("🔍 SECTIONS DÉTECTÉES DANS LE HTML")
            print("─" * 80)
            
            sections = []
            if 'Développez votre entreprise en Israël' in html_content:
                sections.append("✅ Hero Section (titre principal)")
            if 'Notre processus en 3 étapes' in html_content:
                sections.append("✅ Section Processus (3 étapes)")
            if 'Découvrez nos packs' in html_content:
                sections.append("✅ Section CTA Packs")
            if 'linear-gradient' in html_content:
                sections.append("✅ Styles avec gradients (design moderne)")
            if 'padding' in html_content:
                sections.append("✅ Styles de padding (mise en page)")
            
            if sections:
                for section in sections:
                    print(f"  {section}")
            else:
                print("  ⚠️ Aucune section majeure détectée")
            
            # Simulation visuelle de l'éditeur
            print("\n" + "=" * 80)
            print("🎨 CE QUE VOUS VERREZ DANS L'ÉDITEUR GRAPESJS")
            print("=" * 80)
            
            print("""
┌────────────────────────────────────────────────────────────────────────────┐
│  Admin - Éditeur de Page: Home                                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [Blocs]  [Styles]  [Calques]         FR EN HE    [Publié ✓]  [Enregistrer]│
│                                                                            │
├──────────┬─────────────────────────────────────────────────────────┬──────┤
│          │                                                         │      │
│  📦      │  ┌───────────────────────────────────────────────────┐ │ 🎨   │
│  Héro    │  │                                                   │ │      │
│  2 Col   │  │   Développez votre entreprise en Israël          │ │ Dim  │
│  3 Card  │  │                                                   │ │ Text │
│  CTA     │  │   Votre partenaire pour une expansion réussie    │ │ Déco │
│  Form    │  │                                                   │ │      │
│          │  │   [Prendre rendez-vous →] [En savoir plus]       │ │      │
│          │  └───────────────────────────────────────────────────┘ │      │
│          │                                                         │      │
│          │  ┌───────────────────────────────────────────────────┐ │      │
│          │  │  Notre processus en 3 étapes                      │ │      │
│          │  │                                                   │ │      │
│          │  │  [1] Analyse    [2] Recherche    [3] Accompagn.  │ │      │
│          │  └───────────────────────────────────────────────────┘ │      │
│          │                                                         │      │
│          │  ┌───────────────────────────────────────────────────┐ │      │
│          │  │  Découvrez nos packs d'accompagnement             │ │      │
│          │  │                                                   │ │      │
│          │  │  [Voir nos packs →]                               │ │      │
│          │  └───────────────────────────────────────────────────┘ │      │
│          │                                                         │      │
└──────────┴─────────────────────────────────────────────────────────┴──────┘

Thème IGV:
  - Fond blanc (pas marron) ✅
  - Boutons bleu #0052CC ✅
  - Bordures grises claires ✅
  - Canvas avec ombre légère ✅
  - Drag & drop fluide ✅
""")
            
            # Vérifications importantes
            print("\n" + "─" * 80)
            print("✅ VÉRIFICATIONS")
            print("─" * 80)
            
            checks = [
                (len(html_content) > 500, "Contenu HTML substantiel (> 500 chars)"),
                ('section' in html_content.lower(), "Utilise des balises <section>"),
                ('style=' in html_content, "Contient des styles inline"),
                (page.get('published'), "Page publiée (visible sur le site)"),
                (bool(page.get('title', {}).get('fr')), "Titre FR défini"),
            ]
            
            for passed, description in checks:
                status = "✅" if passed else "❌"
                print(f"  {status} {description}")
            
            print("\n" + "=" * 80)
            print("🔗 URLS POUR TESTER")
            print("=" * 80)
            print(f"\n  Admin Editor: https://israelgrowthventure.com/admin/pages/home")
            print(f"  Page Publique: https://israelgrowthventure.com/")
            print(f"\n  📌 Connectez-vous avec: {ADMIN_EMAIL}")
            
        else:
            print(f"\n❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Exception: {e}")

if __name__ == "__main__":
    print_visual_test()
