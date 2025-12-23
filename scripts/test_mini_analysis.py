"""
Test local de l'endpoint /api/mini-analysis
Vérifie les 5 scénarios requis
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"  # Backend local
# BASE_URL = "https://igv-cms-backend.onrender.com"  # Production

def test_scenario(name, payload, expected_status=200, expected_error=None):
    """Test un scénario avec affichage des résultats"""
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}")
    print(f"Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(f"{BASE_URL}/api/mini-analysis", json=payload, timeout=60)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"✅ Status code correct ({expected_status})")
        else:
            print(f"❌ Status code incorrect (attendu: {expected_status}, reçu: {response.status_code})")
        
        data = response.json()
        print(f"\nRéponse: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}...")
        
        if expected_error and expected_status != 200:
            if expected_error.lower() in str(data.get('detail', '')).lower():
                print(f"✅ Message d'erreur correct")
            else:
                print(f"❌ Message d'erreur incorrect")
                print(f"   Attendu: {expected_error}")
                print(f"   Reçu: {data.get('detail')}")
        
        if response.status_code == 200:
            if 'analysis' in data and len(data['analysis']) > 100:
                print(f"✅ Analyse générée ({len(data['analysis'])} caractères)")
                print(f"\nExtrait de l'analyse:")
                print(data['analysis'][:300] + "...")
            else:
                print(f"❌ Analyse trop courte ou manquante")
        
        return response
        
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        return None


def main():
    print("="*60)
    print("TESTS DE L'ENDPOINT /api/mini-analysis")
    print("="*60)
    print(f"URL: {BASE_URL}")
    
    # TEST 1: Restauration Halal => Whitelist 2 (Arabe)
    test_scenario(
        "Test 1: Restauration Halal => Whitelist_2_Arabe_incl_Mixed",
        {
            "email": "test1@test.com",
            "nom_de_marque": "Kebab Express Test1",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Halal",
            "anciennete": "3-5 ans",
            "pays_dorigine": "France",
            "concept": "Fast-food kebab halal avec produits frais",
            "positionnement": "Milieu de gamme",
            "modele_actuel": "Franchise",
            "differenciation": "Recettes artisanales, viande 100% halal certifiée",
            "objectif_israel": "Expansion internationale, cibler la communauté arabe",
            "contraintes": "Certification halal obligatoire"
        }
    )
    
    time.sleep(2)
    
    # TEST 2: Restauration Casher => Whitelist 1 (Jewish)
    test_scenario(
        "Test 2: Restauration Casher => Whitelist_1_Jewish_incl_Mixed",
        {
            "email": "test2@test.com",
            "nom_de_marque": "Bagel Corner Test2",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Casher",
            "anciennete": "5-10 ans",
            "pays_dorigine": "USA",
            "concept": "Bagels et sandwiches casher",
            "positionnement": "Premium",
            "modele_actuel": "Succursales propres",
            "differenciation": "Recettes new-yorkaises authentiques, casher strict",
            "objectif_israel": "Marché naturel pour produits casher",
            "contraintes": "Certification casher Beth Din requise"
        }
    )
    
    time.sleep(2)
    
    # TEST 3: Retail non-food => Whitelist 1 (pas de statut alimentaire)
    test_scenario(
        "Test 3: Retail (hors food) => Whitelist_1_Jewish_incl_Mixed",
        {
            "email": "test3@test.com",
            "nom_de_marque": "Fashion House Test3",
            "secteur": "Retail (hors food)",
            "statut_alimentaire": "",
            "anciennete": "Plus de 10 ans",
            "pays_dorigine": "France",
            "concept": "Prêt-à-porter haut de gamme pour femmes",
            "positionnement": "Premium",
            "modele_actuel": "Franchise",
            "differenciation": "Design français, qualité européenne",
            "objectif_israel": "Clientèle aisée Tel Aviv et Jérusalem",
            "contraintes": "Adaptation tailles pour marché local"
        }
    )
    
    time.sleep(2)
    
    # TEST 4: Paramédical => Whitelist 1
    test_scenario(
        "Test 4: Paramédical / Santé => Whitelist_1_Jewish_incl_Mixed",
        {
            "email": "test4@test.com",
            "nom_de_marque": "Dental Care Test4",
            "secteur": "Paramédical / Santé",
            "statut_alimentaire": "",
            "anciennete": "1-3 ans",
            "pays_dorigine": "Allemagne",
            "concept": "Clinique dentaire moderne avec technologie laser",
            "positionnement": "Premium",
            "modele_actuel": "Succursales propres",
            "differenciation": "Équipement de pointe, protocoles allemands",
            "objectif_israel": "Marché porteur, forte demande en soins dentaires",
            "contraintes": "Équivalence diplômes, licence locale"
        }
    )
    
    time.sleep(2)
    
    # TEST 5: Anti-doublon => même nom_de_marque 2 fois => 409
    print(f"\n{'='*60}")
    print("TEST 5: Anti-doublon (même marque 2 fois)")
    print(f"{'='*60}")
    
    # Première demande (devrait passer)
    resp1 = test_scenario(
        "Test 5a: Première demande (Café Unique Test5)",
        {
            "email": "test5@test.com",
            "nom_de_marque": "Café Unique Test5",
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Aucun",
            "concept": "Coffee shop moderne"
        },
        expected_status=200
    )
    
    time.sleep(2)
    
    # Deuxième demande (devrait être bloquée - 409)
    resp2 = test_scenario(
        "Test 5b: Deuxième demande (même nom => 409)",
        {
            "email": "autre@email.com",  # Email différent mais même marque
            "nom_de_marque": "Café Unique Test5",  # Même nom
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Aucun"
        },
        expected_status=409,
        expected_error="déjà été générée"
    )
    
    # Variante: normalisation (avec accents, espaces, etc.)
    time.sleep(2)
    resp3 = test_scenario(
        "Test 5c: Variante normalisée (café unique test5 => 409)",
        {
            "email": "encore@autre.com",
            "nom_de_marque": "café  unique  test5",  # Minuscules + espaces multiples
            "secteur": "Restauration / Food",
            "statut_alimentaire": "Aucun"
        },
        expected_status=409,
        expected_error="déjà été générée"
    )
    
    print(f"\n{'='*60}")
    print("RÉSUMÉ DES TESTS")
    print(f"{'='*60}")
    print("""
Test 1 (Halal)      : Doit utiliser Whitelist_2_Arabe_incl_Mixed
Test 2 (Casher)     : Doit utiliser Whitelist_1_Jewish_incl_Mixed
Test 3 (Retail)     : Doit utiliser Whitelist_1_Jewish_incl_Mixed
Test 4 (Paramédical): Doit utiliser Whitelist_1_Jewish_incl_Mixed
Test 5 (Anti-doublon): Doit bloquer 2ème demande avec 409
    """)


if __name__ == "__main__":
    main()
