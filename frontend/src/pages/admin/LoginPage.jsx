import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('igv_token', response.data.access_token);
      localStorage.setItem('igv_user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center px-4" data-testid="login-page">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0052CC] to-[#0065FF] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">IGV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CMS Admin</h1>
          <p className="text-gray-600">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              data-testid="login-email-input"
              placeholder="admin@igv.co.il"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              data-testid="login-password-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#0052CC] text-white rounded-lg font-semibold hover:bg-[#003D99] transition-all duration-300 disabled:opacity-50"
            data-testid="login-submit-button"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn className="mr-2" size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default credentials for demo:</p>
          <p className="font-mono text-xs mt-2">admin@igv.co.il / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

