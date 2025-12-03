import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const { language } = useLanguage();

  const footerContent = {
    fr: {
      tagline: "Votre partenaire pour l'expansion en Israël",
      quickLinks: 'Liens Rapides',
      contact: 'Contact',
      rights: 'Tous droits réservés.',
    },
    en: {
      tagline: 'Your partner for expansion in Israel',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },
    he: {
      tagline: 'השותף שלך להתרחבות בישראל',
      quickLinks: 'קישורים מהירים',
      contact: 'צור קשר',
      rights: 'כל הזכויות שמורות.',
    },
  };

  const content = footerContent[language] || footerContent.fr;

  return (
    <footer className="bg-gray-900 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/igv-logo.png" 
                alt="IGV Logo" 
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400">{content.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{content.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  {language === 'fr' ? 'Accueil' : language === 'en' ? 'Home' : 'בית'}
                </Link>
              </li>
              <li>
                <Link to="/packs" className="text-gray-400 hover:text-white transition-colors">
                  {language === 'fr' ? 'Nos Offres' : language === 'en' ? 'Our Packs' : 'החבילות שלנו'}
                </Link>
              </li>
              <li>
                <Link to="/le-commerce-de-demain" className="text-gray-400 hover:text-white transition-colors">
                  {language === 'fr' ? 'Le Commerce de Demain' : language === 'en' ? 'Future of Retail' : 'המסחר של המחר'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {language === 'fr' ? 'À Propos' : language === 'en' ? 'About' : 'אודות'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {language === 'fr' ? 'Contact' : language === 'en' ? 'Contact' : 'צור קשר'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{content.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400">
                <Mail size={20} className="mt-1 flex-shrink-0" />
                <span>israel.growth.venture@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>21 Rue Gefen, Harish, Israël</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Israel Growth Venture. {content.rights}</p>
        </div>
      </div>
    </footer>
  );
};

