// ============================================================
// Hook personnalisé pour injection CMS dans design Emergent
// ============================================================
// Ce hook charge le contenu CMS en arrière-plan et fournit
// une fonction helper pour récupérer textes/images avec fallback.
//
// Usage:
// const { getText, getImage, isLoading } = useCMSContent('page-slug');
// const title = getText('hero.title', fallbackTitle);
// const heroImg = getImage('hero.image', '/default-hero.jpg');
// ============================================================

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pagesAPI } from '../utils/api';

export const useCMSContent = (pageSlug) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [cmsData, setCmsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const response = await pagesAPI.getBySlug(pageSlug);
        if (response.data && response.data.published) {
          // Stocker le contenu structuré (si disponible)
          setCmsData(response.data.structured_content || null);
        }
      } catch (error) {
        // Silencieux : si CMS indisponible, on utilise les fallbacks
        console.log(`CMS content not loaded for ${pageSlug}, using fallback content`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCMSContent();
  }, [pageSlug]);

  /**
   * Récupère un texte depuis le CMS ou retourne le fallback
   * @param {string} path - Chemin vers la valeur (ex: "hero.title")
   * @param {string} fallbackValue - Valeur par défaut
   * @returns {string} Texte à afficher
   */
  const getText = (path, fallbackValue) => {
    if (!cmsData) return fallbackValue;
    
    // Naviguer dans l'objet CMS avec le path
    const keys = path.split('.');
    let value = cmsData;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return fallbackValue;
      }
    }
    
    // Si on a un objet multilingue {fr, en, he}, prendre la langue active
    if (value && typeof value === 'object' && (value.fr || value.en || value.he)) {
      return value[language] || value.fr || fallbackValue;
    }
    
    // Si on a un array (pour les points, items, etc.)
    if (Array.isArray(value)) {
      return value;
    }
    
    return value || fallbackValue;
  };

  /**
   * Récupère une URL d'image depuis le CMS ou retourne l'image par défaut
   * Supporte les images multilingues {fr: "url", en: "url", he: "url"} ou URL simple
   * @param {string} path - Chemin vers l'image (ex: "hero.image")
   * @param {string} fallbackImage - Image par défaut (peut être null pour pas d'image)
   * @returns {string|null} URL de l'image ou null
   */
  const getImage = (path, fallbackImage = null) => {
    if (!cmsData) return fallbackImage;
    
    const keys = path.split('.');
    let value = cmsData;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return fallbackImage;
      }
    }
    
    // Si l'image est multilingue {fr, en, he}, prendre selon la langue active
    if (value && typeof value === 'object' && (value.fr || value.en || value.he)) {
      return value[language] || value.fr || fallbackImage;
    }
    
    // Sinon retourner l'URL directe (string)
    return value || fallbackImage;
  };

  /**
   * Récupère un objet complet (ex: pour array de points)
   * @param {string} path - Chemin vers l'objet
   * @param {any} fallbackValue - Valeur par défaut
   * @returns {any} Objet ou fallback
   */
  const getData = (path, fallbackValue) => {
    if (!cmsData) return fallbackValue;
    
    const keys = path.split('.');
    let value = cmsData;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return fallbackValue;
      }
    }
    
    return value !== undefined ? value : fallbackValue;
  };

  return {
    getText,
    getImage,
    getData,
    isLoading,
    hasContent: cmsData !== null,
  };
};
