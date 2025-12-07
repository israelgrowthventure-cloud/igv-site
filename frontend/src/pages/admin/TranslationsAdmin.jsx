import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translationsAPI } from '../../utils/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Save } from 'lucide-react';

const TranslationsAdmin = () => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTranslations, setEditingTranslations] = useState({});

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const response = await translationsAPI.getAll();
      setTranslations(response.data);
      // Initialize editing state
      const initialState = {};
      response.data.forEach((t) => {
        initialState[t.key] = { ...t.translations };
      });
      setEditingTranslations(initialState);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Error loading translations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key, lang, value) => {
    setEditingTranslations({
      ...editingTranslations,
      [key]: {
        ...editingTranslations[key],
        [lang]: value,
      },
    });
  };

  const handleSave = async (key) => {
    try {
      await translationsAPI.update(key, { translations: editingTranslations[key] });
      toast.success('Translation updated!');
      loadTranslations();
    } catch (error) {
      console.error('Error updating translation:', error);
      toast.error('Error updating translation');
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const key of Object.keys(editingTranslations)) {
        await translationsAPI.update(key, { translations: editingTranslations[key] });
      }
      toast.success('All translations updated!');
      loadTranslations();
    } catch (error) {
      console.error('Error updating translations:', error);
      toast.error('Error updating translations');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="translations-admin">
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
              <h1 className="text-2xl font-bold text-gray-900">Translations</h1>
              <p className="text-sm text-gray-500">Manage multi-language content</p>
            </div>
          </div>
          <button
            onClick={handleSaveAll}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-colors"
            data-testid="save-all-button"
          >
            <Save size={18} />
            <span>Save All</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-6">
            {translations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No translations yet. Translations will appear here once created.</p>
              </div>
            ) : (
              translations.map((translation) => (
                <div
                  key={translation.key}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                  data-testid={`translation-${translation.key}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{translation.key}</h3>
                      <p className="text-sm text-gray-500">Translation key</p>
                    </div>
                    <button
                      onClick={() => handleSave(translation.key)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      data-testid={`save-button-${translation.key}`}
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['fr', 'en', 'he'].map((lang) => (
                      <div key={lang}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {lang.toUpperCase()}
                        </label>
                        <textarea
                          value={editingTranslations[translation.key]?.[lang] || ''}
                          onChange={(e) =>
                            handleUpdate(translation.key, lang, e.target.value)
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                          data-testid={`translation-input-${translation.key}-${lang}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TranslationsAdmin;

