import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';

/**
 * Page de succès après paiement
 * Utilisée pour Stripe (actuellement) et Monetico (futur)
 * 
 * Query params supportés:
 * - provider: "stripe" ou "monetico"
 * - pack: nom du pack
 * - amount: montant payé
 * - currency: devise (EUR, USD, ILS, etc.)
 * - status: statut du paiement
 */
const PaymentSuccess = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Récupération des paramètres de paiement
  const provider = searchParams.get('provider') || 'stripe';
  const packName = searchParams.get('pack') || searchParams.get('packName') || t('packs.unknownPack');
  const amount = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'EUR';
  const status = searchParams.get('status') || 'confirmed';

  const [paymentDetails, setPaymentDetails] = useState({
    provider: provider,
    pack: packName,
    amount: amount,
    currency: currency,
    status: status,
    date: new Date().toLocaleDateString(i18n.language)
  });

  useEffect(() => {
    // Log pour debugging
    console.log('Payment Success - Query params:', {
      provider: searchParams.get('provider'),
      pack: searchParams.get('pack'),
      amount: searchParams.get('amount'),
      currency: searchParams.get('currency'),
      status: searchParams.get('status')
    });
  }, [searchParams]);

  const getProviderDisplayName = (provider) => {
    const providerNames = {
      'stripe': 'Stripe',
      'monetico': 'Monetico (CIC)',
      'cb': 'Carte Bancaire'
    };
    return providerNames[provider.toLowerCase()] || 'Carte Bancaire';
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return '';
    
    const currencySymbols = {
      'EUR': '€',
      'USD': '$',
      'ILS': '₪',
      'eur': '€',
      'usd': '$',
      'ils': '₪'
    };
    
    const symbol = currencySymbols[currency] || currency;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) return `${amount} ${symbol}`;
    
    const formatted = numAmount.toLocaleString(i18n.language);
    
    if (currency === 'ILS' || currency === 'ils') {
      return `${formatted} ${symbol}`;
    }
    return `${formatted} ${symbol}`;
  };

  return (
    <>
      {/* SEO - noindex car page spécifique à un paiement */}
      <Helmet>
        <title>{t('payment.success.title') || 'Paiement confirmé'} - Israel Growth Venture</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={t('payment.success.message') || 'Confirmation de paiement'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-20 px-4" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto">
          {/* Carte principale */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icône de succès */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('payment.success.title') || 'Paiement confirmé !'}
          </h1>

          {/* Message de remerciement */}
          <p className="text-lg text-gray-600 mb-8">
            {t('payment.success.message') || 'Merci, votre paiement a bien été reçu. Nous vous confirmerons la suite par email.'}
          </p>

          {/* Détails du paiement */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              {t('payment.success.details') || 'Détails de la commande'}
            </h2>
            
            <div className="space-y-3">
              {/* Pack */}
              {paymentDetails.pack && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('payment.success.pack') || 'Pack'} :</span>
                  <span className="font-semibold text-gray-900">{paymentDetails.pack}</span>
                </div>
              )}

              {/* Montant */}
              {paymentDetails.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('payment.success.amount') || 'Montant'} :</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(paymentDetails.amount, paymentDetails.currency)}
                  </span>
                </div>
              )}

              {/* Mode de paiement */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('payment.success.method') || 'Paiement'} :</span>
                <span className="font-semibold text-gray-900">
                  {getProviderDisplayName(paymentDetails.provider)}
                </span>
              </div>

              {/* Statut */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('payment.success.status') || 'Statut'} :</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t('payment.success.confirmed') || 'Confirmé'}
                </span>
              </div>

              {/* Date */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('payment.success.date') || 'Date'} :</span>
                <span className="font-semibold text-gray-900">{paymentDetails.date}</span>
              </div>
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {t('payment.success.nextSteps') || 'Prochaines étapes'}
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>{t('payment.success.step1') || 'Vous recevrez un email de confirmation sous quelques minutes'}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>{t('payment.success.step2') || 'Notre équipe vous contactera pour planifier un rendez-vous'}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>{t('payment.success.step3') || 'Nous commencerons votre accompagnement selon le pack choisi'}</span>
              </li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('payment.success.backHome') || "Retour à l'accueil"}
            </button>
            
            <button
              onClick={() => navigate('/packs')}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              {t('payment.success.viewPacks') || 'Voir nos packs'}
            </button>
          </div>

          {/* Contact */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('payment.success.question') || 'Une question ?'}{' '}
              <a 
                href="mailto:contact@israelgrowthventure.com" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('payment.success.contactUs') || 'Contactez-nous'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
