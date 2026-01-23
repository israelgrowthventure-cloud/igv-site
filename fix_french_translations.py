#!/usr/bin/env python3
"""Fix all French translation encoding issues and add missing keys"""

import json
import re
import os

# Path to French translations
FR_PATH = r"C:\Users\PC\Desktop\IGV\igv-frontend\src\i18n\locales\fr.json"

# Mapping of corrupted characters to correct ones
ENCODING_FIXES = {
    'ֳ©': 'é',
    'ֳ¨': 'è',
    'ֳ´': 'ô',
    'ֳ ': 'à',
    'ֳ»': 'û',
    'ֳ¢': 'â',
    'ֳ®': 'î',
    'ֳ¯': 'ï',
    'ֳ¼': 'ü',
    'ֳ§': 'ç',
    'ֳ×': 'ê',
    'ג†': 'Ê',
    'ֳ‰': 'É',
    'ג"': 'Ô',
    'ֳ€': 'À',
    'à©': 'é',
    'à¨': 'è',
    'à´': 'ô',
    'à ': 'à',
    'à»': 'û',
    'à¢': 'â',
    'à®': 'î',
    'à¯': 'ï',
    'à¼': 'ü',
    'à§': 'ç',
    'à«': 'ë',
    'Israà«l': 'Israël',
    'oà¹': 'où',
    'là ': 'là',
    'à ': 'à',
    'Activit?s': 'Activités',
    'R?unions': 'Réunions',
    'T?ches': 'Tâches',
    'Activit?': 'Activité',
    'cr??e': 'créée',
    'cr??': 'créé',
    'succ?s': 'succès',
    'termin?e': 'terminée',
    'termin?': 'terminé',
    'supprim?e': 'supprimée',
    'activit?': 'activité',
    'Li? ?': 'Lié à',
    '?chec': 'Échec',
    'Annul?e': 'Annulée',
    'mise ? jour': 'mise à jour',
    'cr?ation': 'création',
    "l'activit?": "l'activité",
    'R?union': 'Réunion',
    'T?che': 'Tâche'
}

def fix_encoding(text):
    """Fix encoding issues in text"""
    if not isinstance(text, str):
        return text
    
    # First pass: apply all encoding fixes
    for bad, good in ENCODING_FIXES.items():
        text = text.replace(bad, good)
    
    # Second pass: fix any remaining Hebrew-encoded UTF-8
    # Pattern: ֳ followed by a character
    text = re.sub(r'ֳ©', 'é', text)
    text = re.sub(r'ֳ¨', 'è', text)
    text = re.sub(r'ֳ', 'à', text)  # Fallback
    
    # Fix stray question marks that should be accented chars
    # Pattern: single ? between letters usually means accent was lost
    
    return text

