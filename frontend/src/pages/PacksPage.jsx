import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { packsAPI, pricingAPI } from '../utils/api';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PacksPage = () => {
  const { language } = useLanguage();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState({ price: 1000, currency: 'USD', zone: 'default' });

  useEffect(() => {
    loadPacks();
    detectCountryAndPricing();
  }, []);

  const loadPacks = async () => {
    try {
      const response = await packsAPI.getAll(true);
      setPacks(response.data);
    } catch (error) {
      console.error('Error loading packs:', error);
      toast.error('Error loading packs');
    } finally {
      setLoading(false);
    }
  };

  const detectCountryAndPricing = async () => {
    try {
      // In production, you'd get the actual IP
      // For now, use a default or from backend
      const response = await pricingAPI.getForCountry('US');
      setPricing(response.data);
    } catch (error) {
      console.error('Error detecting pricing:', error);
    }
  };

  const content = {
    fr: {
      title: 'Nos Offres',
      subtitle: 'Choisissez le pack adapté à vos besoins',
      loading: 'Chargement...',
      cta: 'Choisir cette offre',
      priceNote: `Prix pour votre région: ${pricing.price} ${pricing.currency}`,
    },
    en: {
      title: 'Our Packs',
      subtitle: 'Choose the pack that fits your needs',
      loading: 'Loading...',
      cta: 'Choose this offer',
      priceNote: `Price for your region: ${pricing.price} ${pricing.currency}`,
    },
    he: {
      title: 'החבילות שלנו',
      subtitle: 'בחרו את החבילה המתאימה לצרכים שלכם',
      loading: 'טוען...',
      cta: 'בחרו הצעה זו',
      priceNote: `מחיר לאזור שלך: ${pricing.price} ${pricing.currency}`,
    },
  };

  const currentContent = content[language] || content.fr;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner" data-testid="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-white" data-testid="packs-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" data-testid="packs-title">
              {currentContent.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4" data-testid="packs-subtitle">
              {currentContent.subtitle}
            </p>
            <p className="text-sm text-[#0052CC] font-medium" data-testid="price-note">
              {currentContent.priceNote}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packs.map((pack, index) => (
              <div
                key={pack.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#0052CC]"
                data-testid={`pack-card-${index}`}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`pack-name-${index}`}>
                    {pack.name[language] || pack.name.fr || pack.name.en}
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid={`pack-description-${index}`}>
                    {pack.description[language] || pack.description.fr || pack.description.en}
                  </p>
                  <div className="text-3xl font-bold text-[#0052CC] mb-6" data-testid={`pack-price-${index}`}>
                    {pricing.price} {pricing.currency}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(pack.features[language] || pack.features.fr || pack.features.en || []).map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start space-x-2" data-testid={`pack-feature-${index}-${fIndex}`}>
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/checkout/${pack.id}`}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#0052CC] text-white rounded-lg font-semibold hover:bg-[#003D99] transition-all duration-300"
                    data-testid={`pack-cta-button-${index}`}
                  >
                    {currentContent.cta}
                    <ArrowRight className="ml-2" size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PacksPage;

