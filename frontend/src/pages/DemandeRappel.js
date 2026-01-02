import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Phone, Mail, User, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const DemandeRappel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('pack') || 'analyse';
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    pack: packId,
    date_souhaitee: '',
    heure_souhaitee: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const packNames = {
    analyse: t('packs.analyse.name'),
    succursales: t('packs.succursales.name'),
    franchise: t('packs.franchise.name')
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email || !formData.telephone) {
      toast.error(t('demandeRappel.errors.fieldsRequired', 'Veuillez remplir tous les champs obligatoires'));
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/crm/lead-from-pack', {
        email: formData.email,
        full_name: formData.nom,
        phone: formData.telephone,
        company: formData.entreprise,
        pack_requested: formData.pack,
        preferred_date: formData.date_souhaitee,
        preferred_time: formData.heure_souhaitee,
        message: formData.message,
        source: 'pack_rappel',
        status: 'new'
      });

      if (response.success) {
        setSuccess(true);
        toast.success(t('demandeRappel.success', 'Votre demande a été enregistrée avec succès'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('demandeRappel.errors.submitFailed', 'Erreur lors de l\'envoi. Veuillez réessayer.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>{t('demandeRappel.successTitle', 'Demande enregistrée')} | IGV</title>
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-20">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('demandeRappel.successTitle', 'Demande enregistrée !')}
            </h1>
            
            <p className="text-lg text-gray-700 mb-6">
              {t('demandeRappel.successMessage', 'Merci pour votre intérêt. Un expert IGV vous contactera sous 48h pour discuter de votre projet.')}
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8 text-left">
              <p className="text-sm text-gray-700">
                <strong>{t('demandeRappel.packSelected', 'Pack sélectionné')} :</strong> {packNames[formData.pack]}
              </p>
              {formData.date_souhaitee && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>{t('demandeRappel.preferredDate', 'Date souhaitée')} :</strong> {formData.date_souhaitee} {formData.heure_souhaitee && `à ${formData.heure_souhaitee}`}
                </p>
              )}
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToHome', 'Retour à l\'accueil')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('demandeRappel.title', 'Demande de rappel')} | IGV</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('demandeRappel.title', 'Demande de rappel')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('demandeRappel.subtitle', 'Un expert IGV vous contactera sous 48h pour discuter de votre projet d\'expansion en Israël')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">
                {t('demandeRappel.packSelected', 'Pack sélectionné')} : <span className="text-blue-600">{packNames[packId]}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    {t('demandeRappel.fields.nom', 'Nom complet')} *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('demandeRappel.placeholders.nom', 'Jean Dupont')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    {t('demandeRappel.fields.email', 'Email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('demandeRappel.placeholders.email', 'jean@entreprise.com')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    {t('demandeRappel.fields.telephone', 'Téléphone')} *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('demandeRappel.placeholders.telephone', '+33 6 12 34 56 78')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4" />
                    {t('demandeRappel.fields.entreprise', 'Entreprise')}
                  </label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('demandeRappel.placeholders.entreprise', 'Nom de l\'entreprise')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    {t('demandeRappel.fields.date', 'Date souhaitée')}
                  </label>
                  <input
                    type="date"
                    name="date_souhaitee"
                    value={formData.date_souhaitee}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    {t('demandeRappel.fields.heure', 'Heure souhaitée')}
                  </label>
                  <select
                    name="heure_souhaitee"
                    value={formData.heure_souhaitee}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('demandeRappel.placeholders.heure', 'Sélectionner')}</option>
                    <option value="09:00-12:00">09:00 - 12:00</option>
                    <option value="12:00-14:00">12:00 - 14:00</option>
                    <option value="14:00-17:00">14:00 - 17:00</option>
                    <option value="17:00-19:00">17:00 - 19:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('demandeRappel.fields.message', 'Message (optionnel)')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('demandeRappel.placeholders.message', 'Parlez-nous de votre projet...')}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/packs')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.back', 'Retour')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.loading', 'Envoi...') : t('demandeRappel.submit', 'Demander un rappel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemandeRappel;
