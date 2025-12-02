import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { translationsAPI } from '../../utils/api';

const TranslationsAdmin = () => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const response = await translationsAPI.getAll();
      setTranslations(response.data);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Error loading translations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await translationsAPI.update(translations);
      toast.success('Translations saved successfully!');
    } catch (error) {
      console.error('Error saving translations:', error);
      toast.error('Error saving translations');
    } finally {
      setSaving(false);
    }
  };

  const updateTranslation = (key, lang, value) => {
    setTranslations({
      ...translations,
      [key]: {
        ...translations[key],
        [lang]: value,
      },
    });
  };

  const filteredKeys = Object.keys(translations).filter((key) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    Object.values(translations[key] || {}).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-600 hover:text-[#0052CC] transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Translations Management</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors disabled:opacity-50"
            data-testid="save-button"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search translations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Editing:</span>
              <div className="flex space-x-1 border border-gray-300 rounded-lg overflow-hidden">
                {['fr', 'en', 'he'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      currentLang === lang
                        ? 'bg-[#0052CC] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    data-testid={`lang-button-${lang}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredKeys.length} of {Object.keys(translations).length} translations
          </div>
        </div>

        {/* Translations Grid */}
        <div className="space-y-4">
          {filteredKeys.map((key) => (
            <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="mb-3">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {key}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['fr', 'en', 'he'].map((lang) => (
                  <div key={lang}>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">
                      {lang}
                    </label>
                    <textarea
                      value={translations[key]?.[lang] || ''}
                      onChange={(e) => updateTranslation(key, lang, e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent ${
                        currentLang === lang
                          ? 'border-[#0052CC] bg-blue-50'
                          : 'border-gray-300'
                      }`}
                      dir={lang === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredKeys.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No translations found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationsAdmin;
