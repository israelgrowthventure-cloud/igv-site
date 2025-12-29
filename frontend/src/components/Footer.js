import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // FOOTER MINIMAL - Pages essentielles uniquement
  const footerLinks = [
    { path: '/about', label: t('footer.about') },
    { path: '/contact', label: t('footer.contact') },
    { path: '/legal', label: t('footer.legal') }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/igv-logo.png" alt="Israel Growth Venture" className="h-10" />
            </div>
            <p className="text-sm text-gray-400">
              {t('footer.company')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
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

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-2">
              <a href="mailto:israel.growth.venture@gmail.com" className="text-sm hover:text-blue-400 transition-colors block">
                israel.growth.venture@gmail.com
              </a>
              <p className="text-sm text-gray-400">
                israelgrowthventure.com
              </p>
            </div>
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
