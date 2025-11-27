/**
 * Configuration centralisée pour l'API Backend
 * 
 * En développement local:
 * - En développement local: utilisez .env.local avec votre backend local si nécessaire
 * 
 * En production (Render):
 * - La variable d'environnement REACT_APP_API_BASE_URL peut surcharger cette valeur
 * - URL par défaut: https://igv-cms-backend.onrender.com (unified backend)
 */

export const API_BASE_URL = 
  process.env.REACT_APP_API_BASE_URL || "https://igv-cms-backend.onrender.com";

