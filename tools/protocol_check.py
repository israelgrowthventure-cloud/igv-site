#!/usr/bin/env python3
"""
Protocol Check Script - Vérifie que le protocole de mission est en place
Version: 1.0
"""

import os
import sys
from pathlib import Path

# Configuration
PROTOCOL_VERSION = "1.0"
REQUIRED_FILES = [
    "START_HERE.md",
    "MISSION_PROTOCOL.md",
    "ACCEPTANCE_TESTS.md"
]

# Règles obligatoires dans MISSION_PROTOCOL.md
REQUIRED_RULES = [
    "Interdiction de \"Fini\" Sans Validation",
    "Zéro Blabla",
    "Un Changement = Un Test = Une Preuve",
    "Clés i18n Visibles ou Redirection Home = BUG BLOQUANT",
    "Pas de Démo Vide",
    "Toute Modification Sensible Doit Être Explicitée",
    "Test Sur Domaine Production Obligatoire",
    "Fin de Mission = Bloc Validation + Preuves",
    "Échec = Cause + Correctif + Re-test + Preuve",
    "\"Terminé\" = Tous les Tests Passent"
]

def check_file_exists(filename):
    """Vérifie qu'un fichier existe à la racine du projet"""
    filepath = Path(filename)
    if not filepath.exists():
        print(f"❌ ERREUR: Fichier manquant - {filename}")
        return False
    print(f"✅ Fichier présent - {filename}")
    return True

def check_mission_protocol():
    """Vérifie que MISSION_PROTOCOL.md contient les 10 règles"""
    filepath = Path("MISSION_PROTOCOL.md")
    
    if not filepath.exists():
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    missing_rules = []
    for i, rule in enumerate(REQUIRED_RULES, 1):
        # Recherche flexible (juste vérifier que le concept est présent)
        if rule.lower() not in content.lower():
            missing_rules.append(f"Règle {i}: {rule}")
    
    if missing_rules:
        print(f"❌ MISSION_PROTOCOL.md incomplet - Règles manquantes:")
        for rule in missing_rules:
            print(f"   - {rule}")
        return False
    
    print(f"✅ MISSION_PROTOCOL.md contient les 10 règles obligatoires")
    return True

def check_acceptance_tests():
    """Vérifie que ACCEPTANCE_TESTS.md contient les 5 tests"""
    filepath = Path("ACCEPTANCE_TESTS.md")
    
    if not filepath.exists():
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    required_tests = [
        "Test 1: Login Admin",
        "Test 2: Créer un Lead",
        "Test 3: Ouvrir Fiche Lead",
        "Test 4: Changer Stage Pipeline",
        "Test 5: Créer Utilisateur"
    ]
    
    missing_tests = []
    for test in required_tests:
        if test.lower() not in content.lower():
            missing_tests.append(test)
    
    if missing_tests:
        print(f"❌ ACCEPTANCE_TESTS.md incomplet - Tests manquants:")
        for test in missing_tests:
            print(f"   - {test}")
        return False
    
    print(f"✅ ACCEPTANCE_TESTS.md contient les 5 tests obligatoires")
    return True

def main():
    """Point d'entrée principal"""
    print("=" * 60)
    print("PROTOCOL CHECK - Vérification du protocole de mission")
    print("=" * 60)
    print()
    
    all_checks_passed = True
    
    # Vérification 1: Fichiers requis
    print("📁 Vérification des fichiers requis...")
    for filename in REQUIRED_FILES:
        if not check_file_exists(filename):
            all_checks_passed = False
    print()
    
    # Vérification 2: Contenu MISSION_PROTOCOL.md
    print("📋 Vérification du contenu MISSION_PROTOCOL.md...")
    if not check_mission_protocol():
        all_checks_passed = False
    print()
    
    # Vérification 3: Contenu ACCEPTANCE_TESTS.md
    print("✅ Vérification du contenu ACCEPTANCE_TESTS.md...")
    if not check_acceptance_tests():
        all_checks_passed = False
    print()
    
    # Résultat final
    print("=" * 60)
    if all_checks_passed:
        print(f"✅ PROTOCOL_OK — protocol_version={PROTOCOL_VERSION} — files_read={', '.join(REQUIRED_FILES)}")
        print("=" * 60)
        print()
        print("Le protocole est correctement en place.")
        print("Toutes les missions futures doivent commencer par la ligne PROTOCOL_OK.")
        return 0
    else:
        print("❌ PROTOCOL_FAILED - Le protocole n'est pas complet")
        print("=" * 60)
        print()
        print("Veuillez corriger les erreurs ci-dessus avant de continuer.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
