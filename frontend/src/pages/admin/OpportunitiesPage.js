import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Search, Filter, Plus, Eye, Trash2, 
  Loader2, Edit2, X, Save
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const OpportunitiesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchOpportunities();
  }, [searchTerm]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/opportunities', {
        params: { search: searchTerm, limit: 100 }
      });
      setOpportunities(response?.opportunities || response || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error(t('admin.crm.opportunities.errors.load_failed') || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm(t('admin.crm.opportunities.delete_confirm') || 'Delete this opportunity?')) return;
    try {
      await api.delete(`/api/crm/opportunities/${oppId}`);
      toast.success(t('admin.crm.opportunities.deleted') || 'Opportunity deleted');
      fetchOpportunities();
    } catch (error) {
      toast.error(t('admin.crm.opportunities.errors.delete_failed') || 'Failed to delete opportunity');
    }
  };

  const handleEdit = (opp) => {
    setSelectedOpp(opp);
    setEditData(opp);
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/crm/opportunities/${selectedOpp.id}`, editData);
      toast.success(t('admin.crm.opportunities.updated') || 'Opportunity updated');
      setEditing(false);
      setSelectedOpp(null);
      fetchOpportunities();
    } catch (error) {
      toast.error(t('admin.crm.opportunities.errors.update_failed') || 'Failed to update opportunity');
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      qualification: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-purple-100 text-purple-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Helmet>
        <title>{t('admin.crm.opportunities.title') || 'Opportunities'} | IGV CRM</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  {t('admin.crm.opportunities.title') || 'Opportunities'}
                </h1>
                <p className="text-sm text-gray-600">
                  {opportunities.length} {t('admin.crm.opportunities.count') || 'opportunities'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('admin.crm.common.search') || 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('admin.crm.opportunities.empty') || 'No opportunities yet'}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.opportunities.columns.name') || 'Name'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.opportunities.columns.value') || 'Value'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.opportunities.columns.stage') || 'Stage'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.opportunities.columns.probability') || 'Probability'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      {t('admin.crm.opportunities.columns.created') || 'Created'}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                      {t('admin.crm.common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {opportunities.map((opp) => (
                    <tr key={opp.id || opp.opportunity_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{opp.name}</p>
                        {opp.brand_name && <p className="text-sm text-gray-500">{opp.brand_name}</p>}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {opp.value ? `€${opp.value.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStageColor(opp.stage)}`}>
                          {t(`admin.crm.opportunities.stages.${opp.stage}`) || opp.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {opp.probability}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {opp.created_at ? new Date(opp.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(opp)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={t('admin.crm.common.edit') || 'Edit'}
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(opp.id || opp.opportunity_id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                            title={t('admin.crm.common.delete') || 'Delete'}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Edit Modal */}
        {editing && selectedOpp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">
                {t('admin.crm.opportunities.edit') || 'Edit Opportunity'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('admin.crm.opportunities.columns.name') || 'Name'}
                  </label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('admin.crm.opportunities.columns.value') || 'Value (€)'}
                  </label>
                  <input
                    type="number"
                    value={editData.value || ''}
                    onChange={(e) => setEditData({...editData, value: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('admin.crm.opportunities.columns.stage') || 'Stage'}
                  </label>
                  <select
                    value={editData.stage || 'qualification'}
                    onChange={(e) => setEditData({...editData, stage: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="qualification">{t('admin.crm.opportunities.stages.qualification') || 'Qualification'}</option>
                    <option value="proposal">{t('admin.crm.opportunities.stages.proposal') || 'Proposal'}</option>
                    <option value="negotiation">{t('admin.crm.opportunities.stages.negotiation') || 'Negotiation'}</option>
                    <option value="closed_won">{t('admin.crm.opportunities.stages.closed_won') || 'Closed Won'}</option>
                    <option value="closed_lost">{t('admin.crm.opportunities.stages.closed_lost') || 'Closed Lost'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t('admin.crm.opportunities.columns.probability') || 'Probability (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editData.probability || 0}
                    onChange={(e) => setEditData({...editData, probability: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => { setEditing(false); setSelectedOpp(null); }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('admin.crm.common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('admin.crm.common.save') || 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OpportunitiesPage;
