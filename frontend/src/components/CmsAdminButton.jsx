import React from 'react';
import { Palette } from 'lucide-react';
import './CmsAdminButton.css';

/**
 * CmsAdminButton - Bouton Wix-style pour ouvrir l'admin CMS
 * Intégré dans le sidebar du CRM
 * Script: https://4vm404m082y6.space.minimax.io/livecms.js
 */
const CmsAdminButton = ({ collapsed = false }) => {
  const handleClick = () => {
    if (window.LiveCMS && typeof window.LiveCMS.openAdmin === 'function') {
      window.LiveCMS.openAdmin();
    } else {
      console.warn('⚠️ LiveCMS non disponible, vérifier le script');
      alert('CMS en cours de chargement...');
    }
  };

  return (
    <button 
      className={`cms-admin-button ${collapsed ? 'cms-admin-collapsed' : ''}`} 
      onClick={handleClick}
      title={collapsed ? 'Modifier le Site (CMS)' : ''}
    >
      <Palette className="cms-admin-icon" size={18} />
      {!collapsed && <span className="cms-admin-text">Modifier le Site</span>}
    </button>
  );
};

export default CmsAdminButton;
