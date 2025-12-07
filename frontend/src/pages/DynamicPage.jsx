import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { pagesAPI } from '../utils/api';
import { toast } from 'sonner';

const DynamicPage = () => {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine slug: either from URL params or from pathname
  const getSlugFromPath = () => {
    if (paramSlug) return paramSlug;
    
    const path = location.pathname;
    // Handle direct routes like /etude-implantation-360 or /etude-implantation-360/merci
    if (path === '/etude-implantation-360') return 'etude-implantation-360';
    if (path === '/etude-implantation-360/merci') return 'etude-implantation-merci';
    
    // Fallback: extract slug from path (remove leading slash)
    return path.replace(/^\//, '').replace(/\//g, '-');
  };

  const slug = getSlugFromPath();

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await pagesAPI.getBySlug(slug);
      setPage(response.data);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Page introuvable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!page || !page.published) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-page">
      <div className="py-20" data-testid="dynamic-page">
        <style dangerouslySetInnerHTML={{ __html: page.content_css }} />
        <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
      </div>
    </div>
  );
};

export default DynamicPage;

