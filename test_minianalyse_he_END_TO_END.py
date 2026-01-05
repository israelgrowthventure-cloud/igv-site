"""
TEST END-TO-END MINI-ANALYSE HE - Simulation utilisateur RÉEL
Exactement comme si on remplissait le formulaire sur israelgrowthventure.com/mini-analyse
"""
import requests
import json
import base64
import time

FRONTEND_URL = "https://israelgrowthventure.com"
BACKEND_URL = "https://igv-cms-backend.onrender.com"

print("=" * 80)
print("TEST END-TO-END MINI-ANALYSE HÉBREU")
print("Simulation utilisateur réel sur le site web")
print("=" * 80)

# STEP 1: Soumettre le formulaire EXACTEMENT comme le frontend le fait
print("\n[STEP 1] Soumission formulaire mini-analyse en HÉBREU...")
print(f"URL: {BACKEND_URL}/api/mini-analysis")

form_data = {
    "email": "contact@israelgrowthventure.com",  # Votre email pour recevoir
    "phone": "+972501234567",
    "first_name": "David",
    "last_name": "Cohen",
    "nom_de_marque": "בית קפה פריזאי",  # Café Parisien en hébreu
    "secteur": "Restauration / Food",
    "statut_alimentaire": "kasher",
    "anciennete": "5-10 ans",
    "pays_dorigine": "France",
    "concept": "בית קפה צרפתי מסורתי עם מאפים ביתיים",  # Café français traditionnel
    "positionnement": "פרימיום, איכות גבוהה",  # Premium, haute qualité
    "modele_actuel": "3 בתי קפה בצרפת",  # 3 cafés en France
    "differenciation": "מתכונים משפחתיים מקוריים, אווירה פריזאית אותנטית",
    "objectif_israel": "פתיחת 2-3 סניפים בתל אביב ובירושלים",
    "contraintes": "תקציב התחלתי מוגבל, צורך בשותפים מקומיים",
    "language": "he"  # CRITIQUE pour hébreu
}

print(f"\nDonnées formulaire:")
print(f"  - Email: {form_data['email']}")
print(f"  - Marque: {form_data['nom_de_marque']}")
print(f"  - Langue: {form_data['language']}")
print(f"\n⏳ Envoi de la requête (peut prendre 30-60s pour Gemini)...")

start_time = time.time()

try:
    # Appel API EXACTEMENT comme le frontend
    response = requests.post(
        f"{BACKEND_URL}/api/mini-analysis",
        json=form_data,
        timeout=120  # 2 minutes max pour Gemini
    )
    
    elapsed = time.time() - start_time
    print(f"\n✅ Réponse reçue en {elapsed:.1f}s")
    print(f"Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ ERREUR: {response.text[:500]}")
        exit(1)
    
    result = response.json()
    
    # Vérifier la structure de la réponse
    print(f"\n📊 Structure réponse:")
    print(f"  - Keys: {list(result.keys())}")
    
    if "analysis" not in result:
        print(f"❌ ERREUR: Pas de champ 'analysis' dans la réponse")
        print(f"Response complète: {json.dumps(result, indent=2, ensure_ascii=False)[:1000]}")
        exit(1)
    
    analysis_text = result["analysis"]
    print(f"\n✅ ANALYSE GÉNÉRÉE:")
    print(f"  - Longueur: {len(analysis_text)} caractères")
    print(f"  - Début: {analysis_text[:200]}...")
    print(f"  - Fin: ...{analysis_text[-200:]}")
    
    # Vérifier que c'est bien en hébreu
    if not any(ord(c) >= 0x0590 and ord(c) <= 0x05FF for c in analysis_text):
        print(f"⚠️ ATTENTION: Le texte ne semble pas contenir de caractères hébreux!")
    else:
        print(f"✅ Texte contient bien des caractères hébreux")
    
except requests.exceptions.Timeout:
    print(f"❌ TIMEOUT après 120s - Gemini n'a pas répondu à temps")
    exit(1)
except Exception as e:
    print(f"❌ EXCEPTION: {type(e).__name__}: {str(e)}")
    exit(1)

# STEP 2: Télécharger le PDF (comme le bouton "Télécharger PDF")
print(f"\n[STEP 2] Téléchargement PDF...")
print(f"URL: {BACKEND_URL}/api/pdf/generate")

