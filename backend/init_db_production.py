#!/usr/bin/env python3
"""
Script d'initialisation de la base MongoDB en production
=========================================================

⚠️  ATTENTION: Ce script crée des données dans la base de production
    via l'API backend existante.

PRÉREQUIS:
- Backend déployé et opérationnel sur https://igv-cms-backend.onrender.com
- Variables d'environnement configurées sur Render (MONGO_URL, JWT_SECRET, etc.)
- Connexion internet stable

CE QUE CE SCRIPT FAIT:
1. Crée/vérifie l'utilisateur admin (postmaster@israelgrowthventure.com)
2. Crée 3 packs de base (Analyse, Succursales, Franchise)
3. Crée 5 règles de pricing par zone (EU, US_CA, IL, ASIA_AFRICA, DEFAULT)

CE QUE CE SCRIPT NE FAIT PAS:
- Ne supprime PAS les données existantes (idempotent)
- Ne modifie PAS les données déjà présentes
- Ne crée PAS de pages CMS (à faire via l'interface /admin/pages)

EXÉCUTION:
    python init_db_production.py

APRÈS EXÉCUTION:
- Se connecter au CMS: https://israelgrowthventure.com/admin/login
- Email: postmaster@israelgrowthventure.com
- Password: Admin@igv

SÉCURITÉ:
- Les credentials admin sont hardcodés (à changer après première connexion)
- Utilise l'API publique (pas d'accès direct à MongoDB)
- Toutes les opérations sont loggées

"""
import requests
import json
from datetime import datetime

BACKEND_URL = "https://igv-cms-backend.onrender.com/api"

print("=" * 70)
print("🚀 INITIALISATION BASE DONNÉES IGV - PRODUCTION")
print("=" * 70)

# ÉTAPE 1: Créer l'utilisateur admin avec mot de passe connu
print("\n👤 ÉTAPE 1: Création utilisateur admin...")
admin_data = {
    "email": "postmaster@israelgrowthventure.com",
    "password": "Admin@igv"
}

try:
    # Essayer de se connecter d'abord
    response = requests.post(f"{BACKEND_URL}/auth/login", json=admin_data, timeout=30)
    if response.status_code == 200:
        print("✅ Admin existe déjà, connexion réussie")
        token = response.json()["access_token"]
    else:
        # Créer le compte
        response = requests.post(f"{BACKEND_URL}/auth/register", json={**admin_data, "role": "admin"}, timeout=30)
        if response.status_code == 200:
            print("✅ Admin créé avec succès")
            token = response.json()["access_token"]
        else:
            print(f"❌ Erreur création admin: {response.status_code}")
            print(response.text)
            exit(1)
