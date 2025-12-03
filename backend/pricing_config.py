"""
Configuration centralisée des prix par zone géographique
=========================================================

Ce module gère la logique de pricing dynamique par zone géographique.
Utilisé par le backend pour calculer les prix en fonction du pays de l'utilisateur.

ZONES SUPPORTÉES:
- EU: Europe (EUR)
- US_CA: USA et Canada (USD)
- IL: Israël (ILS)
- ASIA_AFRICA: Asie et Afrique (USD)

FONCTIONNALITÉS:
- Mapping pays → zone (COUNTRY_TO_ZONE)
- Prix par pack et par zone (PRICING_CONFIG)
- Conversion monétaire pour Stripe (to_stripe_amount)
- Calcul mensualités (3x, 12x)
- Formatage prix localisé (format_price)

STRUCTURE PRICING_CONFIG:
{
    Zone.EU: {
        PackType.ANALYSE: 3000 EUR,
        PackType.SUCCURSALES: 15000 EUR,
        PackType.FRANCHISE: 15000 EUR
    },
    ...
}

UTILISATION DANS server.py:
- get_zone_from_country(country_code) → Zone
- get_price_for_pack(pack_type, zone) → int (prix en unité monétaire)
- get_currency_for_zone(zone) → str (code devise ISO)
- to_stripe_amount(amount, currency) → int (montant en centimes/agorot)

ROUTES BACKEND UTILISANT CE MODULE:
- GET /api/pricing?packId=...&zone=...
- GET /api/pricing/country/{country_code}
- POST /api/orders/create-payment-intent

Tous les montants sont en unités métier (euros, dollars, shekels).
Conversion en plus petites unités (cents/agorot) effectuée lors de la création de session Stripe.
"""

from enum import Enum
from typing import Dict, Literal

class Zone(str, Enum):
    """Zones géographiques supportées"""
    EU = "EU"
    US_CA = "US_CA"
    IL = "IL"
    ASIA_AFRICA = "ASIA_AFRICA"

class Currency(str, Enum):
    """Devises supportées"""
    EUR = "eur"
    USD = "usd"
    ILS = "ils"

class PackType(str, Enum):
    """Types de packs disponibles"""
    ANALYSE = "analyse"
    SUCCURSALES = "succursales"
    FRANCHISE = "franchise"

class PlanType(str, Enum):
    """Types de plan de paiement"""
    ONE_SHOT = "ONE_SHOT"
    THREE_TIMES = "3X"
    TWELVE_TIMES = "12X"

# Mapping des pays vers les zones
COUNTRY_TO_ZONE: Dict[str, Zone] = {
    # Europe
    "FR": Zone.EU, "DE": Zone.EU, "IT": Zone.EU, "ES": Zone.EU, "PT": Zone.EU,
    "BE": Zone.EU, "NL": Zone.EU, "LU": Zone.EU, "AT": Zone.EU, "CH": Zone.EU,
    "GB": Zone.EU, "IE": Zone.EU, "DK": Zone.EU, "SE": Zone.EU, "NO": Zone.EU,
    "FI": Zone.EU, "PL": Zone.EU, "CZ": Zone.EU, "HU": Zone.EU, "RO": Zone.EU,
    "GR": Zone.EU, "BG": Zone.EU, "HR": Zone.EU, "SI": Zone.EU, "SK": Zone.EU,
    "EE": Zone.EU, "LV": Zone.EU, "LT": Zone.EU, "CY": Zone.EU, "MT": Zone.EU,
    
    # USA / Canada
    "US": Zone.US_CA, "CA": Zone.US_CA,
    
    # Israël
    "IL": Zone.IL,
    
    # Asie
    "CN": Zone.ASIA_AFRICA, "JP": Zone.ASIA_AFRICA, "KR": Zone.ASIA_AFRICA,
    "IN": Zone.ASIA_AFRICA, "SG": Zone.ASIA_AFRICA, "TH": Zone.ASIA_AFRICA,
    "VN": Zone.ASIA_AFRICA, "ID": Zone.ASIA_AFRICA, "MY": Zone.ASIA_AFRICA,
    "PH": Zone.ASIA_AFRICA, "HK": Zone.ASIA_AFRICA, "TW": Zone.ASIA_AFRICA,
    
    # Afrique
    "ZA": Zone.ASIA_AFRICA, "EG": Zone.ASIA_AFRICA, "MA": Zone.ASIA_AFRICA,
    "TN": Zone.ASIA_AFRICA, "DZ": Zone.ASIA_AFRICA, "NG": Zone.ASIA_AFRICA,
    "KE": Zone.ASIA_AFRICA, "GH": Zone.ASIA_AFRICA, "SN": Zone.ASIA_AFRICA,
    "CI": Zone.ASIA_AFRICA, "CM": Zone.ASIA_AFRICA, "ET": Zone.ASIA_AFRICA,
}

