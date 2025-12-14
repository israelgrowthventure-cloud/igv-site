// Configuration des prix par région
// Modifiable facilement pour ajuster les tarifs

export const PRICING_CONFIG = {
  europe: {
    name: 'Europe',
    currency: '€',
    packs: {
      analyse: { price: 3000, label: '3 000 €' },
      succursales: { price: 15000, label: '15 000 €' },
      franchise: { price: 15000, label: '15 000 €' }
    }
  },
  usa: {
    name: 'USA / North America',
    currency: '$',
    packs: {
      analyse: { price: 4000, label: '4 000 $' },
      succursales: { price: 30000, label: '30 000 $' },
      franchise: { price: 30000, label: '30 000 $' }
    }
  },
  israel: {
    name: 'Israel',
    currency: '₪',
    packs: {
      analyse: { price: 7000, label: '7 000 ₪' },
      succursales: { price: 55000, label: '55 000 ₪' },
      franchise: { price: 55000, label: '55 000 ₪' }
    }
  },
  other: {
    name: 'Asia / Africa / Other',
    currency: '$',
    packs: {
      analyse: { price: 4000, label: '4 000 $' },
      succursales: { price: 30000, label: '30 000 $' },
      franchise: { price: 30000, label: '30 000 $' }
    }
  }
};

// Fonction pour obtenir le pricing selon la région
export const getPricing = (region = 'europe') => {
  return PRICING_CONFIG[region] || PRICING_CONFIG.europe;
};

// Fonction pour formater le prix
export const formatPrice = (price, currency) => {
  return `${price.toLocaleString()} ${currency}`;
};
