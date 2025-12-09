#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de vérification pages CMS - Phase 5
Vérifie que toutes les pages requises existent dans la collection pages MongoDB
"""

import os
import sys
import requests
from datetime import datetime

# Configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'https://igv-cms-backend.onrender.com')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'postmaster@israelgrowthventure.com')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Admin@igv2025#')

# Pages requises
REQUIRED_PAGES = [
    {'slug': 'home', 'path': '/', 'title_fr': 'Accueil - Israel Growth Venture'},
    {'slug': 'qui-sommes-nous', 'path': '/qui-sommes-nous', 'title_fr': 'Qui sommes-nous - IGV'},
    {'slug': 'packs', 'path': '/packs', 'title_fr': 'Nos Packs - IGV'},
    {'slug': 'le-commerce-de-demain', 'path': '/le-commerce-de-demain', 'title_fr': 'Le Commerce de Demain - IGV'},
    {'slug': 'contact', 'path': '/contact', 'title_fr': 'Contact - IGV'},
    {'slug': 'etude-implantation-360', 'path': '/etude-implantation-360', 'title_fr': 'Étude d\'Implantation IGV – Israël 360°'},
    {'slug': 'etude-implantation-360-merci', 'path': '/etude-implantation-360/merci', 'title_fr': 'Merci, nous vous recontactons...'},
]

def log(message, color='\033[0m'):
    """Log avec timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{color}[{timestamp}] {message}\033[0m")

def authenticate():
    """Authentification admin"""
    log("🔐 Authentification admin...", '\033[94m')
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        response.raise_for_status()
        token = response.json().get('access_token')
        log("✅ Authentification réussie", '\033[92m')
        return token
    except Exception as e:
        log(f"❌ Erreur authentification: {e}", '\033[91m')
        return None

def get_all_pages(token):
    """Récupérer toutes les pages CMS"""
    log("📄 Récupération pages CMS...", '\033[94m')
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/pages",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        response.raise_for_status()
        pages = response.json()
        log(f"📊 {len(pages)} pages trouvées", '\033[92m')
        return pages
    except Exception as e:
        log(f"❌ Erreur récupération pages: {e}", '\033[91m')
        return []

def verify_pages():
    """Vérifier présence de toutes les pages requises"""
    log("=" * 60, '\033[94m')
    log("VÉRIFICATION PAGES CMS - PHASE 5", '\033[94m')
    log("=" * 60, '\033[94m')
    log("")
    
    # Authentification
    token = authenticate()
    if not token:
        log("❌ Impossible de continuer sans authentification", '\033[91m')
        return False
    
    log("")
    
    # Récupérer pages existantes
    existing_pages = get_all_pages(token)
    existing_slugs = {page.get('slug') for page in existing_pages}
    
    log("")
    log("🔍 Vérification pages requises:", '\033[93m')
    log("-" * 60)
    
    missing_pages = []
    all_ok = True
    
    for required in REQUIRED_PAGES:
        slug = required['slug']
        if slug in existing_slugs:
            # Trouver la page
            page = next((p for p in existing_pages if p.get('slug') == slug), None)
            published = page.get('published', False) if page else False
            status_icon = "✅" if published else "⚠️"
            status_text = "OK" if published else "NON PUBLIÉE"
            color = '\033[92m' if published else '\033[93m'
            log(f"{status_icon} {slug} → {status_text}", color)
            if not published:
                all_ok = False
        else:
            log(f"❌ {slug} → MANQUANTE", '\033[91m')
            missing_pages.append(required)
            all_ok = False
    
    log("")
    log("=" * 60, '\033[94m')
    log("RÉSUMÉ", '\033[94m')
    log("=" * 60, '\033[94m')
    
    if all_ok:
        log("✅ Toutes les pages requises sont présentes et publiées !", '\033[92m')
        return True
    else:
        if missing_pages:
            log(f"❌ {len(missing_pages)} page(s) manquante(s):", '\033[91m')
            for page in missing_pages:
                log(f"   - {page['slug']} ({page['path']})", '\033[91m')
        log("⚠️ Action requise: exécuter init_cms_via_api.py", '\033[93m')
        return False

if __name__ == "__main__":
    success = verify_pages()
    sys.exit(0 if success else 1)
