import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from 'context/LanguageContext.jsx';
import { Menu, X, Globe } from 'lucide-react';

export const Navbar = () => {
  const { language, changeLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
  ];

  const navLinks = {
    fr: [
      { path: '/', label: 'Accueil' },
      { path: '/packs', label: 'Nos Offres' },
      { path: '/le-commerce-de-demain', label: 'Le Commerce de Demain' },
      { path: '/about', label: 'À Propos' },
      { path: '/contact', label: 'Contact' },
    ],
    en: [
      { path: '/', label: 'Home' },
      { path: '/packs', label: 'Our Packs' },
      { path: '/le-commerce-de-demain', label: 'Future of Retail' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
    ],
    he: [
      { path: '/', label: 'בית' },
      { path: '/packs', label: 'החבילות שלנו' },
      { path: '/le-commerce-de-demain', label: 'המסחר של המחר' },
      { path: '/about', label: 'אודות' },
      { path: '/contact', label: 'צור קשר' },
    ],
  };

  const currentLinks = navLinks[language] || navLinks.fr;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="navbar-logo">
            <img 
              src="/igv-logo.png" 
              alt="IGV Logo" 
              className="h-12 w-auto"
            />
            <span className="text-lg font-bold text-gray-900 hidden lg:inline">Israel Growth Venture</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-[#0052CC] font-medium transition-colors"
                data-testid={`nav-link-${link.label}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-[#0052CC] transition-colors"
                data-testid="language-selector"
              >
                <Globe size={18} />
                <span>{language.toUpperCase()}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      data-testid={`lang-option-${lang.code}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#0052CC]"
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            {currentLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block text-gray-700 hover:text-[#0052CC] font-medium"
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-link-${link.label}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-gray-700 hover:text-[#0052CC] flex items-center space-x-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

