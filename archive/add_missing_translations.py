#!/usr/bin/env python3
"""Add all missing CRM translation keys to fr.json, en.json, and he.json"""

import json
import os

FRONTEND_PATH = r"C:\Users\PC\Desktop\IGV\igv-frontend\src\i18n\locales"

# All missing translations organized by language
MISSING_TRANSLATIONS = {
    "fr": {
        "admin": {
            "crm": {
                "title": "Gestion CRM",
                "tabs": {
                    "dashboard": "Tableau de bord",
                    "leads": "Prospects",
                    "contacts": "Contacts",
                    "pipeline": "Pipeline",
                    "settings": "Paramètres"
                },
                "dashboard": {
                    "direct": "Direct",
                    "leads_today": "Prospects aujourd'hui",
                    "pipeline_value": "Valeur du pipeline",
                    "stage_distribution": "Distribution par étape",
                    "tasks_overdue": "Tâches en retard",
                    "top_sources": "Principales sources"
                },
                "leads": {
                    "title": "Prospects",
                    "subtitle": "Gérez vos prospects et convertissez-les en contacts",
                    "new_lead": "Nouveau Prospect",
                    "export": "Exporter CSV",
                    "search": "Rechercher des prospects...",
                    "search_placeholder": "Rechercher des prospects...",
                    "filter_sector": "Filtrer par secteur",
                    "filter_stage": "Filtrer par étape",
                    "filter_status": "Filtrer par statut",
                    "filters": "Filtres",
                    "all_stages": "Toutes les étapes",
                    "all_statuses": "Tous les statuts",
                    "apply_filters": "Appliquer les filtres",
                    "created": "Prospect créé avec succès",
                    "deleted": "Prospect supprimé avec succès",
                    "status_updated": "Statut mis à jour",
                    "note_added": "Note ajoutée avec succès",
                    "note_error": "Erreur lors de l'ajout de la note",
                    "note_placeholder": "Ajouter une note...",
                    "add_note": "Ajouter une note",
                    "save_note": "Enregistrer la note",
                    "export_success": "Prospects exportés avec succès",
                    "export_error": "Erreur lors de l'export",
                    "empty_title": "Aucun prospect",
                    "empty_subtitle": "Créez votre premier prospect pour commencer",
                    "empty_description": "Créez votre premier prospect pour commencer",
                    "no_leads": "Aucun prospect trouvé",
                    "no_activities": "Aucune activité",
                    "activities": "Activités",
                    "convert_to_contact": "Convertir en Contact",
                    "create_opportunity": "Créer une Opportunité",
                    "converting": "Conversion en cours...",
                    "convert_success": "Prospect converti avec succès",
                    "convert_error": "Erreur lors de la conversion",
                    "confirm_convert": "Confirmer la conversion",
                    "update_success": "Prospect mis à jour avec succès",
                    "update_error": "Erreur lors de la mise à jour",
                    "already_converted": "Déjà converti",
                    "view_contact": "Voir le contact",
                    "converted": "Converti",
                    "info": "Informations",
                    "email": "Email",
                    "phone": "Téléphone",
                    "sector": "Secteur",
                    "status": "Statut",
                    "language": "Langue",
                    "mini_analysis": "Mini-Analyse IA",
                    "generated_on": "Généré le",
                    "add_note_placeholder": "Ajouter une note...",
                    "columns": {
                        "name": "Nom",
                        "email": "Email",
                        "brand": "Marque",
                        "sector": "Secteur",
                        "status": "Statut",
                        "priority": "Priorité",
                        "created": "Créé le",
                        "phone": "Téléphone",
                        "contact": "Nom du Contact"
                    },
                    "col_actions": "Actions",
                    "col_brand": "Marque",
                    "col_created": "Créé le",
                    "col_email": "Email",
                    "col_sector": "Secteur",
                    "col_status": "Statut",
                    "toast": {
                        "convert_success": "Prospect converti en contact avec succès",
                        "contact_created": "Contact créé",
                        "view_contact": "Voir le Contact",
                        "opportunity_created": "Opportunité créée",
                        "view_opportunity": "Voir l'Opportunité",
                        "already_converted": "Ce prospect a déjà été converti",
                        "lead_not_found": "Prospect introuvable",
                        "missing_info": "Le prospect doit avoir au moins un email ou un nom pour être converti",
                        "convert_error": "Erreur lors de la conversion du prospect"
                    },
                    "details": {
                        "back": "Retour aux prospects",
                        "info": "Informations du Prospect",
                        "notes": "Notes",
                        "add_note": "Ajouter une note...",
                        "activities": "Activités",
                        "email": "Email",
                        "phone": "Téléphone",
                        "sector": "Secteur",
                        "city": "Ville cible",
                        "status": "Statut",
                        "priority": "Priorité",
                        "focus_notes": "Notes importantes"
                    }
                },
                "activities": {
                    "title": "Activités",
                    "subtitle": "Gérez les activités et le suivi de vos prospects",
                    "status": {
                        "pending": "En attente",
                        "completed": "Terminée",
                        "cancelled": "Annulée",
                        "overdue": "En retard",
                        "undefined": "Terminée"
                    }
                },
                "settings": {
                    "title": "Paramètres CRM",
                    "subtitle": "Gérez les paramètres de votre CRM"
                },
                "priorities": {
                    "A": "Haute (A)",
                    "B": "Moyenne (B)",
                    "C": "Basse (C)",
                    "undefined": "Non définie"
                },
                "statuses": {
                    "NEW": "Nouveau",
                    "CONTACTED": "Contacté",
                    "QUALIFIED": "Qualifié",
                    "CONVERTED": "Converti",
                    "LOST": "Perdu",
                    "PENDING_QUOTA": "En attente quota",
                    "undefined": "Non défini",
                    "completed": "Terminé"
                },
                "errors": {
                    "load_failed": "Échec du chargement",
                    "lead_not_found": "Prospect introuvable"
                }
            }
        }
    },
    "en": {
        "admin": {
            "crm": {
                "title": "CRM Management",
                "tabs": {
                    "dashboard": "Dashboard",
                    "leads": "Leads",
                    "contacts": "Contacts",
                    "pipeline": "Pipeline",
                    "settings": "Settings"
                },
                "dashboard": {
                    "direct": "Direct",
                    "leads_today": "Leads today",
                    "pipeline_value": "Pipeline value",
                    "stage_distribution": "Stage distribution",
                    "tasks_overdue": "Overdue tasks",
                    "top_sources": "Top sources"
                },
                "leads": {
                    "title": "Leads",
                    "subtitle": "Manage your leads and convert them to contacts",
                    "new_lead": "New Lead",
                    "export": "Export CSV",
                    "search": "Search leads...",
                    "search_placeholder": "Search leads...",
                    "filter_sector": "Filter by sector",
                    "filter_stage": "Filter by stage",
                    "filter_status": "Filter by status",
                    "filters": "Filters",
                    "all_stages": "All stages",
                    "all_statuses": "All statuses",
                    "apply_filters": "Apply filters",
                    "created": "Lead created successfully",
                    "deleted": "Lead deleted successfully",
                    "status_updated": "Status updated",
                    "note_added": "Note added successfully",
                    "note_error": "Error adding note",
                    "note_placeholder": "Add a note...",
                    "add_note": "Add a note",
                    "save_note": "Save note",
                    "export_success": "Leads exported successfully",
                    "export_error": "Error exporting leads",
                    "empty_title": "No leads",
                    "empty_subtitle": "Create your first lead to get started",
                    "empty_description": "Create your first lead to get started",
                    "no_leads": "No leads found",
                    "no_activities": "No activities",
                    "activities": "Activities",
                    "convert_to_contact": "Convert to Contact",
                    "create_opportunity": "Create Opportunity",
                    "converting": "Converting...",
                    "convert_success": "Lead converted successfully",
                    "convert_error": "Error converting lead",
                    "confirm_convert": "Confirm conversion",
                    "update_success": "Lead updated successfully",
                    "update_error": "Error updating lead",
                    "already_converted": "Already converted",
                    "view_contact": "View contact",
                    "converted": "Converted",
                    "info": "Information",
                    "email": "Email",
                    "phone": "Phone",
                    "sector": "Sector",
                    "status": "Status",
                    "language": "Language",
                    "mini_analysis": "AI Mini-Analysis",
                    "generated_on": "Generated on",
                    "add_note_placeholder": "Add a note...",
                    "columns": {
                        "name": "Name",
                        "email": "Email",
                        "brand": "Brand",
                        "sector": "Sector",
                        "status": "Status",
                        "priority": "Priority",
                        "created": "Created",
                        "phone": "Phone",
                        "contact": "Contact Name"
                    },
                    "col_actions": "Actions",
                    "col_brand": "Brand",
                    "col_created": "Created",
                    "col_email": "Email",
                    "col_sector": "Sector",
                    "col_status": "Status",
                    "toast": {
                        "convert_success": "Lead converted to contact successfully",
                        "contact_created": "Contact created",
                        "view_contact": "View Contact",
                        "opportunity_created": "Opportunity created",
                        "view_opportunity": "View Opportunity",
                        "already_converted": "This lead has already been converted",
                        "lead_not_found": "Lead not found",
                        "missing_info": "Lead must have at least an email or name to be converted",
                        "convert_error": "Error converting lead"
                    },
                    "details": {
                        "back": "Back to leads",
                        "info": "Lead Information",
                        "notes": "Notes",
                        "add_note": "Add a note...",
                        "activities": "Activities",
                        "email": "Email",
                        "phone": "Phone",
                        "sector": "Sector",
                        "city": "Target city",
                        "status": "Status",
                        "priority": "Priority",
                        "focus_notes": "Important notes"
                    }
                },
                "activities": {
                    "title": "Activities",
                    "subtitle": "Manage activities and lead follow-up",
                    "status": {
                        "pending": "Pending",
                        "completed": "Completed",
                        "cancelled": "Cancelled",
                        "overdue": "Overdue",
                        "undefined": "Completed"
                    }
                },
                "settings": {
                    "title": "CRM Settings",
                    "subtitle": "Manage your CRM settings"
                },
                "priorities": {
                    "A": "High (A)",
                    "B": "Medium (B)",
                    "C": "Low (C)",
                    "undefined": "Undefined"
                },
                "statuses": {
                    "NEW": "New",
                    "CONTACTED": "Contacted",
                    "QUALIFIED": "Qualified",
                    "CONVERTED": "Converted",
                    "LOST": "Lost",
                    "PENDING_QUOTA": "Pending quota",
                    "undefined": "Undefined",
                    "completed": "Completed"
                },
                "errors": {
                    "load_failed": "Failed to load",
                    "lead_not_found": "Lead not found"
                }
            }
        }
    },
    "he": {
        "admin": {
            "crm": {
                "title": "ניהול CRM",
                "tabs": {
                    "dashboard": "לוח בקרה",
                    "leads": "לידים",
                    "contacts": "אנשי קשר",
                    "pipeline": "צינור מכירות",
                    "settings": "הגדרות"
                },
                "dashboard": {
                    "direct": "ישיר",
                    "leads_today": "לידים היום",
                    "pipeline_value": "ערך הצינור",
                    "stage_distribution": "התפלגות לפי שלב",
                    "tasks_overdue": "משימות באיחור",
                    "top_sources": "מקורות מובילים"
                },
                "leads": {
                    "title": "לידים",
                    "subtitle": "נהל את הלידים שלך והמר אותם לאנשי קשר",
                    "new_lead": "ליד חדש",
                    "export": "ייצוא CSV",
                    "search": "חפש לידים...",
                    "search_placeholder": "חפש לידים...",
                    "filter_sector": "סנן לפי ענף",
                    "filter_stage": "סנן לפי שלב",
                    "filter_status": "סנן לפי סטטוס",
                    "filters": "מסננים",
                    "all_stages": "כל השלבים",
                    "all_statuses": "כל הסטטוסים",
                    "apply_filters": "החל מסננים",
                    "created": "ליד נוצר בהצלחה",
                    "deleted": "ליד נמחק בהצלחה",
                    "status_updated": "סטטוס עודכן",
                    "note_added": "הערה נוספה בהצלחה",
                    "note_error": "שגיאה בהוספת הערה",
                    "note_placeholder": "הוסף הערה...",
                    "add_note": "הוסף הערה",
                    "save_note": "שמור הערה",
                    "export_success": "לידים יוצאו בהצלחה",
                    "export_error": "שגיאה בייצוא",
                    "empty_title": "אין לידים",
                    "empty_subtitle": "צור את הליד הראשון שלך כדי להתחיל",
                    "empty_description": "צור את הליד הראשון שלך כדי להתחיל",
                    "no_leads": "לא נמצאו לידים",
                    "no_activities": "אין פעילויות",
                    "activities": "פעילויות",
                    "convert_to_contact": "המר לאיש קשר",
                    "create_opportunity": "צור הזדמנות",
                    "converting": "ממיר...",
                    "convert_success": "ליד הומר בהצלחה",
                    "convert_error": "שגיאה בהמרת הליד",
                    "confirm_convert": "אשר המרה",
                    "update_success": "ליד עודכן בהצלחה",
                    "update_error": "שגיאה בעדכון הליד",
                    "already_converted": "כבר הומר",
                    "view_contact": "צפה באיש קשר",
                    "converted": "הומר",
                    "info": "מידע",
                    "email": "אימייל",
                    "phone": "טלפון",
                    "sector": "ענף",
                    "status": "סטטוס",
                    "language": "שפה",
                    "mini_analysis": "מיני-אנליזה AI",
                    "generated_on": "נוצר ב",
                    "add_note_placeholder": "הוסף הערה...",
                    "columns": {
                        "name": "שם",
                        "email": "אימייל",
                        "brand": "מותג",
                        "sector": "ענף",
                        "status": "סטטוס",
                        "priority": "עדיפות",
                        "created": "נוצר",
                        "phone": "טלפון",
                        "contact": "שם איש קשר"
                    },
                    "col_actions": "פעולות",
                    "col_brand": "מותג",
                    "col_created": "נוצר",
                    "col_email": "אימייל",
                    "col_sector": "ענף",
                    "col_status": "סטטוס",
                    "toast": {
                        "convert_success": "ליד הומר לאיש קשר בהצלחה",
                        "contact_created": "איש קשר נוצר",
                        "view_contact": "צפה באיש קשר",
                        "opportunity_created": "הזדמנות נוצרה",
                        "view_opportunity": "צפה בהזדמנות",
                        "already_converted": "ליד זה כבר הומר",
                        "lead_not_found": "ליד לא נמצא",
                        "missing_info": "לליד חייב להיות לפחות אימייל או שם כדי להמיר",
                        "convert_error": "שגיאה בהמרת הליד"
                    },
                    "details": {
                        "back": "חזרה ללידים",
                        "info": "מידע על הליד",
                        "notes": "הערות",
                        "add_note": "הוסף הערה...",
                        "activities": "פעילויות",
                        "email": "אימייל",
                        "phone": "טלפון",
                        "sector": "ענף",
                        "city": "עיר יעד",
                        "status": "סטטוס",
                        "priority": "עדיפות",
                        "focus_notes": "הערות חשובות"
                    }
                },
                "activities": {
                    "title": "פעילויות",
                    "subtitle": "נהל פעילויות ומעקב לידים",
                    "status": {
                        "pending": "ממתין",
                        "completed": "הושלם",
                        "cancelled": "בוטל",
                        "overdue": "באיחור",
                        "undefined": "הושלם"
                    }
                },
                "settings": {
                    "title": "הגדרות CRM",
                    "subtitle": "נהל את הגדרות ה-CRM שלך"
                },
                "priorities": {
                    "A": "גבוהה (A)",
                    "B": "בינונית (B)",
                    "C": "נמוכה (C)",
                    "undefined": "לא מוגדר"
                },
                "statuses": {
                    "NEW": "חדש",
                    "CONTACTED": "יצרנו קשר",
                    "QUALIFIED": "מתאים",
                    "CONVERTED": "הומר",
                    "LOST": "אבוד",
                    "PENDING_QUOTA": "ממתין למכסה",
                    "undefined": "לא מוגדר",
                    "completed": "הושלם"
                },
                "errors": {
                    "load_failed": "טעינה נכשלה",
                    "lead_not_found": "ליד לא נמצא"
                }
            }
        }
    }
}

def deep_merge(base, update):
    """Deep merge update into base, preserving existing values"""
    for key, value in update.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            # Only add if not already present
            if key not in base:
                base[key] = value
            elif isinstance(value, dict) and isinstance(base[key], dict):
                deep_merge(base[key], value)
    return base

def process_file(lang):
    """Process a single language file"""
    filepath = os.path.join(FRONTEND_PATH, f"{lang}.json")
    
    print(f"Processing {lang}.json...")
    
    # Read existing file
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    # Merge missing translations
    if lang in MISSING_TRANSLATIONS:
        deep_merge(data, MISSING_TRANSLATIONS[lang])
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ {lang}.json updated")

def main():
    print("Adding missing CRM translations to all language files...\n")
    
    for lang in ["fr", "en", "he"]:
        process_file(lang)
    
    print("\n✓ All translation files updated successfully!")

if __name__ == "__main__":
    main()
