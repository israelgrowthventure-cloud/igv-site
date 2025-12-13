import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Initialize Monetico payment
 */
export const initMoneticoPayment = async ({
    pack_slug,
    amount,
    currency = 'EUR',
    customer_email,
    customer_name,
    order_reference
}) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/payment/monetico/init`, {
            pack_slug,
            amount,
            currency,
            customer_email,
            customer_name,
            order_reference
        });

        return response.data;
    } catch (error) {
        console.error('Monetico init error:', error);
        throw new Error(
            error.response?.data?.detail || 'Payment initialization failed'
        );
    }
};

/**
 * Submit Monetico payment form
 */
export const submitMoneticoForm = (formData, moneticoUrl) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = moneticoUrl;

    // Add all hidden fields
    Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

export default {
    initMoneticoPayment,
    submitMoneticoForm
};
