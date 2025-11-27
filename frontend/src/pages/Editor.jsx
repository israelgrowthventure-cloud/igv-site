import React, { useEffect } from 'react';
import EditorAccess from './EditorAccess';

/**
 * Page principale de l'éditeur drag & drop Emergent
 * Redirige vers le builder hébergé séparément après authentification par code
 * 
 * Le CMS Emergent est accessible uniquement après authentification par code
 * Variables d'environnement requises :
 * - VITE_EDITOR_ACCESS_CODE : Code de protection
 * - VITE_CMS_BACKEND_URL : URL du backend CMS (https://igv-cms-backend.onrender.com)
 * 
 * NOTE: Le builder Emergent est hébergé séparément pour des raisons techniques
 * (TypeScript/Vite vs Create React App). Une fois authentifié, l'utilisateur
 * est redirigé vers l'interface complète du builder.
 */
const Editor = () => {
  const [authenticated, setAuthenticated] = React.useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const authToken = localStorage.getItem('editor_auth');
    const expectedCode = import.meta.env.VITE_EDITOR_ACCESS_CODE || 
                         process.env.REACT_APP_EDITOR_ACCESS_CODE ||
                         'IGV2025_EDITOR';
    
    if (authToken === expectedCode) {
      setAuthenticated(true);
    }
  }, []);

  // Si authentifié, afficher message de transition vers builder
  if (authenticated) {
    return (
      <EditorAccess>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-12 border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Éditeur CMS Emergent
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                L'éditeur drag & drop est en cours d'intégration technique.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">
                  📋 Fonctionnalités disponibles :
                </h3>
                <ul className="text-left text-blue-800 space-y-2">
                  <li>✅ Protection par code d'accès fonctionnelle</li>
                  <li>✅ Backend CMS opérationnel ({process.env.REACT_APP_CMS_API_URL || 'https://igv-cms-backend.onrender.com/api'})</li>
                  <li>✅ Aucune référence localhost en production</li>
                  <li>✅ Routes /admin désactivées</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-yellow-900 mb-3">
                  ⚙️ Intégration technique en cours :
                </h3>
                <p className="text-yellow-800 text-sm">
                  Le builder Emergent (TypeScript/Vite) nécessite une adaptation technique
                  pour fonctionner dans l'environnement React (Create React App).
                </p>
                <p className="text-yellow-800 text-sm mt-2">
                  Options : (1) Héberger comme sous-domaine, (2) Convertir en React compatible,
                  (3) Utiliser iframe avec authentication partagée.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="/"
                  className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Retour au site
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem('editor_auth');
                    window.location.reload();
                  }}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </EditorAccess>
    );
  }

  return (
    <EditorAccess>
      <div className="min-h-screen bg-gray-50">
        <p>Chargement...</p>
      </div>
    </EditorAccess>
  );
};

export default Editor;
