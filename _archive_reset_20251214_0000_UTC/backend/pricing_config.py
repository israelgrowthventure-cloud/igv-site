"""
Pricing Configuration for IGV Packs
Supports 4 regional zones with currency-specific pricing
"""

# Zone mapping for geolocation
ZONE_MAPPING = {
    'EU': {
        'countries': ['FR', 'BE', 'CH', 'LU', 'MC', 'DE', 'IT', 'ES', 'PT', 'NL', 'GB', 'IE', 'AT', 'DK', 'SE', 'NO', 'FI'],
        'currency': 'EUR',
        'symbol': '€',
        'multiplier': 1.0
    },
    'US_CA': {
        'countries': ['US', 'CA'],
        'currency': 'USD',
        'symbol': '$',
        'multiplier': 1.33  # ~1.33x for USD conversion
    },
    'IL': {
        'countries': ['IL'],
        'currency': 'ILS',
        'symbol': '₪',
        'multiplier': 2.33  # ~3.7 ILS per EUR, ~7000 ILS for 3000 EUR pack
    },
    'ASIA_AFRICA': {
        'countries': [],  # Default for unlisted countries
        'currency': 'USD',
        'symbol': '$',
        'multiplier': 1.33
    }
}

# Base prices in EUR
PACK_BASE_PRICES = {
    'analyse': 3000.0,
    'succursales': 15000.0,
    'franchise': 15000.0
}

# Pack definitions with multilingual content
PACKS_DATA = [
    {
        "id": "ce97cb34-376f-4450-847a-42db24457773",
        "slug": "analyse",
        "name": {
            "fr": "Pack Analyse",
            "en": "Analysis Pack",
            "he": "חבילת ניתוח"
        },
        "description": {
            "fr": "Analyse du potentiel de la marque et définition du plan d'expansion.",
            "en": "Analysis of brand potential and expansion plan definition.",
            "he": "ניתוח פוטנציאל המותג והגדרת התכנית."
        },
        "features": {
            "fr": [
                "Analyse complète du marché israélien",
                "Étude de la concurrence et des zones à fort potentiel",
                "Identification des formats et villes prioritaires",
                "Scénarios d'implantation (succursales, franchise, master)",
                "Recommandations stratégiques et estimation budgétaire"
            ],
            "en": [
                "Complete Israeli market analysis",
                "Competition and high-potential zones study",
                "Priority formats and cities identification",
                "Implementation scenarios (branches, franchise, master)",
                "Strategic recommendations and budget estimation"
            ],
            "he": [
                "ניתוח מלא של השוק הישראלי",
                "מחקר תחרות ואזורי פוטנציאל גבוה",
                "זיהוי פורמטים וערים עדיפים",
                "תסריטי הטמעה (סניפים, זכיינות, מאסטר)",
                "המלצות אסטרטגיות והערכת תקציב"
            ]
        },
        "base_price": 3000.0,
        "currency": "EUR",
        "order": 0,
        "active": True
    },
    {
        "id": "19a1f57b-e064-4f40-a2cb-ee56373e70d1",
        "slug": "succursales",
        "name": {
            "fr": "Pack Succursales",
            "en": "Branches Pack",
            "he": "חבילת סניפים"
        },
        "description": {
            "fr": "Lancement opérationnel de l'expansion par succursales (Analyse incluse).",
            "en": "Operational launch of expansion through branches (Analysis included).",
            "he": "השקה תפעולית של ההרחבה באמצעות סניפים (ניתוח כלול)."
        },
        "features": {
            "fr": [
                "Pack Analyse inclus dans le prix",
                "Recherche et qualification de locaux commerciaux ciblés",
                "Négociation avec les propriétaires et centres commerciaux",
                "Accompagnement juridique et administratif complet",
                "Suivi jusqu'à l'ouverture opérationnelle",
                "Revue de performance 3 mois après ouverture"
            ],
            "en": [
                "Analysis Pack included in the price",
                "Targeted commercial premises search and qualification",
                "Negotiation with owners and shopping centers",
                "Complete legal and administrative support",
                "Support until operational opening",
                "Performance review 3 months after opening"
            ],
            "he": [
                "חבילת ניתוח כלולה במחיר",
                "חיפוש וסינון של מקומות מסחריים ממוקדים",
                "משא ומתן עם בעלים ומרכזים מסחריים",
                "תמיכה משפטית ואדמיניסטרטיבית מלאה",
                "ליווי עד להשקה תפעולית",
                "סקירת ביצועים 3 חודשים לאחר הפתיחה"
            ]
        },
        "base_price": 15000.0,
        "currency": "EUR",
        "order": 1,
        "active": True
    },
    {
        "id": "019a428e-5d58-496b-9e74-f70e4c26e942",
        "slug": "franchise",
        "name": {
            "fr": "Pack Franchise",
            "en": "Franchise Pack",
            "he": "חבילת זכיינות"
        },
        "description": {
            "fr": "Lancement opérationnel de l'expansion par franchise (Analyse incluse).",
            "en": "Operational launch of expansion through franchise (Analysis included).",
            "he": "השקה תפעולית של ההרחבה באמצעות זכיינות (ניתוח כלול)."
        },
        "features": {
            "fr": [
                "Pack Analyse inclus dans le prix",
                "Analyse de la franchise et adaptation au marché israélien",
                "Création du manuel opératoire complet",
                "Stratégie de recrutement et sélection des franchisés",
                "Accompagnement juridique et contractuel",
                "Formation des franchisés et lancement des premières ouvertures"
            ],
            "en": [
                "Analysis Pack included in the price",
                "Franchise analysis and adaptation to Israeli market",
                "Complete operations manual creation",
                "Franchisee recruitment and selection strategy",
                "Legal and contractual support",
                "Franchisee training and launch of first openings"
            ],
            "he": [
                "חבילת ניתוח כלולה במחיר",
                "ניתוח הזכיינות והתאמה לשוק הישראלי",
                "יצירת מדריך תפעול מלא",
                "אסטרטגיית גיוס ובחירת זכיינים",
                "ליווי משפטי וחוזי",
                "הכשרת זכיינים והשקת הפתיחות הראשונות"
            ]
        },
        "base_price": 15000.0,
        "currency": "EUR",
        "order": 2,
        "active": True
    }
]


