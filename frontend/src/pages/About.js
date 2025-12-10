// ============================================================
// ATTENTION - Layout final IGV validé (Phase 6 - Design V2)
// ============================================================
// Page Qui Sommes-Nous avec design moderne validé.
// Contenu prioritairement depuis CMS (slug: 'qui-sommes-nous').
// Fallback React avec hero, valeurs, team Mickael, CTA contact.
// 
// NE PAS MODIFIER la structure sans demande explicite du client.
// Modifications futures : via contenu CMS uniquement.
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, Target, Users, TrendingUp } from 'lucide-react';
import { pagesAPI } from '../utils/api';

const About = () => {
  const { t } = useTranslation();
  const [cmsContent, setCmsContent] = useState(null);
  const [loadingCMS, setLoadingCMS] = useState(true);

  // Tenter de charger le contenu CMS
  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const response = await pagesAPI.getBySlug('qui-sommes-nous');
        if (response.data && response.data.published && response.data.content_html) {
          setCmsContent(response.data);
        }
      } catch (error) {
        console.log('CMS content not available for qui-sommes-nous, using React fallback');
      } finally {
        setLoadingCMS(false);
      }
    };
    loadCMSContent();
  }, []);

  // Pendant le chargement CMS : afficher un loader minimal
  if (loadingCMS) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si le contenu CMS est disponible, l'afficher
  if (cmsContent) {
    return (
      <div className="cms-about-page">
        <style dangerouslySetInnerHTML={{ __html: cmsContent.content_css }} />
        <div dangerouslySetInnerHTML={{ __html: cmsContent.content_html }} />
      </div>
    );
  }

  // Fallback: contenu React codé en dur (seulement si CMS échoue)

  const values = [
    {
      icon: Award,
      title: 'Expertise',
      description: 'Plus de 20 ans d\'expérience dans l\'immobilier commercial et l\'expansion de marques'
    },
    {
      icon: Target,
      title: 'Résultats',
      description: 'Approche orientée résultats avec un taux de réussite élevé pour nos clients'
    },
    {
      icon: Users,
      title: 'Accompagnement',
      description: 'Support complet de A à Z, de l\'analyse initiale au suivi post-ouverture'
    },
    {
      icon: TrendingUp,
      title: 'Réseau',
      description: 'Réseau étendu de partenaires locaux et connexions avec les autorités'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('about.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-base text-gray-600 leading-relaxed">
                {t('about.collaboration')}
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                {t('about.support')}
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                {t('about.service')}
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                alt="Team"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold mb-1">20+</div>
                <div className="text-sm">Ans d'expérience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nos valeurs
            </h2>
            <p className="text-lg text-gray-600">
              Ce qui nous distingue
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gradient-to-b from-blue-50 to-white hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces"
                  alt="Mickael - Founder"
                  className="rounded-xl shadow-lg w-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Mickael</h3>
                <div className="text-blue-600 font-semibold mb-4">Fondateur & CEO</div>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Avec plus de 20 ans d'expérience en tant qu'agent immobilier professionnel à Paris et trois nominations comme meilleur agent du réseau Procomm, Mickael a acquis une expertise reconnue dans le domaine.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Passionné par l'aide aux entreprises à réussir dans ce pays dynamique, il comprend profondément les besoins de ses clients et développe des stratégies personnalisées pour maximiser leur succès.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Travaillons ensemble
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Contactez-nous pour discuter de votre projet d'expansion en Israël
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-base font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="about-contact-btn"
          >
            {t('nav.contact')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
