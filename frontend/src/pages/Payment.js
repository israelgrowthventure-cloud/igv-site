import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ArrowRight, Shield, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { getPricing } from '../utils/pricing';

const Payment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [packData, setPackData] = useState(null);
  const [location, setLocation] = useState(null);
  const [pricing, setPricing] = useState(null);

  const packId = searchParams.get('pack');

  useEffect(() => {
    // Detect location and pricing
    api.detectLocation().then(data => {
      setLocation(data);
      setPricing(getPricing(data.region));
    }).catch(() => {
      setLocation({ region: 'europe', country: 'France', currency: '€' });
      setPricing(getPricing('europe'));
    });

    // Get pack data
    if (packId) {
      const packs = {
        analyse: {
          name: t('packs.analyse.name'),
          description: t('packs.analyse.description')
        },
        succursales: {
          name: t('packs.succursales.name'),
          description: t('packs.succursales.description')
        },
        franchise: {
          name: t('packs.franchise.name'),
          description: t('packs.franchise.description')
        }
      };
      setPackData(packs[packId] || null);
    }
  }, [packId, t]);

  const handlePayment = async () => {
    if (!packData || !pricing) {
      toast.error(t('payment.errors.packNotSelected'));
      return;
    }

    setLoading(true);
    try {
      // Get pack price
      const packPrice = pricing.packs[packId];
      if (!packPrice) {
        throw new Error('Price not found');
      }

      // Initiate Monetico payment
      const response = await api.post('/api/monetico/init-payment', {
        pack_id: packId,
        pack_name: packData.name,
        amount: packPrice.amount,
        currency: packPrice.currency,
        language: i18n.language
      });

      if (response.payment_url) {
        // Redirect to Monetico payment page
        window.location.href = response.payment_url;
      } else if (response.form_data) {
        // If form_data is returned, create and submit form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.form_action;
        
        Object.entries(response.form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      
      // Handle specific error cases
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('Monetico')) {
        toast.error(t('payment.errors.notConfigured'));
      } else {
        toast.error(error.response?.data?.detail || t('payment.errors.generic'));
      }
    }
  };

  if (!packId || !packData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('payment.errors.noPackSelected')}</h2>
          <button
            onClick={() => navigate('/packs')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('payment.backToPacks')}
          </button>
        </div>
      </div>
    );
  }

  const packPrice = pricing?.packs[packId];

  return (
    <>
      <Helmet>
        <title>{t('payment.title')} | Israel Growth Venture</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('payment.title')}</h1>
            <p className="text-lg text-gray-600">{t('payment.subtitle')}</p>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Pack Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{packData.name}</h2>
              <p className="text-blue-100 mb-6">{packData.description}</p>
              
              {packPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{packPrice.label}</span>
                  {location?.country && (
                    <span className="text-blue-200 text-sm">({location.country})</span>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-semibold">{t('packs.priceOnRequest')}</div>
              )}
            </div>

            {/* Security Features */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center gap-3 text-gray-700 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="font-semibold">{t('payment.security.title')}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{t('payment.security.ssl')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{t('payment.security.secure3d')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{t('payment.security.pciDss')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment.method.title')}</h3>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{t('payment.method.card')}</div>
                    <div className="text-sm text-gray-600">{t('payment.method.cardSubtitle')}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <img src="/images/visa.svg" alt="Visa" className="h-8" onError={(e) => e.target.style.display = 'none'} />
                  <img src="/images/mastercard.svg" alt="Mastercard" className="h-8" onError={(e) => e.target.style.display = 'none'} />
                  <img src="/images/cb.svg" alt="CB" className="h-8" onError={(e) => e.target.style.display = 'none'} />
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !packPrice}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('payment.processing')}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {t('payment.cta')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('payment.redirectMessage')}
              </p>
            </div>

            {/* Support */}
            <div className="bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">{t('payment.support.question')}</p>
              <a 
                href="mailto:israel.growth.venture@gmail.com" 
                className="text-blue-600 hover:underline font-medium"
              >
                israel.growth.venture@gmail.com
              </a>
            </div>
          </div>

          {/* Back to Packs */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/packs')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← {t('payment.backToPacks')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
