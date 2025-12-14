import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { FileText, Download, Calendar, CheckCircle, Clock, LogOut } from 'lucide-react';

const ClientDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    if (!token) {
      navigate('/client/login');
      return;
    }

    loadClientData();
  }, [navigate]);

  const loadClientData = async () => {
    try {
      const token = localStorage.getItem('client_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [profileRes, analysesRes] = await Promise.all([
        api.get('/client/profile', config),
        api.get('/client/analyses', config)
      ]);

      setClientData(profileRes);
      setAnalyses(analysesRes);
    } catch (error) {
      toast.error(t('client.dashboard.loadError'));
      if (error.response?.status === 401) {
        navigate('/client/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAnalysis = async (analysisId) => {
    try {
      const token = localStorage.getItem('client_token');
      const response = await api.get(`/client/analyses/${analysisId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analyse_${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('client.dashboard.downloadSuccess'));
    } catch (error) {
      toast.error(t('client.dashboard.downloadError'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    navigate('/client/login');
    toast.success(t('client.dashboard.logoutSuccess'));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('client.dashboard.welcome')}, {clientData?.name}
            </h1>
            <p className="text-gray-600 mt-1">{clientData?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('client.dashboard.logout')}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('client.dashboard.totalAnalyses')}</p>
                <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('client.dashboard.completed')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyses.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('client.dashboard.inProgress')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyses.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analyses List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('client.dashboard.myAnalyses')}
            </h2>
          </div>

          {analyses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>{t('client.dashboard.noAnalyses')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {analysis.pack_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : analysis.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t(`client.dashboard.status.${analysis.status}`)}
                        </div>
                      </div>
                    </div>

                    {analysis.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadAnalysis(analysis.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        {t('client.dashboard.download')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
