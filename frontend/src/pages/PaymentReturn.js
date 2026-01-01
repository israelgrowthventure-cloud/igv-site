import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2, Home, FileText } from 'lucide-react';
import { toast } from 'sonner';

const PaymentReturn = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failure, error
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Récupérer les paramètres de retour Monetico
    const reference = searchParams.get('reference');
    const montant = searchParams.get('montant');
    const codeRetour = searchParams.get('code-retour');
    const MAC = searchParams.get('MAC');

    if (!reference) {
      setStatus('error');
      toast.error(t('payment.invalidReturn', 'Invalid payment return'));
      return;
    }

    // Vérifier le statut du paiement
    if (codeRetour === 'payetest' || codeRetour === 'paye') {
      setStatus('success');
      setPaymentData({
        reference,
        montant: montant ? parseFloat(montant.replace('EUR', '')) / 100 : 0,
        currency: 'EUR'
      });
      toast.success(t('payment.success', 'Payment successful!'));
    } else if (codeRetour === 'Annulation') {
      setStatus('failure');
      setPaymentData({ reference, reason: t('payment.cancelled', 'Payment cancelled by user') });
      toast.error(t('payment.cancelledToast', 'Payment cancelled'));
    } else {
      setStatus('failure');
      setPaymentData({ reference, reason: t('payment.failed', 'Payment failed') });
      toast.error(t('payment.failedToast', 'Payment failed'));
    }
  }, [searchParams, t]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.processing', 'Processing payment...')}</h2>
            <p className="text-gray-600">{t('payment.pleaseWait', 'Please wait while we verify your payment')}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('payment.successTitle', 'Payment Successful!')}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('payment.successMessage', 'Your payment has been processed successfully.')}
            </p>
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-3">{t('payment.details', 'Payment Details')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('payment.reference', 'Reference')}:</span>
                    <span className="font-mono font-semibold">{paymentData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('payment.amount', 'Amount')}:</span>
                    <span className="font-semibold">{paymentData.montant} {paymentData.currency}</span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-8">
              {t('payment.confirmationEmail', 'You will receive a confirmation email shortly with your invoice.')}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                {t('common.backToHome', 'Back to Home')}
              </button>
              <button
                onClick={() => window.location.href = 'mailto:israel.growth.venture@gmail.com?subject=Payment%20Confirmation%20-%20' + (paymentData?.reference || '')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t('payment.requestInvoice', 'Request Invoice')}
              </button>
            </div>
          </div>
        );

      case 'failure':
        return (
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('payment.failedTitle', 'Payment Failed')}</h2>
            <p className="text-lg text-gray-600 mb-6">
              {paymentData?.reason || t('payment.failedMessage', 'Your payment could not be processed.')}
            </p>
            {paymentData?.reference && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-gray-600">
                  {t('payment.reference', 'Reference')}: <span className="font-mono font-semibold">{paymentData.reference}</span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-8">
              {t('payment.tryAgainMessage', 'Please try again or contact our support team for assistance.')}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                {t('common.backToHome', 'Back to Home')}
              </button>
              <button
                onClick={() => navigate('/packs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('payment.tryAgain', 'Try Again')}
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('payment.invalidTitle', 'Invalid Payment Return')}</h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('payment.invalidMessage', 'The payment return data is invalid or missing.')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Home className="w-4 h-4" />
              {t('common.backToHome', 'Back to Home')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('payment.pageTitle', 'Payment Return')} - Israel Growth Venture</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReturn;
