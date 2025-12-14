import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/packs', label: t('nav.packs') },
    { path: '/future-commerce', label: t('nav.futureCommerce') }
  ];

  const legalLinks = [
    { path: '/terms', label: t('nav.terms') },
    { path: '/contact', label: t('nav.contact') }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/igv-logo.png" alt="Israel Growth Venture" className="h-10" />
              <div>
                <div className="text-lg font-bold text-white">Israel Growth Venture</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">{t('footer.email')}</div>
                  <a href="mailto:israel.growth.venture@gmail.com" className="text-sm hover:text-blue-400 transition-colors">
                    israel.growth.venture@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">{t('footer.address')}</div>
                  <p className="text-sm">{t('footer.addressValue')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} {t('footer.company')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
