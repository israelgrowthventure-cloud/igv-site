import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('pack') || 'analyse';

  const packNames = {
    analyse: t('packs.analyse.name'),
    succursales: t('packs.succursales.name'),
    franchise: t('packs.franchise.name')
  };

  return (
    <>
      <Helmet>
        <title>{t('checkout.title', 'Checkout')} | Israel Growth Venture</title>
      </Helmet>
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('checkout.title', 'Finalisation de votre commande')}
              </h1>
              <p className="text-lg text-gray-600">
                {packNames[packId] || packId}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-blue-900 mb-2">
                {t('checkout.processing', 'Configuration du paiement sécurisé...')}
              </h2>
              <p className="text-sm text-blue-700">
                {t('checkout.message', 'Notre équipe vous contactera sous 24h pour finaliser votre achat de manière sécurisée.')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">✓</span>
                <span>{t('checkout.confirmation', 'Votre demande a été enregistrée')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">✓</span>
                <span>{t('checkout.contact', 'Un conseiller vous contactera prochainement')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">✓</span>
                <span>{t('checkout.secure', 'Paiement 100% sécurisé')}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/packs')}
                className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← {t('common.backToPacks', 'Retour aux packs')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
