import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packsAPI } from 'utils/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const PacksAdmin = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
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
    setEditingId(pack.id);
    setEditForm({ ...pack });
  };

  const handleSave = async () => {
    try {
      await packsAPI.update(editingId, editForm);
      toast.success('Pack updated successfully!');
      setEditingId(null);
      setEditForm(null);
      loadPacks();
    } catch (error) {
      console.error('Error updating pack:', error);
      toast.error('Error updating pack');
    }
  };

  const handleDelete = async (packId) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;

    try {
      await packsAPI.delete(packId);
      toast.success('Pack deleted successfully!');
      loadPacks();
    } catch (error) {
      console.error('Error deleting pack:', error);
      toast.error('Error deleting pack');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
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
              <h1 className="text-2xl font-bold text-gray-900">Packs Management</h1>
              <p className="text-sm text-gray-500">Manage your service packs and offers</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {['fr', 'en', 'he'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentLang === lang
                    ? 'bg-[#0052CC] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`lang-button-${lang}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
              data-testid={`pack-card-${pack.id}`}
            >
              {editingId === pack.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name ({currentLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={editForm.name[currentLang] || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            name: { ...editForm.name, [currentLang]: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                        data-testid="edit-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price
                      </label>
                      <input
                        type="number"
                        value={editForm.base_price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, base_price: parseFloat(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                        data-testid="edit-price-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description ({currentLang.toUpperCase()})
                    </label>
                    <textarea
                      value={editForm.description[currentLang] || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: { ...editForm.description, [currentLang]: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      data-testid="edit-description-input"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
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
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {pack.name[currentLang] || pack.name.fr}
                      </h3>
                      <p className="text-gray-600">
                        {pack.description[currentLang] || pack.description.fr}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(pack)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid={`edit-button-${pack.id}`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pack.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-button-${pack.id}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#0052CC] mb-4">
                    {pack.base_price} {pack.currency}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {(pack.features[currentLang] || pack.features.fr || []).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Order: {pack.order}</span>
                    <span className={pack.active ? 'text-green-600' : 'text-red-600'}>
                      {pack.active ? 'Active' : 'Inactive'}
                    </span>
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

export default PacksAdmin;

