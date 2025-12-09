"""
Service de notifications email pour les leads Étude d'Implantation 360°
Utilise les variables d'environnement pour la configuration SMTP
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)


class EmailNotificationService:
    """Service d'envoi d'emails de notification"""
    
    def __init__(self):
        # Configuration depuis variables d'environnement
        self.smtp_host = os.getenv('EMAIL_BACKEND_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('EMAIL_BACKEND_PORT', '587'))
        self.smtp_username = os.getenv('EMAIL_BACKEND_USERNAME')
        self.smtp_password = os.getenv('EMAIL_BACKEND_PASSWORD')
        self.notifications_to = os.getenv('EMAIL_NOTIFICATIONS_TO', 'postmaster@israelgrowthventure.com')
        self.from_email = os.getenv('EMAIL_FROM', 'no-reply@israelgrowthventure.com')
        
        # Check if email is configured
        self.is_configured = bool(self.smtp_username and self.smtp_password)
        
        if not self.is_configured:
            logger.warning(
                "Email service not fully configured. "
                "Set EMAIL_BACKEND_USERNAME and EMAIL_BACKEND_PASSWORD environment variables."
            )
    
    async def send_etude_implantation_360_notification(self, lead_data: Dict) -> bool:
        """
        Envoie une notification email pour un nouveau lead Étude 360°
        
        Args:
            lead_data: Dictionnaire contenant les données du lead
            
        Returns:
            bool: True si envoi réussi, False sinon
        """
        if not self.is_configured:
            logger.warning("Email not configured - skipping notification")
            return False
        
        try:
            # Créer le message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = '[IGV] Nouveau lead Étude d\'Implantation 360°'
            msg['From'] = self.from_email
            msg['To'] = self.notifications_to
            
            # Corps du message
            horizon_labels = {
                '0-6': '0–6 mois',
                '6-12': '6–12 mois',
                '12+': '12+ mois',
                'unknown': 'Je ne sais pas encore'
            }
            
            horizon = lead_data.get('implantation_horizon', 'unknown')
            horizon_label = horizon_labels.get(horizon, horizon)
            
            text_content = f"""
Nouveau lead Étude d'Implantation 360°

Informations du contact :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom : {lead_data.get('full_name', 'N/A')}
Email : {lead_data.get('work_email', 'N/A')}
Rôle : {lead_data.get('role', 'Non renseigné')}
Marque/Groupe : {lead_data.get('brand_group', 'Non renseigné')}
Horizon : {horizon_label}

Détails techniques :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source : {lead_data.get('source', 'N/A')}
Langue : {lead_data.get('locale', 'N/A')}
Date : {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
ID : {lead_data.get('_id', 'N/A')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action recommandée : Contacter sous 24h pour un échange exploratoire
            """
            
            part1 = MIMEText(text_content, 'plain')
            msg.attach(part1)
            
            # Envoyer l'email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email notification sent for lead: {lead_data.get('work_email')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {e}", exc_info=True)
            return False


# Instance globale du service
email_service = EmailNotificationService()
