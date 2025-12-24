import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const AdminLogin = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('admin.login.errors.fieldsRequired'));
      return;
    }

    setLoading(true);

    try {
      const data = await api.adminLogin({ email, password });
      
      if (data.access_token) {
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_role', data.role);
        toast.success(t('admin.login.success'));
        navigate('/admin/dashboard');
      } else {
        toast.error(t('admin.login.errors.invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        toast.error(t('admin.login.errors.invalidCredentials'));
      } else {
        toast.error(t('admin.login.errors.serverError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('admin.login.title')} | IGV Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.login.title')}
            </h1>
            <p className="text-gray-600">
              {t('admin.login.subtitle')}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Language Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.login.language')}
              </label>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('admin.login.emailPlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('admin.login.passwordPlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('admin.login.signing')}
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    {t('admin.login.submit')}
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <p className="mt-6 text-xs text-center text-gray-500">
              {t('admin.login.securityNotice')}
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            © 2025 Israel Growth Venture. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