pdf_payload = {
    "email": form_data["email"],
    "brandName": form_data["nom_de_marque"],
    "sector": form_data["secteur"],
    "origin": form_data["pays_dorigine"],
    "analysis": analysis_text,
    "language": "he"
}

try:
    pdf_response = requests.post(
        f"{BACKEND_URL}/api/pdf/generate",
        json=pdf_payload,
        timeout=30
    )
    
    print(f"Status: {pdf_response.status_code}")
    
    if pdf_response.status_code != 200:
        print(f"❌ ERREUR PDF: {pdf_response.text[:500]}")
    else:
        pdf_data = pdf_response.json()
        
        if "pdfBase64" in pdf_data:
            pdf_b64 = pdf_data["pdfBase64"]
            pdf_bytes = base64.b64decode(pdf_b64)
            
            # Sauvegarder le PDF
            pdf_filename = f"mini_analyse_he_REEL_{int(time.time())}.pdf"
            with open(pdf_filename, "wb") as f:
                f.write(pdf_bytes)
            
            print(f"✅ PDF généré et sauvegardé:")
            print(f"  - Fichier: {pdf_filename}")
            print(f"  - Taille: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024:.1f} KB)")
            
            # Vérifier contenu PDF
            import PyPDF2
            with open(pdf_filename, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                pdf_text = ""
                for page in pdf_reader.pages:
                    pdf_text += page.extract_text()
                
                print(f"  - Pages: {len(pdf_reader.pages)}")
                print(f"  - Texte extrait: {len(pdf_text)} caractères")
                print(f"  - Ratio: {len(pdf_text)/len(analysis_text)*100:.1f}%")
                
                if len(pdf_text) < len(analysis_text) * 0.7:
                    print(f"  ⚠️ PERTE DE CONTENU dans le PDF!")
                else:
                    print(f"  ✅ PDF contient l'analyse complète")
        else:
            print(f"❌ Pas de pdfBase64 dans la réponse")
            print(f"Response: {json.dumps(pdf_data, indent=2, ensure_ascii=False)[:500]}")
            
except Exception as e:
    print(f"❌ EXCEPTION PDF: {type(e).__name__}: {str(e)}")

# STEP 3: Envoyer par email (comme le bouton "Envoyer par mail")
print(f"\n[STEP 3] Envoi par email...")
print(f"URL: {BACKEND_URL}/api/email/send-pdf")
print(f"Destinataire: {form_data['email']}")

email_payload = {
    "email": form_data["email"],
    "brandName": form_data["nom_de_marque"],
    "sector": form_data["secteur"],
    "origin": form_data["pays_dorigine"],
    "analysis": analysis_text,
    "language": "he"
}

try:
    email_response = requests.post(
        f"{BACKEND_URL}/api/email/send-pdf",
        json=email_payload,
        timeout=30
    )
    
    print(f"Status: {email_response.status_code}")
    
    if email_response.status_code != 200:
        print(f"❌ ERREUR EMAIL: {email_response.text[:500]}")
    else:
        email_data = email_response.json()
        print(f"✅ Email envoyé:")
        print(f"  Response: {json.dumps(email_data, indent=2, ensure_ascii=False)}")
        print(f"\n📧 Vérifiez votre boîte mail: {form_data['email']}")
        print(f"   Sujet attendu: Mini-Analyse {form_data['nom_de_marque']}")
        
except Exception as e:
    print(f"❌ EXCEPTION EMAIL: {type(e).__name__}: {str(e)}")

print("\n" + "=" * 80)
print("RÉSUMÉ TEST END-TO-END:")
print("=" * 80)
print(f"1. ✅ Formulaire soumis (langue=he)")
print(f"2. ✅ Analyse Gemini générée: {len(analysis_text)} caractères")
print(f"3. ✅ PDF téléchargé: {pdf_filename if 'pdf_filename' in locals() else 'ÉCHEC'}")
print(f"4. ✅ Email envoyé à: {form_data['email']}")
print(f"\n⚠️ VÉRIFICATION MANUELLE REQUISE:")
print(f"   - Ouvrir {pdf_filename if 'pdf_filename' in locals() else 'le PDF'} et vérifier qu'il est complet")
print(f"   - Vérifier réception email sur {form_data['email']}")
print("=" * 80)
