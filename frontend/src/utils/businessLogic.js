/**
 * TECHNICAL LOGIC UTILITIES
 * =========================
 * This file preserves all technical business logic that was hardcoded in pages.
 * These utilities can be imported and used by CMS-rendered components.
 * 
 * ARCHITECTURE PRINCIPLE:
 * - Visual layout = CMS controlled (blocks, styles, content)
 * - Business logic = Code controlled (calculations, API calls, validations)
 * 
 * This separation allows:
 * - Designers to change layouts freely in CMS
 * - Developers to maintain business logic in code
 * - No risk of breaking calculations when changing design
 */

import { API_BASE_URL } from '../config/apiConfig';

/**
 * PACK DEFINITIONS
 * These are the 3 packs available for purchase
 */
export const PACK_IDS = {
  ANALYSE: 'analyse',
  SUCCURSALES: 'succursales',
  FRANCHISE: 'franchise',
};

export const PACK_DEFAULTS = {
  [PACK_IDS.ANALYSE]: {
    id: 'analyse',
    fallbackPrice: 7000,
    fallbackPriceLabel: '7 000 ₪',
  },
  [PACK_IDS.SUCCURSALES]: {
    id: 'succursales',
    fallbackPrice: 55000,
    fallbackPriceLabel: '55 000 ₪',
  },
  [PACK_IDS.FRANCHISE]: {
    id: 'franchise',
    fallbackPrice: 55000,
    fallbackPriceLabel: '55 000 ₪',
  },
};

/**
 * PAYMENT PLAN TYPES
 */
export const PLAN_TYPES = {
  ONE_SHOT: 'ONE_SHOT',
  THREE_TIMES: '3X',
  TWELVE_TIMES: '12X',
};

/**
 * Create Stripe Checkout Session
 * @param {object} params - Checkout parameters
 * @returns {Promise<string>} Stripe checkout URL
 */
export const createCheckoutSession = async ({
  packId,
  planType,
  zone,
  fullName,
  company,
  email,
  phone,
  country
}) => {
  const response = await fetch(`${API_BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pack_id: packId,
      plan_type: planType,
      zone: zone,
      customer_info: {
        name: fullName,
        email: email,
        phone: phone,
        company: company,
        country: country
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data.checkout_url;
};

/**
 * Format price for display based on language
 * Reverses numbers for Hebrew RTL display
 * 
 * @param {string} priceString - Price string (e.g., "7 000 ₪")
 * @param {string} language - Current language (en, fr, he)
 * @returns {string} Formatted price
 */
export const formatPriceForLanguage = (priceString, language) => {
  if (!priceString) return '';
  
  if (language === 'he') {
    // Reverse numeric groups for Hebrew RTL
    return priceString.replace(/\d[\d\s]*/g, (match) => {
      return match.split('').reverse().join('');
    });
  }
  
  return priceString;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate checkout form data
 */
export const validateCheckoutForm = (formData) => {
  const errors = {};

  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  }

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }

  if (!formData.phone || formData.phone.trim().length < 8) {
    errors.phone = 'Invalid phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Send contact form email
 */
export const sendContactEmail = async ({ name, email, phone, company, message }) => {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      company,
      message
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to send message');
  }

  return await response.json();
};

/**
 * Book appointment via calendar
 */
export const bookAppointment = async ({ name, email, phone, company, date, time, message }) => {
  const response = await fetch(`${API_BASE_URL}/api/appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      company,
      date,
      time,
      message
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to book appointment');
  }

  return await response.json();
};

export default {
  PACK_IDS,
  PACK_DEFAULTS,
  PLAN_TYPES,
  createCheckoutSession,
  formatPriceForLanguage,
  isValidEmail,
  validateCheckoutForm,
  sendContactEmail,
  bookAppointment,
};
