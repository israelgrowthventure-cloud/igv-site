import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, Eye, EyeOff, Settings } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const ADMIN_PASSWORD = 'igv2025';

  useEffect(() => {
    // Charger les données de contenu
    const loadContent = async () => {
      try {
        const response = await fetch('/content.json');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };

    if (isAuth) {
      loadContent();
    }
  }, [isAuth]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      setPassword('');
      setMessage('');
    } else {
      setMessage('❌ Mot de passe incorrect');
      setPassword('');
    }
  };

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      setPacks(prev => ({
        ...prev,
        [selectedPack]: {
          ...prev[selectedPack],
          features: [...prev[selectedPack].features, currentFeature]
        }
      }));
      setCurrentFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setPacks(prev => ({
      ...prev,
      [selectedPack]: {
        ...prev[selectedPack],
        features: prev[selectedPack].features.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        },
        body: JSON.stringify(content)
      });

      if (response.ok) {
        setMessage('✅ Contenu sauvegardé avec succès!');
        setTimeout(() => setMessage(''), 3000);
        // Recharger la page pour voir les changements
        window.location.reload();
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage('❌ Erreur: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    setPassword('');
    navigate('/');
  };

  // Écran de connexion
  if (!isAuth) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Settings className="text-blue-600 mr-2" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Admin IGV</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe administrateur
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {message && <p className="text-sm text-red-600 text-center">{message}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Se connecter
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Panel de gestion du contenu
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  // Écran d'édition
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">✏️ Éditeur de Contenu</h1>
          <button
            onClick={() => { setIsAuth(false); navigate('/'); }}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Tabs de navigation */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {['hero', 'packs', 'features', 'contact', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Contenu éditable */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* TAB: HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Bannière d'accueil (Hero)</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal</label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
                <input
                  type="text"
                  value={content.hero.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={content.hero.description}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bouton principal</label>
                <input
                  type="text"
                  value={content.hero.cta_button}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, cta_button: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bouton secondaire</label>
                <input
                  type="text"
                  value={content.hero.secondary_button}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondary_button: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB: PACKS */}
          {activeTab === 'packs' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Nos Packs</h2>
              
              {Object.keys(content.packs).map(packKey => (
                <div key={packKey} className="border-l-4 border-blue-600 pl-6 py-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{content.packs[packKey].name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du pack</label>
                      <input
                        type="text"
                        value={content.packs[packKey].name}
                        onChange={(e) => setContent({
                          ...content,
                          packs: {
                            ...content.packs,
                            [packKey]: { ...content.packs[packKey], name: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix</label>
                      <input
                        type="number"
                        value={content.packs[packKey].price}
                        onChange={(e) => setContent({
                          ...content,
                          packs: {
                            ...content.packs,
                            [packKey]: { ...content.packs[packKey], price: Number(e.target.value) }
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={content.packs[packKey].description}
                      onChange={(e) => setContent({
                        ...content,
                        packs: {
                          ...content.packs,
                          [packKey]: { ...content.packs[packKey], description: e.target.value }
                        }
                      })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                    <input
                      type="text"
                      value={content.packs[packKey].duration}
                      onChange={(e) => setContent({
                        ...content,
                        packs: {
                          ...content.packs,
                          [packKey]: { ...content.packs[packKey], duration: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Fonctionnalités</label>
                    <div className="space-y-2 mb-3">
                      {content.packs[packKey].features.map((feature, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-gray-300">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...content.packs[packKey].features];
                              newFeatures[idx] = e.target.value;
                              setContent({
                                ...content,
                                packs: {
                                  ...content.packs,
                                  [packKey]: { ...content.packs[packKey], features: newFeatures }
                                }
                              });
                            }}
                            className="flex-1 outline-none"
                          />
                          <button
                            onClick={() => {
                              const newFeatures = content.packs[packKey].features.filter((_, i) => i !== idx);
                              setContent({
                                ...content,
                                packs: {
                                  ...content.packs,
                                  [packKey]: { ...content.packs[packKey], features: newFeatures }
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 ml-3 font-semibold"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Ajouter une fonctionnalité"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          setContent({
                            ...content,
                            packs: {
                              ...content.packs,
                              [packKey]: {
                                ...content.packs[packKey],
                                features: [...content.packs[packKey].features, e.target.value]
                              }
                            }
                          });
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Nos Points Forts</h2>
              
              {content.features.map((feature, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...content.features];
                        newFeatures[idx].title = e.target.value;
                        setContent({ ...content, features: newFeatures });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...content.features];
                        newFeatures[idx].description = e.target.value;
                        setContent({ ...content, features: newFeatures });
                      }}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      const newFeatures = content.features.filter((_, i) => i !== idx);
                      setContent({ ...content, features: newFeatures });
                    }}
                    className="mt-3 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Supprimer cette section
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setContent({
                    ...content,
                    features: [...content.features, { title: 'Nouveau point fort', description: '' }]
                  });
                }}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                + Ajouter une section
              </button>
            </div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Informations de Contact</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={content.contact.title}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, title: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={content.contact.description}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, description: e.target.value } })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={content.contact.phone}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Paramètres Généraux</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du site</label>
                <input
                  type="text"
                  value={content.site.title}
                  onChange={(e) => setContent({ ...content, site: { ...content.site, title: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                <input
                  type="text"
                  value={content.site.tagline}
                  onChange={(e) => setContent({ ...content, site: { ...content.site, tagline: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={content.site.description}
                  onChange={(e) => setContent({ ...content, site: { ...content.site, description: e.target.value } })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Conseil :</strong> Tous les changements seront sauvegardés dans la base de contenu du site.
                </p>
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex space-x-4 pt-8 border-t border-gray-300 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              <span>{saving ? 'Sauvegarde...' : '💾 Sauvegarder tous les changements'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
