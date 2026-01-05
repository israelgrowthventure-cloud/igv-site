"""
Analyser le contenu du PDF HE pour comprendre pourquoi il est vide
"""
import PyPDF2
import os

pdf_path = r"c:\Users\PC\AppData\Local\Temp\IGV_Mini_Analysis_TestBrand.pdf"

if not os.path.exists(pdf_path):
    print(f"❌ PDF non trouvé: {pdf_path}")
    exit(1)

print("=" * 80)
print("ANALYSE PDF MINI-ANALYSE HE")
print("=" * 80)

# Lire le PDF
with open(pdf_path, 'rb') as f:
    pdf_reader = PyPDF2.PdfReader(f)
    
    print(f"\n📄 Informations PDF:")
    print(f"   - Nombre de pages: {len(pdf_reader.pages)}")
    print(f"   - Taille fichier: {os.path.getsize(pdf_path)} bytes")
    
    # Extraire le texte de chaque page
    for i, page in enumerate(pdf_reader.pages):
        print(f"\n📄 PAGE {i+1}:")
        text = page.extract_text()
        
        if text and text.strip():
            print(f"   Longueur texte: {len(text)} caractères")
            print(f"   Premières lignes:")
            lines = text.split('\n')[:20]  # Premières 20 lignes
            for line in lines:
                if line.strip():
                    print(f"      {line[:100]}")
        else:
            print(f"   ⚠️ PAGE VIDE - Aucun texte extractible")
    
    # Métadonnées
    if pdf_reader.metadata:
        print(f"\n📋 Métadonnées:")
        for key, value in pdf_reader.metadata.items():
            print(f"   {key}: {value}")

print("\n" + "=" * 80)
print("DIAGNOSTIC:")
print("  - Si pages vides: problème génération contenu")
print("  - Si texte en carrés/boxes: problème police hébraïque")
print("  - Si seulement header: contenu analyse non ajouté")
print("=" * 80)
