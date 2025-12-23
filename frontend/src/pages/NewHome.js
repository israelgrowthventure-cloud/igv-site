import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const NewHome = () => {
  const [formData, setFormData] = useState({
    email: '',
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
    contraintes: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const secteurs = [
    'Restauration / Food',
    'Retail (hors food)',
    'Services',
    'Paramédical / Santé'
  ];

  const statutsAlimentaires = [
    'Casher',
    'Halal',
    'Healthy',
    'Vegan/Végétarien',
    'Aucun',
    'À définir'
  ];

  const anciennetes = [
    'Moins de 1 an',
    '1-3 ans',
    '3-5 ans',
    '5-10 ans',
    'Plus de 10 ans'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      toast.success('Analyse copiée dans le presse-papiers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.nom_de_marque || !formData.secteur) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.secteur === 'Restauration / Food' && !formData.statut_alimentaire) {
      toast.error('Le statut alimentaire est obligatoire pour la restauration');
      return;
    }

    setLoading(true);
    
    try {
      const data = await api.sendMiniAnalysis(formData);
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la génération de l\'analyse');
      }

      setAnalysis(data.analysis);
      toast.success('Votre mini-analyse IGV a été générée!');
      
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Handle 409 Conflict (duplicate brand) with axios error structure
      if (error.response?.status === 409) {
        const errorMsg = error.response?.data?.detail || 'Une analyse a déjà été générée pour cette enseigne';
        toast.error(errorMsg);
        setError(errorMsg);
      } else {
        const errorMsg = error.response?.data?.detail || error.message || 'Erreur lors de la génération de l\'analyse';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Is your brand relevant for the Israeli market? | Israel Growth Venture</title>
        <meta name="description" content="Get a first AI-generated market insight for Israel in less than 2 minutes. Understand if, how, and where your brand could make sense in the Israeli market." />
        
        {/* OpenGraph */}
        <meta property="og:title" content="Is your brand relevant for the Israeli market?" />
        <meta property="og:description" content="Get a free AI-generated Israel market insight in less than 2 minutes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://israelgrowthventure.com" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Is your brand relevant for the Israeli market?" />
        <meta name="twitter:description" content="Get a free AI-generated Israel market insight in less than 2 minutes." />
        
        {/* Canonical */}
        <link rel="canonical" content="https://israelgrowthventure.com" />
        
        {/* Schema.org Organization markup for AIO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Israel Growth Venture",
            "alternateName": "IGV",
            "url": "https://israelgrowthventure.com",
            "description": "Israel Growth Venture provides professional market analysis and strategic consulting for international brands considering expansion into the Israeli market. Services include market analysis, entry strategy, location selection, and implementation support for Israel market entry.",
            "foundingDate": "2024",
            "areaServed": {
              "@type": "Country",
              "name": "Israel"
            },
            "serviceType": [
              "Market Analysis",
              "Israel Market Entry Consulting",
              "Strategic Business Consulting",
              "Market Research",
              "Franchise Consulting",
              "Retail Expansion Consulting"
            ],
            "knowsAbout": [
              "Israel market entry",
              "Israeli consumer market",
              "Franchise expansion Israel",
              "Retail market Israel",
              "Market analysis Israel",
              "Business consulting Israel"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "israel.growth.venture@gmail.com",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Mini-Analyse IA Gratuite
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Votre marque est-elle pertinente pour le marché israélien ?
            </h1>
            
            <p className="text-xl text-gray-700 mb-4 font-medium">
              Obtenez une première mini-analyse IA en moins de 2 minutes.
            </p>
            
            <div className="max-w-2xl mx-auto bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-12">
              <p className="text-base text-gray-700 leading-relaxed">
                <strong>Israël n'est pas un marché test.</strong><br />
                Cette première analyse vous aide à comprendre si, comment et où votre marque pourrait avoir du sens en Israël.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
                Générez votre mini-analyse gratuite
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Nom de marque */}
                <div>
                  <label htmlFor="nom_de_marque" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de marque *
                  </label>
                  <input
                    type="text"
                    id="nom_de_marque"
                    name="nom_de_marque"
                    required
                    value={formData.nom_de_marque}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de votre enseigne"
                  />
                </div>

                {/* Secteur */}
                <div>
                  <label htmlFor="secteur" className="block text-sm font-semibold text-gray-700 mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    id="secteur"
                    name="secteur"
                    required
                    value={formData.secteur}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez votre secteur</option>
                    {secteurs.map(secteur => (
                      <option key={secteur} value={secteur}>{secteur}</option>
                    ))}
                  </select>
                </div>

                {/* Statut alimentaire (visible uniquement si Restauration) */}
                {formData.secteur === 'Restauration / Food' && (
                  <div>
                    <label htmlFor="statut_alimentaire" className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut alimentaire *
                    </label>
                    <select
                      id="statut_alimentaire"
                      name="statut_alimentaire"
                      required
                      value={formData.statut_alimentaire}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez un statut</option>
                      {statutsAlimentaires.map(statut => (
                        <option key={statut} value={statut}>{statut}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Ancienneté */}
                <div>
                  <label htmlFor="anciennete" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ancienneté de la marque
                  </label>
                  <select
                    id="anciennete"
                    name="anciennete"
                    value={formData.anciennete}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez</option>
                    {anciennetes.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                {/* Pays d'origine */}
                <div>
                  <label htmlFor="pays_dorigine" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pays d'origine
                  </label>
                  <input
                    type="text"
                    id="pays_dorigine"
                    name="pays_dorigine"
                    value={formData.pays_dorigine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="France, USA, etc."
                  />
                </div>

                {/* Concept */}
                <div>
                  <label htmlFor="concept" className="block text-sm font-semibold text-gray-700 mb-2">
                    Concept / Description de l'activité
                  </label>
                  <textarea
                    id="concept"
                    name="concept"
                    rows={3}
                    value={formData.concept}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Décrivez brièvement votre concept..."
                  />
                </div>

                {/* Positionnement */}
                <div>
                  <label htmlFor="positionnement" className="block text-sm font-semibold text-gray-700 mb-2">
                    Positionnement (premium, milieu de gamme, accessible...)
                  </label>
                  <input
                    type="text"
                    id="positionnement"
                    name="positionnement"
                    value={formData.positionnement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: Premium, Milieu de gamme"
                  />
                </div>

                {/* Modèle actuel */}
                <div>
                  <label htmlFor="modele_actuel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Modèle actuel (franchise, succursales, propre...)
                  </label>
                  <input
                    type="text"
                    id="modele_actuel"
                    name="modele_actuel"
                    value={formData.modele_actuel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Franchise, succursales propres, mixte..."
                  />
                </div>

                {/* Différenciation */}
                <div>
                  <label htmlFor="differenciation" className="block text-sm font-semibold text-gray-700 mb-2">
                    Quelle est votre différenciation / avantage concurrentiel ?
                  </label>
                  <textarea
                    id="differenciation"
                    name="differenciation"
                    rows={4}
                    value={formData.differenciation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Qu'est-ce qui vous rend unique par rapport à vos concurrents..."
                  />
                </div>

                {/* Objectif Israel */}
                <div>
                  <label htmlFor="objectif_israel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Objectif / Raison de vouloir s'implanter en Israël
                  </label>
                  <textarea
                    id="objectif_israel"
                    name="objectif_israel"
                    rows={3}
                    value={formData.objectif_israel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Expansion internationale, marché porteur, partenariat..."
                  />
                </div>

                {/* Contraintes */}
                <div>
                  <label htmlFor="contraintes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraintes connues ou anticipées
                  </label>
                  <textarea
                    id="contraintes"
                    name="contraintes"
                    rows={3}
                    value={formData.contraintes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Réglementation, certifications, budget, etc."
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Générer ma mini-analyse gratuite
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {analysis && (
          <section id="results" className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Votre Mini-Analyse IGV
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Check className="w-5 h-5" />
                    Copier l'analyse
                  </button>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> Cette première mini-analyse a été générée par un modèle IA basé sur vos données.
                    Elle fournit une orientation initiale mais ne remplace pas une analyse humaine complète du marché israélien.
                    Si vous souhaitez une étude détaillée, stratégique et localisée, vous pouvez demander une analyse complète réalisée par Israel Growth Venture.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Envie d'aller plus loin ?
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    Une analyse complète du marché israélien (emplacements, budget, risques, modèle d'entrée) est disponible.
                  </p>
                  <a
                    href={`/contact?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Demander une analyse complète (3 000 USD)
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust Indicators */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Check, text: 'Analyse IA Instantanée' },
                { icon: Check, text: 'Spécialistes Marché Israélien' },
                { icon: Check, text: 'Mini-Analyse Gratuite' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default NewHome;
