import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

const ContactExpert = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const packParam = searchParams.get('pack');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pack name mapping for display
  const packNames = {
    analyse: t('packs.analyse.name', 'Diagnostic Stratégique'),
    succursales: t('packs.succursales.name', 'Accompagnement Succursales'),
    franchise: t('packs.franchise.name', 'Développement Franchise')
  };

  const selectedPack = packParam && packNames[packParam] 
    ? { id: packParam, name: packNames[packParam] }
    : null;

  // Pre-fill message based on selected pack
  useEffect(() => {
    if (selectedPack) {
      const packMessage = `\n\nJe suis intéressé(e) par le pack ${selectedPack.name}.`;
      setFormData(prev => ({
        ...prev,
        message: prev.message + packMessage
      }));
    }
  }, [selectedPack]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t('contactExpert.form.success', 'Votre demande a été transmise ! Un expert vous contactera sous 48h.'));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: selectedPack ? `\n\nJe suis intéressé(e) par le pack ${selectedPack.name}.` : ''
      });
    } catch (error) {
      toast.error(t('contactExpert.form.error', 'Une erreur est survenue. Veuillez réessayer.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              {t('contactExpert.hero.title', 'Transformez votre ambition en réalité')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {selectedPack 
                ? t('contactExpert.hero.description', "Vous avez sélectionné le pack {packName}. Nos experts sont prêts à analyser votre projet et vous guider vers le succès.", { packName: selectedPack.name })
                : t('contactExpert.subtitle', "Parlons de votre projet d'expansion en Israël")
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {t('contactExpert.title', 'Consultation Personnalisée')}
                </h2>
                <p className="text-slate-600 mb-8">
                  {t('contactExpert.subtitle', 'Parlons de votre projet d\'expansion en Israël')}
                </p>

                {selectedPack && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium">{t('contactExpert.packInfo.label', 'Pack sélectionné')}</p>
                          <p className="font-semibold text-slate-900">{selectedPack.name}</p>
                        </div>
                      </div>
                      <Link 
                        to="/packs" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {t('contactExpert.packInfo.change', 'Changer de pack')}
                      </Link>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('contactExpert.form.name', 'Nom complet')} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        placeholder={t('contact.form.name', 'Votre nom')}
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('contactExpert.form.company', 'Entreprise')}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        placeholder={t('contact.form.company', 'Nom de l\'entreprise')}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('contactExpert.form.email', 'Email professionnel')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        placeholder="vous@entreprise.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t('contactExpert.form.phone', 'Téléphone')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('contactExpert.form.message', 'Présentation de votre projet')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                      placeholder={t('contact.form.message', 'Décrivez votre projet, vos objectifs et vos attentes...')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('contactExpert.form.sending', 'Envoi en cours...')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {t('contactExpert.form.submit', 'Demander une consultation')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Why IGV */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {t('contactExpert.whyIGV.title', 'Pourquoi choisir IGV ?')}
                </h3>
                <ul className="space-y-4">
                  {[
                    t('contactExpert.whyIGV.items.0', '10+ années d\'expérience sur le marché israelien'),
                    t('contactExpert.whyIGV.items.1', 'Réseau exclusif de partenaires et d\'emplacements'),
                    t('contactExpert.whyIGV.items.2', 'Accompagnement de A à Z, du diagnostic à l\'ouverture'),
                    t('contactExpert.whyIGV.items.3', 'Taux de succès supérieur à 90%')
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
                <h3 className="text-xl font-bold mb-4">
                  {t('contactExpert.nextSteps', 'Prochaines étapes')}
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  {t('contactExpert.nextStepsDescription', 'Après réception de votre demande, nous programmerons un appel de 30 minutes pour comprendre votre projet en profondeur et vous présenter notre approche.')}
                </p>
                <div className="flex items-center gap-3 text-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Réponse sous 48h</span>
                </div>
              </div>

              {/* Alternative Contact */}
              <div className="bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
                <h3 className="text-lg font-bold mb-4">其他联系方式</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Vous préférez nous contacter directement ?
                </p>
                <a 
                  href="mailto:contact@igv.israel" 
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  contact@igv.israel
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            {t('home.cta.title', 'Prêt à commencer votre expansion ?')}
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle', 'Contactez-nous aujourd\'hui pour une consultation gratuite')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/mini-analyse" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t('packs.ctaMiniAnalysis', 'Obtenir ma mini-analyse gratuite')}
            </Link>
            <Link 
              to="/appointment" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              {t('nav.appointment', 'Réserver un rendez-vous')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactExpert;
