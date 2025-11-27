import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

/**
 * Composant de protection par code d'accès pour l'éditeur
 * Le code est défini via la variable d'environnement VITE_EDITOR_ACCESS_CODE
 */
const EditorAccess = ({ children }) => {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Vérifier si déjà authentifié au chargement
  useEffect(() => {
    const savedAuth = localStorage.getItem('editor_auth');
    const expectedCode = process.env.REACT_APP_EDITOR_ACCESS_CODE || 'IGV2025_EDITOR';
    
    // Si pas de code configuré, bloquer l'accès
    if (!expectedCode) {
      setError('Éditeur non configuré. Contactez l\'administrateur.');
      setLoading(false);
      return;
    }

    // Vérifier l'authentification sauvegardée
    if (savedAuth === expectedCode) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const expectedCode = process.env.REACT_APP_EDITOR_ACCESS_CODE || 'IGV2025_EDITOR';

    if (!expectedCode) {
      setError('Éditeur non configuré. Contactez l\'administrateur.');
      return;
    }

    if (code === expectedCode) {
      // Sauvegarder l'authentification
      localStorage.setItem('editor_auth', code);
      setIsAuthenticated(true);
    } else {
      setError('Code incorrect');
      setCode('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('editor_auth');
    setIsAuthenticated(false);
    setCode('');
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

  // Si authentifié, afficher le contenu (le builder)
  if (isAuthenticated) {
    return (
      <div>
        {/* Bouton de déconnexion discret */}
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Déconnexion
        </button>
        {children}
      </div>
    );
  }

  // Écran de connexion
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Éditeur IGV</h1>
          <p className="text-gray-600">Accès protégé par code</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'accès
              </label>
              <input
                type="password"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Entrez le code"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Accéder à l'éditeur
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Pour obtenir le code d'accès, contactez l'administrateur système
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorAccess;
