import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Cookie, Settings, Eye, BarChart3, Mail } from 'lucide-react';

const CookiesPolicy = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <>
      <Helmet>
        <title>{t('gdpr.cookies.page_title') || 'Politique des cookies - IGV'}</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold">{t('gdpr.cookies.title') || 'Politique des cookies'}</h1>
            </div>

            <p className="text-gray-600 mb-8">
              {t('gdpr.cookies.intro') || 'Cette page explique quels cookies nous utilisons, pourquoi, et comment vous pouvez les gérer.'}
            </p>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Cookie className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.cookies.section1.title') || '1. Qu\'est-ce qu\'un cookie ?'}</h2>
                </div>
                <p className="text-gray-700">
                  {t('gdpr.cookies.section1.p1') || 'Un cookie est un petit fichier texte déposé sur votre ordinateur ou appareil mobile lors de votre visite sur un site web. Les cookies permettent au site de mémoriser vos actions et préférences.'}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.cookies.section2.title') || '2. Types de cookies utilisés'}</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold">{t('gdpr.cookies.essential.title') || 'Cookies essentiels'}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {t('gdpr.cookies.essential.desc') || 'Ces cookies sont nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.'}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('gdpr.cookies.essential.cookie1') || 'Session utilisateur (authentification admin)'}</li>
                      <li>{t('gdpr.cookies.essential.cookie2') || 'Préférences de langue'}</li>
                      <li>{t('gdpr.cookies.essential.cookie3') || 'Consentement cookies'}</li>
                    </ul>
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      {t('gdpr.cookies.essential.status') || '✓ Toujours activés'}
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-600 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold">{t('gdpr.cookies.analytics.title') || 'Cookies analytiques'}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {t('gdpr.cookies.analytics.desc') || 'Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.'}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('gdpr.cookies.analytics.cookie1') || 'Suivi des pages visitées'}</li>
                      <li>{t('gdpr.cookies.analytics.cookie2') || 'Durée de visite'}</li>
                      <li>{t('gdpr.cookies.analytics.cookie3') || 'Source de trafic'}</li>
                    </ul>
                    <p className="mt-2 text-sm font-semibold text-yellow-600">
                      {t('gdpr.cookies.analytics.status') || '⚠ Nécessite votre consentement'}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {t('gdpr.cookies.analytics.note') || 'Note : Les adresses IP sont anonymisées. Aucune donnée personnellement identifiable n\'est collectée.'}
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold">{t('gdpr.cookies.marketing.title') || 'Cookies marketing'}</h3>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {t('gdpr.cookies.marketing.desc') || 'Ces cookies permettent de personnaliser les communications que vous recevez.'}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('gdpr.cookies.marketing.cookie1') || 'Préférences de newsletter'}</li>
                      <li>{t('gdpr.cookies.marketing.cookie2') || 'Historique d\'interaction avec emails'}</li>
                    </ul>
                    <p className="mt-2 text-sm font-semibold text-purple-600">
                      {t('gdpr.cookies.marketing.status') || '⚠ Nécessite votre consentement explicite'}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.cookies.section3.title') || '3. Comment gérer vos cookies ?'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    {t('gdpr.cookies.section3.p1') || 'Vous pouvez gérer vos préférences de cookies de plusieurs manières :'}
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('gdpr.cookies.section3.method1.title') || 'Via notre bannière de consentement'}</h4>
                    <p className="text-sm">
                      {t('gdpr.cookies.section3.method1.desc') || 'Lors de votre première visite, vous pouvez choisir les types de cookies à accepter.'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('gdpr.cookies.section3.method2.title') || 'Via les paramètres de votre navigateur'}</h4>
                    <p className="text-sm">
                      {t('gdpr.cookies.section3.method2.desc') || 'Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Attention : certaines fonctionnalités du site pourraient ne plus fonctionner.'}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('gdpr.cookies.section4.title') || '4. Durée de conservation'}</h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>{t('gdpr.cookies.section4.essential') || 'Cookies essentiels :'}</strong> {t('gdpr.cookies.section4.essential_duration') || 'Session + 30 jours'}</p>
                  <p><strong>{t('gdpr.cookies.section4.analytics') || 'Cookies analytiques :'}</strong> {t('gdpr.cookies.section4.analytics_duration') || '13 mois maximum'}</p>
                  <p><strong>{t('gdpr.cookies.section4.marketing') || 'Cookies marketing :'}</strong> {t('gdpr.cookies.section4.marketing_duration') || '13 mois maximum'}</p>
                </div>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-4">{t('gdpr.cookies.section5.title') || 'Questions ?'}</h2>
                <p className="text-gray-700">
                  {t('gdpr.cookies.section5.p1') || 'Pour toute question sur notre utilisation des cookies, contactez-nous à :'}{' '}
                  <a href="mailto:contact@israelgrowthventure.com" className="text-blue-600 hover:underline font-semibold">
                    contact@israelgrowthventure.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesPolicy;
