import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles, Download, Check, Mail, Loader2, MapPin, Store } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import BrandName from '../components/BrandName';

const MiniAnalysis = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';
  const [searchParams] = useSearchParams();
  
  // Phase 3: URL Parameter Capture
  const packParam = searchParams.get('pack');
  const packNameParam = searchParams.get('packName');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    nom_de_marque: '',
    secteur: '',
    statut_alimentaire: '',
    anciennete: '',
    pays_dorigine: '',
    concept: '',
    positionnement: '',
    modele_actuel: '',
    differenciation: '',
    objectif_israel: '',
    contraintes: '',
    // Phase 3: Type de projet (auto-filled from pack parameter)
    type_de_projet: '',
    // Phase 3: Israel-specific fields
    nombre_points_vente: '',
    villes_cibles: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [israelFieldsVisible, setIsraelFieldsVisible] = useState(false);

  // Phase 3: Map pack parameters to project types
  const packToProjectType = {
    analyse: { fr: 'Diagnostic Stratégique', en: 'Strategic Assessment', he: 'הערכה אסטרטגית' },
    succursales: { fr: 'Ouverture de Succursales', en: 'Branch Opening', he: 'פתיחת סניפים' },
    franchise: { fr: 'Développement Franchise', en: 'Franchise Development', he: 'פיתוח זכיינות' }
  };

  // Phase 3: Capture pack parameter on mount and pre-fill project type
  useEffect(() => {
    if (packParam && packToProjectType[packParam]) {
      const projectType = packToProjectType[packParam][currentLang] || packToProjectType[packParam]['fr'];
      setFormData(prev => ({
        ...prev,
        type_de_projet: projectType
      }));
      
      // Show toast notification
      toast.info(
        currentLang === 'he' 
          ? `נבחרה חבילה: ${packNameParam || projectType}`
          : currentLang === 'en'
            ? `Selected pack: ${packNameParam || projectType}`
            : `Pack sélectionné : ${packNameParam || projectType}`,
        { duration: 3000 }
      );
    }
  }, [packParam, packNameParam, currentLang]);

  // Phase 3: Check if country is Israel to show additional fields
  useEffect(() => {
    const country = formData.pays_dorigine?.toLowerCase().trim();
    const israelVariants = ['israel', 'ישראל', 'israel🇮🇱'];
    setIsraelFieldsVisible(israelVariants.includes(country));
  }, [formData.pays_dorigine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.email || !formData.nom_de_marque || !formData.secteur) {
      toast.error(t('miniAnalysis.toast.fieldsRequired'));
      return;
    }

    // First name and last name are required
    if (!formData.first_name || formData.first_name.trim().length < 2) {
      const errorMsg = {
        fr: 'Le prénom est obligatoire',
        en: 'First name is required',
        he: 'שם פרטי נדרש'
      }[currentLang] || 'First name is required';
      toast.error(errorMsg);
      return;
    }
    
    if (!formData.last_name || formData.last_name.trim().length < 2) {
      const errorMsg = {
        fr: 'Le nom est obligatoire',
        en: 'Last name is required',
        he: 'שם משפחה נדרש'
      }[currentLang] || 'Last name is required';
      toast.error(errorMsg);
      return;
    }

    // Phone is required
    if (!formData.phone || formData.phone.trim().length < 6) {
      toast.error(t('miniAnalysis.toast.phoneRequired') || 'Le numéro de téléphone est obligatoire');
      return;
    }

    if (formData.secteur === t('miniAnalysis.sectors.0') && !formData.statut_alimentaire) {
      toast.error(t('miniAnalysis.toast.foodStatusRequired'));
      return;
    }

    setLoading(true);
    
    // Show loading toast immediately
    const loadingToastId = toast.loading(t('miniAnalysis.toast.analyzing'));
    
    try {
      // Add language to request and pack information
      const requestData = {
        ...formData,
        language: currentLang,
        pack_source: packParam || null
      };
      
      const data = await api.sendMiniAnalysis(requestData);
      
      toast.dismiss(loadingToastId);
      
      if (!data.success) {
        throw new Error(data.message || t('miniAnalysis.toast.error'));
      }

      setAnalysis(data.analysis);
      setAnalysisResult({ text: data.analysis, quota_blocked: false });
      toast.success(t('miniAnalysis.toast.success'));
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss(loadingToastId);
      
      // MISSION: Handle 429 Quota Error (UX propre + message multilingue)
      if (error.response?.status === 429) {
        const errorData = error.response?.data;
        if (errorData?.error_code === 'GEMINI_QUOTA_DAILY') {
          const quotaMsg = errorData.message?.[currentLang] || errorData.message?.en || 'Quota limit reached. Please try again tomorrow.';
          
          // Set special quota state (not generic error)
          setError(null);
          setAnalysisResult({
            text: '',
            quota_blocked: true,
            quota_message: quotaMsg,
            email_sent: errorData.email_sent || false,
            request_id: errorData.request_id
          });
          
          // Show toast with confirmation
          toast.info(quotaMsg, { duration: 6000 });
          
          // Scroll to results section to show quota message
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
          
          return;
        }
      }
      
      // Handle 409 Conflict (duplicate brand)
      if (error.response?.status === 409) {
        const errorMsg = error.response?.data?.detail || t('miniAnalysis.toast.duplicate');
        toast.error(errorMsg);
        setError(errorMsg);
      } else {
        const errorMsg = error.response?.data?.detail || error.message || t('miniAnalysis.toast.error');
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }

  };

  const handleContactExpert = async () => {
    try {
      await api.contactExpert({
        email: formData.email,
        brandName: formData.nom_de_marque,
        sector: formData.secteur,
        country: formData.pays_dorigine,
        language: currentLang,
        source: 'mini-analysis'
      });
      
      setShowContactModal(true);
      toast.success(t('miniAnalysis.toast.contactExpertSuccess'));
    } catch (error) {
      console.error('Error contacting expert:', error);
      toast.error(t('miniAnalysis.toast.error'));
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    
    setPdfLoading(true);
    const loadingToastId = toast.loading(t('miniAnalysis.toast.pdfDownloading'));
    
    try {
      const pdfData = await api.generatePDF({
        email: formData.email,
        brandName: formData.nom_de_marque,
        sector: formData.secteur,
        origin: formData.pays_dorigine,
        analysis: analysis,
        language: currentLang
      });
      
      toast.dismiss(loadingToastId);
      
      // Download PDF - check pdfBase64 first (backend returns this)
      if (pdfData.pdfBase64) {
        // Create blob from base64 and download
        const blob = base64ToBlob(pdfData.pdfBase64, 'application/pdf');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.nom_de_marque}_IGV_Analysis.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t('miniAnalysis.toast.pdfDownloaded'));
      } else if (pdfData.pdfUrl) {
        window.open(pdfData.pdfUrl, '_blank');
        toast.success(t('miniAnalysis.toast.pdfDownloaded'));
      } else {
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss(loadingToastId);
      
      // Better error message with backend detail if available
      const errorMsg = error?.response?.data?.detail || error?.message || t('miniAnalysis.toast.error');
      toast.error(`PDF Error: ${errorMsg}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEmailPDF = async () => {
    if (!analysis) return;
    
    setEmailLoading(true);
    const loadingToastId = toast.loading(t('miniAnalysis.toast.emailSending'));
    
    try {
      await api.emailPDF({
        email: formData.email,
        brandName: formData.nom_de_marque,
        sector: formData.secteur,
        origin: formData.pays_dorigine,
        analysis: analysis,
        language: currentLang
      });
      
      toast.dismiss(loadingToastId);
      toast.success(t('miniAnalysis.toast.emailSent'));
    } catch (error) {
      console.error('Error emailing PDF:', error);
      toast.dismiss(loadingToastId);
      
      // Better error message with backend detail if available
      const errorMsg = error?.response?.data?.detail || error?.message || t('miniAnalysis.toast.error');
      toast.error(`Email Error: ${errorMsg}`);
    } finally {
      setEmailLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      toast.success(t('miniAnalysis.results.copied'));
    }
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64, type) => {
    const binStr = atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  };

  return (
    <>
      <Helmet>
        <title>{t('miniAnalysis.hero.title')} | {t('common.brandName')}</title>
        <meta name="description" content={t('miniAnalysis.hero.description')} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={`${t('miniAnalysis.hero.title')} | ${t('common.brandName')}`} />
        <meta property="og:description" content={t('miniAnalysis.hero.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://israelgrowthventure.com/${currentLang}/mini-analyse`} />
        
        {/* hreflang */}
        <link rel="alternate" hrefLang="fr" href="https://israelgrowthventure.com/fr/mini-analyse" />
        <link rel="alternate" hrefLang="en" href="https://israelgrowthventure.com/en/mini-analyse" />
        <link rel="alternate" hrefLang="he" href="https://israelgrowthventure.com/he/mini-analyse" />
        <link rel="alternate" hrefLang="x-default" href="https://israelgrowthventure.com/mini-analyse" />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://israelgrowthventure.com/${currentLang}/mini-analyse`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              {t('miniAnalysis.hero.title')}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('miniAnalysis.hero.subtitle')}
            </h1>
            
            <p className="text-xl text-gray-700 mb-8">
              {t('miniAnalysis.hero.description')}
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              {/* Phase 3: Pack Selection Banner */}
              {packParam && formData.type_de_projet && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      {currentLang === 'he' ? 'חבילה נבחרה מהדף הקודם' : currentLang === 'en' ? 'Pack selected from previous page' : 'Pack sélectionné depuis la page précédente'}
                    </p>
                    <p className="font-semibold text-green-800">{packNameParam || formData.type_de_projet}</p>
                  </div>
                </div>
              )}
              
              {/* Quota Information - Multilingual */}
              <div className={`mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded ${currentLang === 'he' ? 'text-right' : 'text-left'}`} dir={currentLang === 'he' ? 'rtl' : 'ltr'}>
                <p className="text-sm text-blue-800 font-medium mb-2">
                  {currentLang === 'he' ? 'כדי להבטיח את איכות הניתוחים שלנו, מוחלת מכסה יומית. אם הניתוח שלך לא נטען, אנא חזור מחר.' : currentLang === 'en' ? 'To ensure the quality of our analyses, a daily quota is applied. If your analysis does not load, please return tomorrow.' : 'Afin de garantir la qualité de nos analyses, un quota quotidien est appliqué. Si votre analyse ne se charge pas, nous vous invitons à revenir le lendemain.'}
                </p>
                <p className="text-sm text-blue-800">
                  {currentLang === 'he' ? 'ניתן להפיק אנליזה אחת בלבד לכל עסק.' : currentLang === 'en' ? 'Only one mini-analysis can be generated per business.' : 'Une seule mini-analyse peut être générée par enseigne.'}
                </p>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
                {t('miniAnalysis.form.title')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.emailPlaceholder')}
                  />
                </div>

                {/* Phone - REQUIRED */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.phone') || t('contact.form.phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.phonePlaceholder') || '+33 6 XX XX XX XX'}
                  />
                </div>

                {/* First Name - REQUIRED */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentLang === 'he' ? 'שם פרטי' : currentLang === 'en' ? 'First Name' : 'Prénom'} *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={currentLang === 'he' ? 'הכנס שם פרטי' : currentLang === 'en' ? 'Enter your first name' : 'Votre prénom'}
                  />
                </div>

                {/* Last Name - REQUIRED */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentLang === 'he' ? 'שם משפחה' : currentLang === 'en' ? 'Last Name' : 'Nom'} *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={currentLang === 'he' ? 'הכנס שם משפחה' : currentLang === 'en' ? 'Enter your last name' : 'Votre nom'}
                  />
                </div>

                {/* Brand Name */}
                <div>
                  <label htmlFor="nom_de_marque" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.brandName')} *
                  </label>
                  <input
                    type="text"
                    id="nom_de_marque"
                    name="nom_de_marque"
                    required
                    value={formData.nom_de_marque}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.brandNamePlaceholder')}
                  />
                </div>

                {/* Phase 3: Project Type (auto-filled from pack parameter, read-only) */}
                <div>
                  <label htmlFor="type_de_projet" className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentLang === 'he' ? 'סוג הפרויקט' : currentLang === 'en' ? 'Project Type' : 'Type de projet'}
                  </label>
                  <input
                    type="text"
                    id="type_de_projet"
                    name="type_de_projet"
                    value={formData.type_de_projet}
                    readOnly={!!packParam}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      packParam 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                        : 'border-gray-300'
                    }`}
                    placeholder={currentLang === 'he' ? 'בחר סוג פרויקט' : currentLang === 'en' ? 'Select project type' : 'Sélectionnez le type de projet'}
                  />
                  {packParam && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentLang === 'he' ? 'נבחר אוטומטית מהחבילה שנבחרה' : currentLang === 'en' ? 'Auto-selected from chosen pack' : 'Sélectionné automatiquement depuis le pack choisi'}
                    </p>
                  )}
                </div>

                {/* Sector */}
                <div>
                  <label htmlFor="secteur" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.sector')} *
                  </label>
                  <select
                    id="secteur"
                    name="secteur"
                    required
                    value={formData.secteur}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('miniAnalysis.form.sectorPlaceholder')}</option>
                    {t('miniAnalysis.sectors', { returnObjects: true }).map((sector, idx) => (
                      <option key={idx} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Food Status (visible only if Restaurant/Food) */}
                {formData.secteur === t('miniAnalysis.sectors.0') && (
                  <div>
                    <label htmlFor="statut_alimentaire" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('miniAnalysis.form.foodStatus')} *
                    </label>
                    <select
                      id="statut_alimentaire"
                      name="statut_alimentaire"
                      required
                      value={formData.statut_alimentaire}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('miniAnalysis.form.foodStatusPlaceholder')}</option>
                      {t('miniAnalysis.foodStatuses', { returnObjects: true }).map((status, idx) => (
                        <option key={idx} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Seniority */}
                <div>
                  <label htmlFor="anciennete" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.seniority')}
                  </label>
                  <select
                    id="anciennete"
                    name="anciennete"
                    value={formData.anciennete}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('miniAnalysis.form.seniorityPlaceholder')}</option>
                    {t('miniAnalysis.seniorities', { returnObjects: true }).map((age, idx) => (
                      <option key={idx} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                {/* Country of Origin */}
                <div>
                  <label htmlFor="pays_dorigine" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.originCountry')}
                  </label>
                  <input
                    type="text"
                    id="pays_dorigine"
                    name="pays_dorigine"
                    value={formData.pays_dorigine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.originCountryPlaceholder')}
                  />
                </div>

                {/* Phase 3: Israel-specific fields - visible when Israel is selected */}
                {israelFieldsVisible && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-indigo-900">
                        {currentLang === 'he' ? 'פרטים ספציפיים לישראל' : currentLang === 'en' ? 'Israel-Specific Details' : 'Détails spécifiques à Israël'}
                      </h3>
                    </div>
                    
                    {/* Number of stores desired */}
                    <div>
                      <label htmlFor="nombre_points_vente" className="block text-sm font-semibold text-indigo-800 mb-2">
                        {currentLang === 'he' ? 'מספר נקודות המכירה הרצויות' : currentLang === 'en' ? 'Number of desired store locations' : 'Nombre de points de vente souhaités'}
                      </label>
                      <input
                        type="number"
                        id="nombre_points_vente"
                        name="nombre_points_vente"
                        min="1"
                        value={formData.nombre_points_vente}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={currentLang === 'he' ? 'הכנס מספר' : currentLang === 'en' ? 'Enter number' : 'Entrez un nombre'}
                      />
                    </div>

                    {/* Target cities */}
                    <div>
                      <label htmlFor="villes_cibles" className="block text-sm font-semibold text-indigo-800 mb-2">
                        {currentLang === 'he' ? 'ערים יעד' : currentLang === 'en' ? 'Target cities' : 'Villes cibles'}
                      </label>
                      <textarea
                        id="villes_cibles"
                        name="villes_cibles"
                        rows={3}
                        value={formData.villes_cibles}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder={currentLang === 'he' ? 'רשום את הערים היעד' : currentLang === 'en' ? 'List your target cities' : 'Listez vos villes cibles'}
                      />
                      <p className="text-xs text-indigo-600 mt-1">
                        {currentLang === 'he' ? 'לדוגמה: תל אביב, ירושלים, חיפה' : currentLang === 'en' ? 'E.g., Tel Aviv, Jerusalem, Haifa' : 'Ex: Tel Aviv, Jérusalem, Haïfa'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Concept */}
                <div>
                  <label htmlFor="concept" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.concept')}
                  </label>
                  <textarea
                    id="concept"
                    name="concept"
                    rows={3}
                    value={formData.concept}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('miniAnalysis.form.conceptPlaceholder')}
                  />
                </div>

                {/* Positioning */}
                <div>
                  <label htmlFor="positionnement" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.positioning')}
                  </label>
                  <input
                    type="text"
                    id="positionnement"
                    name="positionnement"
                    value={formData.positionnement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.positioningPlaceholder')}
                  />
                </div>

                {/* Current Model */}
                <div>
                  <label htmlFor="modele_actuel" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.currentModel')}
                  </label>
                  <input
                    type="text"
                    id="modele_actuel"
                    name="modele_actuel"
                    value={formData.modele_actuel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('miniAnalysis.form.currentModelPlaceholder')}
                  />
                </div>

                {/* Differentiation */}
                <div>
                  <label htmlFor="differenciation" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.differentiation')}
                  </label>
                  <textarea
                    id="differenciation"
                    name="differenciation"
                    rows={4}
                    value={formData.differenciation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('miniAnalysis.form.differentiationPlaceholder')}
                  />
                </div>

                {/* Israel Objective */}
                <div>
                  <label htmlFor="objectif_israel" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.israelObjective')}
                  </label>
                  <textarea
                    id="objectif_israel"
                    name="objectif_israel"
                    rows={3}
                    value={formData.objectif_israel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('miniAnalysis.form.israelObjectivePlaceholder')}
                  />
                </div>

                {/* Constraints */}
                <div>
                  <label htmlFor="contraintes" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('miniAnalysis.form.constraints')}
                  </label>
                  <textarea
                    id="contraintes"
                    name="contraintes"
                    rows={3}
                    value={formData.contraintes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('miniAnalysis.form.constraintsPlaceholder')}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                    {error.includes('quota') || error.includes('Quota') || error.includes('limit') ? (
                      <p className="text-xs text-red-600 mt-2">
                        ⏰ {currentLang === 'fr' ? 'Réessayez demain' : currentLang === 'he' ? 'נסו שוב מחר' : 'Try again tomorrow'}
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (error && (error.includes('quota') || error.includes('Quota') || error.includes('limit')))}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('miniAnalysis.form.submitting')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {t('miniAnalysis.form.submit')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {analysisResult && (
          <section id="results" className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                {analysisResult.quota_blocked ? (
                  /* MISSION: UX Propre pour Quota Gemini */
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                      <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {currentLang === 'fr' ? 'Demande enregistrée' : currentLang === 'he' ? 'הבקשה נשמרה' : 'Request saved'}
                    </h3>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6 text-left max-w-2xl mx-auto">
                      <p className="text-lg text-gray-800 whitespace-pre-wrap">
                        {analysisResult.quota_message}
                      </p>
                    </div>
                    
                    {analysisResult.email_sent && (
                      <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-3 px-6 rounded-lg max-w-md mx-auto mb-4">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                          {currentLang === 'fr' ? 'Email de confirmation envoyé' : currentLang === 'he' ? 'אימייל אישור נשלח' : 'Confirmation email sent'}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-6">
                      {currentLang === 'fr' 
                        ? `ID de demande: ${analysisResult.request_id || 'N/A'}` 
                        : currentLang === 'he' 
                          ? `מזהה בקשה: ${analysisResult.request_id || 'N/A'}` 
                          : `Request ID: ${analysisResult.request_id || 'N/A'}`
                      }
                    </p>
                    
                    <button
                      onClick={() => {
                        setAnalysisResult(null);
                        setError(null);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
                    >
                      {currentLang === 'fr' ? 'Nouvelle demande' : currentLang === 'he' ? 'בקשה חדשה' : 'New request'}
                    </button>
                  </div>
                ) : (
                  /* Normal Analysis Results */
                  <>
                {/* Header with Actions */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {t('miniAnalysis.results.title')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('miniAnalysis.results.subtitle')} <strong>{formData.nom_de_marque}</strong>
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      {t('miniAnalysis.results.copy')}
                    </button>
                    
                    <button
                      onClick={handleDownloadPDF}
                      disabled={pdfLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {t('miniAnalysis.results.download')}
                    </button>
                    
                    <button
                      onClick={handleEmailPDF}
                      disabled={emailLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {t('miniAnalysis.results.email')}
                    </button>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>

                {/* Contact Expert CTA */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('miniAnalysis.results.nextSteps')}
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    {t('miniAnalysis.results.nextStepsDescription')}
                  </p>
                  <button
                    onClick={handleContactExpert}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('miniAnalysis.results.contactExpert')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Trust Indicators */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Sparkles, textKey: 'miniAnalysis.hero.title' },
                { icon: Check, textKey: 'common.brandName' },
                { icon: Check, textKey: 'nav.miniAnalysis' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {idx === 1 ? <BrandName /> : t(item.textKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Contact Expert Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('common.success')}
            </h3>
            <p className="text-gray-700 mb-6">
              {t('miniAnalysis.toast.contactExpertSuccess')}
            </p>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MiniAnalysis;
