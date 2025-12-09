# -*- coding: utf-8 -*-
"""
Interface abstraite PaymentProvider
Permet de gérer plusieurs fournisseurs de paiement (Monetico, Stripe legacy, etc.)
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from decimal import Decimal


class PaymentProvider(ABC):
    """Interface abstraite pour les providers de paiement"""
    
    @abstractmethod
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
        Initialiser une transaction de paiement
        
        Args:
            amount: Montant à payer
            currency: Devise (EUR, USD, ILS...)
            pack_slug: Slug du pack acheté
            customer_email: Email client
            customer_name: Nom client
            order_reference: Référence unique de commande
            **kwargs: Paramètres additionnels
            
        Returns:
            Dict contenant les données nécessaires pour initier le paiement
            (URL, form fields, etc.)
        """
        pass
    
    @abstractmethod
    def validate_payment(self, data: Dict[str, Any]) -> bool:
        """
        Valider une notification de paiement (callback/webhook)
        
        Args:
            data: Données reçues du provider
            
        Returns:
            True si paiement valide, False sinon
        """
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """
        Vérifier si le provider est correctement configuré
        
        Returns:
            True si toutes les variables d'environnement nécessaires sont présentes
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Retourner le nom du provider (ex: 'monetico', 'stripe')"""
        pass
