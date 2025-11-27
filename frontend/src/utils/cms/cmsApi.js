/**
 * CMS API Utility Functions
 * ==========================
 * 
 * CRITICAL CONCEPT:
 * This file handles all communication with the visual CMS backend.
 * The CMS is a separate service that controls ALL visual content.
 * 
 * ENVIRONMENT VARIABLE REQUIRED:
 * REACT_APP_CMS_API_URL - Base URL of the CMS API
 * Example: https://igv-cms-backend.onrender.com/api
 * 
 * DEPLOYMENT INSTRUCTIONS FOR RENDER:
 * 1. Go to Render Dashboard → Your Frontend Service
 * 2. Navigate to "Environment" tab
 * 3. Add environment variable:
 *    Key: REACT_APP_CMS_API_URL
 *    Value: https://igv-cms-backend.onrender.com/api
 * 4. Redeploy the service
 * 
 * API ENDPOINTS:
 * - GET /pages/{slug} - Fetch page content by slug
 * - GET /pages - List all published pages
 * 
 * RESPONSE FORMAT:
 * {
 *   "slug": "home",
 *   "title": "Homepage",
 *   "status": "published",
 *   "blocks": [
 *     {
 *       "id": "block-uuid",
 *       "type": "heading",
 *       "props": { "content": "Welcome" },
 *       "children": []
 *     }
 *   ],
 *   "metadata": {
 *     "seo_title": "...",
 *     "seo_description": "..."
 *   }
 * }
 */

// Get CMS API base URL from environment
const CMS_API_BASE_URL = process.env.REACT_APP_CMS_API_URL;

/**
 * Check if CMS is configured
 */
export const isCmsConfigured = () => {
  return !!CMS_API_BASE_URL;
};

/**
 * Get the full CMS API URL
 */
export const getCmsApiUrl = () => {
  if (!CMS_API_BASE_URL) {
    console.error('CMS API URL not configured. Set REACT_APP_CMS_API_URL environment variable.');
    return null;
  }
  return CMS_API_BASE_URL;
};

/**
 * Fetch a page by slug from the CMS
 * 
 * @param {string} slug - Page slug (e.g., "home", "packs", "about")
 * @returns {Promise<Object>} Page data with blocks
 * @throws {Error} If CMS not configured or fetch fails
 */
export const fetchPageBySlug = async (slug) => {
  if (!isCmsConfigured()) {
    throw new Error('CMS_NOT_CONFIGURED');
  }

  const url = `${CMS_API_BASE_URL}/pages/${slug}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PAGE_NOT_FOUND');
      }
      throw new Error(`CMS_ERROR: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.slug || !Array.isArray(data.blocks)) {
      console.error('Invalid CMS response structure:', data);
      throw new Error('INVALID_CMS_RESPONSE');
    }

    // Only return published pages
    if (data.status !== 'published') {
      throw new Error('PAGE_NOT_PUBLISHED');
    }

    return data;
  } catch (error) {
    if (error.message.startsWith('PAGE_') || error.message.startsWith('CMS_')) {
      throw error;
    }
    console.error('CMS fetch error:', error);
    throw new Error('CMS_NETWORK_ERROR');
  }
};

/**
 * Fetch all published pages from CMS
 * 
 * @returns {Promise<Array>} List of all published pages
 */
export const fetchAllPages = async () => {
  if (!isCmsConfigured()) {
    throw new Error('CMS_NOT_CONFIGURED');
  }

  const url = `${CMS_API_BASE_URL}/pages`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS_ERROR: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter only published pages
    return data.filter(page => page.status === 'published');
  } catch (error) {
    console.error('CMS fetch all pages error:', error);
    throw error;
  }
};

/**
 * Convert URL path to CMS slug
 * 
 * @param {string} path - URL path (e.g., "/", "/packs", "/about-us")
 * @returns {string} CMS slug
 * 
 * Examples:
 * "/" → "home"
 * "/packs" → "packs"
 * "/about-us" → "about-us"
 */
export const pathToSlug = (path) => {
  // Remove leading/trailing slashes
  const cleanPath = path.replace(/^\/|\/$/g, '');
  
  // Root path becomes "home"
  if (!cleanPath || cleanPath === '') {
    return 'home';
  }
  
  return cleanPath;
};

/**
 * Get user-friendly error message
 * 
 * @param {string} errorCode - Error code from API
 * @returns {string} User-friendly message
 */
export const getCmsErrorMessage = (errorCode) => {
  const messages = {
    'CMS_NOT_CONFIGURED': 'The CMS is not configured. Please set REACT_APP_CMS_API_URL environment variable.',
    'PAGE_NOT_FOUND': 'This page does not exist in the CMS.',
    'PAGE_NOT_PUBLISHED': 'This page is not yet published.',
    'INVALID_CMS_RESPONSE': 'Invalid response from CMS. Please check CMS configuration.',
    'CMS_NETWORK_ERROR': 'Unable to connect to CMS. Please check your internet connection.',
  };

  return messages[errorCode] || 'An unknown error occurred while loading this page.';
};

export default {
  isCmsConfigured,
  getCmsApiUrl,
  fetchPageBySlug,
  fetchAllPages,
  pathToSlug,
  getCmsErrorMessage,
};
