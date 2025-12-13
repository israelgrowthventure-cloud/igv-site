// ============================================================
// ATTENTION - Contact Page - Design Emergent FORCÉ
// ============================================================
// Cette page utilise UNIQUEMENT le design Emergent React codé en dur.
// CMS overlay SUPPRIMÉ pour garantir le design moderne complet.
// Formulaire fonctionnel + i18n FR/EN/HE intégré.
// ============================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Send } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';
import { toast } from 'sonner';
import { useCMSContent } from '../hooks/useCMSContent';
import SEO from '../components/SEO';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { getText, getImage } = useCMSContent('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send contact form');
      }

      toast.success(t('contact.form.success'));
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error(t('contact.form.error'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen pt-20 font-sans">
      <SEO
        title={`${t('contact.title')} - Israel Growth Venture`}
        description={t('contact.subtitle')}
        pathname="/contact"
        image="https://israelgrowthventure.com/og-contact.jpg"
      />
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="hero-title text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('contact.form.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                    data-testid="contact-name-input"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('contact.form.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                    data-testid="contact-email-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('contact.form.company')}
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                      data-testid="contact-company-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('contact.form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                      data-testid="contact-phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all resize-none outline-none"
                    data-testid="contact-message-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 px-6 shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  data-testid="contact-submit-btn"
                >
                  {loading ? (
                    <span>{t('contact.form.sending')}</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      <span>{t('contact.form.submit')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pl-12 pt-8">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 font-work-sans">
                  {t('contact.info.title')}
                </h2>

                <div className="space-y-8">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:border-blue-200 transition-colors">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        {t('contact.info.email')}
                      </div>
                      <a
                        href="mailto:contact@israelgrowthventure.com"
                        className="text-base text-blue-600 hover:text-blue-700 transition-colors font-medium"
                      >
                        contact@israelgrowthventure.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:border-blue-200 transition-colors">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        {t('contact.info.address')}
                      </div>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {t('contact.info.addressValue')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-lg font-bold mb-4 relative z-10">
                    Horaires d'ouverture
                  </h3>
                  <div className="space-y-2 relative z-10 text-blue-50">
                    <div className="flex justify-between border-b border-blue-500/30 pb-2">
                      <span>Lundi - Jeudi</span>
                      <span className="font-medium">9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-500/30 pb-2">
                      <span>Vendredi</span>
                      <span className="font-medium">9h00 - 14h00</span>
                    </div>
                    <div className="flex justify-between pt-2 text-blue-200">
                      <span>Samedi - Dimanche</span>
                      <span className="font-medium">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
