import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle, RefreshCw } from 'lucide-react';

const PaymentFailure = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const code_retour = searchParams.get('code-retour');
  const motif_refus = searchParams.get('motif-refus');
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('payment.failure.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('payment.failure.message')}
        </p>
        
        {code_retour && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-red-700 font-medium mb-2">
              {t('payment.errorCode')}: {code_retour}
            </p>
            {motif_refus && (
              <p className="text-sm text-red-600">
                {motif_refus}
              </p>
            )}
          </div>
        )}
        
        {reference && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">
              {t('payment.reference')}
            </p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {reference}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/packs')}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t('payment.failure.retry')}
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('payment.failure.contactSupport')}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {t('payment.failure.backHome')}
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          {t('payment.failure.helpText')}
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