def fix_dict_encoding(obj):
    """Recursively fix encoding in a dictionary"""
    if isinstance(obj, dict):
        return {k: fix_dict_encoding(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_dict_encoding(item) for item in obj]
    elif isinstance(obj, str):
        return fix_encoding(obj)
    else:
        return obj

def add_missing_keys(data):
    """Add missing translation keys"""
    
    # Ensure admin.crm exists
    if 'admin' not in data:
        data['admin'] = {}
    if 'crm' not in data['admin']:
        data['admin']['crm'] = {}
    
    crm = data['admin']['crm']
    
    # Add missing settings.subtitle
    if 'settings' not in crm:
        crm['settings'] = {}
    if 'subtitle' not in crm['settings']:
        crm['settings']['subtitle'] = 'Gérez les paramètres de votre CRM'
    
    # Add missing activities section
    if 'activities' not in crm:
        crm['activities'] = {}
    
    activities = crm['activities']
    
    # Fix activities translations
    activities.update({
        'title': 'Activités',
        'subtitle': 'Gérez les activités et le suivi de vos prospects',
        'count': 'activités',
        'add': 'Ajouter une activité',
        'created': 'Activité créée avec succès',
        'completed': 'Activité terminée',
        'deleted': 'Activité supprimée',
        'delete_confirm': 'Supprimer cette activité ?',
        'empty': 'Aucune activité',
        'complete': 'Terminer',
        'tabs': {
            'all': 'Toutes',
            'calls': 'Appels',
            'meetings': 'Réunions',
            'tasks': 'Tâches',
            'notes': 'Notes'
        },
        'columns': {
            'type': 'Type',
            'subject': 'Sujet',
            'related': 'Lié à',
            'due_date': 'Date limite',
            'status': 'Statut',
            'notes': 'Notes'
        },
        'types': {
            'call': 'Appel',
            'meeting': 'Réunion',
            'email': 'Email',
            'task': 'Tâche',
            'note': 'Note'
        },
        'status': {
            'pending': 'En attente',
            'completed': 'Terminée',
            'cancelled': 'Annulée',
            'overdue': 'En retard',
            'undefined': 'Terminée'  # Default for undefined status
        },
        'errors': {
            'load_failed': 'Échec du chargement des activités',
            'create_failed': 'Échec de la création de l\'activité',
            'update_failed': 'Échec de la mise à jour de l\'activité',
            'delete_failed': 'Échec de la suppression de l\'activité'
        }
    })
    
    # Fix priorities - ensure undefined fallback
    if 'priorities' not in crm:
        crm['priorities'] = {}
    crm['priorities'].update({
        'A': 'Haute (A)',
        'B': 'Moyenne (B)',
        'C': 'Basse (C)',
        'undefined': 'Non définie'  # Add undefined fallback
    })
    
    # Add missing statuses.undefined
    if 'statuses' not in crm:
        crm['statuses'] = {}
    crm['statuses'].update({
        'NEW': 'Nouveau',
        'CONTACTED': 'Contacté',
        'QUALIFIED': 'Qualifié',
        'CONVERTED': 'Converti',
        'LOST': 'Perdu',
        'PENDING_QUOTA': 'En attente quota',
        'undefined': 'Non défini',
        'completed': 'Terminé'
    })
    
    # Add leads subtitle if missing
    if 'leads' not in crm:
        crm['leads'] = {}
    if 'subtitle' not in crm['leads']:
        crm['leads']['subtitle'] = 'Gérez vos prospects et convertissez-les en contacts'
    
    # Add errors.lead_not_found
    if 'errors' not in crm:
        crm['errors'] = {}
    crm['errors']['lead_not_found'] = 'Prospect introuvable'
    
    # Fix nav translations
    if 'nav' not in crm:
        crm['nav'] = {}
    crm['nav'].update({
        'dashboard': 'Tableau de bord',
        'leads': 'Prospects',
        'contacts': 'Contacts',
        'pipeline': 'Pipeline',
        'opportunities': 'Opportunités',
        'activities': 'Activités',
        'emails': 'Emails',
        'users': 'Utilisateurs',
        'settings': 'Paramètres'
    })
    
    # Fix sidebar
    if 'sidebar' not in crm:
        crm['sidebar'] = {}
    crm['sidebar'].update({
        'expand': 'Développer',
        'collapse': 'Réduire'
    })
    
    return data

def main():
    print("Reading French translations...")
    
    # Read file with proper encoding (utf-8-sig to handle BOM)
    with open(FR_PATH, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    print("Fixing encoding issues...")
    data = fix_dict_encoding(data)
    
    print("Adding missing keys...")
    data = add_missing_keys(data)
    
    # Also fix the top-level crm section if it exists
    if 'crm' in data:
        data['crm'] = fix_dict_encoding(data['crm'])
        if 'nav' in data['crm']:
            data['crm']['nav'].update({
                'opportunities': 'Opportunités',
                'activities': 'Activités',
                'settings': 'Paramètres'
            })
        if 'sidebar' in data['crm']:
            data['crm']['sidebar'].update({
                'collapse': 'Réduire',
                'expand': 'Développer'
            })
    
    print("Writing fixed translations...")
    with open(FR_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✓ French translations fixed successfully!")
    print(f"  - File: {FR_PATH}")

if __name__ == "__main__":
    main()
