import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Home, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Param?tres communs
  const status = searchParams.get('status');
  const provider = searchParams.get('provider'); // 'stripe' or 'monetico'
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'EUR';
  const packName = searchParams.get('pack');

  // Param?tres Monetico sp?cifiques (retour par d?faut)
  const codeRetour = searchParams.get('code-retour'); // paiement, annulation...

  useEffect(() => {
    // Simulation de v?rification
    const timer = setTimeout(() => {
      setLoading(false);
      if (codeRetour === 'paiement' || status === 'confirmed') {
        toast.success(t('payment.success_toast', 'Paiement confirm? avec succ?s !'));
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [codeRetour, status, t]);

  const handleDownloadInvoice = () => {
    toast.info("Le t?l?chargement de la facture sera disponible bient?t.");
    // TODO: Connecter ? l'API backend pour g?n?rer le PDF
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-700">Traitement de votre commande...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-600 p-8 text-center">
          <div className="mx-auto bg-white rounded-full h-20 w-20 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('payment.success_title', 'Paiement R?ussi !')}
          </h1>
          <p className="text-green-100 text-lg">
            {t('payment.success_subtitle', 'Merci de votre confiance. Votre commande est valid?e.')}
          </p>
        </div>

        <div className="p-8">
          <div className="border-b border-gray-100 pb-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">D?tails de la commande</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Pack choisi</span>
                <span className="font-semibold text-gray-900 capitalize">{packName || 'Pack Standard'}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Montant pay?</span>
                <span className="font-semibold text-gray-900">
                  {amount ? `${amount} ${currency === 'EUR' ? '?' : currency}` : 'Consulter facture'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">M?thode</span>
                <span className="font-medium text-gray-900 uppercase">{provider || 'Carte Bancaire'}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Prochaines ?tapes</h3>
            <p className="text-blue-700 text-sm mb-0">
              Un consultant IGV va prendre contact avec vous sous 24h ouvr?es pour d?marrer votre accompagnement.
              Un email de confirmation vous a ?t? envoy?.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="mr-2 h-5 w-5" />
              T?l?charger facture
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="mr-2 h-5 w-5" />
              Retour ? l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
