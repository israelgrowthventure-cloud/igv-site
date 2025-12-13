import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Mail, Loader2, CreditCard } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import ZoneSelector from '../components/ZoneSelector';
import axios from 'axios';
import { toast } from 'sonner';
import { initMoneticoPayment, submitMoneticoForm } from '../utils/paymentApi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Packs = () => {
  const { t, i18n } = useTranslation();
  const { zone, country_name, symbol, isLoading: geoLoading } = useGeo();
  const [packs, setPacks] = useState([]);
  const [packsPricing, setPacksPricing] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);

  useEffect(() => {
    const fetchPacksAndPricing = async () => {
      if (geoLoading) return;

      try {
        // Fetch packs from backend
        const packsResponse = await axios.get(`${BACKEND_URL}/api/packs`);
        const packsData = packsResponse.data.data;
        setPacks(packsData);

        // Fetch pricing for each pack
        const pricingPromises = packsData.map(async (pack) => {
          try {
            const priceResponse = await axios.get(
              `${BACKEND_URL}/api/pricing/${pack.slug}/${zone}`
            );
            return { packId: pack.id, data: priceResponse.data.data };
          } catch (error) {
            console.error(`Error getting price for ${pack.slug}:`, error);
            return {
              packId: pack.id,
              data: {
                price: pack.base_price,
                display: { total: `${pack.base_price} EUR` }
              }
            };
          }
        });

        const pricingResults = await Promise.all(pricingPromises);
        const pricingData = {};
        pricingResults.forEach(result => {
          pricingData[result.packId] = result.data;
        });

        setPacksPricing(pricingData);
      } catch (error) {
        console.error('Error fetching packs:', error);
        toast.error(t('errors.loading_packs') || 'Error loading packs');
      } finally {
        setLoading(false);
      }
    };

    fetchPacksAndPricing();
  }, [zone, geoLoading, t]);

  const handleContactPack = (pack) => {
    const subject = `Demande d'information - ${pack.name[i18n.language] || pack.name.fr}`;
    window.location.href = `mailto:israel.growth.venture@gmail.com?subject=${encodeURIComponent(subject)}`;
  };

  const handlePaymentPack = async (pack) => {
    const packPricing = packsPricing[pack.id];
    if (!packPricing) {
      toast.error('Prix non disponible');
      return;
    }

    setPaymentLoading(pack.id);

    try {
      // Generate unique order reference
      const orderRef = `IGV-${pack.slug.toUpperCase()}-${Date.now()}`;

      // Prompt for customer details
      const customerEmail = prompt('Votre email:');
      if (!customerEmail) {
        setPaymentLoading(null);
        return;
      }

      const customerName = prompt('Votre nom complet:');
      if (!customerName) {
        setPaymentLoading(null);
        return;
      }

      // Initialize payment
      const response = await initMoneticoPayment({
        pack_slug: pack.slug,
        amount: packPricing.price,
        currency: packPricing.currency,
        customer_email: customerEmail,
        customer_name: customerName,
        order_reference: orderRef
      });

      // Submit form to Monetico
      submitMoneticoForm(response.form_data, response.monetico_url);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Erreur lors du paiement');
      setPaymentLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('packs.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t('packs.subtitle')}
          </p>

          {/* Zone Selector */}
          <div className="flex justify-center items-center gap-4">
            {loading || geoLoading ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">{t('pricing.detecting') || 'Detecting location...'}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t('pricing.region') || 'Region'}:</span>
                  <span className="font-semibold text-blue-600">{country_name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-mono font-bold text-gray-900">{symbol}</span>
                </div>
                <ZoneSelector />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Packs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack, index) => {
              const packPricing = packsPricing[pack.id];
              const isHighlighted = index === 1; // Middle pack highlighted
              const currentLang = i18n.language;

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${isHighlighted
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105 border-2 border-blue-600'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-400 shadow-lg hover:shadow-xl'
                    }`}
                  data-testid={`pack-${pack.slug}`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-4 py-1.5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                        {currentLang === 'fr' ? 'Recommandé' : currentLang === 'en' ? 'Recommended' : 'מומלץ'}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-3 ${isHighlighted ? 'text-white' : 'text-gray-900'
                      }`}>
                      {pack.name[currentLang] || pack.name.fr}
                    </h3>
                    <p className={`text-sm ${isHighlighted ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                      {pack.description[currentLang] || pack.description.fr}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b ${isHighlighted ? 'border-blue-400' : 'border-gray-200'}">
                    {loading || geoLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Chargement...</span>
                      </div>
                    ) : packPricing ? (
                      <div>
                        <div className={`text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'
                          }`}>
                          {packPricing.display.total}
                        </div>
                        {packPricing.display.three_times && (
                          <div className={`mt-2 text-xs ${isHighlighted ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                            {currentLang === 'fr' ? 'ou' : currentLang === 'en' ? 'or' : 'או'} {packPricing.display.three_times}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xl font-bold">Prix sur demande</div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {(pack.features[currentLang] || pack.features.fr || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${isHighlighted ? 'bg-blue-400 text-white' : 'bg-blue-50 text-blue-600'
                          }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${isHighlighted ? 'text-blue-50' : 'text-gray-700'
                          }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePaymentPack(pack)}
                      disabled={paymentLoading === pack.id}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 ${isHighlighted
                          ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      data-testid={`pay-pack-${pack.slug}`}
                    >
                      {paymentLoading === pack.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {t('packs.paying') || 'Traitement...'}
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          {t('packs.pay') || 'Payer maintenant'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleContactPack(pack)}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 ${isHighlighted
                          ? 'border-2 border-white text-white hover:bg-white/10'
                          : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                        }`}
                      data-testid={`contact-pack-${pack.slug}`}
                    >
                      <Mail size={18} />
                      {t('packs.contact') || 'Nous contacter'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('packs.customPack.title') || 'Besoin d\'un pack personnalisé ?'}
          </h2>
          <p className="text-base text-gray-600 mb-6">
            {t('packs.customPack.description') || 'Chaque projet est unique. Contactez-nous pour discuter d\'une solution sur mesure.'}
          </p>
          <a
            href="mailto:israel.growth.venture@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            data-testid="custom-pack-contact"
          >
            <Mail className="w-5 h-5 mr-2" />
            {t('packs.customPack.contact') || 'Nous contacter'}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Packs;
