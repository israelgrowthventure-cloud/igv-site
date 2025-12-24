import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, TrendingUp, Eye, Zap, Target } from 'lucide-react';

const FutureCommerce = () => {
  const { t } = useTranslation();

  const realities = [
    {
      title: t('futureCommerce.realities.reality1.title'),
      description: t('futureCommerce.realities.reality1.description'),
      icon: Eye
    },
    {
      title: t('futureCommerce.realities.reality2.title'),
      description: t('futureCommerce.realities.reality2.description'),
      icon: Target
    },
    {
      title: t('futureCommerce.realities.reality3.title'),
      points: t('futureCommerce.realities.reality3.points', { returnObjects: true }),
      conclusion: t('futureCommerce.realities.reality3.conclusion'),
      icon: Zap
    }
  ];

  const services = t('futureCommerce.what_we_do.services', { returnObjects: true });
  const israelPoints = t('futureCommerce.israel.points', { returnObjects: true });
  const whySeriesItems = t('futureCommerce.why_series.items', { returnObjects: true });

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('futureCommerce.hero.line1')}
            </h1>
            <p className="text-2xl sm:text-3xl text-blue-200 mb-4">
              {t('futureCommerce.hero.line2')}
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-8">
              {t('futureCommerce.hero.line3')}
            </p>
          </div>
          
          <p className="text-lg text-gray-300 leading-relaxed text-center max-w-3xl mx-auto">
            {t('futureCommerce.hero.description')}
          </p>
        </div>
      </section>

      {/* Israel Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('futureCommerce.israel.title')}
            </h2>
            <p className="text-xl text-gray-600 italic">
              {t('futureCommerce.israel.subtitle')}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {israelPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {index + 1}
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl">
            <p className="text-lg font-semibold">
              {t('futureCommerce.israel.conclusion')}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Realities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('futureCommerce.realities.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {realities.map((reality, index) => {
              const Icon = reality.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{reality.title}</h3>
                  {reality.description && (
                    <p className="text-sm text-gray-600">{reality.description}</p>
                  )}
                  {reality.points && (
                    <div className="space-y-2 mb-3">
                      {reality.points.map((point, idx) => (
                        <p key={idx} className="text-sm text-gray-600">• {point}</p>
                      ))}
                    </div>
                  )}
                  {reality.conclusion && (
                    <p className="text-sm text-gray-700 italic mt-3">{reality.conclusion}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('futureCommerce.what_we_do.title')}
            </h2>
            <p className="text-base text-gray-600">
              {t('futureCommerce.what_we_do.description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {services.map((service, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-gray-700">{service}</p>
              </div>
            ))}
          </div>

          <div className="text-center p-6 bg-gray-900 text-white rounded-xl">
            <p className="text-lg font-bold">
              {t('futureCommerce.what_we_do.conclusion')}
            </p>
          </div>
        </div>
      </section>

      {/* Why Series */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('futureCommerce.why_series.title')}
            </h2>
            <p className="text-base text-gray-600 mb-4">
              {t('futureCommerce.why_series.description')}
            </p>
            <p className="text-base font-semibold text-gray-900 mb-6">
              {t('futureCommerce.why_series.content')}
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {whySeriesItems.map((item, index) => (
              <li key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-base text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="text-center p-6 bg-blue-600 text-white rounded-xl">
            <p className="text-base font-medium">
              {t('futureCommerce.why_series.conclusion')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à tester votre concept en Israël ?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Réservez un appel de 30 minutes pour discuter de votre projet
          </p>
          <Link
            to="/appointment"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-base font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="future-commerce-cta"
          >
            {t('futureCommerce.cta')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default FutureCommerce;
