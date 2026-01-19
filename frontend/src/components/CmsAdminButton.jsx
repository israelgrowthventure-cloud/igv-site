import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import './CmsAdminButton.css';

const CmsAdminButton = ({ collapsed = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCmsScript = () => {
      if (window.LiveCMS) {
        console.log('CMS deja charge');
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://4vm404m082y6.space.minimax.io/livecms.js';
      script.async = true;

      script.onload = () => {
        console.log('CMS embeddable charge avec succes');
        setIsLoaded(true);
        setIsLoading(false);
      };

      script.onerror = () => {
        console.error('Echec du chargement du CMS');
        setError('CMS non disponible');
        setIsLoading(false);
      };

      setTimeout(() => {
        if (!window.LiveCMS && !error) {
          setError('Timeout - CMS non charge');
          setIsLoading(false);
        }
      }, 10000);

      document.body.appendChild(script);
    };

    const timer = setTimeout(loadCmsScript, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (isLoading) {
      alert('CMS en cours de chargement...');
      return;
    }

    if (window.LiveCMS && typeof window.LiveCMS.openAdmin === 'function') {
      window.LiveCMS.openAdmin();
    } else if (error) {
      // Fallback: ouvrir dans une nouvelle fenêtre ou afficher un message
      alert(`Le CMS n'est pas disponible actuellement. ${error}`);
    } else {
      alert('CMS non disponible. Rafraichissez la page.');
    }
  };

  return (
    <button 
      onClick={handleClick} 
      data-testid="btn-cms-edit"
      aria-label="Modifier le Site"
      className={`cms-admin-button ${error ? 'has-error' : ''}`}
      title={error || (isLoading ? 'Chargement...' : 'Ouvrir l\'editeur de site')}
    >
      <Palette />
      {!collapsed && <span>{isLoading ? 'Chargement...' : 'Modifier le Site'}</span>}
      {error && <span className="error-badge">!</span>}
    </button>
  );
};

export default CmsAdminButton;
