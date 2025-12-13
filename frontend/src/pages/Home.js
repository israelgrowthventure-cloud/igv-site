import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, TrendingUp, Globe, Users } from 'lucide-react';
import SEO from '../components/SEO';
import { useCMSContent } from '../hooks/useCMSContent';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const { getText } = useCMSContent('home');
  const language = i18n.language;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const content = {
    fr: {
      hero: {
        title: "Développez votre entreprise en Israël",
        subtitle: "Expertise complète pour l'expansion de votre marque sur le marché israélien",
        cta: "Découvrir nos offres",
      },
      stats: [
        { value: '500+', label: 'Projets réussis' },
        { value: '20+', label: 'Années d\'expérience' },
        { value: '98%', label: 'Clients satisfaits' },
      ],
      features: [
        {
          icon: <TrendingUp size={32} />,
          title: 'Croissance Stratégique',
          description: 'Plans d\'expansion sur mesure pour votre marché cible',
        },
        {
          icon: <Globe size={32} />,
          title: 'Expertise Locale',
          description: 'Connaissance approfondie du marché israélien',
        },
        {
          icon: <Users size={32} />,
          title: 'Accompagnement Complet',
          description: 'De l\'analyse à la mise en œuvre opérationnelle',
        },
      ],
    },
    en: {
      hero: {
        title: 'Expand Your Business in Israel',
        subtitle: 'Complete expertise for your brand expansion in the Israeli market',
        cta: 'Discover our offers',
      },
      stats: [
        { value: '500+', label: 'Successful projects' },
        { value: '20+', label: 'Years of experience' },
        { value: '98%', label: 'Satisfied clients' },
      ],
      features: [
        {
          icon: <TrendingUp size={32} />,
          title: 'Strategic Growth',
          description: 'Customized expansion plans for your target market',
        },
        {
          icon: <Globe size={32} />,
          title: 'Local Expertise',
          description: 'In-depth knowledge of the Israeli market',
        },
        {
          icon: <Users size={32} />,
          title: 'Full Support',
          description: 'From analysis to operational implementation',
        },
      ],
    },
    he: {
      hero: {
        title: 'הרחיבו את העסק שלכם בישראל',
        subtitle: 'מומחיות מלאה להרחבת המותג שלכם בשוק הישראלי',
        cta: 'גלו את ההצעות שלנו',
      },
      stats: [
        { value: '500+', label: 'פרויקטים מוצלחים' },
        { value: '20+', label: 'שנות ניסיון' },
        { value: '98%', label: 'לקוחות מרוצים' },
      ],
      features: [
        {
          icon: <TrendingUp size={32} />,
          title: 'צמיחה אסטרטגית',
          description: 'תוכניות התרחבות מותאמות לשוק היעד שלכם',
        },
        {
          icon: <Globe size={32} />,
          title: 'מומחיות מקומית',
          description: 'ידע מעמיק של השוק הישראלי',
        },
        {
          icon: <Users size={32} />,
          title: 'תמיכה מלאה',
          description: 'מניתוח ועד ליישום תפעולי',
        },
      ],
    },
  };

  const currentContent = content[language] || content.fr;

  return (
    <div className="min-h-screen pt-16 font-sans">
      <SEO
        title={getText('seo.title', `${currentContent.hero.title} - Israel Growth Venture`)}
        description={getText('seo.description', currentContent.hero.subtitle)}
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
                {currentContent.stats[1].value} {currentContent.stats[1].label}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight font-work-sans" data-testid="hero-title">
                {currentContent.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed" data-testid="hero-subtitle">
                {currentContent.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/packs"
                  className="btn-primary" // Using enforced class
                  data-testid="hero-cta-button"
                >
                  {currentContent.hero.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>

                <Link
                  to="/contact"
                  className="btn-secondary" // Using enforced class
                >
                  {language === 'fr' ? 'Parler à un expert' : 'Talk to an expert'}
                </Link>
              </div>
            </div>

            {/* Visual/Stats (Right Column) */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative z-10 grid gap-6">
                {/* Main Stat Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{currentContent.stats[0].value}</div>
                      <div className="text-sm text-gray-500">{currentContent.stats[0].label}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                {/* Secondary Stat Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-sm ml-auto transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <Users className="text-blue-600" size={24} />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{currentContent.stats[2].value}</div>
                      <div className="text-xs text-gray-500">{currentContent.stats[2].label}</div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-work-sans">Pourquoi nous choisir ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Une approche globale combinant expertise locale et stratégie internationale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentContent.features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                data-testid={`feature-${index}`}
              >
                <div className="w-14 h-14 mb-6 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 font-work-sans">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
