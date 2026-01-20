"""
Script pour ajouter les templates email prédéfinis dans la base de données
et vérifier le module PROSPECTS
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://igv-cms-backend.onrender.com/api"
ADMIN_EMAIL = "postmaster@israelgrowthventure.com"
ADMIN_PASSWORD = "Admin@igv2025#"

# Login
print("="*70)
print("CRÉATION DES TEMPLATES EMAIL PRÉDÉFINIS")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

login_resp = requests.post(f"{BASE_URL}/admin/login", 
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)

if login_resp.status_code != 200:
    print(f"❌ Échec login: {login_resp.status_code}")
    exit(1)

TOKEN = login_resp.json().get("token") or login_resp.json().get("access_token")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
print("✅ Connecté")

# Vérifier templates existants
print("\n[1] Vérification des templates existants...")
templates_resp = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
existing_templates = []
if templates_resp.status_code == 200:
    existing_templates = templates_resp.json().get("templates", [])
    print(f"   Templates existants: {len(existing_templates)}")
    for t in existing_templates:
        print(f"   - {t.get('name')}: {t.get('subject')}")
else:
    print(f"   Erreur: {templates_resp.status_code}")

# Templates prédéfinis à créer
PREDEFINED_TEMPLATES = [
    {
        "name": "Premier contact - Demande d'information",
        "subject": "Votre projet d'expansion en Israël - Israel Growth Venture",
        "body": """Bonjour,

Suite à votre demande concernant votre projet d'expansion en Israël, je me permets de vous contacter.

Chez Israel Growth Venture, nous accompagnons les marques dans leur développement sur le marché israélien, de l'analyse préliminaire jusqu'à l'ouverture effective.

Je serais ravi d'échanger avec vous pour mieux comprendre vos objectifs et vous présenter nos solutions adaptées.

Seriez-vous disponible pour un appel le [DATE] à [HEURE] ?

Dans l'attente de votre retour,
Cordialement,

L'équipe Israel Growth Venture
contact@israelgrowthventure.com
+972 XX XXX XXXX""",
        "language": "fr"
    },
    {
        "name": "Suivi après analyse",
        "subject": "Votre mini-analyse IGV est prête",
        "body": """Bonjour,

Je vous remercie pour l'intérêt que vous portez au marché israélien.

Suite à votre demande, nous avons préparé une mini-analyse préliminaire de votre marque. Celle-ci vous donne un premier aperçu des opportunités et défis pour votre expansion en Israël.

Je vous propose d'en discuter ensemble lors d'un appel le [DATE] à [HEURE] afin de vous présenter les résultats et répondre à vos questions.

N'hésitez pas à me faire part de vos disponibilités.

Bien cordialement,

L'équipe Israel Growth Venture
contact@israelgrowthventure.com""",
        "language": "fr"
    },
    {
        "name": "Relance prospect",
        "subject": "Suite à notre échange - Israel Growth Venture",
        "body": """Bonjour,

Je me permets de revenir vers vous suite à notre précédent échange concernant votre projet d'expansion en Israël.

Avez-vous eu l'occasion de réfléchir à notre proposition ? Je reste à votre disposition pour répondre à toutes vos questions.

Si vous souhaitez planifier un nouvel échange, je suis disponible le [DATE] à [HEURE].

Dans l'attente de votre retour,
Cordialement,

L'équipe Israel Growth Venture
contact@israelgrowthventure.com""",
        "language": "fr"
    },
    {
        "name": "Proposition de rendez-vous",
        "subject": "Planifions un rendez-vous - Israel Growth Venture",
        "body": """Bonjour,

Je souhaite vous proposer un rendez-vous pour discuter de votre projet d'expansion en Israël.

Lors de cet échange, nous pourrons :
- Analyser ensemble le potentiel de votre marque sur le marché israélien
- Identifier les opportunités et les défis spécifiques
- Définir les prochaines étapes adaptées à vos objectifs

Je vous propose le [DATE] à [HEURE]. Cette date vous convient-elle ?

Si ce créneau ne vous convient pas, n'hésitez pas à me proposer d'autres disponibilités.

Cordialement,

L'équipe Israel Growth Venture
contact@israelgrowthventure.com
+972 XX XXX XXXX""",
        "language": "fr"
    }
]

# Créer les templates manquants
print("\n[2] Création des templates prédéfinis...")
existing_names = [t.get("name", "").lower() for t in existing_templates]

created_count = 0
for template in PREDEFINED_TEMPLATES:
    # Vérifier si déjà existant (par nom similaire)
    if template["name"].lower() in existing_names:
        print(f"   ⏭️  Existe déjà: {template['name']}")
        continue
    
    # Créer le template
    create_resp = requests.post(
        f"{BASE_URL}/crm/emails/templates",
        headers=HEADERS,
        json=template,
        timeout=30
    )
    
    if create_resp.status_code in [200, 201]:
        result = create_resp.json()
        print(f"   ✅ Créé: {template['name']} (ID: {result.get('template_id', 'N/A')})")
        created_count += 1
    else:
        print(f"   ❌ Échec: {template['name']} - {create_resp.status_code}: {create_resp.text[:100]}")

print(f"\n   Total créés: {created_count}")

# Vérifier le résultat
print("\n[3] Vérification finale des templates...")
templates_resp2 = requests.get(f"{BASE_URL}/crm/emails/templates", headers=HEADERS, timeout=30)
if templates_resp2.status_code == 200:
    final_templates = templates_resp2.json().get("templates", [])
    print(f"   Templates disponibles: {len(final_templates)}")
    for t in final_templates:
        body = t.get("body", "")
        has_date = "[DATE]" in body
        has_heure = "[HEURE]" in body
        print(f"   - {t.get('name')}")
        print(f"     Objet: {t.get('subject')}")
        print(f"     [DATE]: {'✅' if has_date else '❌'} | [HEURE]: {'✅' if has_heure else '❌'}")
else:
    print(f"   Erreur: {templates_resp2.status_code}")

print("\n" + "="*70)
print("TERMINÉ")
print("="*70)
