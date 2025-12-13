// ============================================================
// ATTENTION - Home Page Phase 7 - Design Emergent restaur?
// ============================================================
// Design moderne avec hero, stats, features sections
// Bas? sur igv-website-v2 (r?f?rence Emergent)
// NE PAS MODIFIER sans validation client IGV
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, TrendingUp, Globe, Users, Award } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';
import SEO from '../components/SEO';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const { getText, getImage } = useCMSContent('home');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const content = {
    fr: {
      hero: {
        title: "D?veloppez votre entreprise en Isra?l",
        subtitle: "Expertise compl?te pour l'expansion de votre marque sur le march? isra?lien",
        cta: "D?couvrir nos offres",
        cta2: "Parler ? un expert"
      },
      stats: [
        { value: '500+', label: 'Projets r?ussis' },
        { value: '20+', label: 'Ann?es d\'exp?rience' },
        { value: '98%', label: 'Clients satisfaits' }
      ],
      features: [
        {
          icon: TrendingUp,
          title: 'Croissance Strat?gique',
          description: 'Plans d\'expansion sur mesure pour votre march? cible'
        },
        {
          icon: Globe,
          title: 'Expertise Locale',
          description: 'Connaissance approfondie du march? isra?lien'
        },
        {
          icon: Users,
          title: 'Accompagnement Complet',
          description: 'De l\'analyse ? la mise en ?uvre op?rationnelle'
        }
      ],
      cta: {
        title: 'Pr?t ? commencer ?',
        description: 'Contactez-nous pour discuter de votre projet',
        button: 'Nous contacter'
      }
    },
    en: {
      hero: {
        title: "Expand Your Business in Israel",
        subtitle: "Complete expertise for your brand expansion in the Israeli market",
        cta: "Discover our offers",
        cta2: "Talk to an expert"
      },
      stats: [
        { value: '500+', label: 'Successful projects' },
        { value: '20+', label: 'Years of experience' },
        { value: '98%', label: 'Satisfied clients' }
      ],
      features: [
        {
          icon: TrendingUp,
          title: 'Strategic Growth',
          description: 'Customized expansion plans for your target market'
        },
        {
          icon: Globe,
          title: 'Local Expertise',
          description: 'In-depth knowledge of the Israeli market'
        },
        {
          icon: Users,
          title: 'Full Support',
          description: 'From analysis to operational implementation'
        }
      ],
      cta: {
        title: 'Ready to start?',
        description: 'Contact us to discuss your project',
        button: 'Contact us'
      }
    },
    he: {
      hero: {
        title: "    ",
        subtitle: "      ",
        cta: "   "
      },
      stats: [
        { value: '500+', label: ' ' },
        { value: '20+', label: ' ' },
        { value: '98%', label: ' ' }
      ],
      features: [
        {
          icon: TrendingUp,
          title: ' ',
          description: '     '
        },
        {
          icon: Globe,
          title: ' ',
          description: '    '
        },
        {
          icon: Users,
          title: ' ',
          description: '   '
        }
      ],
      cta: {
        title: ' ?',
        description: '      ',
        button: ' '
      }
    }
  };

  const currentContent = content[i18n.language] || content.fr;

  return (
    <div className="min-h-screen pt-16 font-sans">
      <SEO
        title={getText('seo.title', `${currentContent.hero.title} - Israel Growth Venture`)}
        description={getText('seo.description', currentContent.hero.subtitle)}
        pathname="/"
        image="https://israelgrowthventure.com/og-home.jpg"
      />
      {/* Hero Section - Emergent Layout (2 Col) */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Content */}
            <div className={`text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>

              {/* Badge Experience (Mobile Top / Desktop Inline) */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
                <Award size={16} />
                <span>20+ {t('common.years_experience', 'Ann?es d\'exp?rience')}</span>
              </div>

              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
                {getText('hero.title', currentContent.hero.title)}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
                {getText('hero.subtitle', currentContent.hero.subtitle)}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/packs"
                  className="btn-emergent btn-primary"
                >
                  {getText('hero.cta', currentContent.hero.cta)}
                  <ArrowRight className="ml-2" size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="btn-emergent btn-secondary"
                >
                  {currentContent.hero.cta2 || "Parler à un expert"}
                </Link>
              </div>
            </div>

            {/* Right Column: Visual / Badge */}
            <div className={`relative hidden lg:block h-full min-h-[400px] transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-white rounded-3xl -z-10 transform rotate-3 scale-95"></div>
              {/* Placeholder for Hero Image - using a gradient block for now to fit specs */}
              <div className="w-full h-full bg-blue-50/50 rounded-2xl flex items-center justify-center p-8 border border-blue-100">
                <div className="badge-experience">
                  <div className="years">20+</div>
                  <div className="label">
                    Ann?es<br />d'Exp?rience
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-work-sans">Pourquoi IGV ?</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentContent.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100"
                >
                  <div className="w-14 h-14 mb-6 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 font-work-sans">
                    {getText(`features.${index}.title`, feature.title)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {getText(`features.${index}.description`, feature.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 opacity-[0.02] pattern-dots"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 font-work-sans">
            {getText('cta.title', currentContent.cta.title)}
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {getText('cta.description', currentContent.cta.description)}
          </p>
          <Link
            to="/contact"
            className="btn-emergent btn-primary px-8 py-4 text-lg shadow-xl shadow-blue-500/20"
          >
            {getText('cta.button', currentContent.cta.button)}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
