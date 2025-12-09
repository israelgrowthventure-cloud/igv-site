import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, TrendingUp, Users, Building } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import { pagesAPI } from '../utils/api';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { country_name, isLoading } = useGeo();
  const [cmsContent, setCmsContent] = useState(null);
  const [loadingCMS, setLoadingCMS] = useState(true);

  // Charger le contenu CMS
  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const response = await pagesAPI.getBySlug('home');
        if (response.data && response.data.published && response.data.content_html) {
          setCmsContent(response.data);
        }
      } catch (error) {
        console.log('CMS content not available for home, using React fallback');
      } finally {
        setLoadingCMS(false);
      }
    };
    loadCMSContent();
  }, []);

  // Pendant le chargement CMS : afficher un loader minimal
  if (loadingCMS) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si le contenu CMS est disponible, l'afficher (VERSION MODERNE PRIORITAIRE)
  if (cmsContent) {
    return (
      <div className="cms-home-page">
        <style dangerouslySetInnerHTML={{ __html: cmsContent.content_css }} />
        <div dangerouslySetInnerHTML={{ __html: cmsContent.content_html }} />
      </div>
    );
  }

  // Si CMS échoue : afficher message d'erreur propre (pas de fallback layout complet)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Israel Growth Venture
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Le contenu de cette page est temporairement indisponible.
        </p>
        <p className="text-gray-500 mb-8">
          Veuillez actualiser la page ou réessayer dans quelques instants.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Actualiser la page
          </button>
          <Link
            to="/packs"
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Voir nos packs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
