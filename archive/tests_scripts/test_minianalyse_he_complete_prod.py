"""
TEST COMPLET MINI-ANALYSE HE EN PRODUCTION
VRAIE demande Gemini + Télécharger PDF + Envoyer Email
PREUVES COMPLÈTES OBLIGATOIRES
"""
import requests
import json
import base64
import time
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com"
EMAIL_DESTINATAIRE = "contact@israelgrowthventure.com"

print("=" * 80)
print("TEST MINI-ANALYSE HE - VRAIE DEMANDE GEMINI + PDF + EMAIL")
print(f"Date: {datetime.now().isoformat()}")
print("=" * 80)

# ============================================================================
# ÉTAPE 1: GÉNÉRATION MINI-ANALYSE AVEC GEMINI (vraie demande complète)
# ============================================================================
print("\n[ÉTAPE 1] Génération mini-analyse avec Gemini (HE)...")
print("-" * 80)

mini_analysis_payload = {
    "email": EMAIL_DESTINATAIRE,
    "phone": "+972501234567",
    "first_name": "דוד",  # David en hébreu
    "last_name": "כהן",  # Cohen en hébreu
    "nom_de_marque": "בית קפה פריזאי",  # Café Parisien en hébreu
    "secteur": "Restauration / Food",
    "statut_alimentaire": "Casher",
    "anciennete": "5-10 ans",
    "pays_dorigine": "France",
    "concept": "בית קפה צרפתי מסורתי עם מאפים ביתיים, קפה איכותי ואווירה פריזאית אותנטית",  # Concept en hébreu
    "positionnement": "פרימיום, איכות גבוהה, חוויה צרפתית אמיתית",  # Positionnement en hébreu
    "modele_actuel": "2 סניפים בפריז, רשת קטנה",  # Modèle actuel
    "differenciation": "מאפים טריים מדי בוקר, מתכונים משפחתיים, שירות אישי",  # Différenciation
    "objectif_israel": "פתיחת 3-5 סניפים בתל אביב ובירושלים בשנתיים הקרובות",  # Objectif
    "contraintes": "חובה לשמור על כשרות, מציאת ספקים מקומיים איכותיים",  # Contraintes
    "language": "he"
}

print(f"\n📝 Payload de la demande:")
print(f"   Marque: {mini_analysis_payload['nom_de_marque']}")
print(f"   Secteur: {mini_analysis_payload['secteur']}")
print(f"   Langue: {mini_analysis_payload['language']}")
print(f"   Email: {mini_analysis_payload['email']}")

start_time = time.time()

try:
    analysis_response = requests.post(
        f"{BACKEND_URL}/api/mini-analysis",
        json=mini_analysis_payload,
        timeout=60  # Gemini peut prendre du temps
    )
    
    duration = time.time() - start_time
    
    print(f"\n📡 Réponse API:")
    print(f"   Status: {analysis_response.status_code}")
    print(f"   Durée: {duration:.2f}s")
    print(f"   Headers:")
    for key, value in analysis_response.headers.items():
        if key.startswith('X-IGV'):
            print(f"     {key}: {value}")
    
    if analysis_response.status_code == 200:
        analysis_data = analysis_response.json()
        
        # Extraire l'analyse
        analysis_text = analysis_data.get("analysis", "")
        
        print(f"\n✅ ANALYSE GÉNÉRÉE PAR GEMINI:")
        print(f"   Longueur: {len(analysis_text)} caractères")
        print(f"   Premières 500 caractères:")
        print(f"   {analysis_text[:500]}")
        print(f"   ...")
        print(f"   Dernières 300 caractères:")
        print(f"   {analysis_text[-300:]}")
        
        if len(analysis_text) < 500:
            print(f"\n   ⚠️ ATTENTION: Analyse trop courte! Attendu > 1000 caractères")
        
    else:
        print(f"\n❌ ÉCHEC génération analyse")
        print(f"   Response: {analysis_response.text[:500]}")
        exit(1)
        
except Exception as e:
    print(f"\n❌ EXCEPTION: {type(e).__name__}: {str(e)}")
    exit(1)

# ============================================================================
# ÉTAPE 2: TÉLÉCHARGER PDF
# ============================================================================
print("\n" + "=" * 80)
print("[ÉTAPE 2] Télécharger PDF...")
print("-" * 80)

pdf_payload = {
    "email": mini_analysis_payload["email"],
    "brandName": mini_analysis_payload["nom_de_marque"],
    "sector": mini_analysis_payload["secteur"],
    "origin": mini_analysis_payload["pays_dorigine"],
    "analysis": analysis_text,
    "language": "he"
}

