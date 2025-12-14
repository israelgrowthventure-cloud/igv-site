import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const reference = searchParams.get('reference');
  const amount = searchParams.get('montant');
  
  useEffect(() => {
    // Auto-redirect après 10 secondes
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('payment.success.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('payment.success.message')}
        </p>
        
        {reference && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">
              {t('payment.reference')}
            </p>
            <p className="font-mono text-lg font-semibold text-gray-900">
              {reference}
            </p>
          </div>
        )}
        
        {amount && (
          <p className="text-gray-600 mb-6">
            {t('payment.amount')}: <span className="font-semibold">{amount}</span>
          </p>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('payment.success.accessDashboard')}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('payment.success.backHome')}
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          {t('payment.success.emailConfirmation')}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
