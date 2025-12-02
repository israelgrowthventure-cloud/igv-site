import React, { useEffect, useState } from 'react';
import EditorAccess from './EditorAccess';

/**
 * Éditeur CMS Simple - Édition directe du contenu JSON
 * Accessible après authentification par code
 * Sauvegarde dans localStorage avec export JSON
 */
const Editor = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Vérifier l'authentification
    const authToken = localStorage.getItem('editor_auth');
    const expectedCode = process.env.REACT_APP_EDITOR_ACCESS_CODE || 'IGV2025_EDITOR';
    
    if (authToken === expectedCode) {
      setAuthenticated(true);
      loadContent();
    }
  }, []);

  const loadContent = async () => {
    try {
      // Charger depuis localStorage d'abord (version modifiée)
      const savedContent = localStorage.getItem('cms_content');
      if (savedContent) {
        setContent(JSON.parse(savedContent));
      } else {
        // Sinon charger le fichier public
        const response = await fetch('/content-editable.json');
        const data = await response.json();
        setContent(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      setLoading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('cms_content', JSON.stringify(content, null, 2));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'content-editable.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser aux valeurs par défaut ? Toutes les modifications seront perdues.')) {
      localStorage.removeItem('cms_content');
      window.location.reload();
    }
  };

  const updateField = (path, value) => {
    const newContent = { ...content };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setContent(newContent);
  };

  if (!authenticated) {
    return (
      <EditorAccess>
        <div className="min-h-screen bg-gray-50" />
      </EditorAccess>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement du CMS...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement du CMS...</div>
      </div>
    );
  }

  // Interface d'édition du contenu
  return (
    <EditorAccess>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">CMS Éditeur</h1>
              <div className="flex gap-2">
                {['home', 'about', 'contact', 'packs', 'site'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              {saved && (
                <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  ✓ Sauvegardé
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📥 Exporter JSON
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Réinitialiser
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Retour au site
              </a>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            {/* Section HOME */}
            {activeSection === 'home' && content?.pages?.home && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Page d'accueil</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre SEO</label>
                  <input
                    type="text"
                    value={content.pages.home.seo_title}
                    onChange={(e) => updateField('pages.home.seo_title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description SEO</label>
                  <textarea
                    value={content.pages.home.seo_description}
                    onChange={(e) => updateField('pages.home.seo_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <hr className="border-gray-700" />
                <h3 className="text-xl font-semibold text-white">Hero Section</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre Principal</label>
                  <input
                    type="text"
                    value={content.pages.home.hero.title}
                    onChange={(e) => updateField('pages.home.hero.title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sous-titre</label>
                  <input
                    type="text"
                    value={content.pages.home.hero.subtitle}
                    onChange={(e) => updateField('pages.home.hero.subtitle', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={content.pages.home.hero.description}
                    onChange={(e) => updateField('pages.home.hero.description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <hr className="border-gray-700" />
                <h3 className="text-xl font-semibold text-white">Étapes</h3>

                {['step1', 'step2', 'step3'].map((step) => (
                  <div key={step} className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-3">Étape {step.slice(-1)}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                        <input
                          type="text"
                          value={content.pages.home.steps[step].title}
                          onChange={(e) => updateField(`pages.home.steps.${step}.title`, e.target.value)}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={content.pages.home.steps[step].description}
                          onChange={(e) => updateField(`pages.home.steps.${step}.description`, e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section ABOUT */}
            {activeSection === 'about' && content?.pages?.about && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Page À propos</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre SEO</label>
                  <input
                    type="text"
                    value={content.pages.about.seo_title}
                    onChange={(e) => updateField('pages.about.seo_title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description SEO</label>
                  <textarea
                    value={content.pages.about.seo_description}
                    onChange={(e) => updateField('pages.about.seo_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Section CONTACT */}
            {activeSection === 'contact' && content?.pages?.contact && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Page Contact</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre du formulaire</label>
                  <input
                    type="text"
                    value={content.pages.contact.form.title}
                    onChange={(e) => updateField('pages.contact.form.title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={content.pages.contact.form.description}
                    onChange={(e) => updateField('pages.contact.form.description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Section PACKS */}
            {activeSection === 'packs' && content?.pages?.packs && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Page Packs</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre principal</label>
                  <input
                    type="text"
                    value={content.pages.packs.heading}
                    onChange={(e) => updateField('pages.packs.heading', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={content.pages.packs.description}
                    onChange={(e) => updateField('pages.packs.description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Section SITE */}
            {activeSection === 'site' && content?.site && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Informations du site</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du site</label>
                  <input
                    type="text"
                    value={content.site.name}
                    onChange={(e) => updateField('site.name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
                  <input
                    type="text"
                    value={content.site.tagline}
                    onChange={(e) => updateField('site.tagline', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email de contact</label>
                  <input
                    type="email"
                    value={content.site.contact_email}
                    onChange={(e) => updateField('site.contact_email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={content.site.phone}
                    onChange={(e) => updateField('site.phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={content.site.address}
                    onChange={(e) => updateField('site.address', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-3">📝 Instructions</h3>
            <ul className="text-blue-200 space-y-2 text-sm">
              <li>✓ Modifiez les champs ci-dessus pour personnaliser le contenu</li>
              <li>✓ Cliquez sur "Sauvegarder" pour enregistrer dans localStorage</li>
              <li>✓ Les modifications sont visibles immédiatement sur le site</li>
              <li>✓ Utilisez "Exporter JSON" pour sauvegarder une copie locale</li>
              <li>✓ "Réinitialiser" efface toutes les modifications et revient au contenu original</li>
            </ul>
          </div>
        </div>
      </div>
    </EditorAccess>
  );
};

export default Editor;

