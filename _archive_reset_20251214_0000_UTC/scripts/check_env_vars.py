#!/usr/bin/env python3
"""
Vérification variables d'environnement (PRESENT/ABSENT uniquement)
JAMAIS afficher les valeurs
"""
import os
import sys
import json
from datetime import datetime, timezone

REQUIRED_VARS = [
    "RENDER_API_KEY",  # Nécessaire pour déclencher déploiement
]

# Ces variables sont requises côté BACKEND PROD (Render) mais pas localement
BACKEND_PROD_VARS = [
    "MONGODB_URI",
    "JWT_SECRET",
]

OPTIONAL_VARS = [
    "CORS_ALLOWED_ORIGINS",
    "CMS_ADMIN_EMAIL",
    "CMS_ADMIN_PASSWORD",
    "CMS_JWT_SECRET",
    "UPLOAD_PROVIDER",
    "CRM_ADMIN_EMAIL",
    "CRM_ADMIN_PASSWORD",
    "CRM_ADMIN_NAME",
    "BOOTSTRAP_TOKEN",
    "RBAC_ENABLED",
    "MONETICO_MODE",
    "MONETICO_TPE",
    "MONETICO_SOCIETE",
    "MONETICO_KEY",
    "MONETICO_URL_PAIEMENT",
    "MONETICO_URL_RETOUR_OK",
    "MONETICO_URL_RETOUR_KO",
]

print("=" * 80)
print("VÉRIFICATION VARIABLES D'ENVIRONNEMENT")
print(f"Date UTC: {datetime.now(timezone.utc).isoformat()}")
print("=" * 80)
print()

missing_required = []
missing_optional = []
present_required = []
present_optional = []

print("Variables REQUISES:")
for var in REQUIRED_VARS:
    value = os.getenv(var)
    if value:
        print(f"  ✅ {var}: PRESENT")
        present_required.append(var)
    else:
        print(f"  ❌ {var}: ABSENT")
        missing_required.append(var)

print()
print("Variables BACKEND PRODUCTION (vérifiées côté Render, pas localement):")
for var in BACKEND_PROD_VARS:
    print(f"  ℹ️  {var}: Requis en PROD (Render Dashboard)")

print()
print("Variables OPTIONNELLES:")
for var in OPTIONAL_VARS:
    value = os.getenv(var)
    if value:
        print(f"  ✅ {var}: PRESENT")
        present_optional.append(var)
    else:
        print(f"  ⚠️  {var}: ABSENT")
        missing_optional.append(var)

print()
print("=" * 80)
print("RÉSUMÉ")
print("=" * 80)
print(f"Requises présentes: {len(present_required)}/{len(REQUIRED_VARS)}")
print(f"Optionnelles présentes: {len(present_optional)}/{len(OPTIONAL_VARS)}")

# Sauvegarder résultats (SANS valeurs)
result = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "required": {
        "present": present_required,
        "missing": missing_required,
    },
    "optional": {
        "present": present_optional,
        "missing": missing_optional,
    },
    "status": "OK" if not missing_required else "BLOCKED",
}

with open("scripts/env_check_result.json", "w") as f:
    json.dump(result, f, indent=2)

print()
if missing_required:
    print("❌ BLOCAGE: Variables requises manquantes")
    for var in missing_required:
        print(f"   - {var}")
    print()
    print("Action: Configurer ces variables dans l'environnement système ou Render Dashboard")
    sys.exit(1)
else:
    print("✅ Toutes les variables requises sont présentes")
    if missing_optional:
        print()
        print("⚠️  Certaines fonctionnalités seront limitées (variables optionnelles manquantes):")
        for var in missing_optional:
            print(f"   - {var}")
    sys.exit(0)