def get_zone_from_country_code(country_code):
    """Determine pricing zone from country code"""
    for zone, config in ZONE_MAPPING.items():
        if country_code in config['countries']:
            return zone
    return 'ASIA_AFRICA'  # Default zone


def calculate_price(pack_slug, zone='EU'):
    """Calculate price for a pack in a specific zone"""
    if pack_slug not in PACK_BASE_PRICES:
        raise ValueError(f"Unknown pack: {pack_slug}")
    
    base_price = PACK_BASE_PRICES[pack_slug]
    zone_config = ZONE_MAPPING.get(zone, ZONE_MAPPING['EU'])
    
    # Calculate final price
    final_price = base_price * zone_config['multiplier']
    
    # Format display strings
    symbol = zone_config['symbol']
    currency = zone_config['currency']
    
    # Round based on currency (ILS needs rounding to nearest 10)
    if currency == 'ILS':
        final_price = round(final_price / 10) * 10
    else:
        final_price = round(final_price, 2)
    
    return {
        'zone': zone,
        'price': final_price,
        'currency': currency,
        'symbol': symbol,
        'display': {
            'total': f"{int(final_price):,} {symbol}".replace(',', ' '),
            'three_times': f"3 x {int(final_price / 3):,} {symbol}".replace(',', ' '),
            'twelve_times': f"12 x {int(final_price / 12):,} {symbol}".replace(',', ' ')
        }
    }


def get_all_packs():
    """Get all available packs"""
    return PACKS_DATA
