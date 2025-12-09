import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Building2, Mail, User, Calendar, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Formulaire de qualification pour l'Étude d'Implantation IGV – Israël 360°
 * Collecte les informations clés et crée un lead via l'API backend
 */
const EtudeImplantation360Form = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    role: '',
    brandGroup: '',
    implantationHorizon: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Options horizon d'implantation
  const horizonOptions = [
    { value: '', label: 'Sélectionnez...' },
    { value: '0-6', label: '0–6 mois' },
    { value: '6-12', label: '6–12 mois' },
    { value: '12+', label: '12+ mois' },
    { value: 'unknown', label: 'Je ne sais pas encore' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user types
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage('Le nom est requis');
      return false;
    }
    if (!formData.workEmail.trim()) {
      setErrorMessage('L\'email professionnel est requis');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.workEmail)) {
      setErrorMessage('Veuillez entrer un email valide');
      return false;
    }
    if (!formData.implantationHorizon) {
      setErrorMessage('Veuillez sélectionner un horizon d\'implantation');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        full_name: formData.fullName.trim(),
        work_email: formData.workEmail.trim().toLowerCase(),
        role: formData.role.trim() || null,
        brand_group: formData.brandGroup.trim() || null,
        implantation_horizon: formData.implantationHorizon,
        source: 'etude_implantation_360_landing',
        locale: 'fr'
      };

      const response = await fetch(`${API_BASE_URL}/api/leads/etude-implantation-360`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erreur lors de l\'envoi du formulaire');
      }

      // Success - redirect to thank you page
      toast.success('Votre demande a été envoyée avec succès !');
      navigate('/etude-implantation-merci');
      
    } catch (error) {
      console.error('Form submission error:', error);
      setErrorMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-xl my-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Demander une étude d'implantation
          </h2>
          <p className="text-lg text-gray-700">
            Remplissez ce formulaire pour lancer un échange exploratoire avec notre équipe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Nom */}
          <div>
            <label 
              htmlFor="fullName" 
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Nom complet <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Jean Dupont"
              disabled={isSubmitting}
              aria-required="true"
            />
          </div>

          {/* Email professionnel */}
          <div>
            <label 
              htmlFor="workEmail" 
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              Email professionnel <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              value={formData.workEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="jean.dupont@entreprise.com"
              disabled={isSubmitting}
              aria-required="true"
            />
          </div>

          {/* Rôle */}
          <div>
            <label 
              htmlFor="role" 
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
              Rôle / Fonction
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Directeur Expansion, CEO, etc."
              disabled={isSubmitting}
            />
          </div>

          {/* Marque / Groupe */}
          <div>
            <label 
              htmlFor="brandGroup" 
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Building2 className="w-4 h-4 mr-2 text-blue-600" />
              Marque / Groupe
            </label>
            <input
              type="text"
              id="brandGroup"
              name="brandGroup"
              value={formData.brandGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nom de votre entreprise"
              disabled={isSubmitting}
            />
          </div>

          {/* Horizon d'implantation */}
          <div>
            <label 
              htmlFor="implantationHorizon" 
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Horizon d'implantation <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="implantationHorizon"
              name="implantationHorizon"
              value={formData.implantationHorizon}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={isSubmitting}
              aria-required="true"
            >
              {horizonOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner mr-3"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Valider et lancer un échange
              </>
            )}
          </button>

          <p className="text-xs text-gray-600 text-center mt-4">
            En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe pour discuter de votre projet d'implantation en Israël.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EtudeImplantation360Form;
