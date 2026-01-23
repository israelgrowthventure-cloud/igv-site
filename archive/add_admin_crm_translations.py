#!/usr/bin/env python3
"""
Add admin.crm translations structure - used by ActivitiesPage, SettingsPage, etc.
The code uses BOTH 'crm.*' AND 'admin.crm.*'
"""

import json
import os

FRONTEND_PATH = r"C:\Users\PC\Desktop\IGV\igv-frontend\src\i18n\locales"

# admin.crm translations (for files that use admin.crm.* prefix)
ADMIN_CRM_TRANSLATIONS = {
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
                    "title": "Tableau de bord",
                    "direct": "Direct",
                    "leads_today": "Prospects aujourd'hui",
                    "leads_7d": "Prospects (7 jours)",
                    "pipeline_value": "Valeur du pipeline",
                    "stage_distribution": "Distribution par étape",
                    "tasks_overdue": "Tâches en retard",
                    "top_sources": "Principales sources"
                },
                "leads": {
                    "title": "Prospects",
                    "subtitle": "Gérez vos prospects",
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
                    "updated": "Prospect mis à jour avec succès",
                    "deleted": "Prospect supprimé avec succès",
                    "status_updated": "Statut mis à jour",
                    "note_added": "Note ajoutée avec succès",
                    "note_error": "Erreur lors de l'ajout de la note",
                    "note_placeholder": "Ajouter une note...",
                    "add_note": "Ajouter une note",
                    "save_note": "Enregistrer la note",
                    "export_success": "Prospects exportés",
                    "export_error": "Erreur lors de l'export",
                    "empty_title": "Aucun prospect",
                    "empty_subtitle": "Créez votre premier prospect",
                    "no_leads": "Aucun prospect trouvé",
                    "no_activities": "Aucune activité",
                    "no_brand": "Pas de marque",
                    "not_found": "Prospect non trouvé",
                    "activities": "Activités",
                    "actions": "Actions",
                    "convert_to_contact": "Convertir en Contact",
                    "create_opportunity": "Créer une Opportunité",
                    "converting": "Conversion en cours...",
                    "convert_success": "Converti avec succès",
                    "convert_error": "Erreur lors de la conversion",
                    "confirm_convert": "Confirmer la conversion",
                    "already_converted": "Déjà converti",
                    "view_contact": "Voir le contact",
                    "converted": "Converti",
                    "info": "Informations",
                    "email": "Email",
                    "phone": "Téléphone",
                    "sector": "Secteur",
                    "status": "Statut",
                    "language": "Langue",
                    "target_city": "Ville cible",
                    "mini_analysis": "Mini-Analyse IA",
                    "generated_on": "Généré le",
                    "delete_confirm_title": "Supprimer ce prospect ?",
                    "delete_confirm_message": "Cette action est irréversible.",
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
                    "toast": {
                        "convert_success": "Prospect converti en contact",
                        "contact_created": "Contact créé",
                        "view_contact": "Voir le Contact",
                        "opportunity_created": "Opportunité créée",
                        "view_opportunity": "Voir l'Opportunité",
                        "already_converted": "Ce prospect a déjà été converti",
                        "lead_not_found": "Prospect introuvable",
                        "missing_info": "Infos manquantes",
                        "convert_error": "Erreur lors de la conversion"
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
                        "focus_notes": "Notes importantes",
                        "status_priority": "Statut et Priorité",
                        "contact_info": "Informations de contact",
                        "additional": "Informations complémentaires"
                    },
                    "errors": {
                        "load_failed": "Échec du chargement",
                        "create_failed": "Échec de la création",
                        "update_failed": "Échec de la mise à jour",
                        "delete_failed": "Échec de la suppression"
                    }
                },
                "contacts": {
                    "title": "Contacts",
                    "subtitle": "Gérez vos contacts",
                    "new_contact": "Nouveau Contact",
                    "search": "Rechercher des contacts...",
                    "export": "Exporter CSV",
                    "created": "Contact créé avec succès",
                    "updated": "Contact mis à jour avec succès",
                    "deleted": "Contact supprimé avec succès",
                    "not_found": "Contact non trouvé",
                    "no_company": "Pas d'entreprise",
                    "opportunities": "Opportunités",
                    "recent_activities": "Activités récentes",
                    "columns": {
                        "name": "Nom",
                        "company": "Entreprise",
                        "email": "Email",
                        "phone": "Téléphone",
                        "status": "Statut",
                        "sector": "Secteur",
                        "created": "Créé le",
                        "last_contact": "Dernier Contact"
                    },
                    "details": {
                        "contact_info": "Informations de contact",
                        "position": "Poste",
                        "location": "Localisation",
                        "tags": "Tags"
                    },
                    "errors": {
                        "load_failed": "Échec du chargement",
                        "create_failed": "Échec de la création",
                        "update_failed": "Échec de la mise à jour",
                        "delete_failed": "Échec de la suppression"
                    }
                },
                "opportunities": {
                    "title": "Opportunités",
                    "subtitle": "Gérez vos opportunités",
                    "new": "Nouvelle Opportunité",
                    "edit": "Modifier l'Opportunité",
                    "created": "Opportunité créée",
                    "updated": "Opportunité mise à jour",
                    "deleted": "Opportunité supprimée",
                    "exported": "Opportunités exportées",
                    "count": "opportunités",
                    "empty": "Aucune opportunité",
                    "empty_title": "Aucune opportunité",
                    "empty_subtitle": "Créez votre première opportunité",
                    "delete_confirm": "Supprimer cette opportunité ?",
                    "search": "Rechercher...",
                    "name": "Nom",
                    "value": "Valeur (€)",
                    "probability": "Probabilité (%)",
                    "stage": "Étape",
                    "expected_close": "Date de clôture prévue",
                    "notes": "Notes",
                    "total_count": "Nombre total",
                    "total_value": "Valeur totale",
                    "weighted_value": "Valeur pondérée",
                    "columns": {
                        "name": "Nom",
                        "value": "Valeur",
                        "stage": "Étape",
                        "probability": "Probabilité",
                        "created": "Créé le"
                    },
                    "stages": {
                        "qualification": "Qualification",
                        "proposal": "Proposition",
                        "negotiation": "Négociation",
                        "closed_won": "Gagné",
                        "closed_lost": "Perdu"
                    },
                    "errors": {
                        "load_failed": "Échec du chargement",
                        "create_failed": "Échec de la création",
                        "update_failed": "Échec de la mise à jour",
                        "delete_failed": "Échec de la suppression"
                    }
                },
                "pipeline": {
                    "title": "Pipeline Commercial",
                    "total_value": "Valeur Totale du Pipeline",
                    "weighted_value": "Valeur Pondérée",
                    "move_to": "Déplacer vers",
                    "opportunities": "opportunités",
                    "stage_updated": "Étape mise à jour",
                    "total_opps": "Total Opportunités",
                    "avg_deal": "Affaire Moyenne",
                    "close_rate": "Taux de Clôture",
                    "stages": {
                        "prospecting": "Prospection",
                        "qualification": "Qualification",
                        "proposal": "Proposition",
                        "negotiation": "Négociation",
                        "closed_won": "Gagné",
                        "closed_lost": "Perdu",
                        "initial_interest": "Intérêt Initial",
                        "info_requested": "Infos Demandées",
                        "first_call": "Premier Appel",
                        "pitch_delivered": "Pitch Présenté",
                        "proposal_sent": "Proposition Envoyée",
                        "verbal_commitment": "Engagement Verbal",
                        "won": "Gagné"
                    }
                },
                "activities": {
                    "title": "Activités",
                    "subtitle": "Gérez les activités",
                    "count": "activités",
                    "add": "Ajouter une activité",
                    "created": "Activité créée avec succès",
                    "completed": "Activité terminée",
                    "deleted": "Activité supprimée",
                    "delete_confirm": "Supprimer cette activité ?",
                    "empty": "Aucune activité",
                    "complete": "Terminer",
                    "tabs": {
                        "all": "Toutes",
                        "calls": "Appels",
                        "meetings": "Réunions",
                        "tasks": "Tâches",
                        "notes": "Notes"
                    },
                    "columns": {
                        "type": "Type",
                        "subject": "Sujet",
                        "related": "Lié à",
                        "due_date": "Date limite",
                        "status": "Statut",
                        "notes": "Notes"
                    },
                    "types": {
                        "call": "Appel",
                        "meeting": "Réunion",
                        "email": "Email",
                        "task": "Tâche",
                        "note": "Note"
                    },
                    "status": {
                        "pending": "En attente",
                        "completed": "Terminée",
                        "cancelled": "Annulée",
                        "overdue": "En retard",
                        "undefined": "Terminée"
                    },
                    "errors": {
                        "load_failed": "Échec du chargement",
                        "create_failed": "Échec de la création",
                        "update_failed": "Échec de la mise à jour",
                        "delete_failed": "Échec de la suppression"
                    }
                },
                "emails": {
                    "title": "Historique des Emails",
                    "history_title": "Historique des Emails",
                    "compose": "Composer un email",
                    "to": "À",
                    "sent_count": "emails envoyés",
                    "empty_title": "Aucun email envoyé",
                    "empty_description": "Les emails apparaîtront ici",
                    "detail_title": "Détails de l'Email",
                    "template_detail": "Détails du Modèle",
                    "select_template": "Choisir un modèle",
                    "use": "Utiliser",
                    "subject": "Objet",
                    "subject_placeholder": "Objet de votre email...",
                    "message": "Message",
                    "message_placeholder": "Rédigez votre message ici...",
                    "sending": "Envoi...",
                    "send": "Envoyer",
                    "sent_success": "Email envoyé avec succès",
                    "send_failed": "Échec de l'envoi",
                    "error_empty": "Veuillez remplir l'objet et le message",
                    "deleted": "Enregistrement supprimé",
                    "delete_confirm": "Voulez-vous supprimer ?",
                    "templates_count": "modèles disponibles",
                    "no_templates": "Aucun modèle",
                    "columns": {
                        "recipient": "Destinataire",
                        "subject": "Sujet",
                        "date": "Date",
                        "status": "Statut",
                        "sent_by": "Envoyé Par",
                        "from": "De",
                        "to": "À"
                    },
                    "status": {
                        "sent": "Envoyé",
                        "delivered": "Distribué",
                        "opened": "Ouvert",
                        "clicked": "Cliqué",
                        "failed": "Échoué",
                        "bounced": "Rejeté"
                    },
                    "tabs": {
                        "sent": "Envoyés",
                        "received": "Reçus",
                        "templates": "Modèles"
                    },
                    "errors": {
                        "load_failed": "Échec du chargement",
                        "templates_load_failed": "Échec du chargement des modèles",
                        "delete_failed": "Échec de la suppression"
                    }
                },
                "users": {
                    "title": "Utilisateurs",
                    "new": "Nouvel Utilisateur",
                    "edit": "Modifier l'Utilisateur",
                    "search_placeholder": "Rechercher des utilisateurs...",
                    "all_roles": "Tous les Rôles",
                    "all_statuses": "Tous les Statuts",
                    "active": "Actif",
                    "inactive": "Inactif",
                    "empty": "Aucun utilisateur trouvé",
                    "no_name": "Sans nom",
                    "created": "Utilisateur créé avec succès",
                    "updated": "Utilisateur mis à jour avec succès",
                    "deleted": "Utilisateur supprimé avec succès",
                    "delete_confirm": "Êtes-vous sûr ?",
                    "columns": {
                        "user": "Utilisateur",
                        "email": "Email",
                        "role": "Rôle",
                        "status": "Statut",
                        "assigned_leads": "Leads Assignés",
                        "actions": "Actions"
                    },
                    "form": {
                        "email": "Email",
                        "first_name": "Prénom",
                        "last_name": "Nom",
                        "password": "Mot de passe",
                        "password_edit": "Nouveau mot de passe",
                        "role": "Rôle",
                        "active_account": "Compte actif"
                    },
                    "roles": {
                        "admin": "Admin",
                        "commercial": "Commercial",
                        "support": "Support"
                    },
                    "buttons": {
                        "save": "Enregistrer",
                        "cancel": "Annuler",
                        "create": "Créer",
                        "modify": "Modifier"
                    },
                    "errors": {
                        "load_failed": "Erreur lors du chargement",
                        "email_required": "L'email est requis",
                        "password_required": "Le mot de passe est requis",
                        "update_failed": "Erreur lors de la mise à jour",
                        "delete_failed": "Erreur lors de la suppression"
                    }
                },
                "settings": {
                    "title": "Paramètres CRM",
                    "subtitle": "Gérez les utilisateurs, tags et étapes",
                    "tabs": {
                        "users": "Utilisateurs",
                        "tags": "Tags",
                        "stages": "Étapes du Pipeline"
                    },
                    "users": {
                        "updated": "Utilisateur mis à jour",
                        "columns": {
                            "name": "Nom",
                            "email": "Email",
                            "role": "Rôle",
                            "status": "Statut",
                            "created": "Créé le"
                        },
                        "errors": {
                            "update_failed": "Erreur lors de la mise à jour"
                        }
                    },
                    "tags": {
                        "add": "Ajouter un Tag",
                        "created": "Tag créé",
                        "deleted": "Tag supprimé",
                        "delete_confirm": "Supprimer ce tag ?",
                        "columns": {
                            "name": "Nom",
                            "color": "Couleur",
                            "count": "Nombre d'utilisations"
                        },
                        "errors": {
                            "create_failed": "Erreur lors de la création",
                            "delete_failed": "Erreur lors de la suppression"
                        }
                    },
                    "stages": {
                        "add": "Ajouter une Étape",
                        "created": "Étape créée",
                        "updated": "Étape mise à jour",
                        "deleted": "Étape supprimée",
                        "delete_confirm": "Supprimer cette étape ?",
                        "columns": {
                            "name": "Nom"
                        },
                        "errors": {
                            "create_failed": "Erreur lors de la création",
                            "update_failed": "Erreur lors de la mise à jour",
                            "delete_failed": "Erreur lors de la suppression"
                        }
                    },
                    "errors": {
                        "load_failed": "Erreur lors du chargement"
                    }
                },
                "common": {
                    "filters": "Filtres",
                    "all_statuses": "Tous les statuts",
                    "all_priorities": "Toutes les priorités",
                    "reset": "Réinitialiser",
                    "edit": "Modifier",
                    "delete": "Supprimer",
                    "save": "Enregistrer",
                    "cancel": "Annuler",
                    "back": "Retour",
                    "back_to_list": "Retour à la liste",
                    "actions": "Actions",
                    "export": "Exporter",
                    "search": "Rechercher...",
                    "loading": "Chargement...",
                    "no_data": "Aucune donnée",
                    "confirm": "Confirmer",
                    "confirm_delete": "Êtes-vous sûr ?",
                    "close": "Fermer",
                    "add": "Ajouter",
                    "create": "Créer",
                    "update": "Mettre à jour",
                    "view": "Voir les Détails",
                    "refresh": "Actualiser",
                    "refreshed": "Données actualisées",
                    "no_notes": "Aucune note",
                    "no_opportunities": "Aucune opportunité",
                    "no_activities": "Aucune activité",
                    "send_email": "Envoyer un email"
                },
                "errors": {
                    "load_failed": "Échec du chargement",
                    "create_failed": "Échec de la création",
                    "update_failed": "Échec de la mise à jour",
                    "delete_failed": "Échec de la suppression",
                    "export_failed": "Échec de l'export"
                },
                "statuses": {
                    "NEW": "Nouveau",
                    "CONTACTED": "Contacté",
                    "QUALIFIED": "Qualifié",
                    "CONVERTED": "Converti",
                    "LOST": "Perdu",
                    "PENDING_QUOTA": "En attente quota",
                    "undefined": "Non défini"
                },
                "priorities": {
                    "A": "Haute (A)",
                    "B": "Moyenne (B)",
                    "C": "Basse (C)",
                    "undefined": "Non définie"
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
                    "title": "Dashboard",
                    "direct": "Direct",
                    "leads_today": "Leads today",
                    "leads_7d": "Leads (7 days)",
                    "pipeline_value": "Pipeline value",
                    "stage_distribution": "Stage distribution",
                    "tasks_overdue": "Overdue tasks",
                    "top_sources": "Top sources"
                },
                "leads": {
                    "title": "Leads",
                    "subtitle": "Manage your leads",
                    "new_lead": "New Lead",
                    "export": "Export CSV",
                    "search": "Search leads...",
                    "columns": {"name": "Name", "email": "Email", "brand": "Brand", "sector": "Sector", "status": "Status", "priority": "Priority", "created": "Created"},
                    "toast": {"convert_success": "Lead converted", "contact_created": "Contact created", "opportunity_created": "Opportunity created"},
                    "details": {"back": "Back to leads", "info": "Lead Information", "notes": "Notes"},
                    "errors": {"load_failed": "Failed to load", "create_failed": "Failed to create"}
                },
                "contacts": {"title": "Contacts", "subtitle": "Manage contacts", "columns": {"name": "Name", "email": "Email"}},
                "opportunities": {"title": "Opportunities", "columns": {"name": "Name", "value": "Value"}},
                "pipeline": {"title": "Pipeline", "stages": {"qualification": "Qualification", "proposal": "Proposal"}},
                "activities": {
                    "title": "Activities",
                    "count": "activities",
                    "add": "Add activity",
                    "created": "Activity created",
                    "completed": "Activity completed",
                    "deleted": "Activity deleted",
                    "delete_confirm": "Delete this activity?",
                    "types": {"call": "Call", "meeting": "Meeting", "email": "Email", "task": "Task", "note": "Note"},
                    "status": {"pending": "Pending", "completed": "Completed", "cancelled": "Cancelled", "overdue": "Overdue"},
                    "columns": {"type": "Type", "subject": "Subject", "related": "Related to", "due_date": "Due date", "status": "Status"},
                    "errors": {"load_failed": "Failed to load", "create_failed": "Failed to create", "update_failed": "Failed to update", "delete_failed": "Failed to delete"}
                },
                "emails": {"title": "Email History", "columns": {"recipient": "Recipient", "subject": "Subject"}},
                "users": {"title": "Users", "columns": {"user": "User", "email": "Email"}, "roles": {"admin": "Admin", "commercial": "Commercial"}},
                "settings": {
                    "title": "CRM Settings",
                    "tabs": {"users": "Users", "tags": "Tags", "stages": "Pipeline Stages"},
                    "users": {"updated": "User updated", "columns": {"name": "Name"}, "errors": {"update_failed": "Update failed"}},
                    "tags": {"add": "Add Tag", "created": "Tag created", "deleted": "Tag deleted", "delete_confirm": "Delete tag?", "errors": {"create_failed": "Create failed", "delete_failed": "Delete failed"}},
                    "stages": {"add": "Add Stage", "created": "Stage created", "updated": "Stage updated", "deleted": "Stage deleted", "delete_confirm": "Delete stage?", "errors": {"create_failed": "Create failed", "update_failed": "Update failed", "delete_failed": "Delete failed"}},
                    "errors": {"load_failed": "Load failed"}
                },
                "common": {"refresh": "Refresh", "filters": "Filters", "edit": "Edit", "delete": "Delete", "save": "Save", "cancel": "Cancel"},
                "statuses": {"NEW": "New", "CONTACTED": "Contacted", "QUALIFIED": "Qualified", "CONVERTED": "Converted", "LOST": "Lost"},
                "priorities": {"A": "High (A)", "B": "Medium (B)", "C": "Low (C)"}
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
                    "title": "לוח בקרה",
                    "direct": "ישיר",
                    "leads_today": "לידים היום",
                    "leads_7d": "לידים (7 ימים)",
                    "pipeline_value": "ערך הצינור",
                    "stage_distribution": "התפלגות לפי שלב",
                    "tasks_overdue": "משימות באיחור",
                    "top_sources": "מקורות מובילים"
                },
                "leads": {
                    "title": "לידים",
                    "subtitle": "נהל את הלידים שלך",
                    "columns": {"name": "שם", "email": "אימייל", "brand": "מותג", "sector": "ענף", "status": "סטטוס"},
                    "toast": {"convert_success": "ליד הומר", "contact_created": "איש קשר נוצר"},
                    "details": {"back": "חזרה ללידים", "info": "מידע על הליד", "notes": "הערות"},
                    "errors": {"load_failed": "שגיאה בטעינה"}
                },
                "contacts": {"title": "אנשי קשר", "columns": {"name": "שם", "email": "אימייל"}},
                "opportunities": {"title": "הזדמנויות", "columns": {"name": "שם", "value": "ערך"}},
                "pipeline": {"title": "צינור מכירות", "stages": {"qualification": "הכשרה", "proposal": "הצעה"}},
                "activities": {
                    "title": "פעילויות",
                    "count": "פעילויות",
                    "add": "הוסף פעילות",
                    "created": "פעילות נוצרה",
                    "completed": "פעילות הושלמה",
                    "deleted": "פעילות נמחקה",
                    "delete_confirm": "למחוק את הפעילות?",
                    "types": {"call": "שיחה", "meeting": "פגישה", "email": "אימייל", "task": "משימה", "note": "הערה"},
                    "status": {"pending": "ממתין", "completed": "הושלם", "cancelled": "בוטל", "overdue": "באיחור"},
                    "columns": {"type": "סוג", "subject": "נושא", "related": "קשור ל", "due_date": "תאריך יעד", "status": "סטטוס"},
                    "errors": {"load_failed": "שגיאה בטעינה", "create_failed": "שגיאה ביצירה", "update_failed": "שגיאה בעדכון", "delete_failed": "שגיאה במחיקה"}
                },
                "emails": {"title": "היסטוריית אימיילים", "columns": {"recipient": "נמען", "subject": "נושא"}},
                "users": {"title": "משתמשים", "columns": {"user": "משתמש", "email": "אימייל"}, "roles": {"admin": "מנהל", "commercial": "מסחרי"}},
                "settings": {
                    "title": "הגדרות CRM",
                    "tabs": {"users": "משתמשים", "tags": "תגיות", "stages": "שלבי צינור"},
                    "users": {"updated": "משתמש עודכן", "columns": {"name": "שם"}, "errors": {"update_failed": "שגיאה בעדכון"}},
                    "tags": {"add": "הוסף תגית", "created": "תגית נוצרה", "deleted": "תגית נמחקה", "delete_confirm": "למחוק את התגית?", "errors": {"create_failed": "שגיאה ביצירה", "delete_failed": "שגיאה במחיקה"}},
                    "stages": {"add": "הוסף שלב", "created": "שלב נוצר", "updated": "שלב עודכן", "deleted": "שלב נמחק", "delete_confirm": "למחוק את השלב?", "errors": {"create_failed": "שגיאה ביצירה", "update_failed": "שגיאה בעדכון", "delete_failed": "שגיאה במחיקה"}},
                    "errors": {"load_failed": "שגיאה בטעינה"}
                },
                "common": {"refresh": "רענן", "filters": "מסננים", "edit": "ערוך", "delete": "מחק", "save": "שמור", "cancel": "ביטול"},
                "statuses": {"NEW": "חדש", "CONTACTED": "יצרנו קשר", "QUALIFIED": "מתאים", "CONVERTED": "הומר", "LOST": "אבוד"},
                "priorities": {"A": "גבוהה (A)", "B": "בינונית (B)", "C": "נמוכה (C)"}
            }
        }
    }
}

def deep_merge(base, update):
    """Deep merge update into base, overwriting existing keys"""
    for key, value in update.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base

def process_file(lang):
    """Process a single language file"""
    filepath = os.path.join(FRONTEND_PATH, f"{lang}.json")
    
    print(f"Processing {lang}.json...")
    
    # Read existing file
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    # Merge translations
    if lang in ADMIN_CRM_TRANSLATIONS:
        deep_merge(data, ADMIN_CRM_TRANSLATIONS[lang])
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ {lang}.json updated with admin.crm translations")

def main():
    print("=" * 60)
    print("  ADD admin.crm.* Translations")
    print("  (Used by ActivitiesPage, SettingsPage, AdminCRM, etc.)")
    print("=" * 60)
    print()
    
    for lang in ["fr", "en", "he"]:
        process_file(lang)
    
    print()
    print("✓ All translation files updated with admin.crm translations!")
    print()

if __name__ == "__main__":
    main()
