import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Zap, Target, Users, ArrowRight, Calendar } from 'lucide-react';

const FutureCommercePage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const content = {
    fr: {
      title: "Le commerce tel que vous le pratiquez est mort.",
      subtitle: "Israël : là où le commerce du futur se crée avant les autres",
      hero: {
        line1: "Le commerce tel que vous le pratiquez est mort.",
        line2: "Pas dans 10 ans. Pas dans 5 ans.",
        line3: "Maintenant.",
        description: "Les marques qui continuent d'ouvrir des boutiques comme en 2010 s'accrochent à un modèle qui n'existe déjà plus. Les consommateurs ne veulent plus acheter : ils veulent vivre, ressentir, tester, participer."
      },
      israel: {
        title: "Israël : là où le commerce du futur se crée avant les autres",
        subtitle: "Israël n'est pas un marché. C'est un laboratoire.",
        points: [
          "Le consommateur adopte en 3 mois ce que l'Europe met 3 ans à comprendre.",
          "Les usages changent plus vite que les business plans.",
          "Les concepts survivent uniquement s'ils sont réellement bons.",
          "Le digital et le physique ne sont plus séparés : tout est hybride, tout est instantané."
        ],
        conclusion: "Si votre concept tient en Israël, il est prêt pour le futur."
      },
      realities: {
        title: "3 Réalités que les marques doivent comprendre maintenant",
        reality1: {
          title: "Le client n'achète plus un produit, il achète une expérience",
          description: "Et cette expérience doit commencer avant qu'il entre en magasin, et continuer après qu'il soit sorti."
        },
        reality2: {
          title: "Le retail n'est plus un lieu. C'est un média.",
          description: "Un magasin qui ne raconte rien ne vend rien."
        },
        reality3: {
          title: "Le modèle économique doit intégrer :",
          points: [
            "le coût du digital,",
            "l'inflation immobilière,",
            "les attentes émotionnelles,",
            "la vitesse des tendances."
          ],
          conclusion: "Beaucoup refusent de l'admettre. Mais ceux qui réussissent sont ceux qui regardent la réalité en face."
        }
      },
      whatWeDo: {
        title: "Ce que nous faisons chez IGV",
        description: "Nous testons des concepts en conditions réelles, ici, dans le pays le plus rapide du monde pour valider une idée :",
        services: [
          "Nous trouvons les bons emplacements",
          "Nous montons les structures",
          "Nous formons les équipes",
          "Nous lançons",
          "Et nous suivons"
        ],
        conclusion: "IGV, ce n'est pas du conseil. C'est de l'exécution."
      },
      whySeries: {
        title: "Pourquoi une série \"Le Commerce de Demain\" ?",
        description: "Parce que les marques doivent comprendre où va le commerce, pour savoir où placer leurs pions.",
        content: "Chaque semaine, je partage :",
        items: [
          "une observation terrain",
          "un insight consommateur",
          "une vérité que personne n'ose dire",
          "une tendance que je vois arriver",
          "ou un concept qui mérite d'être analysé"
        ],
        conclusion: "Pas de théorie. Pas de buzzwords. Juste la réalité du terrain, maintenant."
      },
      cta: "Réserver un appel de 30 minutes"
    },
    en: {
      title: "The retail you practice is dead.",
      subtitle: "Israel: where the future of retail is created before others",
      hero: {
        line1: "The retail you practice is dead.",
        line2: "Not in 10 years. Not in 5 years.",
        line3: "Now.",
        description: "Brands that continue to open stores like in 2010 are clinging to a model that no longer exists. Consumers no longer want to buy: they want to live, feel, test, participate."
      },
      israel: {
        title: "Israel: where the future of retail is created before others",
        subtitle: "Israel is not a market. It's a laboratory.",
        points: [
          "Consumers adopt in 3 months what Europe takes 3 years to understand.",
          "Usage changes faster than business plans.",
          "Concepts survive only if they are genuinely good.",
          "Digital and physical are no longer separate: everything is hybrid, everything is instant."
        ],
        conclusion: "If your concept holds in Israel, it's ready for the future."
      },
      realities: {
        title: "3 Realities that brands must understand now",
        reality1: {
          title: "The customer no longer buys a product, they buy an experience",
          description: "And this experience must start before they enter the store, and continue after they leave."
        },
        reality2: {
          title: "Retail is no longer a place. It's a medium.",
          description: "A store that tells nothing sells nothing."
        },
        reality3: {
          title: "The business model must integrate:",
          points: [
            "the cost of digital,",
            "real estate inflation,",
            "emotional expectations,",
            "the speed of trends."
          ],
          conclusion: "Many refuse to admit it. But those who succeed are those who face reality."
        }
      },
      whatWeDo: {
        title: "What we do at IGV",
        description: "We test concepts in real conditions, here, in the fastest country in the world to validate an idea:",
        services: [
          "We find the right locations",
          "We set up structures",
          "We train teams",
          "We launch",
          "And we follow up"
        ],
        conclusion: "IGV is not consulting. It's execution."
      },
      whySeries: {
        title: "Why a \"Future of Retail\" series?",
        description: "Because brands need to understand where retail is going, to know where to place their bets.",
        content: "Every week, I share:",
        items: [
          "a field observation",
          "a consumer insight",
          "a truth no one dares to say",
          "a trend I see coming",
          "or a concept worth analyzing"
        ],
        conclusion: "No theory. No buzzwords. Just ground reality, now."
      },
      cta: "Book a 30-minute call"
    },
    he: {
      title: "המסחר שאתם מכירים מת.",
      subtitle: "ישראל: המקום שבו נוצר המסחר של העתיד לפני האחרים",
      hero: {
        line1: "המסחר שאתם מכירים מת.",
        line2: "לא בעוד 10 שנים. לא בעוד 5 שנים.",
        line3: "עכשיו.",
        description: "מותגים שממשיכים לפתוח חנויות כמו ב-2010 נאחזים במודל שכבר לא קיים. הצרכנים לא רוצים יותר לקנות: הם רוצים לחיות, להרגיש, לבדוק, להשתתף."
      },
      israel: {
        title: "ישראל: המקום שבו נוצר המסחר של העתיד לפני האחרים",
        subtitle: "ישראל היא לא שוק. היא מעבדה.",
        points: [
          "הצרכן מאמץ ב-3 חודשים מה שלאירופה לוקח 3 שנים להבין.",
          "השימושים משתנים מהר יותר מתוכניות עסקיות.",
          "הקונספטים שורדים רק אם הם באמת טובים.",
          "הדיגיטל והפיזי כבר לא מופרדים: הכל היברידי, הכל מיידי."
        ],
        conclusion: "אם הקונספט שלך מחזיק בישראל, הוא מוכן לעתיד."
      },
      realities: {
        title: "3 מציאויות שמותגים חייבים להבין עכשיו",
        reality1: {
          title: "הלקוח כבר לא קונה מוצר, הוא קונה חוויה",
          description: "והחוויה הזו חייבת להתחיל לפני שהוא נכנס לחנות, ולהמשיך אחרי שהוא יוצא."
        },
        reality2: {
          title: "הקמעונאות כבר לא מקום. היא מדיה.",
          description: "חנות שלא מספרת כלום לא מוכרת כלום."
        },
        reality3: {
          title: "המודל העסקי חייב לשלב:",
          points: [
            "את עלות הדיגיטל,",
            "את האינפלציה של נדל\"ן מסחרי,",
            "את הציפיות הרגשיות,",
            "את מהירות הטרנדים."
          ],
          conclusion: "רבים מסרבים להודות בזה. אבל אלה שמצליחים הם אלה שמתמודדים עם המציאות."
        }
      },
      whatWeDo: {
        title: "מה אנחנו עושים ב-IGV",
        description: "אנחנו בודקים קונספטים בתנאים אמיתיים, כאן, במדינה הכי מהירה בעולם לאמת רעיון:",
        services: [
          "אנחנו מוצאים את המיקומים הנכונים",
          "אנחנו מקימים את המבנים",
          "אנחנו מאמנים צוותים",
          "אנחנו משיקים",
          "ואנחנו עוקבים"
        ],
        conclusion: "IGV זה לא ייעוץ. זה ביצוע."
      },
      whySeries: {
        title: "למה סדרת \"המסחר של המחר\"?",
        description: "כי מותגים צריכים להבין לאן המסחר הולך, כדי לדעת איפה לשים את הכלים שלהם.",
        content: "כל שבוע, אני משתף:",
        items: [
          "תצפית שטח",
          "תובנה צרכנית",
          "אמת שאף אחד לא מעז להגיד",
          "טרנד שאני רואה מגיע",
          "או קונספט ששווה לנתח"
        ],
        conclusion: "בלי תיאוריה. בלי מילות באזז. רק המציאות של השטח, עכשיו."
      },
      cta: "הזמן שיחה של 30 דקות"
    }
  };

  const currentContent = content[language] || content.fr;

  return (
    <div className="future-commerce-page">
      {/* Hero Section - Bold Statement */}
      <section className="relative py-20 lg:py-32 bg-black text-white overflow-hidden" data-testid="future-commerce-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-[#0052CC] opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight" data-testid="hero-title">
            {currentContent.hero.line1}
          </h1>
          <div className="space-y-4 text-2xl sm:text-3xl lg:text-4xl text-gray-300 mb-8">
            <p>{currentContent.hero.line2}</p>
            <p>{currentContent.hero.line3}</p>
          </div>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
            {currentContent.hero.description}
          </p>
        </div>
      </section>

      {/* Israel as Laboratory */}
      <section className="py-20 bg-white" data-testid="israel-lab-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {currentContent.israel.title}
            </h2>
            <p className="text-2xl text-[#0052CC] font-semibold mb-8">
              {currentContent.israel.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {currentContent.israel.points.map((point, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300"
                data-testid={`israel-point-${index}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#0052CC] rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="text-white" size={24} />
                  </div>
                  <p className="text-lg text-gray-800 leading-relaxed">{point}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-[#0052CC]">
              {currentContent.israel.conclusion}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Realities */}
      <section className="py-20 bg-gray-50" data-testid="realities-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-16 text-center">
            {currentContent.realities.title}
          </h2>

          <div className="space-y-12">
            {/* Reality 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#0052CC]">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentContent.realities.reality1.title}
              </h3>
              <p className="text-lg text-gray-700">
                {currentContent.realities.reality1.description}
              </p>
            </div>

            {/* Reality 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#0052CC]">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentContent.realities.reality2.title}
              </h3>
              <p className="text-lg text-gray-700">
                {currentContent.realities.reality2.description}
              </p>
            </div>

            {/* Reality 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[#0052CC]">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {currentContent.realities.reality3.title}
              </h3>
              <ul className="space-y-2 mb-4">
                {currentContent.realities.reality3.points.map((point, index) => (
                  <li key={index} className="text-lg text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-[#0052CC] rounded-full mr-3"></span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="text-lg text-gray-700 italic">
                {currentContent.realities.reality3.conclusion}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do at IGV */}
      <section className="py-20 bg-gradient-to-br from-[#0052CC] to-[#0065FF] text-white" data-testid="what-we-do-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              {currentContent.whatWeDo.title}
            </h2>
            <p className="text-xl mb-8">
              {currentContent.whatWeDo.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {currentContent.whatWeDo.services.map((service, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
                data-testid={`service-${index}`}
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#0052CC] font-bold text-xl">{index + 1}</span>
                </div>
                <p className="font-semibold">{service}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">
              {currentContent.whatWeDo.conclusion}
            </p>
          </div>
        </div>
      </section>

      {/* Why This Series */}
      <section className="py-20 bg-white" data-testid="why-series-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {currentContent.whySeries.title}
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              {currentContent.whySeries.description}
            </p>
            <p className="text-lg text-gray-700 mb-6">
              {currentContent.whySeries.content}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentContent.whySeries.items.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                data-testid={`series-item-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="text-[#0052CC]" size={24} />
                  <p className="text-gray-800 font-medium">{item}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-gray-800 mb-8">
              {currentContent.whySeries.conclusion}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-[#0052CC] text-white rounded-lg font-semibold text-lg hover:bg-[#003D99] transition-all duration-300 hover:shadow-lg hover:scale-105"
              data-testid="cta-button"
            >
              {currentContent.cta}
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FutureCommercePage;