except Exception as e:
    print(f"❌ Erreur réseau: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# ÉTAPE 2: Créer les 3 packs avec données complètes
print("\n📦 ÉTAPE 2: Création des 3 packs...")
packs = [
    {
        "name": {
            "fr": "Pack Analyse",
            "en": "Analysis Pack",
            "he": "חבילת ניתוח"
        },
        "description": {
            "fr": "Analyse complète du marché israélien",
            "en": "Complete analysis of the Israeli market",
            "he": "ניתוח מלא של השוק הישראלי"
        },
        "features": {
            "fr": [
                "Étude détaillée du marché israélien",
                "Analyse de la concurrence",
                "Identification des zones prioritaires",
                "Scénarios d'implantation"
            ],
            "en": [
                "Detailed Israeli market study",
                "Competitive analysis",
                "Priority zone identification",
                "Implementation scenarios"
            ],
            "he": [
                "מחקר מפורט של השוק הישראלי",
                "ניתוח תחרות",
                "זיהוי אזורי עדיפות",
                "תרחישי יישום"
            ]
        },
        "base_price": 3000,
        "currency": "EUR",
        "order": 0,
        "active": True
    },
    {
        "name": {
            "fr": "Pack Succursales",
            "en": "Branch Pack",
            "he": "חבילת סניפים"
        },
        "description": {
            "fr": "Ouverture de votre réseau de succursales",
            "en": "Opening your branch network",
            "he": "פתיחת רשת הסניפים שלך"
        },
        "features": {
            "fr": [
                "Localisation optimale des sites",
                "Recrutement et formation",
                "Support opérationnel",
                "Suivi des performances"
            ],
            "en": [
                "Optimal site location",
                "Recruitment and training",
                "Operational support",
                "Performance monitoring"
            ],
            "he": [
                "איתור מיקומים אופטימלי",
                "גיוס והדרכה",
                "תמיכה תפעולית",
                "מעקב ביצועים"
            ]
        },
        "base_price": 15000,
        "currency": "EUR",
        "order": 1,
        "active": True
    },
    {
        "name": {
            "fr": "Pack Franchise",
            "en": "Franchise Pack",
            "he": "חבילת זיכיון"
        },
        "description": {
            "fr": "Développement complet de votre réseau de franchise",
            "en": "Complete development of your franchise network",
            "he": "פיתוח מלא של רשת הזיכיון שלך"
        },
        "features": {
            "fr": [
                "Analyse franchise",
                "Structure contractuelle",
                "Recommandations légales",
                "Recherche franchisés"
            ],
            "en": [
                "Franchise analysis",
                "Contractual structure",
                "Legal recommendations",
                "Franchisee search"
            ],
            "he": [
                "ניתוח זיכיון",
                "מבנה חוזי",
                "המלצות משפטיות",
                "חיפוש זכיינים"
            ]
        },
        "base_price": 15000,
        "currency": "EUR",
        "order": 2,
        "active": True
    }
]

for pack in packs:
    try:
        response = requests.post(f"{BACKEND_URL}/packs", json=pack, headers=headers, timeout=30)
        if response.status_code == 200:
            print(f"✅ Pack créé: {pack['name']['fr']}")
        else:
            print(f"⚠️  Pack {pack['name']['fr']}: {response.status_code} (peut-être déjà existant)")
    except Exception as e:
        print(f"❌ Erreur pack {pack['name']['fr']}: {e}")

# ÉTAPE 3: Créer les règles de pricing par zone
print("\n💰 ÉTAPE 3: Création des règles de pricing...")
pricing_rules = [
    {
        "zone_name": "EU",
        "country_codes": ["FR", "DE", "IT", "ES", "PT", "BE", "NL", "LU", "AT", "CH", "GB", "IE", "DK", "SE", "NO", "FI"],
        "price": 3000,
        "currency": "EUR",
        "active": True
    },
    {
        "zone_name": "US_CA",
        "country_codes": ["US", "CA"],
        "price": 4000,
        "currency": "USD",
        "active": True
    },
    {
        "zone_name": "IL",
        "country_codes": ["IL"],
        "price": 7000,
        "currency": "ILS",
        "active": True
    },
    {
        "zone_name": "ASIA_AFRICA",
        "country_codes": ["CN", "JP", "KR", "IN", "SG", "ZA", "EG", "MA", "TH", "VN", "ID", "MY"],
        "price": 4000,
        "currency": "USD",
        "active": True
    },
    {
        "zone_name": "DEFAULT",
        "country_codes": [],
        "price": 3000,
        "currency": "EUR",
        "active": True
    }
]

for rule in pricing_rules:
    try:
        response = requests.post(f"{BACKEND_URL}/pricing-rules", json=rule, headers=headers, timeout=30)
        if response.status_code == 200:
            print(f"✅ Règle créée: {rule['zone_name']} - {rule['price']} {rule['currency']}")
        else:
            print(f"⚠️  Règle {rule['zone_name']}: {response.status_code} (peut-être déjà existante)")
    except Exception as e:
        print(f"❌ Erreur règle {rule['zone_name']}: {e}")

# ÉTAPE 4: Vérification finale
print("\n✅ ÉTAPE 4: Vérification finale...")
print("-" * 70)

try:
    # Vérifier packs
    response = requests.get(f"{BACKEND_URL}/packs", timeout=10)
    if response.status_code == 200:
        packs_data = response.json()
        print(f"📦 Packs disponibles: {len(packs_data)} packs")
    else:
        print(f"⚠️  Impossible de vérifier les packs: {response.status_code}")
except Exception as e:
    print(f"❌ Erreur vérification packs: {e}")

try:
    # Vérifier pricing rules
    response = requests.get(f"{BACKEND_URL}/pricing-rules", timeout=10)
    if response.status_code == 200:
        rules_data = response.json()
        print(f"💰 Règles de pricing: {len(rules_data)} règles")
    else:
        print(f"⚠️  Impossible de vérifier pricing rules: {response.status_code}")
except Exception as e:
    print(f"❌ Erreur vérification pricing: {e}")

print("\n" + "=" * 70)
print("🎉 INITIALISATION TERMINÉE")
print("=" * 70)
print("\n📝 PROCHAINES ÉTAPES:")
print("1. Accéder au CMS: https://israelgrowthventure.com/admin/login")
print("2. Email: postmaster@israelgrowthventure.com")
print("3. Password: Admin@igv")
print("4. Créer des pages dans /admin/pages")
print("5. Modifier les packs dans /admin/packs")
print("6. Configurer le pricing dans /admin/pricing")
print("\n✨ Le CMS Emergent est maintenant opérationnel !")
