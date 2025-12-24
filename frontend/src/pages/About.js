import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Building, Users, Target } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>{t('about.title')} | Israel Growth Venture</title>
        <meta name="description" content={t('about.description')} />
        <link rel="canonical" href="https://israelgrowthventure.com/about" />
      </Helmet>

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('about.description')}
            </p>
          </div>

          {/* What we do */}
          <section className="mb-16">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-8">
                {t('about.collaboration')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-8">
                {t('about.support')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('about.service')}
              </p>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">{t('home.aiInsight.cta')}</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {t('home.aiInsight.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/mini-analyse"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                {t('nav.miniAnalysis')}
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all border-2 border-blue-400"
              >
                {t('nav.contact')}
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
