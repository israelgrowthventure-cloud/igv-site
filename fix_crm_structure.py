#!/usr/bin/env python3
"""
Fix CRM translations structure and encoding issues
The code uses 'crm.*' not 'admin.crm.*'
"""

import json
import os

FRONTEND_PATH = r"C:\Users\PC\Desktop\IGV\igv-frontend\src\i18n\locales"

# Complete CRM translations (using correct structure: crm.* not admin.crm.*)
CRM_TRANSLATIONS = {
    "fr": {
        "crm": {
            "title": "Gestion CRM",
            "tabs": {
                "dashboard": "Tableau de bord",
                "leads": "Prospects",
                "contacts": "Contacts",
                "pipeline": "Pipeline",
                "settings": "Paramètres"
            },
            "nav": {
                "dashboard": "Tableau de bord",
                "leads": "Prospects",
                "contacts": "Contacts",
                "opportunities": "Opportunités",
                "pipeline": "Pipeline",
                "activities": "Activités",
                "emails": "Emails",
                "users": "Utilisateurs",
                "settings": "Paramètres"
            },
            "sidebar": {
                "expand": "Développer",
                "collapse": "Réduire"
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
            "stages": {
                "prospecting": "Prospection",
                "qualification": "Qualification",
                "proposal": "Proposition",
                "negotiation": "Négociation",
                "closed_won": "Gagné",
                "closed_lost": "Perdu",
                "new": "Nouveau",
                "contacted": "Contacté",
                "qualified": "Qualifié"
            },
            "status": {
                "new": "Nouveau",
                "contacted": "Contacté",
                "qualified": "Qualifié",
                "converted": "Converti",
                "lost": "Perdu"
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
                "updated": "Prospect mis à jour avec succès",
                "deleted": "Prospect supprimé avec succès",
                "status_updated": "Statut mis à jour",
                "note_added": "Note ajoutée avec succès",
                "note_error": "Erreur lors de l'ajout de la note",
                "note_placeholder": "Ajouter une note...",
                "add_note": "Ajouter une note",
                "add_note_placeholder": "Ajouter une note...",
                "save_note": "Enregistrer la note",
                "export_success": "Prospects exportés avec succès",
                "export_error": "Erreur lors de l'export",
                "empty_title": "Aucun prospect",
                "empty_subtitle": "Créez votre premier prospect pour commencer",
                "empty_description": "Créez votre premier prospect pour commencer",
                "no_leads": "Aucun prospect trouvé",
                "no_activities": "Aucune activité",
                "no_brand": "Pas de marque",
                "not_found": "Prospect non trouvé",
                "activities": "Activités",
                "actions": "Actions",
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
                "target_city": "Ville cible",
                "mini_analysis": "Mini-Analyse IA",
                "generated_on": "Généré le",
                "delete_confirm_title": "Supprimer ce prospect ?",
                "delete_confirm_message": "Cette action est irréversible. Êtes-vous sûr ?",
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
                    "missing_info": "Le prospect doit avoir au moins un email ou un nom",
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
                    "focus_notes": "Notes importantes",
                    "status_priority": "Statut et Priorité",
                    "contact_info": "Informations de contact",
                    "additional": "Informations complémentaires"
                }
            },
            "contacts": {
                "title": "Contacts",
                "subtitle": "Gérez vos contacts clients",
                "new_contact": "Nouveau Contact",
                "search": "Rechercher des contacts...",
                "export": "Exporter CSV",
                "created": "Contact créé avec succès",
                "updated": "Contact mis à jour avec succès",
                "deleted": "Contact supprimé avec succès",
                "not_found": "Contact non trouvé",
                "no_company": "Pas d'entreprise",
                "converted_from_lead": "Converti depuis un prospect",
                "lead_id": "ID du Prospect",
                "opportunities": "Opportunités",
                "recent_activities": "Activités récentes",
                "delete_confirm_title": "Supprimer ce contact ?",
                "delete_confirm_message": "Cette action est irréversible.",
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
                }
            },
            "opportunities": {
                "title": "Opportunités",
                "subtitle": "Gérez vos opportunités commerciales",
                "new": "Nouvelle Opportunité",
                "edit": "Modifier l'Opportunité",
                "created": "Opportunité créée avec succès",
                "updated": "Opportunité mise à jour avec succès",
                "deleted": "Opportunité supprimée avec succès",
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
                "current_stage": "Étape Actuelle",
                "estimated_value": "Valeur Estimée",
                "description": "Description",
                "stage_history": "Historique des Étapes",
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
                "subtitle": "Gérez les activités et le suivi",
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
                "empty_description": "Les emails envoyés apparaîtront ici",
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
                "delete_confirm": "Voulez-vous supprimer cet enregistrement ?",
                "received_title": "Emails Reçus",
                "received_description": "Non implémenté",
                "received_tab": "Boîte de réception",
                "templates_count": "modèles disponibles",
                "templates_info": "Disponibles en anglais, français et hébreu.",
                "no_templates": "Aucun modèle disponible",
                "no_templates_description": "Les modèles apparaîtront ici",
                "available_languages": "Disponible en:",
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
                "delete_confirm": "Êtes-vous sûr de vouloir supprimer ?",
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
                    "password_edit": "Nouveau mot de passe (laisser vide)",
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
                "back": "Retour au CRM",
                "back_to_list": "Retour à la liste",
                "actions": "Actions",
                "export": "Exporter",
                "search": "Rechercher...",
                "loading": "Chargement...",
                "no_data": "Aucune donnée disponible",
                "no_history": "Aucun historique disponible",
                "confirm": "Confirmer",
                "confirm_delete": "Êtes-vous sûr de vouloir supprimer ?",
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
                "created": "Créé le",
                "updated": "Modifié le",
                "language": "Langue",
                "reference": "Référence",
                "send_email": "Envoyer un email"
            },
            "errors": {
                "load_failed": "Échec du chargement",
                "create_failed": "Échec de la création",
                "update_failed": "Échec de la mise à jour",
                "delete_failed": "Échec de la suppression",
                "export_failed": "Échec de l'export",
                "note_failed": "Échec de l'ajout de note",
                "status_failed": "Échec de la mise à jour du statut",
                "stage_failed": "Échec de la mise à jour de l'étape",
                "convert_failed": "Échec de la conversion",
                "lead_not_found": "Prospect introuvable"
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
            "priorities": {
                "A": "Haute (A)",
                "B": "Moyenne (B)",
                "C": "Basse (C)",
                "undefined": "Non définie"
            },
            "breadcrumb": {
                "home": "Accueil"
            }
        }
    },
    "en": {
        "crm": {
            "title": "CRM Management",
            "tabs": {
                "dashboard": "Dashboard",
                "leads": "Leads",
                "contacts": "Contacts",
                "pipeline": "Pipeline",
                "settings": "Settings"
            },
            "nav": {
                "dashboard": "Dashboard",
                "leads": "Leads",
                "contacts": "Contacts",
                "opportunities": "Opportunities",
                "pipeline": "Pipeline",
                "activities": "Activities",
                "emails": "Emails",
                "users": "Users",
                "settings": "Settings"
            },
            "sidebar": {
                "expand": "Expand",
                "collapse": "Collapse"
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
            "stages": {
                "prospecting": "Prospecting",
                "qualification": "Qualification",
                "proposal": "Proposal",
                "negotiation": "Negotiation",
                "closed_won": "Closed Won",
                "closed_lost": "Closed Lost",
                "new": "New",
                "contacted": "Contacted",
                "qualified": "Qualified"
            },
            "status": {
                "new": "New",
                "contacted": "Contacted",
                "qualified": "Qualified",
                "converted": "Converted",
                "lost": "Lost"
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
                "updated": "Lead updated successfully",
                "deleted": "Lead deleted successfully",
                "status_updated": "Status updated",
                "note_added": "Note added successfully",
                "note_error": "Error adding note",
                "note_placeholder": "Add a note...",
                "add_note": "Add a note",
                "add_note_placeholder": "Add a note...",
                "save_note": "Save note",
                "export_success": "Leads exported successfully",
                "export_error": "Error exporting leads",
                "empty_title": "No leads",
                "empty_subtitle": "Create your first lead to get started",
                "empty_description": "Create your first lead to get started",
                "no_leads": "No leads found",
                "no_activities": "No activities",
                "no_brand": "No brand",
                "not_found": "Lead not found",
                "activities": "Activities",
                "actions": "Actions",
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
                "target_city": "Target City",
                "mini_analysis": "AI Mini-Analysis",
                "generated_on": "Generated on",
                "delete_confirm_title": "Delete this lead?",
                "delete_confirm_message": "This action cannot be undone.",
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
                    "missing_info": "Lead must have at least an email or name",
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
                    "focus_notes": "Important notes",
                    "status_priority": "Status & Priority",
                    "contact_info": "Contact Information",
                    "additional": "Additional Information"
                }
            },
            "contacts": {
                "title": "Contacts",
                "subtitle": "Manage your client contacts",
                "new_contact": "New Contact",
                "search": "Search contacts...",
                "export": "Export CSV",
                "created": "Contact created successfully",
                "updated": "Contact updated successfully",
                "deleted": "Contact deleted successfully",
                "not_found": "Contact not found",
                "no_company": "No company",
                "converted_from_lead": "Converted from Lead",
                "lead_id": "Lead ID",
                "opportunities": "Opportunities",
                "recent_activities": "Recent Activities",
                "delete_confirm_title": "Delete this contact?",
                "delete_confirm_message": "This action cannot be undone.",
                "columns": {
                    "name": "Name",
                    "company": "Company",
                    "email": "Email",
                    "phone": "Phone",
                    "status": "Status",
                    "sector": "Sector",
                    "created": "Created",
                    "last_contact": "Last Contact"
                },
                "details": {
                    "contact_info": "Contact Information",
                    "position": "Position",
                    "location": "Location",
                    "tags": "Tags"
                }
            },
            "opportunities": {
                "title": "Opportunities",
                "subtitle": "Manage your business opportunities",
                "new": "New Opportunity",
                "edit": "Edit Opportunity",
                "created": "Opportunity created successfully",
                "updated": "Opportunity updated successfully",
                "deleted": "Opportunity deleted successfully",
                "exported": "Opportunities exported",
                "count": "opportunities",
                "empty": "No opportunities",
                "empty_title": "No opportunities",
                "empty_subtitle": "Create your first opportunity",
                "delete_confirm": "Delete this opportunity?",
                "search": "Search...",
                "name": "Name",
                "value": "Value (€)",
                "probability": "Probability (%)",
                "stage": "Stage",
                "expected_close": "Expected Close Date",
                "notes": "Notes",
                "total_count": "Total Count",
                "total_value": "Total Value",
                "weighted_value": "Weighted Value",
                "columns": {
                    "name": "Name",
                    "value": "Value",
                    "stage": "Stage",
                    "probability": "Probability",
                    "created": "Created"
                },
                "stages": {
                    "qualification": "Qualification",
                    "proposal": "Proposal",
                    "negotiation": "Negotiation",
                    "closed_won": "Closed Won",
                    "closed_lost": "Closed Lost"
                },
                "errors": {
                    "load_failed": "Failed to load",
                    "create_failed": "Failed to create",
                    "update_failed": "Failed to update",
                    "delete_failed": "Failed to delete"
                }
            },
            "pipeline": {
                "title": "Sales Pipeline",
                "total_value": "Total Pipeline Value",
                "weighted_value": "Weighted Value",
                "move_to": "Move to",
                "opportunities": "opportunities",
                "stage_updated": "Stage updated",
                "total_opps": "Total Opportunities",
                "avg_deal": "Average Deal",
                "close_rate": "Close Rate",
                "current_stage": "Current Stage",
                "estimated_value": "Estimated Value",
                "description": "Description",
                "stage_history": "Stage History",
                "stages": {
                    "prospecting": "Prospecting",
                    "qualification": "Qualification",
                    "proposal": "Proposal",
                    "negotiation": "Negotiation",
                    "closed_won": "Closed Won",
                    "closed_lost": "Closed Lost",
                    "initial_interest": "Initial Interest",
                    "info_requested": "Info Requested",
                    "first_call": "First Call",
                    "pitch_delivered": "Pitch Delivered",
                    "proposal_sent": "Proposal Sent",
                    "verbal_commitment": "Verbal Commitment",
                    "won": "Won"
                }
            },
            "activities": {
                "title": "Activities",
                "subtitle": "Manage activities and follow-up",
                "count": "activities",
                "add": "Add activity",
                "created": "Activity created successfully",
                "completed": "Activity completed",
                "deleted": "Activity deleted",
                "delete_confirm": "Delete this activity?",
                "empty": "No activities",
                "complete": "Complete",
                "tabs": {
                    "all": "All",
                    "calls": "Calls",
                    "meetings": "Meetings",
                    "tasks": "Tasks",
                    "notes": "Notes"
                },
                "columns": {
                    "type": "Type",
                    "subject": "Subject",
                    "related": "Related to",
                    "due_date": "Due date",
                    "status": "Status",
                    "notes": "Notes"
                },
                "types": {
                    "call": "Call",
                    "meeting": "Meeting",
                    "email": "Email",
                    "task": "Task",
                    "note": "Note"
                },
                "status": {
                    "pending": "Pending",
                    "completed": "Completed",
                    "cancelled": "Cancelled",
                    "overdue": "Overdue",
                    "undefined": "Completed"
                },
                "errors": {
                    "load_failed": "Failed to load",
                    "create_failed": "Failed to create",
                    "update_failed": "Failed to update",
                    "delete_failed": "Failed to delete"
                }
            },
            "emails": {
                "title": "Email History",
                "history_title": "Email History",
                "compose": "Compose email",
                "to": "To",
                "sent_count": "emails sent",
                "empty_title": "No emails sent",
                "empty_description": "Emails sent will appear here",
                "detail_title": "Email Details",
                "template_detail": "Template Details",
                "select_template": "Select a template",
                "use": "Use",
                "subject": "Subject",
                "subject_placeholder": "Email subject...",
                "message": "Message",
                "message_placeholder": "Write your message here...",
                "sending": "Sending...",
                "send": "Send",
                "sent_success": "Email sent successfully",
                "send_failed": "Failed to send",
                "error_empty": "Please fill in subject and message",
                "deleted": "Record deleted",
                "delete_confirm": "Delete this record?",
                "received_title": "Received Emails",
                "received_description": "Not implemented",
                "received_tab": "Inbox",
                "templates_count": "templates available",
                "templates_info": "Available in English, French, and Hebrew.",
                "no_templates": "No templates available",
                "no_templates_description": "Templates will appear here",
                "available_languages": "Available in:",
                "columns": {
                    "recipient": "Recipient",
                    "subject": "Subject",
                    "date": "Date",
                    "status": "Status",
                    "sent_by": "Sent By",
                    "from": "From",
                    "to": "To"
                },
                "status": {
                    "sent": "Sent",
                    "delivered": "Delivered",
                    "opened": "Opened",
                    "clicked": "Clicked",
                    "failed": "Failed",
                    "bounced": "Bounced"
                },
                "tabs": {
                    "sent": "Sent",
                    "received": "Received",
                    "templates": "Templates"
                },
                "errors": {
                    "load_failed": "Failed to load",
                    "templates_load_failed": "Failed to load templates",
                    "delete_failed": "Failed to delete"
                }
            },
            "users": {
                "title": "Users",
                "new": "New User",
                "edit": "Edit User",
                "search_placeholder": "Search users...",
                "all_roles": "All Roles",
                "all_statuses": "All Statuses",
                "active": "Active",
                "inactive": "Inactive",
                "empty": "No users found",
                "no_name": "No name",
                "created": "User created successfully",
                "updated": "User updated successfully",
                "deleted": "User deleted successfully",
                "delete_confirm": "Are you sure you want to delete?",
                "columns": {
                    "user": "User",
                    "email": "Email",
                    "role": "Role",
                    "status": "Status",
                    "assigned_leads": "Assigned Leads",
                    "actions": "Actions"
                },
                "form": {
                    "email": "Email",
                    "first_name": "First Name",
                    "last_name": "Last Name",
                    "password": "Password",
                    "password_edit": "New password (leave blank)",
                    "role": "Role",
                    "active_account": "Active account"
                },
                "roles": {
                    "admin": "Admin",
                    "commercial": "Commercial",
                    "support": "Support"
                },
                "buttons": {
                    "save": "Save",
                    "cancel": "Cancel",
                    "create": "Create",
                    "modify": "Modify"
                },
                "errors": {
                    "load_failed": "Error loading",
                    "email_required": "Email is required",
                    "password_required": "Password is required",
                    "update_failed": "Error updating",
                    "delete_failed": "Error deleting"
                }
            },
            "settings": {
                "title": "CRM Settings",
                "subtitle": "Manage users, tags, and stages",
                "tabs": {
                    "users": "Users",
                    "tags": "Tags",
                    "stages": "Pipeline Stages"
                },
                "users": {
                    "updated": "User updated",
                    "columns": {
                        "name": "Name",
                        "email": "Email",
                        "role": "Role",
                        "status": "Status",
                        "created": "Created"
                    },
                    "errors": {
                        "update_failed": "Error updating"
                    }
                },
                "tags": {
                    "add": "Add Tag",
                    "created": "Tag created",
                    "deleted": "Tag deleted",
                    "delete_confirm": "Delete this tag?",
                    "columns": {
                        "name": "Name",
                        "color": "Color",
                        "count": "Usage Count"
                    },
                    "errors": {
                        "create_failed": "Error creating",
                        "delete_failed": "Error deleting"
                    }
                },
                "stages": {
                    "add": "Add Stage",
                    "created": "Stage created",
                    "updated": "Stage updated",
                    "deleted": "Stage deleted",
                    "delete_confirm": "Delete this stage?",
                    "columns": {
                        "name": "Name"
                    },
                    "errors": {
                        "create_failed": "Error creating",
                        "update_failed": "Error updating",
                        "delete_failed": "Error deleting"
                    }
                },
                "errors": {
                    "load_failed": "Error loading"
                }
            },
            "common": {
                "filters": "Filters",
                "all_statuses": "All statuses",
                "all_priorities": "All priorities",
                "reset": "Reset",
                "edit": "Edit",
                "delete": "Delete",
                "save": "Save",
                "cancel": "Cancel",
                "back": "Back to CRM",
                "back_to_list": "Back to list",
                "actions": "Actions",
                "export": "Export",
                "search": "Search...",
                "loading": "Loading...",
                "no_data": "No data available",
                "no_history": "No history available",
                "confirm": "Confirm",
                "confirm_delete": "Are you sure you want to delete?",
                "close": "Close",
                "add": "Add",
                "create": "Create",
                "update": "Update",
                "view": "View Details",
                "refresh": "Refresh",
                "refreshed": "Data refreshed",
                "no_notes": "No notes",
                "no_opportunities": "No opportunities",
                "no_activities": "No activities",
                "created": "Created",
                "updated": "Updated",
                "language": "Language",
                "reference": "Reference",
                "send_email": "Send email"
            },
            "errors": {
                "load_failed": "Failed to load",
                "create_failed": "Failed to create",
                "update_failed": "Failed to update",
                "delete_failed": "Failed to delete",
                "export_failed": "Failed to export",
                "note_failed": "Failed to add note",
                "status_failed": "Failed to update status",
                "stage_failed": "Failed to update stage",
                "convert_failed": "Failed to convert",
                "lead_not_found": "Lead not found"
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
            "priorities": {
                "A": "High (A)",
                "B": "Medium (B)",
                "C": "Low (C)",
                "undefined": "Undefined"
            },
            "breadcrumb": {
                "home": "Home"
            }
        }
    },
    "he": {
        "crm": {
            "title": "ניהול CRM",
            "tabs": {
                "dashboard": "לוח בקרה",
                "leads": "לידים",
                "contacts": "אנשי קשר",
                "pipeline": "צינור מכירות",
                "settings": "הגדרות"
            },
            "nav": {
                "dashboard": "לוח בקרה",
                "leads": "לידים",
                "contacts": "אנשי קשר",
                "opportunities": "הזדמנויות",
                "pipeline": "צינור מכירות",
                "activities": "פעילויות",
                "emails": "אימיילים",
                "users": "משתמשים",
                "settings": "הגדרות"
            },
            "sidebar": {
                "expand": "הרחב",
                "collapse": "צמצם"
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
            "stages": {
                "prospecting": "חיפוש",
                "qualification": "הכשרה",
                "proposal": "הצעה",
                "negotiation": "משא ומתן",
                "closed_won": "נסגר בהצלחה",
                "closed_lost": "אבוד",
                "new": "חדש",
                "contacted": "יצרנו קשר",
                "qualified": "מתאים"
            },
            "status": {
                "new": "חדש",
                "contacted": "יצרנו קשר",
                "qualified": "מתאים",
                "converted": "הומר",
                "lost": "אבוד"
            },
            "leads": {
                "title": "לידים",
                "subtitle": "נהל את הלידים שלך והמר אותם",
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
                "updated": "ליד עודכן בהצלחה",
                "deleted": "ליד נמחק בהצלחה",
                "status_updated": "סטטוס עודכן",
                "note_added": "הערה נוספה בהצלחה",
                "note_error": "שגיאה בהוספת הערה",
                "note_placeholder": "הוסף הערה...",
                "add_note": "הוסף הערה",
                "add_note_placeholder": "הוסף הערה...",
                "save_note": "שמור הערה",
                "export_success": "לידים יוצאו בהצלחה",
                "export_error": "שגיאה בייצוא",
                "empty_title": "אין לידים",
                "empty_subtitle": "צור את הליד הראשון שלך",
                "empty_description": "צור את הליד הראשון שלך",
                "no_leads": "לא נמצאו לידים",
                "no_activities": "אין פעילויות",
                "no_brand": "אין מותג",
                "not_found": "ליד לא נמצא",
                "activities": "פעילויות",
                "actions": "פעולות",
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
                "target_city": "עיר יעד",
                "mini_analysis": "מיני-אנליזה AI",
                "generated_on": "נוצר ב",
                "delete_confirm_title": "למחוק את הליד?",
                "delete_confirm_message": "פעולה זו לא ניתנת לביטול.",
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
                    "convert_success": "ליד הומר בהצלחה",
                    "contact_created": "איש קשר נוצר",
                    "view_contact": "צפה באיש קשר",
                    "opportunity_created": "הזדמנות נוצרה",
                    "view_opportunity": "צפה בהזדמנות",
                    "already_converted": "ליד זה כבר הומר",
                    "lead_not_found": "ליד לא נמצא",
                    "missing_info": "לליד חייב להיות אימייל או שם",
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
                    "focus_notes": "הערות חשובות",
                    "status_priority": "סטטוס ועדיפות",
                    "contact_info": "פרטי קשר",
                    "additional": "מידע נוסף"
                }
            },
            "contacts": {
                "title": "אנשי קשר",
                "subtitle": "נהל את אנשי הקשר שלך",
                "new_contact": "איש קשר חדש",
                "search": "חפש אנשי קשר...",
                "export": "ייצוא CSV",
                "created": "איש קשר נוצר בהצלחה",
                "updated": "איש קשר עודכן בהצלחה",
                "deleted": "איש קשר נמחק בהצלחה",
                "not_found": "איש קשר לא נמצא",
                "no_company": "אין חברה",
                "converted_from_lead": "הומר מליד",
                "lead_id": "מזהה ליד",
                "opportunities": "הזדמנויות",
                "recent_activities": "פעילויות אחרונות",
                "delete_confirm_title": "למחוק את איש הקשר?",
                "delete_confirm_message": "פעולה זו לא ניתנת לביטול.",
                "columns": {
                    "name": "שם",
                    "company": "חברה",
                    "email": "אימייל",
                    "phone": "טלפון",
                    "status": "סטטוס",
                    "sector": "ענף",
                    "created": "נוצר",
                    "last_contact": "קשר אחרון"
                },
                "details": {
                    "contact_info": "פרטי קשר",
                    "position": "תפקיד",
                    "location": "מיקום",
                    "tags": "תגיות"
                }
            },
            "opportunities": {
                "title": "הזדמנויות",
                "subtitle": "נהל את ההזדמנויות שלך",
                "new": "הזדמנות חדשה",
                "edit": "ערוך הזדמנות",
                "created": "הזדמנות נוצרה בהצלחה",
                "updated": "הזדמנות עודכנה בהצלחה",
                "deleted": "הזדמנות נמחקה בהצלחה",
                "exported": "הזדמנויות יוצאו",
                "count": "הזדמנויות",
                "empty": "אין הזדמנויות",
                "empty_title": "אין הזדמנויות",
                "empty_subtitle": "צור את ההזדמנות הראשונה שלך",
                "delete_confirm": "למחוק את ההזדמנות?",
                "search": "חיפוש...",
                "name": "שם",
                "value": "ערך (€)",
                "probability": "הסתברות (%)",
                "stage": "שלב",
                "expected_close": "תאריך סגירה צפוי",
                "notes": "הערות",
                "total_count": "סה\"כ",
                "total_value": "ערך כולל",
                "weighted_value": "ערך משוקלל",
                "columns": {
                    "name": "שם",
                    "value": "ערך",
                    "stage": "שלב",
                    "probability": "הסתברות",
                    "created": "נוצר"
                },
                "stages": {
                    "qualification": "הכשרה",
                    "proposal": "הצעה",
                    "negotiation": "משא ומתן",
                    "closed_won": "נסגר בהצלחה",
                    "closed_lost": "אבוד"
                },
                "errors": {
                    "load_failed": "שגיאה בטעינה",
                    "create_failed": "שגיאה ביצירה",
                    "update_failed": "שגיאה בעדכון",
                    "delete_failed": "שגיאה במחיקה"
                }
            },
            "pipeline": {
                "title": "צינור מכירות",
                "total_value": "ערך צינור כולל",
                "weighted_value": "ערך משוקלל",
                "move_to": "העבר ל",
                "opportunities": "הזדמנויות",
                "stage_updated": "שלב עודכן בהצלחה",
                "total_opps": "סה\"כ הזדמנויות",
                "avg_deal": "עסקה ממוצעת",
                "close_rate": "אחוז סגירה",
                "current_stage": "שלב נוכחי",
                "estimated_value": "ערך משוער",
                "description": "תיאור",
                "stage_history": "היסטוריית שלבים",
                "stages": {
                    "prospecting": "חיפוש",
                    "qualification": "הכשרה",
                    "proposal": "הצעה",
                    "negotiation": "משא ומתן",
                    "closed_won": "נסגר בהצלחה",
                    "closed_lost": "אבוד",
                    "initial_interest": "עניין ראשוני",
                    "info_requested": "מידע התבקש",
                    "first_call": "שיחה ראשונה",
                    "pitch_delivered": "מצגת הוצגה",
                    "proposal_sent": "הצעה נשלחה",
                    "verbal_commitment": "התחייבות מילולית",
                    "won": "זכייה"
                }
            },
            "activities": {
                "title": "פעילויות",
                "subtitle": "נהל פעילויות ומעקב",
                "count": "פעילויות",
                "add": "הוסף פעילות",
                "created": "פעילות נוצרה בהצלחה",
                "completed": "פעילות הושלמה",
                "deleted": "פעילות נמחקה",
                "delete_confirm": "למחוק את הפעילות?",
                "empty": "אין פעילויות",
                "complete": "סיים",
                "tabs": {
                    "all": "הכל",
                    "calls": "שיחות",
                    "meetings": "פגישות",
                    "tasks": "משימות",
                    "notes": "הערות"
                },
                "columns": {
                    "type": "סוג",
                    "subject": "נושא",
                    "related": "קשור ל",
                    "due_date": "תאריך יעד",
                    "status": "סטטוס",
                    "notes": "הערות"
                },
                "types": {
                    "call": "שיחה",
                    "meeting": "פגישה",
                    "email": "אימייל",
                    "task": "משימה",
                    "note": "הערה"
                },
                "status": {
                    "pending": "ממתין",
                    "completed": "הושלם",
                    "cancelled": "בוטל",
                    "overdue": "באיחור",
                    "undefined": "הושלם"
                },
                "errors": {
                    "load_failed": "שגיאה בטעינה",
                    "create_failed": "שגיאה ביצירה",
                    "update_failed": "שגיאה בעדכון",
                    "delete_failed": "שגיאה במחיקה"
                }
            },
            "emails": {
                "title": "היסטוריית אימיילים",
                "history_title": "היסטוריית אימיילים",
                "compose": "כתוב אימייל",
                "to": "אל",
                "sent_count": "אימיילים נשלחו",
                "empty_title": "אין אימיילים",
                "empty_description": "אימיילים שנשלחו יופיעו כאן",
                "detail_title": "פרטי אימייל",
                "template_detail": "פרטי תבנית",
                "select_template": "בחר תבנית",
                "use": "השתמש",
                "subject": "נושא",
                "subject_placeholder": "נושא האימייל...",
                "message": "הודעה",
                "message_placeholder": "כתוב את ההודעה שלך...",
                "sending": "שולח...",
                "send": "שלח",
                "sent_success": "אימייל נשלח בהצלחה",
                "send_failed": "שליחה נכשלה",
                "error_empty": "אנא מלא נושא והודעה",
                "deleted": "רשומה נמחקה",
                "delete_confirm": "למחוק את הרשומה?",
                "received_title": "אימיילים שהתקבלו",
                "received_description": "לא מיושם",
                "received_tab": "תיבת דואר",
                "templates_count": "תבניות זמינות",
                "templates_info": "זמין באנגלית, צרפתית ועברית.",
                "no_templates": "אין תבניות זמינות",
                "no_templates_description": "תבניות יופיעו כאן",
                "available_languages": "זמין ב:",
                "columns": {
                    "recipient": "נמען",
                    "subject": "נושא",
                    "date": "תאריך",
                    "status": "סטטוס",
                    "sent_by": "נשלח ע\"י",
                    "from": "מאת",
                    "to": "אל"
                },
                "status": {
                    "sent": "נשלח",
                    "delivered": "הועבר",
                    "opened": "נפתח",
                    "clicked": "נלחץ",
                    "failed": "נכשל",
                    "bounced": "חזר"
                },
                "tabs": {
                    "sent": "נשלחו",
                    "received": "התקבלו",
                    "templates": "תבניות"
                },
                "errors": {
                    "load_failed": "שגיאה בטעינה",
                    "templates_load_failed": "שגיאה בטעינת תבניות",
                    "delete_failed": "שגיאה במחיקה"
                }
            },
            "users": {
                "title": "משתמשים",
                "new": "משתמש חדש",
                "edit": "ערוך משתמש",
                "search_placeholder": "חפש משתמשים...",
                "all_roles": "כל התפקידים",
                "all_statuses": "כל הסטטוסים",
                "active": "פעיל",
                "inactive": "לא פעיל",
                "empty": "לא נמצאו משתמשים",
                "no_name": "ללא שם",
                "created": "משתמש נוצר בהצלחה",
                "updated": "משתמש עודכן בהצלחה",
                "deleted": "משתמש נמחק בהצלחה",
                "delete_confirm": "האם אתה בטוח?",
                "columns": {
                    "user": "משתמש",
                    "email": "אימייל",
                    "role": "תפקיד",
                    "status": "סטטוס",
                    "assigned_leads": "לידים מוקצים",
                    "actions": "פעולות"
                },
                "form": {
                    "email": "אימייל",
                    "first_name": "שם פרטי",
                    "last_name": "שם משפחה",
                    "password": "סיסמה",
                    "password_edit": "סיסמה חדשה (השאר ריק)",
                    "role": "תפקיד",
                    "active_account": "חשבון פעיל"
                },
                "roles": {
                    "admin": "מנהל",
                    "commercial": "מסחרי",
                    "support": "תמיכה"
                },
                "buttons": {
                    "save": "שמור",
                    "cancel": "ביטול",
                    "create": "צור",
                    "modify": "ערוך"
                },
                "errors": {
                    "load_failed": "שגיאה בטעינה",
                    "email_required": "אימייל נדרש",
                    "password_required": "סיסמה נדרשת",
                    "update_failed": "שגיאה בעדכון",
                    "delete_failed": "שגיאה במחיקה"
                }
            },
            "settings": {
                "title": "הגדרות CRM",
                "subtitle": "נהל משתמשים, תגיות ושלבים",
                "tabs": {
                    "users": "משתמשים",
                    "tags": "תגיות",
                    "stages": "שלבי צינור"
                },
                "users": {
                    "updated": "משתמש עודכן",
                    "columns": {
                        "name": "שם",
                        "email": "אימייל",
                        "role": "תפקיד",
                        "status": "סטטוס",
                        "created": "נוצר"
                    },
                    "errors": {
                        "update_failed": "שגיאה בעדכון"
                    }
                },
                "tags": {
                    "add": "הוסף תגית",
                    "created": "תגית נוצרה",
                    "deleted": "תגית נמחקה",
                    "delete_confirm": "למחוק את התגית?",
                    "columns": {
                        "name": "שם",
                        "color": "צבע",
                        "count": "מספר שימושים"
                    },
                    "errors": {
                        "create_failed": "שגיאה ביצירה",
                        "delete_failed": "שגיאה במחיקה"
                    }
                },
                "stages": {
                    "add": "הוסף שלב",
                    "created": "שלב נוצר",
                    "updated": "שלב עודכן",
                    "deleted": "שלב נמחק",
                    "delete_confirm": "למחוק את השלב?",
                    "columns": {
                        "name": "שם"
                    },
                    "errors": {
                        "create_failed": "שגיאה ביצירה",
                        "update_failed": "שגיאה בעדכון",
                        "delete_failed": "שגיאה במחיקה"
                    }
                },
                "errors": {
                    "load_failed": "שגיאה בטעינה"
                }
            },
            "common": {
                "filters": "מסננים",
                "all_statuses": "כל הסטטוסים",
                "all_priorities": "כל העדיפויות",
                "reset": "אפס",
                "edit": "ערוך",
                "delete": "מחק",
                "save": "שמור",
                "cancel": "ביטול",
                "back": "חזרה ל-CRM",
                "back_to_list": "חזרה לרשימה",
                "actions": "פעולות",
                "export": "ייצוא",
                "search": "חיפוש...",
                "loading": "טוען...",
                "no_data": "אין נתונים",
                "no_history": "אין היסטוריה",
                "confirm": "אישור",
                "confirm_delete": "האם אתה בטוח?",
                "close": "סגור",
                "add": "הוסף",
                "create": "צור",
                "update": "עדכן",
                "view": "צפה בפרטים",
                "refresh": "רענן",
                "refreshed": "הנתונים רועננו",
                "no_notes": "אין הערות",
                "no_opportunities": "אין הזדמנויות",
                "no_activities": "אין פעילויות",
                "created": "נוצר",
                "updated": "עודכן",
                "language": "שפה",
                "reference": "מזהה",
                "send_email": "שלח אימייל"
            },
            "errors": {
                "load_failed": "טעינה נכשלה",
                "create_failed": "יצירה נכשלה",
                "update_failed": "עדכון נכשל",
                "delete_failed": "מחיקה נכשלה",
                "export_failed": "ייצוא נכשל",
                "note_failed": "הוספת הערה נכשלה",
                "status_failed": "עדכון סטטוס נכשל",
                "stage_failed": "עדכון שלב נכשל",
                "convert_failed": "המרה נכשלה",
                "lead_not_found": "ליד לא נמצא"
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
            "priorities": {
                "A": "גבוהה (A)",
                "B": "בינונית (B)",
                "C": "נמוכה (C)",
                "undefined": "לא מוגדר"
            },
            "breadcrumb": {
                "home": "דף הבית"
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
    
    # Merge translations (this will overwrite existing crm keys with fixed versions)
    if lang in CRM_TRANSLATIONS:
        deep_merge(data, CRM_TRANSLATIONS[lang])
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ {lang}.json updated with correct structure and encoding")

def main():
    print("=" * 60)
    print("  FIX CRM Translation Structure")
    print("  Using correct structure: crm.* (not admin.crm.*)")
    print("=" * 60)
    print()
    
    for lang in ["fr", "en", "he"]:
        process_file(lang)
    
    print()
    print("✓ All translation files fixed!")
    print()

if __name__ == "__main__":
    main()
