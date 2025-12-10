// ============================================================
// API Client - Paiements Monetico
// ============================================================
// Client pour interagir avec l'endpoint Monetico backend
// Gère l'initialisation des paiements CB via Monetico (CIC)
// ============================================================

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Initialiser un paiement Monetico
 * @param {Object} params - Paramètres du paiement
 * @param {string} params.pack - Slug du pack (analyse, succursales, franchise)
 * @param {number} params.amount - Montant en EUR
 * @param {string} params.currency - Devise (EUR par défaut)
 * @param {string} params.customer_email - Email client
 * @param {string} params.customer_name - Nom client
 * @param {string} params.order_reference - Référence commande unique
 * @returns {Promise<Object>} Données du formulaire Monetico
 */
export async function initMoneticoPayment({ 
  pack, 
  amount, 
  currency = 'EUR',
  customer_email,
  customer_name,
  order_reference
}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payments/monetico/init`, {
      pack,
      amount,
      currency,
      customer_email,
      customer_name,
      order_reference
    });

    return response.data;
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 503 = Monetico non configuré (cas attendu)
      if (status === 503) {
        throw new Error(data.detail?.message || data.detail || 'Paiement CB non disponible');
      }

      // 400 = Erreur validation
      if (status === 400) {
        throw new Error(data.detail || 'Données de paiement invalides');
      }

      // 500 = Erreur serveur
      if (status === 500) {
        throw new Error('Erreur serveur lors de l\'initialisation du paiement');
      }

      throw new Error(data.detail || 'Erreur paiement Monetico');
    }

    // Erreur réseau ou autre
    throw new Error('Impossible de contacter le serveur de paiement');
  }
}

/**
 * Soumettre le formulaire Monetico dynamiquement
 * @param {Object} formData - Données retournées par initMoneticoPayment
 * @param {string} formData.form_action - URL Monetico
 * @param {string} formData.form_method - Méthode POST
 * @param {Object} formData.form_fields - Champs du formulaire
 */
export function submitMoneticoForm(formData) {
  const form = document.createElement('form');
  form.method = formData.form_method || 'POST';
  form.action = formData.form_action;

  // Ajouter tous les champs cachés
  Object.entries(formData.form_fields || {}).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
