import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, TrendingUp, Globe, Users } from 'lucide-react';
import SEO from '../components/SEO';
import { useCMSContent } from '../hooks/useCMSContent';

// Assets
const FALLBACK_TEAM_PHOTO = '/assets/team.png';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // CMS Integration
  const { getText, getImage, isLoading } = useCMSContent('home');
  const language = i18n.language;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Content Fallbacks (V2 Structure)
  const defaultContent = {
    hero: {
      title: t('home.hero.title', "Développez votre entreprise en Israël"),
      subtitle: t('home.hero.subtitle', "Expertise complète pour l'expansion de votre marque sur le marché israélien"),
      cta: t('home.hero.cta', "Découvrir nos offres"),
    },
    stats: [
      { value: '500+', label: t('home.stats.projects', 'Projets réussis') },
      { value: '20+', label: t('home.stats.experience', 'Années d\'expérience') },
      { value: '98%', label: t('home.stats.clients', 'Clients satisfaits') },
    ]
  };

  // Get dynamic values or use defaults
  const heroTitle = getText('hero.title', defaultContent.hero.title);
  const heroSubtitle = getText('hero.subtitle', defaultContent.hero.subtitle);
  const heroCTA = getText('hero.cta', defaultContent.hero.cta);

  // Images (Dynamic with fallback to local assets)
  const heroImage = getImage('hero.image', FALLBACK_TEAM_PHOTO);

  const stats = [
    {
      value: getText('stats.0.value', defaultContent.stats[0].value),
      label: getText('stats.0.label', defaultContent.stats[0].label)
    },
    {
      value: getText('stats.1.value', defaultContent.stats[1].value),
      label: getText('stats.1.label', defaultContent.stats[1].label)
    },
    {
      value: getText('stats.2.value', defaultContent.stats[2].value),
      label: getText('stats.2.label', defaultContent.stats[2].label)
    }
  ];

  return (
    <div className="min-h-screen pt-16 font-sans">
      <SEO
        title={`${heroTitle} - Israel Growth Venture`}
        description={heroSubtitle}
        pathname="/"
        image="https://israelgrowthventure.com/og-home.jpg"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32" data-testid="hero-section">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 rounded-bl-[100px] -z-10 hidden lg:block"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              {/* Badge Experience (Mobile/Inline) */}
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-full text-sm mb-6 border border-blue-100">
                {stats[1].value} {stats[1].label}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight font-work-sans" data-testid="hero-title">
                {heroTitle}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed" data-testid="hero-subtitle">
                {heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/packs"
                  className="btn-primary"
                  data-testid="hero-cta-button"
                >
                  {heroCTA}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>

                <Link
                  to="/contact"
                  className="btn-secondary"
                >
                  {language === 'fr' ? 'Parler à un expert' : language === 'en' ? 'Talk to an expert' : 'דבר עם מומחה'}
                </Link>
              </div>
            </div>

            {/* Visual/Image (Right Column) */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative z-10 w-full h-[500px]">
                {/* Team Photo / Hero Image */}
                <img
                  src={heroImage}
                  alt="Team IGV"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none'; // Hide if fails
                  }}
                />

                {/* Floating Stat Card Overlay */}
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-sm animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{stats[0].value}</div>
                      <div className="text-sm text-gray-500">{stats[0].label}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-work-sans">
              {getText('features.title', "Pourquoi nous choisir ?")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {getText('features.subtitle', "Une approche globale combinant expertise locale et stratégie internationale.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Note: Features content is hard to fully dynamic without mapping an array from CMS */}
            {/* For now, we keep the structure but allow text overrides via CMS if keys exist */}

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 mb-6 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-work-sans">
                {getText('features.0.title', "Croissance Stratégique")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getText('features.0.description', "Plans d'expansion sur mesure pour votre marché cible.")}
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 mb-6 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-work-sans">
                {getText('features.1.title', "Expertise Locale")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getText('features.1.description', "Connaissance approfondie du marché israélien.")}
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className="w-14 h-14 mb-6 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-work-sans">
                {getText('features.2.title', "Accompagnement Complet")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getText('features.2.description', "De l'analyse à la mise en œuvre opérationnelle.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden" data-testid="cta-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-work-sans">
            {language === 'fr' ? 'Prêt à commencer ?' : language === 'en' ? 'Ready to start?' : 'מוכנים להתחיל?'}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {language === 'fr'
              ? 'Contactez-nous pour discuter de votre projet et découvrir comment nous pouvons accélérer votre croissance.'
              : language === 'en'
                ? 'Contact us to discuss your project and discover how we can accelerate your growth.'
                : 'צרו איתנו קשר כדי לדון בפרויקט שלכם'}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            data-testid="cta-contact-button"
          >
            {language === 'fr' ? 'Nous contacter' : language === 'en' ? 'Contact us' : 'צרו קשר'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
