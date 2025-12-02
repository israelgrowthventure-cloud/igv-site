import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { pricingAPI } from '../../utils/api';

const PricingAdmin = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);

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
    setEditingRule({ ...rule });
  };

  const handleCancel = () => {
    setEditingRule(null);
  };

  const handleSave = async () => {
    try {
      if (editingRule.id) {
        await pricingAPI.updateRule(editingRule.id, editingRule);
        toast.success('Pricing rule updated successfully!');
      } else {
        await pricingAPI.createRule(editingRule);
        toast.success('Pricing rule created successfully!');
      }
      setEditingRule(null);
      loadRules();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast.error('Error saving pricing rule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing rule?')) return;
    try {
      await pricingAPI.deleteRule(id);
      toast.success('Pricing rule deleted successfully!');
      loadRules();
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      toast.error('Error deleting pricing rule');
    }
  };

  const handleNewRule = () => {
    setEditingRule({
      zone_code: '',
      zone_name: '',
      country_codes: [],
      multiplier: 1.0,
      currency: 'USD',
      active: true,
    });
  };

  const updateRuleField = (field, value) => {
    setEditingRule({ ...editingRule, [field]: value });
  };

  const updateCountryCodes = (value) => {
    const codes = value.split(',').map((code) => code.trim().toUpperCase());
    setEditingRule({ ...editingRule, country_codes: codes });
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-600 hover:text-[#0052CC] transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Rules Management</h1>
          </div>
          <button
            onClick={handleNewRule}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors"
            data-testid="new-rule-button"
          >
            <Plus size={18} />
            <span>New Rule</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Editing Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRule.id ? 'Edit Pricing Rule' : 'New Pricing Rule'}
                </h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Zone Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone Code</label>
                  <input
                    type="text"
                    value={editingRule.zone_code || ''}
                    onChange={(e) => updateRuleField('zone_code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    placeholder="EU, US, ASIA, etc."
                  />
                </div>

                {/* Zone Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                  <input
                    type="text"
                    value={editingRule.zone_name || ''}
                    onChange={(e) => updateRuleField('zone_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    placeholder="Europe, United States, Asia, etc."
                  />
                </div>

                {/* Country Codes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Codes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editingRule.country_codes || []).join(', ')}
                    onChange={(e) => updateCountryCodes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    placeholder="FR, DE, IT, ES, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use ISO 3166-1 alpha-2 country codes (e.g., US, GB, FR)
                  </p>
                </div>

                {/* Multiplier & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingRule.multiplier || 1.0}
                      onChange={(e) => updateRuleField('multiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0 = base price, 1.2 = +20%, 0.8 = -20%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={editingRule.currency || 'USD'}
                      onChange={(e) => updateRuleField('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="ILS">ILS (₪)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Active */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingRule.active || false}
                    onChange={(e) => updateRuleField('active', e.target.checked)}
                    className="w-4 h-4 text-[#0052CC] border-gray-300 rounded focus:ring-[#0052CC]"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 rounded-b-lg">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors"
                >
                  <Save size={18} />
                  <span>Save Rule</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Countries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Multiplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rule.zone_code}</div>
                    <div className="text-sm text-gray-500">{rule.zone_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {(rule.country_codes || []).slice(0, 5).join(', ')}
                      {(rule.country_codes || []).length > 5 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">×{rule.multiplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rule.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rule.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-[#0052CC] hover:text-[#003D99] mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PricingAdmin;
