import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pricingAPI } from 'utils/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const PricingAdmin = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await pricingAPI.getRules();
      setRules(response.data);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
      toast.error('Error loading pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setEditForm({ ...rule });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await pricingAPI.updateRule(editingId, editForm);
        toast.success('Pricing rule updated!');
      } else {
        await pricingAPI.createRule(editForm);
        toast.success('Pricing rule created!');
      }
      setEditingId(null);
      setEditForm(null);
      setShowAddForm(false);
      loadRules();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast.error('Error saving pricing rule');
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      await pricingAPI.deleteRule(ruleId);
      toast.success('Pricing rule deleted!');
      loadRules();
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      toast.error('Error deleting pricing rule');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setEditForm({
      zone_name: '',
      country_codes: [],
      price: 1000,
      currency: 'USD',
      active: true,
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="pricing-admin">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-600 hover:text-[#0052CC] transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pricing Rules</h1>
              <p className="text-sm text-gray-500">Manage pricing by geographic zone</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors"
            data-testid="add-rule-button"
          >
            <Plus size={18} />
            <span>Add Rule</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">New Pricing Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={editForm.zone_name}
                  onChange={(e) => setEditForm({ ...editForm, zone_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  placeholder="EU, US_CA, etc."
                  data-testid="zone-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Codes (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.country_codes.join(', ')}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      country_codes: e.target.value.split(',').map((c) => c.trim()),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  placeholder="FR, DE, IT"
                  data-testid="country-codes-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  data-testid="price-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  data-testid="currency-select"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ILS">ILS</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                data-testid="cancel-button"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors"
                data-testid="save-button"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
              data-testid={`rule-card-${rule.id}`}
            >
              {editingId === rule.id ? (
                // Edit Mode (similar to add form)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zone Name
                    </label>
                    <input
                      type="text"
                      value={editForm.zone_name}
                      onChange={(e) => setEditForm({ ...editForm, zone_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors"
                    >
                      <Save size={18} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{rule.zone_name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rule.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#0052CC] mb-3">
                      {rule.price} {rule.currency}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rule.country_codes.map((code) => (
                        <span
                          key={code}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      data-testid={`edit-button-${rule.id}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      data-testid={`delete-button-${rule.id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingAdmin;

