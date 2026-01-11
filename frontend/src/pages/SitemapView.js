import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// Liste statique des pages publiques pour le sitemap
const PUBLIC_PAGES = [
  { path: '/', label: 'Accueil', changefreq: 'daily', priority: '1.0' },
  { path: '/about', label: 'À propos', changefreq: 'monthly', priority: '0.8' },
  { path: '/mini-analyse', label: 'Mini-Analyse', changefreq: 'weekly', priority: '0.9' },
  { path: '/packs', label: 'Packs d\'investissement', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', label: 'Contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/appointment', label: 'Prendre rendez-vous', changefreq: 'monthly', priority: '0.6' },
  { path: '/demande-rappel', label: 'Demande de rappel', changefreq: 'monthly', priority: '0.5' },
  { path: '/future-commerce', label: 'Future Commerce', changefreq: 'monthly', priority: '0.4' },
  { path: '/checkout', label: 'Checkout', changefreq: 'weekly', priority: '0.3' },
  { path: '/payment', label: 'Paiement', changefreq: 'weekly', priority: '0.3' },
  { path: '/payment-success', label: 'Paiement réussi', changefreq: 'weekly', priority: '0.3' },
  { path: '/payment/return', label: 'Retour paiement', changefreq: 'weekly', priority: '0.3' },
  { path: '/legal', label: 'Mentions légales', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', label: 'Conditions générales', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy', label: 'Politique de confidentialité', changefreq: 'yearly', priority: '0.3' },
  { path: '/cookies', label: 'Politique des cookies', changefreq: 'yearly', priority: '0.3' },
  { path: '/sitemap-igv', label: 'Sitemap XML', changefreq: 'weekly', priority: '0.2' }
];

const SitemapView = () => {
  const { t, i18n } = useTranslation();
  
  const isRTL = i18n.language === 'he';

  return (
    <>
      <Helmet>
        <title>Sitemap | Israel Growth Venture</title>
        <meta name="robots" content="noindex, nofollow" />
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Sitemap - Israel Growth Venture</h1>
            <p className="text-gray-600">
              Liste complète des pages publiques accessibles sur le site
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <span className="font-medium text-gray-700">
                {PUBLIC_PAGES.length} pages référencées
              </span>
              <a 
                href="/sitemap.xml" 
                className="text-blue-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le sitemap XML →
              </a>
            </div>
            <ul className="divide-y">
              {PUBLIC_PAGES.map((page, index) => (
                <li key={page.path} className="hover:bg-gray-50 transition-colors">
                  <Link 
                    to={page.path}
                    className="block px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm w-8">{index + 1}</span>
                      <span className="font-medium text-gray-900">{page.label}</span>
                      <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {page.path}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="hidden sm:inline">
                        Changefreq: <strong>{page.changefreq}</strong>
                      </span>
                      <span className="hidden sm:inline">
                        Priority: <strong>{page.priority}</strong>
                      </span>
                      <span className="text-blue-400">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">À propos de ce sitemap</h2>
            <p className="text-blue-800 text-sm">
              Cette page est destinée aux moteurs de recherche et aux administrateurs du site. 
              Elle liste toutes les pages publiques accessibles sans authentification. 
              Les pages administratives (/admin/*) ne sont pas incluses pour des raisons de sécurité.
            </p>
          </div>

          <div className="mt-4 p-6 bg-gray-100 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">Format XML</h2>
            <p className="text-gray-600 text-sm mb-4">
              Le fichier sitemap.xml standard est également disponible à l'adresse :
            </p>
            <code className="block bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PAGES.map(page => `  <url>
    <loc>https://israelgrowthventure.com${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`}
            </code>
          </div>
        </main>
      </div>
    </>
  );
};

export default SitemapView;
