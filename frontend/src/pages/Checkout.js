import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/apiConfig';
import { useGeo } from '../context/GeoContext';
import { PLAN_TYPES, formatPrice } from '../config/pricingConfig';

const PACKS = {
  analyse: {
    id: 'analyse',
    name: 'Pack Analyse',
    priceLabel: '3 000 €',
    note: "Diagnostic complet du potentiel de votre marque en Israël. Ce pack ne comprend pas la recherche ni l'ouverture de points de vente."
  },
  succursales: {
    id: 'succursales',
    name: 'Pack Succursales',
    priceLabel: '15 000 €',
    note: "Solution clé en main pour l'ouverture de succursales en Israël. Pack conçu pour vos 3 premières succursales. Au-delà, accompagnement sur devis."
  },
  franchise: {
    id: 'franchise',
    name: 'Pack Franchise',
    priceLabel: '15 000 €',
    note: "Développement complet de votre réseau de franchise en Israël. Pack dédié au lancement de votre réseau. Déploiement élargi sur devis."
  },
};

const Checkout = () => {
  const { packId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { zone, isLoading: geoLoading } = useGeo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(PLAN_TYPES.ONE_SHOT);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: ''
  });

  // Charger les prix pour ce pack et cette zone
  useEffect(() => {
    const fetchPricing = async () => {
      if (!zone) return; // Attendre que la zone soit chargée
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/pricing?packId=${packId}&zone=${zone}`);
        if (!response.ok) throw new Error('Failed to fetch pricing');
        const data = await response.json();
        setPricing(data);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        // En cas d'erreur, utiliser des prix par défaut pour ne pas bloquer l'utilisateur
        setPricing({
          zone: zone || 'IL',
          currency: 'ils',
          currency_symbol: '₪',
          total_price: packId === 'analyse' ? 7000 : 55000,
          monthly_3x: packId === 'analyse' ? 2334 : 18334,
          monthly_12x: packId === 'analyse' ? 584 : 4584,
          display: {
            total: packId === 'analyse' ? '7 000 ₪' : '55 000 ₪',
            three_times: packId === 'analyse' ? '3 x 2 334 ₪' : '3 x 18 334 ₪',
            twelve_times: packId === 'analyse' ? '12 x 584 ₪' : '12 x 4 584 ₪'
          }
        });
      }
    };

    if (!geoLoading) {
      fetchPricing();
    }
  }, [zone, packId, geoLoading]);

  // Noms des packs
  const PACK_NAMES = {
    analyse: t('packs.analyse.name'),
    succursales: t('packs.succursales.name'),
    franchise: t('packs.franchise.name'),
  };

  const PACK_NOTES = {
    analyse: t('packs.analyse.note'),
    succursales: t('packs.succursales.note'),
    franchise: t('packs.franchise.note'),
  };

  if (!PACK_NAMES[packId]) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('checkout.packNotFound')}</h1>
          <p className="text-gray-600 mb-6">{t('checkout.packNotFoundDesc')}</p>
          <Link
            to="/packs"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('checkout.backToPacks')}
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getSelectedAmount = () => {
    if (!pricing) return null;
    
    switch (selectedPlan) {
      case PLAN_TYPES.ONE_SHOT:
        return pricing.total_price;
      case PLAN_TYPES.THREE_TIMES:
        return pricing.monthly_3x;
      case PLAN_TYPES.TWELVE_TIMES:
        return pricing.monthly_12x;
      default:
        return pricing.total_price;
    }
  };

  const getDisplayPrice = () => {
    if (!pricing) return '';
    
    switch (selectedPlan) {
      case PLAN_TYPES.ONE_SHOT:
        return pricing.display.total;
      case PLAN_TYPES.THREE_TIMES:
        return pricing.display.three_times;
      case PLAN_TYPES.TWELVE_TIMES:
        return pricing.display.twelve_times;
      default:
        return pricing.display.total;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        packId: packId,
        packName: PACK_NAMES[packId],
        priceLabel: getDisplayPrice(),
        customer: {
          fullName: formData.fullName.trim(),
          company: formData.company ? formData.company.trim() : null,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
        },
        planType: selectedPlan,
        zone: zone,
      };

      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Erreur backend:", response.status, text);
        
        let errorMessage = "Erreur lors de la création de la commande.";
        if (response.status === 400) {
          errorMessage = "Données invalides. Vérifiez vos informations.";
        } else if (response.status === 502) {
          errorMessage = "Erreur de paiement. Vérifiez votre configuration Stripe.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.paymentUrl || typeof data.paymentUrl !== 'string') {
        throw new Error("URL de paiement non reçue du serveur. Réessayez.");
      }

      setTimeout(() => {
        window.location.href = data.paymentUrl;
      }, 300);

    } catch (err) {
      console.error("⚠️ Erreur:", err.message);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  if (geoLoading || !pricing) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('checkout.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/packs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retourner aux packs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Validation du pack</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Payment Plan Selection */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mode de paiement <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* One Shot */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-white" 
                      style={{
                        borderColor: selectedPlan === PLAN_TYPES.ONE_SHOT ? '#2563eb' : '#e5e7eb',
                        backgroundColor: selectedPlan === PLAN_TYPES.ONE_SHOT ? 'white' : 'transparent'
                      }}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={PLAN_TYPES.ONE_SHOT}
                        checked={selectedPlan === PLAN_TYPES.ONE_SHOT}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Paiement comptant</span>
                          <span className="text-lg font-bold text-blue-600">{pricing.display.total}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Paiement en une fois</p>
                      </div>
                    </label>

                    {/* 3 Times */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-white"
                      style={{
                        borderColor: selectedPlan === PLAN_TYPES.THREE_TIMES ? '#2563eb' : '#e5e7eb',
                        backgroundColor: selectedPlan === PLAN_TYPES.THREE_TIMES ? 'white' : 'transparent'
                      }}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={PLAN_TYPES.THREE_TIMES}
                        checked={selectedPlan === PLAN_TYPES.THREE_TIMES}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Paiement en 3 fois</span>
                          <span className="text-lg font-bold text-blue-600">{pricing.display.three_times}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">3 mensualités automatiques</p>
                      </div>
                    </label>

                    {/* 12 Times */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-white"
                      style={{
                        borderColor: selectedPlan === PLAN_TYPES.TWELVE_TIMES ? '#2563eb' : '#e5e7eb',
                        backgroundColor: selectedPlan === PLAN_TYPES.TWELVE_TIMES ? 'white' : 'transparent'
                      }}>
                      <input
                        type="radio"
                        name="paymentPlan"
                        value={PLAN_TYPES.TWELVE_TIMES}
                        checked={selectedPlan === PLAN_TYPES.TWELVE_TIMES}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Paiement sur 12 mois</span>
                          <span className="text-lg font-bold text-blue-600">{pricing.display.twelve_times}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">12 mensualités automatiques</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Société <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="Votre entreprise"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="jean@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                    placeholder="France"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Traitement en cours...' : 'Valider et payer'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Pack Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pack</h4>
                  <p className="text-lg font-bold text-gray-900">{PACK_NAMES[packId]}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Prix</h4>
                  <p className="text-3xl font-bold text-blue-600">{getDisplayPrice()}</p>
                  {selectedPlan !== PLAN_TYPES.ONE_SHOT && (
                    <p className="text-sm text-gray-500 mt-2">
                      Total: {pricing.display.total}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{PACK_NOTES[packId]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;