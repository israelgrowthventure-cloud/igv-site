import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Get token and email from URL params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      validateToken(emailParam, tokenParam);
    } else {
      setValidating(false);
      setIsValid(false);
      toast.error(t('auth.resetPassword.errors.invalidLink'));
    }
  }, [searchParams]);

  const validateToken = async (email, token) => {
    try {
      const data = await api.verifyResetToken(email, token);
      if (data.valid) {
        setIsValid(true);
      } else {
        setIsValid(false);
        toast.error(data.message || t('auth.resetPassword.errors.expiredLink'));
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsValid(false);
      toast.error(t('auth.resetPassword.errors.validationError'));
    } finally {
      setValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (password.length < 8) {
      newErrors.password = t('auth.resetPassword.errors.passwordMinLength');
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.passwordsNotMatch');
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'admin', 'admin123'];
    if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
      newErrors.password = t('auth.resetPassword.errors.passwordTooCommon');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await api.resetPassword(token, email, password);
      
      if (data.success) {
        toast.success(t('auth.resetPassword.success'));
        // Redirect to login after short delay
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        toast.error(data.message || t('auth.resetPassword.errors.genericError'));
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || t('auth.resetPassword.errors.invalidToken'));
      } else if (error.response?.status === 503) {
        toast.error(t('auth.resetPassword.errors.serviceUnavailable'));
      } else {
        toast.error(t('auth.resetPassword.errors.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <>
        <Helmet>
          <title>{t('auth.resetPassword.validating')} | IGV</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {t('auth.resetPassword.validating')}
              </h1>
              <p className="text-gray-600">
                {t('auth.resetPassword.pleaseWait')}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isValid) {
    return (
      <>
        <Helmet>
          <title>{t('auth.resetPassword.errors.invalidLink')} | IGV</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.resetPassword.errors.invalidLink')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('auth.resetPassword.errors.linkExpired')}
              </p>

              <button
                onClick={() => navigate('/admin/forgot-password')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                {t('auth.resetPassword.requestNewLink')}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.resetPassword.title')} | IGV</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.resetPassword.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.resetPassword.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.resetPassword.newPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.resetPassword.passwordPlaceholder')}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.resetPassword.passwordRequirements')}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.resetPassword.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('auth.resetPassword.passwordStrength')}
                  </p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${
                      password.length >= 8 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${password.length >= 8 ? 'opacity-100' : 'opacity-50'}`} />
                      {t('auth.resetPassword.atLeast8Chars')}
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      /[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${/[A-Z]/.test(password) ? 'opacity-100' : 'opacity-50'}`} />
                      {t('auth.resetPassword.oneUppercase')}
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      /[0-9]/.test(password) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${/[0-9]/.test(password) ? 'opacity-100' : 'opacity-50'}`} />
                      {t('auth.resetPassword.oneNumber')}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.resetPassword.resetting')}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {t('auth.resetPassword.submit')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600">
            © 2025 Israel Growth Venture. {t('auth.resetPassword.allRightsReserved')}
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
