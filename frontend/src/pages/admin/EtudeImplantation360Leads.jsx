import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Briefcase, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://igv-cms-backend.onrender.com';

const EtudeImplantation360LeadsPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    checkAuth();
    loadLeads();
  }, [pagination.page]);

  const checkAuth = () => {
    const token = localStorage.getItem('igv_token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('igv_token');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/leads/etude-implantation-360`,
        {
          params: {
            page: pagination.page,
            page_size: pagination.page_size
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setLeads(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        total_pages: response.data.total_pages || 0
      }));
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Erreur lors du chargement des leads');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getHorizonLabel = (horizon) => {
    const labels = {
      'less-than-3-months': '< 3 mois',
      '3-to-6-months': '3-6 mois',
      '6-to-12-months': '6-12 mois',
      'more-than-12-months': '> 12 mois',
      'unknown': 'Non spécifié'
    };
    return labels[horizon] || horizon;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'new': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nouveau' },
      'contacted': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Contacté' },
      'qualified': { bg: 'bg-green-100', text: 'text-green-800', label: 'Qualifié' },
      'converted': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Converti' }
    };
    const badge = badges[status] || badges['new'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading && leads.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Retour au tableau de bord"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads Étude d'Implantation 360°</h1>
                <p className="text-sm text-gray-500">Gestion des demandes d'études personnalisées</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Users size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">{pagination.total} leads</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {leads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun lead pour le moment</h3>
            <p className="text-gray-600">Les demandes d'étude 360° apparaîtront ici.</p>
          </div>
        ) : (
          <>
            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rôle / Entreprise
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Horizon
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                              {lead.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium text-gray-900">{lead.full_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-700">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <a href={`mailto:${lead.work_email}`} className="hover:text-blue-600 hover:underline">
                              {lead.work_email}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{lead.role || 'N/A'}</div>
                            <div className="text-gray-500">{lead.brand_group || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-700">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            <span className="text-sm">{getHorizonLabel(lead.implantation_horizon)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(lead.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-4">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} sur {pagination.total_pages} ({pagination.total} leads au total)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EtudeImplantation360LeadsPage;
