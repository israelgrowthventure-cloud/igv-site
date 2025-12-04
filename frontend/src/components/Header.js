import React, { useState } from 'react';
import igvLogo from "../assets/h-large-fond-blanc.png";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'FR' },
    { code: 'en', name: 'EN' },
    { code: 'he', name: 'HE' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
    document.dir = lng === 'he' ? 'rtl' : 'ltr';
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/packs', label: t('nav.packs') },
    { path: '/future-commerce', label: t('nav.futureCommerce') },
    { path: '/contact', label: t('nav.contact') }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Title */}
          <Link to="/" className={`flex items-center space-x-3 ${i18n.language === 'he' ? 'mr-8' : 'ml-8'}`}>
            <img
              src={igvLogo}
              alt="Israel Growth Venture"
              className="h-16 w-auto"
            />
            <div className="hidden md:block">
              <div className="text-lg font-bold text-gray-900">Israel Growth Venture</div>
              <div className="text-xs text-gray-600 max-w-xs">{t('hero.subtitle')}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center ${i18n.language === 'he' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector & CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid="language-selector-btn"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 uppercase">
                  {i18n.language.substring(0, 2)}
                </span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        i18n.language === lang.code ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                      data-testid={`lang-${lang.code}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              to="/appointment"
              className="hidden md:inline-flex items-center px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              data-testid="header-appointment-btn"
            >
              {t('hero.bookAppointment')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="mobile-menu-btn"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/appointment"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              {t('hero.bookAppointment')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
