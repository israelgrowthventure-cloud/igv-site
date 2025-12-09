# -*- coding: utf-8 -*-
"""
Provider Monetico Payment Services (CIC/Crédit Mutuel)
Gère l'initialisation et la validation des paiements CB via Monetico
"""

import os
import hmac
import hashlib
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from .base import PaymentProvider


class MoneticoPaymentProvider(PaymentProvider):
    """Provider pour paiements CB via Monetico (CIC/Crédit Mutuel)"""
    
    def __init__(self):
        # Variables d'environnement Monetico (NOMS uniquement, pas de valeurs par défaut)
        self.tpe = os.getenv('MONETICO_TPE')
        self.company_code = os.getenv('MONETICO_COMPANY_CODE')
        self.key = os.getenv('MONETICO_KEY')
        self.env = os.getenv('MONETICO_ENV', 'TEST')  # TEST ou PROD
        self.url_success = os.getenv('MONETICO_URL_SUCCESS', 'https://israelgrowthventure.com/payment/success')
        self.url_failure = os.getenv('MONETICO_URL_FAILURE', 'https://israelgrowthventure.com/payment/failure')
        
        # URL Monetico selon environnement
        self.payment_url = (
            'https://p.monetico-services.com/paiement.cgi'
            if self.env == 'PROD'
            else 'https://p.monetico-services.com/test/paiement.cgi'
        )
    
    def is_configured(self) -> bool:
        """Vérifier si Monetico est configuré"""
        return all([self.tpe, self.company_code, self.key])
    
    def get_provider_name(self) -> str:
        """Nom du provider"""
        return 'monetico'
    
    def initialize_payment(
        self,
        amount: Decimal,
        currency: str,
        pack_slug: str,
        customer_email: str,
        customer_name: str,
        order_reference: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Initialiser un paiement Monetico
        
        Returns:
            {
                'form_action': URL Monetico,
                'form_method': 'POST',
                'form_fields': {champ: valeur, ...}
            }
        """
        if not self.is_configured():
            raise ValueError("Monetico non configuré : variables d'environnement manquantes")
        
        # Formater montant (ex: 12000.50 → "12000.50EUR")
        amount_str = f"{amount:.2f}{currency}"
        
        # Date/heure transaction (format Monetico : DD/MM/YYYY:HH:MM:SS)
        date_str = datetime.now().strftime("%d/%m/%Y:%H:%M:%S")
        
        # Contexte de commande (libre text, JSON encodé)
        context = {
            'pack': pack_slug,
            'customer_email': customer_email,
            'customer_name': customer_name
        }
        
        # Données du formulaire Monetico
        form_data = {
            'version': '3.0',
            'TPE': self.tpe,
            'date': date_str,
            'montant': amount_str,
            'reference': order_reference,
            'texte-libre': f'Pack {pack_slug}',
            'lgue': 'FR',
            'societe': self.company_code,
            'mail': customer_email,
            'url_retour': self.url_success,
            'url_retour_ok': self.url_success,
            'url_retour_err': self.url_failure,
        }
        
        # Calcul du MAC (Message Authentication Code) HMAC-SHA1
        mac = self._compute_mac(form_data)
        form_data['MAC'] = mac
        
        return {
            'form_action': self.payment_url,
            'form_method': 'POST',
            'form_fields': form_data
        }
    
    def validate_payment(self, data: Dict[str, Any]) -> bool:
        """
        Valider une notification de retour Monetico
        
        Args:
            data: Données POST du retour Monetico
            
        Returns:
            True si MAC valide et paiement accepté
        """
        if not self.is_configured():
            return False
        
        # Extraire MAC reçu
        received_mac = data.get('MAC', '')
        
        # Reconstruire données pour calcul MAC
        validation_data = {
            'TPE': data.get('TPE'),
            'date': data.get('date'),
            'montant': data.get('montant'),
            'reference': data.get('reference'),
            'texte-libre': data.get('texte-libre'),
            'code-retour': data.get('code-retour'),
        }
        
        # Calculer MAC attendu
        expected_mac = self._compute_mac(validation_data)
        
        # Vérifier MAC + code retour (payetest = test OK, paiement = prod OK)
        code_retour = data.get('code-retour', '')
        return (
            hmac.compare_digest(received_mac, expected_mac) and
            code_retour in ['payetest', 'paiement']
        )
    
    def _compute_mac(self, data: Dict[str, Any]) -> str:
        """
        Calculer le MAC (HMAC-SHA1) selon spécifications Monetico
        
        Format chaîne : TPE*date*montant*reference*texte-libre*version*lgue*societe*mail...
        """
        # Construire chaîne de données selon ordre Monetico
        chain_parts = [
            data.get('TPE', ''),
            data.get('date', ''),
            data.get('montant', ''),
            data.get('reference', ''),
            data.get('texte-libre', ''),
            data.get('version', '3.0'),
            data.get('lgue', 'FR'),
            data.get('societe', self.company_code or ''),
            data.get('mail', ''),
        ]
        
        # Joindre avec '*'
        chain = '*'.join(str(p) for p in chain_parts)
        
        # HMAC-SHA1 avec clé Monetico
        key_bytes = self.key.encode('utf-8') if self.key else b''
        chain_bytes = chain.encode('utf-8')
        
        mac = hmac.new(key_bytes, chain_bytes, hashlib.sha1).hexdigest()
        return mac.upper()
