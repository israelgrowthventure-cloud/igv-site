import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Calendar, Mail, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarLink } from '../utils/calendar';

const Appointment = () => {
  const { t, i18n } = useTranslation();

  const handleOpenCalendar = () => {
    const calendarLink = generateGoogleCalendarLink(i18n.language);
    window.open(calendarLink, '_blank');
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('appointment.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('appointment.subtitle')}
          </p>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('appointment.description')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Choisissez votre créneau
              </h2>
              <p className="text-base text-gray-600">
                Sélectionnez un moment qui vous convient pour un entretien de 30 minutes
              </p>
            </div>

            {/* Calendar Button */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleOpenCalendar}
                className="w-full max-w-md py-4 px-6 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                data-testid="open-calendar-btn"
              >
                <Calendar className="w-6 h-6" />
                <span>{t('appointment.cta')}</span>
                <ExternalLink className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-500">{t('appointment.or')}</span>
              </div>

              <a
                href="mailto:israel.growth.venture@gmail.com?subject=Demande de rendez-vous"
                className="w-full max-w-md py-4 px-6 bg-white text-blue-600 text-base font-semibold rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600 flex items-center justify-center space-x-3"
                data-testid="email-contact-btn"
              >
                <Mail className="w-6 h-6" />
                <span>{t('appointment.contact')}</span>
              </a>
            </div>

            {/* Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-blue-600 font-semibold mb-2">Durée</div>
                  <div className="text-gray-900">30 minutes</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-blue-600 font-semibold mb-2">Format</div>
                  <div className="text-gray-900">Visioconférence ou Téléphone</div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="mt-8 p-6 bg-white rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ce que nous allons discuter :
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    1
                  </div>
                  <span className="text-base text-gray-700">Votre concept et votre vision</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    2
                  </div>
                  <span className="text-base text-gray-700">Le potentiel de votre projet en Israël</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    3
                  </div>
                  <span className="text-base text-gray-700">La meilleure stratégie d'expansion (succursale, franchise, master-franchise)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    4
                  </div>
                  <span className="text-base text-gray-700">Les prochaines étapes et notre accompagnement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Appointment;
