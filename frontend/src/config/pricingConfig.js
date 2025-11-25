/**
 * Configuration centralisée des prix par zone géographique (frontend)
 * 
 * Cette configuration est synchronisée avec le backend (pricing_config.py).
 * Les prix sont récupérés dynamiquement via l'API /api/pricing.
 */

export const ZONES = {
  EU: 'EU',
  US_CA: 'US_CA',
  IL: 'IL',
  ASIA_AFRICA: 'ASIA_AFRICA',
};

export const PLAN_TYPES = {
  ONE_SHOT: 'ONE_SHOT',
  THREE_TIMES: '3X',
  TWELVE_TIMES: '12X',
};

export const PACK_IDS = {
  ANALYSE: 'analyse',
  SUCCURSALES: 'succursales',
  FRANCHISE: 'franchise',
};

/**
 * Configuration statique des prix par zone (pour référence)
 * En production, utiliser l'API /api/pricing pour les prix actualisés
 */
export const STATIC_PRICING = {
  [ZONES.EU]: {
    currency: 'eur',
    symbol: '€',
    packs: {
      [PACK_IDS.ANALYSE]: 3000,
      [PACK_IDS.SUCCURSALES]: 15000,
      [PACK_IDS.FRANCHISE]: 15000,
    },
  },
  [ZONES.US_CA]: {
    currency: 'usd',
    symbol: '$',
    packs: {
      [PACK_IDS.ANALYSE]: 4000,
      [PACK_IDS.SUCCURSALES]: 30000,
      [PACK_IDS.FRANCHISE]: 30000,
    },
  },
  [ZONES.IL]: {
    currency: 'ils',
    symbol: '₪',
    packs: {
      [PACK_IDS.ANALYSE]: 7000,
      [PACK_IDS.SUCCURSALES]: 55000,
      [PACK_IDS.FRANCHISE]: 55000,
    },
  },
  [ZONES.ASIA_AFRICA]: {
    currency: 'usd',
    symbol: '$',
    packs: {
      [PACK_IDS.ANALYSE]: 4000,
      [PACK_IDS.SUCCURSALES]: 30000,
      [PACK_IDS.FRANCHISE]: 30000,
    },
  },
};

/**
 * Formatte un prix avec le bon symbole et séparateurs
 */
export const formatPrice = (amount, zone = ZONES.EU) => {
  const config = STATIC_PRICING[zone];
  if (!config) return `${amount}`;
  
  const formatted = amount.toLocaleString('fr-FR');
  
  if (zone === ZONES.IL) {
    return `${formatted} ${config.symbol}`;
  }
  return `${formatted} ${config.symbol}`;
};

/**
 * Calcule le montant mensuel pour un paiement échelonné
 */
export const calculateMonthlyAmount = (total, installments) => {
  return Math.ceil(total / installments);
};
