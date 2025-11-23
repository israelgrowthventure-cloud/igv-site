import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';

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

const API_BASE_URL = import.meta?.env?.VITE_API_URL || "https://igv-backend.onrender.com";

const Checkout = () => {
  const { packId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: ''
  });

  const pack = PACKS[packId];

  if (!pack) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pack introuvable</h1>
          <p className="text-gray-600 mb-6">Le pack que vous demandez n'existe pas.</p>
          <Link
            to="/packs"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retourner aux packs
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("👉 handleSubmit appelé, envoi de la commande...");
    setError(null);
    setLoading(true);

    try {
      // 1️⃣ Construire le payload conforme au backend
      const payload = {
        packId: pack.id,
        packName: pack.name,
        priceLabel: pack.priceLabel,
        customer: {
          fullName: formData.fullName.trim(),
          company: formData.company ? formData.company.trim() : null,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
        },
      };
      console.log("📦 Payload envoyé:", payload);

      // 2️⃣ Envoyer la requête POST au backend
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // 3️⃣ Gérer les erreurs HTTP (400, 500, etc.)
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Erreur backend:", response.status, text);
        
        // Message d'erreur plus détaillé selon le code
        let errorMessage = "Erreur lors de la création de la commande.";
        if (response.status === 400) {
          errorMessage = "Données invalides. Vérifiez vos informations.";
        } else if (response.status === 502) {
          errorMessage = "Erreur de paiement. Vérifiez votre configuration Stripe.";
        }
        
        throw new Error(errorMessage);
      }

      // 4️⃣ Parser la réponse JSON
      const data = await response.json();
      console.log("✅ Réponse du backend:", data);

      // 5️⃣ Vérifier que paymentUrl est présent et valide
      if (!data.paymentUrl || typeof data.paymentUrl !== 'string') {
        console.error("⚠️ paymentUrl manquant ou invalide dans la réponse:", data);
        throw new Error("URL de paiement non reçue du serveur. Réessayez.");
      }

      // 6️⃣ Rediriger vers Stripe Checkout
      console.log("🔗 Redirection vers Stripe:", data.paymentUrl);
      
      // Petit délai pour éviter les clics doubles (optionnel mais recommandé)
      setTimeout(() => {
        window.location.href = data.paymentUrl;
      }, 300);

    } catch (err) {
      console.error("⚠️ Erreur catch:", err.message);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

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
                  <p className="text-lg font-bold text-gray-900">{pack.name}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Prix</h4>
                  <p className="text-3xl font-bold text-blue-600">{pack.priceLabel}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{pack.note}</p>
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