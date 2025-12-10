// ============================================================
// ATTENTION - Layout final IGV validé (Phase 6 - Design V2)
// ============================================================
// Ce composant implémente le design moderne validé pour la home IGV.
// Structure: Hero texte + image à droite, sections étapes, CTA packs.
// Le contenu texte provient du CMS (page 'home'), le layout reste fixe.
// 
// NE PAS MODIFIER la structure sans demande explicite du client.
// Modifications futures : uniquement via le contenu CMS, pas le layout React.
// ============================================================

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

  // Charger le contenu CMS pour overlay textes dynamiques
  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const response = await pagesAPI.getBySlug('home');
        if (response.data && response.data.published && response.data.content_html) {
          setCmsContent(response.data);
        }
      } catch (error) {
        console.log('CMS content not available for home, using default content');
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

  // Si le contenu CMS est disponible ET contient un HTML complet, l'afficher en priorité
  if (cmsContent && cmsContent.content_html && cmsContent.content_html.includes('<section')) {
    return (
      <div className="cms-home-page">
        <style dangerouslySetInnerHTML={{ __html: cmsContent.content_css || '' }} />
        <div dangerouslySetInnerHTML={{ __html: cmsContent.content_html }} />
      </div>
    );
  }

  // DESIGN MODERNE VALIDÉ - Version finale IGV (layout fixe)
  const steps = [
    {
      number: '1',
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      icon: Users,
    },
    {
      number: '2',
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      icon: TrendingUp,
    },
    {
      number: '3',
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      icon: Building,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Version Moderne avec Image à Droite */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t('hero.subtitle')}
              </p>
              <p className="text-lg text-gray-700 mb-8">
                {t('hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/etude-implantation-360"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {t('hero.cta')} <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link
                  to="/qui-sommes-nous"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  {t('hero.secondary')}
                </Link>
              </div>

              {!isLoading && country_name && (
                <p className="text-sm text-gray-500 mt-6">
                  📍 {t('pricing.region')} : {country_name}
                </p>
              )}
            </div>

            {/* Right side - Image (VERSION VALIDÉE) */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-2xl overflow-hidden h-96">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {t('steps.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mb-4 font-bold">
                    {step.number}
                  </div>
                  <IconComponent className="text-blue-600 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Étude 360° CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('etude360.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('etude360.description')}
          </p>
          <Link
            to="/etude-implantation-360"
            className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            {t('etude360.cta')} <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Packs CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            {t('packs.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('packs.subtitle')}
          </p>
          <Link
            to="/packs"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            {t('packs.viewAll')} <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