# Configuration des prix par zone
PRICING_CONFIG: Dict[Zone, Dict] = {
    Zone.EU: {
        "currency": Currency.EUR,
        "currency_symbol": "€",
        "packs": {
            PackType.ANALYSE: 3000,
            PackType.SUCCURSALES: 15000,
            PackType.FRANCHISE: 15000,
        },
    },
    Zone.US_CA: {
        "currency": Currency.USD,
        "currency_symbol": "$",
        "packs": {
            PackType.ANALYSE: 4000,
            PackType.SUCCURSALES: 30000,
            PackType.FRANCHISE: 30000,
        },
    },
    Zone.IL: {
        "currency": Currency.ILS,
        "currency_symbol": "₪",
        "packs": {
            PackType.ANALYSE: 7000,
            PackType.SUCCURSALES: 55000,
            PackType.FRANCHISE: 55000,
        },
    },
    Zone.ASIA_AFRICA: {
        "currency": Currency.USD,
        "currency_symbol": "$",
        "packs": {
            PackType.ANALYSE: 4000,
            PackType.SUCCURSALES: 30000,
            PackType.FRANCHISE: 30000,
        },
    },
}

def get_zone_from_country(country_code: str) -> Zone:
    """
    Retourne la zone géographique à partir du code pays ISO.
    Fallback vers EU si le pays n'est pas trouvé.
    """
    return COUNTRY_TO_ZONE.get(country_code.upper(), Zone.EU)

def get_price_for_pack(zone: Zone, pack_type: PackType) -> int:
    """
    Retourne le prix d'un pack pour une zone donnée (en unités métier).
    """
    return PRICING_CONFIG[zone]["packs"][pack_type]

def get_currency_for_zone(zone: Zone) -> str:
    """
    Retourne la devise (code Stripe) pour une zone.
    """
    currency = PRICING_CONFIG[zone]["currency"]
    return currency.value if isinstance(currency, Currency) else currency

def get_currency_symbol(zone: Zone) -> str:
    """
    Retourne le symbole de la devise pour une zone.
    """
    return PRICING_CONFIG[zone]["currency_symbol"]

def to_stripe_amount(amount: int, currency: str) -> int:
    """
    Convertit un montant en unités métier vers les plus petites unités Stripe.
    - EUR, USD : x100 (cents)
    - ILS : x100 (agorot)
    """
    # Toutes nos devises utilisent le facteur 100
    return amount * 100

def calculate_monthly_amount(total: int, installments: int) -> int:
    """
    Calcule le montant mensuel pour un paiement échelonné.
    Arrondi à l'entier supérieur pour éviter les pertes.
    """
    import math
    return math.ceil(total / installments)

def format_price(amount: int, zone: Zone) -> str:
    """
    Formate un prix pour l'affichage avec le bon symbole et séparateurs.
    """
    symbol = get_currency_symbol(zone)
    # Format avec espaces comme séparateurs de milliers
    formatted = f"{amount:,}".replace(",", " ")
    
    if zone == Zone.IL:
        return f"{formatted} {symbol}"  # Shekel après le nombre
    else:
        return f"{formatted} {symbol}"  # Standard
