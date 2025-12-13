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
import { ArrowRight, TrendingUp, Globe, Users } from 'lucide-react';
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
        title: "������ �� ���� ���� ������",
        subtitle: "������� ���� ������ ����� ���� ���� �������",
        cta: "��� �� ������ ����"
      },
      stats: [
        { value: '500+', label: '�������� �������' },
        { value: '20+', label: '���� ������' },
        { value: '98%', label: '������ ������' }
      ],
      features: [
        {
          icon: TrendingUp,
          title: '����� ��������',
          description: '������� ������� ������� ���� ���� ����'
        },
        {
          icon: Globe,
          title: '������� ������',
          description: '��� ����� �� ���� �������'
        },
        {
          icon: Users,
          title: '����� ����',
          description: '������ ��� ������ ������'
        }
      ],
      cta: {
        title: '������ ������?',
        description: '��� ����� ��� ��� ���� ������� ����',
        button: '��� ���'
      }
    }
  };

  const currentContent = content[i18n.language] || content.fr;

  return (
    <div className="min-h-screen pt-16">
      <SEO
        title={getText('seo.title', `${currentContent.hero.title} - Israel Growth Venture`)}
        description={getText('seo.description', currentContent.hero.subtitle)}
        pathname="/"
        image="https://israelgrowthventure.com/og-home.jpg"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {getText('hero.title', currentContent.hero.title)}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {getText('hero.subtitle', currentContent.hero.subtitle)}
            </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/packs"
                className="inline-flex items-center px-6 py-3 bg-[#0052CC] text-white rounded-lg font-semibold hover:bg-[#003D99] transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {getText('hero.cta', currentContent.hero.cta)}
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-[#0052CC] border-2 border-[#0052CC] rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {currentContent.hero.cta2 || "Parler à un expert"}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentContent.stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl font-bold text-[#0052CC] mb-2">
                  {getText(`stats.${index}.value`, stat.value)}
                </div>
                <div className="text-gray-600">
                  {getText(`stats.${index}.label`, stat.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {currentContent.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 rounded-xl border border-gray-100 hover:border-[#0052CC] hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center text-[#0052CC]">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {getText(`features.${index}.title`, feature.title)}
                  </h3>
                  <p className="text-gray-600">
                    {getText(`features.${index}.description`, feature.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0052CC] to-[#0065FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {getText('cta.title', currentContent.cta.title)}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {getText('cta.description', currentContent.cta.description)}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-white text-[#0052CC] rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            {getText('cta.button', currentContent.cta.button)}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