try:
    pdf_response = requests.post(
        f"{BACKEND_URL}/api/pdf/generate",
        json=pdf_payload,
        timeout=30
    )
    
    print(f"\n📡 Réponse API PDF:")
    print(f"   Status: {pdf_response.status_code}")
    
    if pdf_response.status_code == 200:
        pdf_data = pdf_response.json()
        
        if "pdfBase64" in pdf_data:
            pdf_b64 = pdf_data["pdfBase64"]
            pdf_bytes = base64.b64decode(pdf_b64)
            
            # Sauvegarder le PDF
            pdf_filename = f"mini_analyse_he_prod_{int(time.time())}.pdf"
            with open(pdf_filename, "wb") as f:
                f.write(pdf_bytes)
            
            print(f"\n✅ PDF GÉNÉRÉ:")
            print(f"   Taille: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024:.1f} KB)")
            print(f"   Fichier: {pdf_filename}")
            print(f"   Base64 longueur: {len(pdf_b64)} caractères")
            
            # Vérifier contenu PDF
            import PyPDF2
            with open(pdf_filename, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                total_text = ""
                for page in pdf_reader.pages:
                    total_text += page.extract_text()
                
                print(f"\n   📄 Contenu PDF extrait:")
                print(f"      Pages: {len(pdf_reader.pages)}")
                print(f"      Texte total: {len(total_text)} caractères")
                print(f"      Ratio analyse/PDF: {len(total_text)}/{len(analysis_text)} = {len(total_text)/len(analysis_text)*100:.1f}%")
                
                if len(total_text) < 500:
                    print(f"      ❌ PDF QUASI VIDE!")
                else:
                    print(f"      ✅ PDF contient du contenu")
        else:
            print(f"\n❌ Pas de pdfBase64 dans la réponse")
            print(f"   Response: {json.dumps(pdf_data, indent=2, ensure_ascii=False)[:300]}")
            exit(1)
    else:
        print(f"\n❌ ÉCHEC génération PDF")
        print(f"   Response: {pdf_response.text[:500]}")
        exit(1)
        
except Exception as e:
    print(f"\n❌ EXCEPTION PDF: {type(e).__name__}: {str(e)}")
    exit(1)

# ============================================================================
# ÉTAPE 3: ENVOYER EMAIL
# ============================================================================
print("\n" + "=" * 80)
print("[ÉTAPE 3] Envoyer email avec PDF...")
print("-" * 80)

email_payload = {
    "email": EMAIL_DESTINATAIRE,
    "brandName": mini_analysis_payload["nom_de_marque"],
    "sector": mini_analysis_payload["secteur"],
    "origin": mini_analysis_payload["pays_dorigine"],
    "analysis": analysis_text,
    "language": "he"
}

try:
    email_response = requests.post(
        f"{BACKEND_URL}/api/email/send-pdf",
        json=email_payload,
        timeout=30
    )
    
    print(f"\n📡 Réponse API Email:")
    print(f"   Status: {email_response.status_code}")
    
    if email_response.status_code == 200:
        email_data = email_response.json()
        print(f"\n✅ EMAIL ENVOYÉ:")
        print(f"   Response: {json.dumps(email_data, indent=2, ensure_ascii=False)}")
        print(f"   Destinataire: {EMAIL_DESTINATAIRE}")
        print(f"   Sujet: Mini-Analyse {mini_analysis_payload['nom_de_marque']}")
    else:
        print(f"\n❌ ÉCHEC envoi email")
        print(f"   Response: {email_response.text[:500]}")
        exit(1)
        
except Exception as e:
    print(f"\n❌ EXCEPTION EMAIL: {type(e).__name__}: {str(e)}")
    exit(1)

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
print("\n" + "=" * 80)
print("RÉSUMÉ FINAL - MINI-ANALYSE HE EN PRODUCTION")
print("=" * 80)

print(f"\n✅ [1] GÉNÉRATION GEMINI:")
print(f"    - Status: {analysis_response.status_code}")
print(f"    - Analyse: {len(analysis_text)} caractères")
print(f"    - Durée: {duration:.2f}s")

print(f"\n✅ [2] PDF DOWNLOAD:")
print(f"    - Status: {pdf_response.status_code}")
print(f"    - Taille: {len(pdf_bytes)} bytes")
print(f"    - Fichier: {pdf_filename}")
print(f"    - Contenu PDF: {len(total_text)} caractères")

print(f"\n✅ [3] EMAIL ENVOI:")
print(f"    - Status: {email_response.status_code}")
print(f"    - Destinataire: {EMAIL_DESTINATAIRE}")

if all([
    analysis_response.status_code == 200,
    pdf_response.status_code == 200,
    email_response.status_code == 200,
    len(analysis_text) > 500,
    len(total_text) > 500
]):
    print(f"\n🎉 SUCCÈS COMPLET - MINI-ANALYSE HE FONCTIONNE!")
    print(f"   - Gemini génère bien une analyse complète en hébreu")
    print(f"   - PDF téléchargeable et contient l'analyse")
    print(f"   - Email envoyé avec succès")
else:
    print(f"\n❌ PROBLÈMES DÉTECTÉS:")
    if len(analysis_text) < 500:
        print(f"   - Analyse trop courte")
    if len(total_text) < 500:
        print(f"   - PDF quasi vide")

print("\n" + "=" * 80)
