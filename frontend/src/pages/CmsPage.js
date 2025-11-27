import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import CmsPageRenderer from '../components/cms/CmsPageRenderer';
import { fetchPageBySlug, pathToSlug, getCmsErrorMessage } from '../utils/cms/cmsApi';

/**
 * CmsPage - Universal Dynamic Page Loader
 * ========================================
 * 
 * CRITICAL CONCEPT:
 * This component replaces ALL hardcoded pages in the application.
 * Every route now goes through this component, which fetches content from the CMS.
 * 
 * HOW IT WORKS:
 * 1. Read current URL path (e.g., "/", "/packs", "/about")
 * 2. Convert path to slug (e.g., "/" → "home", "/packs" → "packs")
 * 3. Fetch page data from CMS API: GET /api/pages/{slug}
 * 4. If page exists and is published → render it with CmsPageRenderer
 * 5. If page not found → show 404 message
 * 6. If CMS not configured → show configuration message
 * 
 * ROUTER CONFIGURATION:
 * In AppRoutes.js, use:
 *   <Route path="*" element={<CmsPage />} />
 * 
 * This means ALL routes are handled by CMS, including:
 * - / (home)
 * - /packs
 * - /about
 * - /contact
 * - ANY future page created in CMS
 * 
 * TO ADD NEW PAGES:
 * 1. Go to CMS admin interface
 * 2. Create new page with desired slug
 * 3. Add blocks (heading, text, images, etc)
 * 4. Publish page
 * 5. Page is immediately live at /{slug}
 * 
 * NO CODE CHANGES NEEDED TO ADD PAGES!
 */

const CmsPage = () => {
  const location = useLocation();
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract slug from current path
  const slug = pathToSlug(location.pathname);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchPageBySlug(slug);
        setPageData(data);
      } catch (err) {
        console.error(`Failed to load page "${slug}":`, err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]); // Reload when slug changes

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATES =====
  if (error) {
    // CMS not configured
    if (error === 'CMS_NOT_CONFIGURED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl text-center">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-yellow-800 mb-4">
                CMS Not Configured
              </h1>
              <p className="text-yellow-700 mb-6">
                The visual CMS is not configured for this website.
              </p>
              <div className="bg-white border border-yellow-200 rounded p-4 text-left">
                <p className="text-sm text-gray-700 mb-2 font-semibold">
                  To enable CMS control:
                </p>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Go to Render Dashboard → Your Frontend Service</li>
                  <li>Navigate to "Environment" tab</li>
                  <li>Add environment variable:</li>
                  <li className="ml-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api
                    </code>
                  </li>
                  <li>Redeploy the service</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Page not found
    if (error === 'PAGE_NOT_FOUND' || error === 'PAGE_NOT_PUBLISHED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'PAGE_NOT_PUBLISHED' 
                ? 'This page exists but is not yet published.'
                : 'The page you are looking for does not exist in the CMS.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Requested slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      );
    }

    // Other errors (network, invalid response, etc)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Error Loading Page
            </h1>
            <p className="text-red-700 mb-4">
              {getCmsErrorMessage(error)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== SUCCESS: RENDER PAGE FROM CMS =====
  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No page data available</p>
      </div>
    );
  }

  return <CmsPageRenderer blocks={pageData.blocks} />;
};

export default CmsPage;
