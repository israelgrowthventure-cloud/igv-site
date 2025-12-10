// ============================================================
// ATTENTION - About Page Phase 7 - Design Emergent restauré
// ============================================================
// Design moderne Mission / Expertise / Valeurs
// Basé sur igv-website-v2 (référence Emergent)
// NE PAS MODIFIER sans validation client IGV
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Users, Award, TrendingUp } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';

const About = () => {
  const { t, i18n } = useTranslation();
  const { getText, getImage } = useCMSContent('about');

  const content = {
    fr: {
      title: 'Qui sommes-nous ?',
      subtitle: 'Votre partenaire stratégique pour une expansion réussie en Israël',
      description: 'Nous sommes une entreprise spécialisée dans le conseil en expansion de marques et la recherche active de biens immobiliers commerciaux. Notre équipe de spécialistes en conseil à l\'implantation de marques vous conseillera et cherchera les meilleurs emplacements pour développer votre marque en Israël.',
      collaboration: 'Nous collaborons avec les municipalités et les principaux propriétaires immobiliers pour promouvoir activement et rechercher des clients pour divers projets de développement de zones commerciales.',
      support: 'Le marché israélien étant très difficile d\'accès, notre équipe peut guider les clients depuis la création d\'un business plan jusqu\'à la sélection de l\'équipe d\'employés. Nous offrons un soutien complet pour assurer le succès de votre expansion.',
      service: 'Si vous cherchez à établir et développer votre marque ou à étendre votre concept par le biais de franchises ou de succursales, l\'équipe Israel Growth Venture est à votre service.',
      values: [
        {
          icon: Target,
          title: 'Expertise Locale',
          description: 'Connaissance approfondie du marché israélien et de ses spécificités'
        },
        {
          icon: Users,
          title: 'Accompagnement Complet',
          description: 'Du business plan à l\'ouverture, nous vous guidons à chaque étape'
        },
        {
          icon: Award,
          title: 'Réseau Étendu',
          description: 'Partenariats avec municipalités et propriétaires immobiliers majeurs'
        },
        {
          icon: TrendingUp,
          title: 'Solutions Sur Mesure',
          description: 'Stratégies adaptées à votre marque et vos objectifs'
        }
      ],
      cta: {
        title: 'Travaillons ensemble',
        description: 'Contactez-nous pour discuter de votre projet d\'expansion en Israël',
        button: 'Nous contacter'
      }
    },
    en: {
      title: 'Who are we?',
      subtitle: 'Your strategic partner for successful expansion in Israel',
      description: 'We are a company specialized in brand expansion consulting and active search for commercial real estate. Our team of brand implementation specialists will advise you and find the best locations to develop your brand in Israel.',
      collaboration: 'We collaborate with municipalities and major property owners to actively promote and seek clients for various commercial zone development projects.',
      support: 'Since the Israeli market is very difficult to access, our team can guide clients from creating a business plan to selecting the team of employees. We offer comprehensive support to ensure the success of your expansion.',
      service: 'If you are looking to establish and grow your brand or expand your concept through franchises or branches, the Israel Growth Venture team is at your service.',
      values: [
        {
          icon: Target,
          title: 'Local Expertise',
          description: 'In-depth knowledge of the Israeli market and its specificities'
        },
        {
          icon: Users,
          title: 'Complete Support',
          description: 'From business plan to opening, we guide you every step'
        },
        {
          icon: Award,
          title: 'Extended Network',
          description: 'Partnerships with municipalities and major property owners'
        },
        {
          icon: TrendingUp,
          title: 'Tailored Solutions',
          description: 'Strategies adapted to your brand and objectives'
        }
      ],
      cta: {
        title: 'Let\'s work together',
        description: 'Contact us to discuss your expansion project in Israel',
        button: 'Contact us'
      }
    },
    he: {
      title: 'מי אנחנו?',
      subtitle: 'השותף האסטרטגי שלכם להתרחבות מוצלחת בישראל',
      description: 'אנחנו חברה המתמחה בייעוץ להתרחבות מותגים וחיפוש אקטיבי של נדל"ן מסחרי. צוות המומחים שלנו ליישום מותגים ייעץ לכם וימצא את המיקומים הטובים ביותר לפיתוח המותג שלכם בישראל.',
      collaboration: 'אנו משתפים פעולה עם עיריות ובעלי נכסים מרכזיים כדי לקדם באופן אקטיבי ולחפש לקוחות לפרויקטים שונים של פיתוח אזורים מסחריים.',
      support: 'מכיוון שהשוק הישראלי קשה מאוד לגישה, הצוות שלנו יכול להדריך לקוחות מיצירת תוכנית עסקית ועד לבחירת צוות העובדים. אנו מציעים תמיכה מקיפה כדי להבטיח את הצלחת ההתרחבות שלכם.',
      service: 'אם אתם מחפשים להקים ולפתח את המותג שלכם או להרחיב את הקונספט שלכם באמצעות זכיינות או סניפים, צוות Israel Growth Venture לשירותכם.',
      values: [
        {
          icon: Target,
          title: 'מומחיות מקומית',
          description: 'ידע מעמיק של השוק הישראלי והמאפיינים שלו'
        },
        {
          icon: Users,
          title: 'תמיכה מלאה',
          description: 'מתוכנית עסקית ועד פתיחה, אנו מדריכים אתכם בכל שלב'
        },
        {
          icon: Award,
          title: 'רשת מורחבת',
          description: 'שותפויות עם עיריות ובעלי נכסים מרכזיים'
        },
        {
          icon: TrendingUp,
          title: 'פתרונות מותאמים',
          description: 'אסטרטגיות מותאמות למותג ולמטרות שלכם'
        }
      ],
      cta: {
        title: 'בואו נעבוד ביחד',
        description: 'צרו איתנו קשר כדי לדון בפרויקט ההתרחבות שלכם בישראל',
        button: 'צרו קשר'
      }
    }
  };

  const currentContent = content[i18n.language] || content.fr;

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {currentContent.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentContent.subtitle}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>{currentContent.description}</p>
            <p>{currentContent.collaboration}</p>
            <p>{currentContent.support}</p>
            <p className="text-xl font-semibold text-[#0052CC]">{currentContent.service}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentContent.values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center text-[#0052CC]">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
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
            {currentContent.cta.title}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {currentContent.cta.description}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-[#0052CC] rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            {currentContent.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
