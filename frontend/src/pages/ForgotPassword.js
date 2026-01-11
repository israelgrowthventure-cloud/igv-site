import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t('auth.forgotPassword.errors.emailRequired'));
      return;
    }

    setLoading(true);

    try {
      const data = await api.forgotPassword(email);
      
      if (data.success) {
        setSubmitted(true);
        toast.success(t('auth.forgotPassword.success'));
      } else {
        toast.error(t('auth.forgotPassword.errors.genericError'));
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        // Security: show same message as success
        setSubmitted(true);
        toast.info(t('auth.forgotPassword.success'));
      } else if (error.response?.status === 503) {
        toast.error(t('auth.forgotPassword.errors.serviceUnavailable'));
      } else {
        toast.error(t('auth.forgotPassword.errors.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>{t('auth.forgotPassword.title')} | IGV</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            {/* Success Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('auth.forgotPassword.checkEmail')}
                </h1>
                <p className="text-gray-600">
                  {t('auth.forgotPassword.emailSent')}
                </p>
              </div>

              {/* Email Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">{t('auth.forgotPassword.sentTo')}</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  {t('auth.forgotPassword.instructions')}
                </p>
              </div>

              {/* Back to Login */}
              <button
                onClick={() => navigate('/admin/login')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('auth.forgotPassword.backToLogin')}
              </button>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-gray-600">
              © 2025 Israel Growth Venture. {t('auth.forgotPassword.allRightsReserved')}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.forgotPassword.title')} | IGV</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.forgotPassword.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.forgotPassword.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.forgotPassword.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.forgotPassword.sending')}
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    {t('auth.forgotPassword.submit')}
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/admin/login')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.forgotPassword.backToLogin')}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600">
            © 2025 Israel Growth Venture. {t('auth.forgotPassword.allRightsReserved')}
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
