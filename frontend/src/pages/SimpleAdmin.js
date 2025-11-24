import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';

const SimpleAdmin = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/content.json');
      const data = await response.json();
      setContent(data);
      setLoading(false);
    } catch (error) {
      toast.error('Erreur lors du chargement du contenu');
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/save-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer igv2025'
        },
        body: JSON.stringify(content)
      });

      if (response.ok) {
        toast.success('✅ Contenu sauvegardé avec succès !');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Impossible de sauvegarder. Vérifiez que le backend est lancé.');
    }
    setSaving(false);
  };

  const updateField = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updatePackField = (packName, field, value) => {
    setContent(prev => ({
      ...prev,
      packs: {
        ...prev.packs,
        [packName]: {
          ...prev.packs[packName],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin IGV</h1>
            <p className="text-sm text-gray-600">Éditeur de contenu simplifié</p>
          </div>
          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={20} />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['hero', 'packs', 'features', 'contact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'hero' && '🏠 Page d\'accueil'}
              {tab === 'packs' && '💼 Packs & Prix'}
              {tab === 'features' && '⭐ Caractéristiques'}
              {tab === 'contact' && '📞 Contact'}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Page d'accueil</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => updateField('hero', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={content.hero.subtitle}
                onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={content.hero.description}
                onChange={(e) => updateField('hero', 'description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Packs Section */}
        {activeTab === 'packs' && (
          <div className="space-y-6">
            {Object.entries(content.packs).map(([packKey, pack]) => (
              <div key={packKey} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {packKey === 'analyse' && '📊 Pack Analyse'}
                  {packKey === 'succursales' && '🏢 Pack Succursales'}
                  {packKey === 'franchise' && '🤝 Pack Franchise'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du pack
                    </label>
                    <input
                      type="text"
                      value={pack.name}
                      onChange={(e) => updatePackField(packKey, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix
                      </label>
                      <input
                        type="number"
                        value={pack.price}
                        onChange={(e) => updatePackField(packKey, 'price', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Devise
                      </label>
                      <select
                        value={pack.currency}
                        onChange={(e) => updatePackField(packKey, 'currency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="€">€ EUR</option>
                        <option value="$">$ USD</option>
                        <option value="₪">₪ ILS</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={pack.description}
                      onChange={(e) => updatePackField(packKey, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de contact</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={content.contact.email}
                onChange={(e) => updateField('contact', 'email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={content.contact.phone}
                onChange={(e) => updateField('contact', 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Les modifications sont sauvegardées dans le fichier content.json. 
            Pour les voir sur le site, actualisez la page après la sauvegarde.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdmin;
