import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './CmsAdminButton.css';

/**
 * CmsAdminButton - Bouton "Modifier le Site" protégé
 * 
 * Conditions d'affichage:
 * - Seulement visible pour les rôles 'admin' ou 'technique'
 * - Protégé par un mot de passe séparé (CMS_PASSWORD via Render)
 * - Ouvre une page placeholder "CMS bientôt disponible"
 * 
 * Mission 2: Mise de côté temporaire du CMS
 */
const CmsAdminButton = ({ collapsed = false }) => {
  const { user, isAdmin, hasRole } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [error, setError] = useState('');

  // Condition d'affichage: seulement admin ou technique
  const canSeeCmsButton = user && (isAdmin() || hasRole('technique', 'tech', 'developer'));

  // Ne pas afficher le bouton pour les commerciaux
  if (!canSeeCmsButton) {
    return null;
  }

  const handleClick = () => {
    setShowPasswordModal(true);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Vérifier le mot de passe via l'API backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://igv-cms-backend.onrender.com'}/api/cms/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setShowPlaceholder(true);
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de vérification');
    }
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setError('');
  };

  const closePlaceholder = () => {
    setShowPlaceholder(false);
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        data-testid="btn-cms-edit"
        aria-label="Modifier le Site"
        className="cms-admin-button"
        title="Ouvrir l'éditeur de site (protégé)"
      >
        <Palette />
        {!collapsed && <span>Modifier le Site</span>}
      </button>

      {/* Modal de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Accès CMS protégé</h3>
            <p className="text-sm text-gray-600 mb-4">
              Entrez le mot de passe CMS pour accéder à l'éditeur.
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe CMS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 bg-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Placeholder CMS bientôt disponible */}
      {showPlaceholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-[500px] shadow-xl text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">CMS bientôt disponible</h2>
            <p className="text-gray-600 mb-6">
              L'éditeur de contenu est en cours de développement.<br />
              Cette fonctionnalité sera disponible prochainement.
            </p>
            <button
              onClick={closePlaceholder}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CmsAdminButton;
