import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Loader2, TrendingUp, Users, DollarSign, Target,
  ChevronRight, Building, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const Pipeline = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isRTL = i18n.language === 'he';

  const stages = [
    { key: 'analysis_requested', label: 'Analyse demandée', color: 'bg-blue-100 border-blue-300' },
    { key: 'analysis_sent', label: 'Analyse envoyée', color: 'bg-indigo-100 border-indigo-300' },
    { key: 'call_scheduled', label: 'Appel planifié', color: 'bg-purple-100 border-purple-300' },
    { key: 'qualification', label: 'Qualification', color: 'bg-yellow-100 border-yellow-300' },
    { key: 'proposal_sent', label: 'Proposition envoyée', color: 'bg-orange-100 border-orange-300' },
    { key: 'negotiation', label: 'Négociation', color: 'bg-pink-100 border-pink-300' },
    { key: 'won', label: 'Gagné', color: 'bg-green-100 border-green-300' },
    { key: 'lost', label: 'Perdu', color: 'bg-red-100 border-red-300' }
  ];

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/crm/pipeline');
      setPipeline(response.pipeline || {});
    } catch (err) {
      console.error('Error fetching pipeline:', err);
      setError('Erreur lors du chargement du pipeline');
      toast.error('Erreur lors du chargement du pipeline');
    } finally {
      setLoading(false);
    }
  };

  const getTotalOpportunities = () => {
    return Object.values(pipeline).reduce((sum, items) => sum + (items?.length || 0), 0);
  };

  const getTotalValue = () => {
    let total = 0;
    Object.values(pipeline).forEach(items => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          total += item.value || 0;
        });
      }
    });
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pipeline | IGV Admin</title>
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/crm')} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Pipeline</h1>
                <p className="text-sm text-gray-600">Vue Kanban des opportunités</p>
              </div>
              <button
                onClick={fetchPipeline}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Actualiser
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Opportunités</p>
                  <p className="text-xl font-bold">{getTotalOpportunities()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valeur Totale</p>
                  <p className="text-xl font-bold">{getTotalValue().toLocaleString()} €</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gagnés</p>
                  <p className="text-xl font-bold">{pipeline.won?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-xl font-bold">
                    {getTotalOpportunities() - (pipeline.won?.length || 0) - (pipeline.lost?.length || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchPipeline}
                className="mt-2 text-red-600 hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Pipeline Kanban */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {stages.map(stage => (
                <div key={stage.key} className={`w-72 flex-shrink-0 rounded-lg border-2 ${stage.color}`}>
                  <div className="p-3 border-b bg-white/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">{stage.label}</h3>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {pipeline[stage.key]?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                    {pipeline[stage.key]?.length > 0 ? (
                      pipeline[stage.key].map((item, idx) => (
                        <div 
                          key={item._id || idx}
                          className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            if (item.lead_id) {
                              navigate(`/admin/crm/leads/${item.lead_id}`);
                            }
                          }}
                        >
                          <p className="font-medium text-gray-900 truncate">
                            {item.name || 'Sans nom'}
                          </p>
                          {item.value > 0 && (
                            <p className="text-sm text-green-600 font-semibold mt-1">
                              {item.value.toLocaleString()} €
                            </p>
                          )}
                          {item.lead_id && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <ChevronRight className="w-3 h-3" />
                              Voir le lead
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Aucune opportunité
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pipeline;
