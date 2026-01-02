import requests
import time

print("\n" + "="*70)
print(" VALIDATION FINALE - MINI-ANALYSE IGV ".center(70))
print("="*70 + "\n")

timestamp = int(time.time())
data = {
    "nom_de_marque": f"Final Test {timestamp}",
    "secteur": "Restauration",
    "statut_alimentaire": "Kasher",
    "email": "israel.growth.venture@gmail.com",
    "telephone": "+972501234567",
    "first_name": "Final",
    "last_name": "Test",
    "emplacements_possibles": "Tel Aviv",
    "autres_activites": "Traiteur",
    "public_cible": "Familles",
    "language": "fr"
}

print("Test mini-analyse en production...")
r = requests.post("https://igv-cms-backend.onrender.com/api/mini-analysis", json=data)

print(f"\nStatus: {r.status_code}")
if r.status_code == 200:
    result = r.json()
    print(f"\n{'='*70}")
    print(" RESULTATS ".center(70))
    print(f"{'='*70}")
    print(f"\n1. Mini-analyse generee:      {'OUI' if result.get('success') else 'NON'}")
    print(f"2. Lead CRM cree:              {'OUI' if result.get('lead_id') else 'NON'}")
    print(f"   - Lead ID: {result.get('lead_id')}")
    print(f"3. PDF genere:                 {'OUI' if result.get('pdf_url') else 'NON'}")
    print(f"4. Email envoye:               {'OUI' if result.get('email_sent') else 'NON'}")
    print(f"   - Status: {result.get('email_status')}")
    print(f"\n5. Analyse (150 chars):")
    print(f"   {result.get('analysis', '')[:150]}...")
    
    # Login admin pour vérifier lead
    print(f"\n{'='*70}")
    print(" VERIFICATION CRM ".center(70))
    print(f"{'='*70}\n")
    
    login = requests.post("https://igv-cms-backend.onrender.com/api/admin/login", json={
        "email": "postmaster@israelgrowthventure.com",
        "password": "Admin@igv2025#"
    })
    
    if login.status_code == 200:
        token = login.json()["access_token"]
        lead_id = result.get('lead_id')
        
        if lead_id:
            lead = requests.get(
                f"https://igv-cms-backend.onrender.com/api/crm/leads/{lead_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if lead.status_code == 200:
                lead_data = lead.json()
                print(f"Lead recupere depuis CRM:")
                print(f"- Nom: {lead_data.get('name')}")
                print(f"- Email: {lead_data.get('email')}")
                print(f"- Analyse stockee: {'OUI' if lead_data.get('analysis') else 'NON'}")
                print(f"- Chemin CRM: israelgrowthventure.com/admin/crm/leads")
                print(f"              > Rechercher '{lead_data.get('email')}'")
                
    print(f"\n{'='*70}")
    print(" VALIDATION GLOBALE ".center(70))
    print(f"{'='*70}\n")
    
    all_ok = all([
        result.get('success'),
        result.get('lead_id'),
        result.get('pdf_url'),
        result.get('email_sent'),
        result.get('analysis')
    ])
    
    if all_ok:
        print("   OUI - TOUTES LES FONCTIONNALITES OK ".center(70, "="))
        print("\n   MISSION REUSSIE ".center(70))
    else:
        print("NON - Verifications supplementaires requises".center(70))
        
else:
    print(f"Erreur: {r.json()}")

print("\n" + "="*70 + "\n")
