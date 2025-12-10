#!/usr/bin/env python3
"""
Script de mise à jour des textes FR des 3 packs
Phase 7 - Correction textes packs uniquement
"""

import os
import sys
from datetime import datetime, timezone
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Configuration MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://igv_user:Juk5QisC96uxV8jR@cluster0.p8ocuik.mongodb.net/')
DB_NAME = os.environ.get('DB_NAME', 'IGV-Cluster')

# Nouveaux textes FR des packs (EXACTEMENT comme spécifié)
PACKS_FR_TEXT_UPDATE = {
    'ef20d489-26da-434a-8d9d-efef73e79c82': {  # Pack Analyse
        'description_fr': "Analyse complète du marché israélien pour jusqu'à 3 ouvertures de magasins",
        'features_fr': [
            "Étude de marché approfondie",
            "Analyse de la concurrence",
            "Identification des opportunités",
            "Recommandations stratégiques",
            "Support jusqu'à 3 ouvertures"
        ]
    },
    '3405147e-66a5-4555-a351-35302e6df396': {  # Pack Succursales
        'description_fr': "Solution complète pour l'ouverture de succursales en Israël",
        'features_fr': [
            "Analyse de marché incluse",
            "Recherche de locaux commerciaux",
            "Support administratif et légal",
            "Accompagnement à l'ouverture",
            "Suivi post-ouverture"
        ]
    },
    'f2b9af76-bc62-4a4d-91b4-b004483e828b': {  # Pack Franchise
        'description_fr': "Développement complet de votre réseau de franchise",
        'features_fr': [
            "Analyse de marché incluse",
            "Structuration du dossier franchise",
            "Recherche de franchisés",
            "Formation et accompagnement",
            "Support continu"
        ]
    }
}

async def update_packs_fr_texts():
    """Mise à jour des textes FR des packs dans MongoDB"""
    
    print(f"🔄 Connexion à MongoDB ({DB_NAME})...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    packs_collection = db['packs']
    
    updated_count = 0
    
    for pack_id, new_texts in PACKS_FR_TEXT_UPDATE.items():
        print(f"\n📦 Mise à jour {pack_id}...")
        
        # Récupérer le pack actuel
        pack = await packs_collection.find_one({'id': pack_id})
        
        if not pack:
            print(f"  ⚠️  Pack {pack_id} non trouvé dans la base")
            continue
        
        # Afficher l'ancien texte
        old_desc = pack.get('description', {}).get('fr', 'N/A')
        old_features = pack.get('features', {}).get('fr', [])
        print(f"  📝 Ancien:")
        print(f"     Description: {old_desc}")
        print(f"     Features: {len(old_features)} items")
        
        # Préparer la mise à jour
        update_data = {
            'description.fr': new_texts['description_fr'],
            'features.fr': new_texts['features_fr'],
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Mettre à jour
        result = await packs_collection.update_one(
            {'id': pack_id},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            print(f"  ✅ Textes FR mis à jour")
            print(f"     Nouvelle description: {new_texts['description_fr']}")
            print(f"     Nouveaux features: {len(new_texts['features_fr'])} items")
            updated_count += 1
        else:
            print(f"  ℹ️  Aucune modification (textes déjà à jour)")
    
    client.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Mise à jour terminée : {updated_count}/3 packs modifiés")
    print(f"{'='*60}\n")
    
    return updated_count

if __name__ == '__main__':
    try:
        count = asyncio.run(update_packs_fr_texts())
        sys.exit(0 if count > 0 else 1)
    except Exception as e:
        print(f"❌ Erreur : {e}")
        sys.exit(1)
