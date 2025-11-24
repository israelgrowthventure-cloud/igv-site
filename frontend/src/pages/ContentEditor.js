import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, Edit3 } from 'lucide-react';

const ContentEditor = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    fetch('/content-editable.json')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => console.error('Erreur chargement contenu:', err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/admin/save-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: prompt('Mot de passe admin:'),
          content: content
        })
      });
      
      if (response.ok) {
        alert('✅ Contenu sauvegardé avec succès!');
      } else {
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedValue = (path, value) => {
    const newContent = { ...content };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setContent(newContent);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Éditeur de Contenu IGV</h1>
                <p className="text-sm text-gray-500">Modifiez facilement le contenu de votre site</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['hero', 'features', 'packs', 'contact', 'images'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Hero Section */}
            {activeTab === 'hero' && content.hero && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Section Hero (Page d'accueil)</h2>
                
                {['title', 'subtitle', 'description'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['fr', 'en', 'he'].map((lang) => (
                        <div key={lang}>
                          <label className="block text-xs text-gray-500 mb-1 uppercase">{lang}</label>
                          {field === 'description' ? (
                            <textarea
                              value={content.hero[field][lang]}
                              onChange={(e) => updateNestedValue(`hero.${field}.${lang}`, e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <input
                              type="text"
                              value={content.hero[field][lang]}
                              onChange={(e) => updateNestedValue(`hero.${field}.${lang}`, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Packs Section */}
            {activeTab === 'packs' && content.packs && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Packs / Offres</h2>
                
                {content.packs.map((pack, packIndex) => (
                  <div key={pack.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pack {packIndex + 1}: {pack.id}</h3>
                    
                    {/* Pack Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Pack</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['fr', 'en', 'he'].map((lang) => (
                          <div key={lang}>
                            <label className="block text-xs text-gray-500 mb-1 uppercase">{lang}</label>
                            <input
                              type="text"
                              value={pack.name[lang]}
                              onChange={(e) => {
                                const newPacks = [...content.packs];
                                newPacks[packIndex].name[lang] = e.target.value;
                                setContent({ ...content, packs: newPacks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix par région</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['EUR', 'USD', 'ILS'].map((currency) => (
                          <div key={currency}>
                            <label className="block text-xs text-gray-500 mb-1">{currency}</label>
                            <input
                              type="number"
                              value={pack.price[currency]}
                              onChange={(e) => {
                                const newPacks = [...content.packs];
                                newPacks[packIndex].price[currency] = parseInt(e.target.value);
                                setContent({ ...content, packs: newPacks });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Section */}
            {activeTab === 'contact' && content.contact && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de Contact</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => updateNestedValue('contact.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={content.contact.phone}
                    onChange={(e) => updateNestedValue('contact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Images Section */}
            {activeTab === 'images' && content.images && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Pour changer une image, placez le fichier dans <code className="bg-gray-100 px-2 py-1 rounded">frontend/src/assets/</code> et mettez à jour le chemin ci-dessous.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <input
                    type="text"
                    value={content.images.logo}
                    onChange={(e) => updateNestedValue('images.logo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/static/media/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Hero</label>
                  <input
                    type="text"
                    value={content.images.heroImage}
                    onChange={(e) => updateNestedValue('images.heroImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/static/media/hero.jpg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
