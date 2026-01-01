import React, { useState, useEffect } from 'react';
import { Search, Plus, DollarSign, Calendar, TrendingUp, X, Loader2, Save, Edit, Trash2, Download, Target } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const OpportunitiesTab = ({ data, onRefresh, searchTerm, setSearchTerm, t }) => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    probability: 50,
    stage: 'qualification',
    expected_close_date: '',
    contact_id: '',
    notes: ''
  });

  const stages = [
    { id: 'qualification', label: t('admin.crm.opportunities.stages.qualification'), color: 'bg-gray-100 text-gray-800' },
    { id: 'proposal', label: t('admin.crm.opportunities.stages.proposal'), color: 'bg-blue-100 text-blue-800' },
    { id: 'negotiation', label: t('admin.crm.opportunities.stages.negotiation'), color: 'bg-yellow-100 text-yellow-800' },
    { id: 'closed_won', label: t('admin.crm.opportunities.stages.closed_won'), color: 'bg-green-100 text-green-800' },
    { id: 'closed_lost', label: t('admin.crm.opportunities.stages.closed_lost'), color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/crm/opportunities');
      // api.get already returns response.data, so response is the data object
      setOpportunities(response.opportunities || response.data?.opportunities || []);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/crm/opportunities', {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 50
      });
      toast.success(t('admin.crm.opportunities.created'));
      setShowCreateModal(false);
      resetForm();
      loadOpportunities();
    } catch (error) {
      toast.error(t('admin.crm.errors.create_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/api/crm/opportunities/${editingOpp._id || editingOpp.opportunity_id}`, {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 50
      });
      toast.success(t('admin.crm.opportunities.updated'));
      setShowEditModal(false);
      setEditingOpp(null);
      resetForm();
      loadOpportunities();
    } catch (error) {
      toast.error(t('admin.crm.errors.update_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm(t('admin.crm.common.confirm_delete'))) return;
    try {
      setLoading(true);
      await api.delete(`/api/crm/opportunities/${oppId}`);
      toast.success(t('admin.crm.opportunities.deleted'));
      loadOpportunities();
    } catch (error) {
      toast.error(t('admin.crm.errors.delete_failed'));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setFormData({
      name: opp.name || '',
      value: opp.value || '',
      probability: opp.probability || 50,
      stage: opp.stage || 'qualification',
      expected_close_date: opp.expected_close_date?.split('T')[0] || '',
      contact_id: opp.contact_id || '',
      notes: opp.notes || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      probability: 50,
      stage: 'qualification',
      expected_close_date: '',
      contact_id: '',
      notes: ''
    });
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Valeur', 'Probabilité', 'Étape', 'Date clôture prévue', 'Créé le'];
    const rows = opportunities.map(opp => [
      opp.name,
      opp.value,
      `${opp.probability}%`,
      stages.find(s => s.id === opp.stage)?.label || opp.stage,
      opp.expected_close_date?.split('T')[0] || '',
      new Date(opp.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `opportunities_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(t('admin.crm.opportunities.exported'));
  };

  const getStageColor = (stage) => stages.find(s => s.id === stage)?.color || 'bg-gray-100 text-gray-800';
  const getStageLabel = (stage) => stages.find(s => s.id === stage)?.label || stage;

  const filteredOpps = opportunities.filter(opp => 
    (opp.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const totalValue = filteredOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
  const weightedValue = filteredOpps.reduce((sum, opp) => sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0);

  const OppModal = ({ isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? t('admin.crm.opportunities.edit') : t('admin.crm.opportunities.new')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.opportunities.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Contrat ABC Corp"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.crm.opportunities.value')} *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.crm.opportunities.probability')} *
              </label>
              <input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.opportunities.stage')}
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.opportunities.expected_close')}
            </label>
            <input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.crm.opportunities.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notes additionnelles..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.opportunities.total_count')}</p>
              <p className="text-xl font-bold">{filteredOpps.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.opportunities.total_value')}</p>
              <p className="text-xl font-bold">{totalValue.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.crm.opportunities.weighted_value')}</p>
              <p className="text-xl font-bold">{weightedValue.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.crm.opportunities.search')}
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            {t('admin.crm.common.export')}
          </button>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t('admin.crm.opportunities.new')}
          </button>
        </div>
      </div>

      {/* Opportunities Table */}
      {loading && opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow border text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.opportunities.name')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.opportunities.value')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.opportunities.probability')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.opportunities.stage')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.crm.opportunities.expected_close')}</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">{t('admin.crm.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpps.length > 0 ? filteredOpps.map(opp => (
                <tr key={opp._id || opp.opportunity_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOpp(opp)}
                      className="text-left hover:text-blue-600 font-medium"
                    >
                      {opp.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{(opp.value || 0).toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${opp.probability || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">{opp.probability || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opp.stage)}`}>
                      {getStageLabel(opp.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(opp)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp._id || opp.opportunity_id)}
                        disabled={loading}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">{t('admin.crm.opportunities.empty_title')}</p>
                      <p className="text-sm mt-1">{t('admin.crm.opportunities.empty_subtitle')}</p>
                      <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        {t('admin.crm.opportunities.new')}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail View */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedOpp.name}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedOpp.stage)}`}>
                  {getStageLabel(selectedOpp.stage)}
                </span>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.value')}</p>
                <p className="text-2xl font-bold text-green-600">{(selectedOpp.value || 0).toLocaleString('fr-FR')} €</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('admin.crm.opportunities.weighted_value')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((selectedOpp.value || 0) * (selectedOpp.probability || 0) / 100).toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{t('admin.crm.opportunities.probability')}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${selectedOpp.probability || 0}%` }}
                      />
                    </div>
                    <span className="font-medium">{selectedOpp.probability || 0}%</span>
                  </div>
                </div>
              </div>
              
              {selectedOpp.expected_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('admin.crm.opportunities.expected_close')}</p>
                    <p className="font-medium">{new Date(selectedOpp.expected_close_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              )}

              {selectedOpp.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('admin.crm.opportunities.notes')}</p>
                  <p className="text-gray-800">{selectedOpp.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => { openEditModal(selectedOpp); setSelectedOpp(null); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => setSelectedOpp(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <OppModal 
          isEdit={false} 
          onSubmit={handleCreate} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <OppModal 
          isEdit={true} 
          onSubmit={handleEdit} 
          onClose={() => { setShowEditModal(false); setEditingOpp(null); }} 
        />
      )}
    </div>
  );
};

export default OpportunitiesTab;
