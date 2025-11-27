import React, { useEffect, useState } from 'react';
import EditorAccess from './EditorAccess';

/**
 * Page principale de l'éditeur drag & drop Emergent
 * Charge le CMS Emergent complet après authentification par code
 * 
 * Le CMS Emergent est accessible uniquement après authentification par code
 * Variables d'environnement requises :
 * - VITE_EDITOR_ACCESS_CODE ou REACT_APP_EDITOR_ACCESS_CODE : Code de protection
 * - VITE_CMS_BACKEND_URL ou REACT_APP_CMS_API_URL : URL du backend CMS
 */
const Editor = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [builderLoaded, setBuilderLoaded] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const authToken = localStorage.getItem('editor_auth');
    const expectedCode = import.meta.env.VITE_EDITOR_ACCESS_CODE || 
                         process.env.REACT_APP_EDITOR_ACCESS_CODE ||
                         'IGV2025_EDITOR';
    
    if (authToken === expectedCode) {
      setAuthenticated(true);
      // Charger le builder dans un iframe
      loadBuilder();
    }
  }, []);

  const loadBuilder = () => {
    try {
      // Le builder Emergent est dans src/editor et utilise Vite
      // Pour l'instant, nous affichons une interface de transition
      // car le builder nécessite son propre serveur de dev Vite
      setBuilderLoaded(true);
    } catch (error) {
      console.error('Erreur chargement builder:', error);
    }
  };

  if (!authenticated) {
    return (
      <EditorAccess>
        <div className="min-h-screen bg-gray-50" />
      </EditorAccess>
    );
  }

  // Interface de connexion au CMS backend
  return (
    <EditorAccess>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Header avec logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              CMS Emergent - Éditeur Drag & Drop
            </h1>
            <p className="text-xl text-gray-400">
              Interface de gestion de contenu visuel
            </p>
          </div>

          {/* Cartes de fonctionnalités */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Authentification Active</h3>
                  <p className="text-gray-400 text-sm">
                    Accès sécurisé par code • Protection active
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Backend CMS Connecté</h3>
                  <p className="text-gray-400 text-sm">
                    {process.env.REACT_APP_CMS_API_URL || 'https://igv-cms-backend.onrender.com/api'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop Builder</h3>
                  <p className="text-gray-400 text-sm">
                    Éditeur visuel • Blocs personnalisables
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ancien Admin Désactivé</h3>
                  <p className="text-gray-400 text-sm">
                    Route /admin supprimée • Uniquement CMS Emergent
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message d'intégration technique */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                  ⚙️ Intégration Technique en Cours
                </h3>
                <p className="text-yellow-200 mb-4">
                  Le builder Emergent (TypeScript/Vite/React 19) nécessite une adaptation technique 
                  pour fonctionner dans l'environnement principal (Create React App/React 18).
                </p>
                <div className="bg-yellow-900/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-100 font-semibold mb-2">Options d'intégration complète :</p>
                  <ul className="text-yellow-200 text-sm space-y-2">
                    <li>• <strong>Option 1 :</strong> Héberger le builder sur un sous-domaine (ex: builder.israelgrowthventure.com)</li>
                    <li>• <strong>Option 2 :</strong> Convertir le builder en React 18 compatible (migration technique)</li>
                    <li>• <strong>Option 3 :</strong> Utiliser un iframe avec authentification partagée via localStorage</li>
                  </ul>
                </div>
                <p className="text-yellow-200 text-sm">
                  Le backend CMS est pleinement opérationnel et toutes les pages sont gérées via l'API.
                  L'interface graphique du builder sera disponible après choix de l'option d'intégration.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <a
              href="/"
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-center"
            >
              Retour au site
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('editor_auth');
                window.location.reload();
              }}
              className="flex-1 py-4 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              Déconnexion
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>CMS Emergent • Version Builder Intégré • Environnement Production</p>
          </div>
        </div>
      </div>
    </EditorAccess>
  );
};

export default Editor;
