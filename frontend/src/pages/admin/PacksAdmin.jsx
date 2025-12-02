import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { packsAPI } from '../../utils/api';

const PacksAdmin = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPack, setEditingPack] = useState(null);
  const [currentLang, setCurrentLang] = useState('fr');

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      setPacks(response.data);
    } catch (error) {
      console.error('Error loading packs:', error);
      toast.error('Error loading packs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pack) => {
    setEditingPack({ ...pack });
  };

  const handleCancel = () => {
    setEditingPack(null);
  };

  const handleSave = async () => {
    try {
      if (editingPack.id) {
        await packsAPI.update(editingPack.id, editingPack);
        toast.success('Pack updated successfully!');
      } else {
        await packsAPI.create(editingPack);
        toast.success('Pack created successfully!');
      }
      setEditingPack(null);
      loadPacks();
    } catch (error) {
      console.error('Error saving pack:', error);
      toast.error('Error saving pack');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;
    try {
      await packsAPI.delete(id);
      toast.success('Pack deleted successfully!');
      loadPacks();
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast.error('Error deleting pack');
    }
  };

  const handleNewPack = () => {
    setEditingPack({
      name: { fr: '', en: '', he: '' },
      description: { fr: '', en: '', he: '' },
      features: { fr: [], en: [], he: [] },
      base_price: 0,
      order: packs.length + 1,
      active: true,
    });
  };

  const updatePackField = (field, value) => {
    setEditingPack({ ...editingPack, [field]: value });
  };

  const updatePackLangField = (field, lang, value) => {
    setEditingPack({
      ...editingPack,
      [field]: { ...editingPack[field], [lang]: value },
    });
  };

  const addFeature = (lang) => {
    const features = editingPack.features[lang] || [];
    setEditingPack({
      ...editingPack,
      features: {
        ...editingPack.features,
        [lang]: [...features, ''],
      },
    });
  };

  const updateFeature = (lang, index, value) => {
    const features = [...editingPack.features[lang]];
    features[index] = value;
    setEditingPack({
      ...editingPack,
      features: {
        ...editingPack.features,
        [lang]: features,
      },
    });
  };

  const removeFeature = (lang, index) => {
    const features = [...editingPack.features[lang]];
    features.splice(index, 1);
    setEditingPack({
      ...editingPack,
      features: {
        ...editingPack.features,
        [lang]: features,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="packs-admin">
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
            <h1 className="text-2xl font-bold text-gray-900">Packs Management</h1>
          </div>
          <button
            onClick={handleNewPack}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors"
            data-testid="new-pack-button"
          >
            <Plus size={18} />
            <span>New Pack</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Editing Modal */}
        {editingPack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPack.id ? 'Edit Pack' : 'New Pack'}
                </h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Language:</span>
                  <div className="flex space-x-1 border border-gray-300 rounded-lg overflow-hidden">
                    {['fr', 'en', 'he'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 text-sm font-medium transition-colors ${
                          currentLang === lang
                            ? 'bg-[#0052CC] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name ({currentLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={editingPack.name[currentLang] || ''}
                    onChange={(e) => updatePackLangField('name', currentLang, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description ({currentLang.toUpperCase()})
                  </label>
                  <textarea
                    value={editingPack.description[currentLang] || ''}
                    onChange={(e) => updatePackLangField('description', currentLang, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Features ({currentLang.toUpperCase()})
                    </label>
                    <button
                      onClick={() => addFeature(currentLang)}
                      className="text-sm text-[#0052CC] hover:text-[#003D99] font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingPack.features[currentLang] || []).map((feature, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(currentLang, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                        />
                        <button
                          onClick={() => removeFeature(currentLang, index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Base Price & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (USD)</label>
                    <input
                      type="number"
                      value={editingPack.base_price || 0}
                      onChange={(e) => updatePackField('base_price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={editingPack.order || 1}
                      onChange={(e) => updatePackField('order', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Active */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingPack.active || false}
                    onChange={(e) => updatePackField('active', e.target.checked)}
                    className="w-4 h-4 text-[#0052CC] border-gray-300 rounded focus:ring-[#0052CC]"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
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
                  <span>Save Pack</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Packs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div key={pack.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pack.name?.fr || pack.name}</h3>
                  <p className="text-sm text-gray-500">Order: {pack.order}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pack.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pack.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{pack.description?.fr || pack.description}</p>
              <div className="text-lg font-bold text-[#0052CC] mb-4">${pack.base_price} USD</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(pack)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PacksAdmin;
