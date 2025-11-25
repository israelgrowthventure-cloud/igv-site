/**
 * Configuration centralisée pour l'API Backend
 * 
 * En développement local:
 * - Mettez REACT_APP_API_BASE_URL=http://localhost:8000 dans votre .env.local
 * 
 * En production (Render):
 * - Configurez la variable d'environnement REACT_APP_API_BASE_URL 
 *   avec l'URL de votre service backend Render
 * - Exemple: https://igv-backend.onrender.com
 */

export const API_BASE_URL = 
  process.env.REACT_APP_API_BASE_URL || "https://REPLACE_WITH_BACKEND_URL.onrender.com";

// Message d'avertissement en développement si l'URL n'est pas configurée
if (process.env.NODE_ENV === 'development' && API_BASE_URL.includes('REPLACE_WITH_BACKEND_URL')) {
  console.warn(
    '⚠️ API_BASE_URL non configurée. Veuillez définir REACT_APP_API_BASE_URL dans votre fichier .env.local'
  );
}
