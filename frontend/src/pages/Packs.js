// ============================================================
// ATTENTION - Layout final IGV validé (Phase 6 - Design V2)
// ============================================================
// Page Packs avec pricing dynamique géolocalisé + paiements Monetico.
// Design mis à jour pour correspondre à la charte Emergent.
// ============================================================

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import { packsAPI, pricingAPI } from '../utils/api';
import { toast } from 'sonner';
import ZoneSelector from '../components/ZoneSelector';

const Packs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { zone, country_name, isLoading: geoLoading } = useGeo();
  const [packs, setPacks] = useState([]);
  const [packsPricing, setPacksPricing] = useState({});
  const [loading, setLoading] = useState(true);

  // Fonction pour inverser les chiffres en hébreu (RTL)
  const formatPriceForLanguage = (priceString) => {
    if (!priceString) return '';

    if (i18n.language === 'he') {
      return priceString.replace(/\d[\d\s]*/g, (match) => {
        return match.split('').reverse().join('');
      });
    }
    return priceString;
  };

  useEffect(() => {
    const fetchPacksAndPricing = async () => {
      const DEFAULT_ZONE = 'EU';
      if (geoLoading) return;
      const effectiveZone = zone || DEFAULT_ZONE;

      try {
        const packsResponse = await packsAPI.getAll(true);
        const packsData = packsResponse.data;
        const sortedPacks = packsData.sort((a, b) => a.order - b.order);
        setPacks(sortedPacks);

        const getPackSlug = (pack) => {
          const nameSlugMap = {
            'Pack Analyse': 'analyse',
            'Pack Succursales': 'succursales',
            'Pack Franchise': 'franchise'
          };
          return nameSlugMap[pack.name?.fr || ''] || pack.slug || pack.id;
        };

        const pricingPromises = sortedPacks.map(async (pack) => {
          try {
            const packSlug = getPackSlug(pack);
            const priceResponse = await pricingAPI.calculatePrice(packSlug, effectiveZone);
            return { packId: pack.id, data: priceResponse.data };
          } catch (error) {
            console.error(`Error calculating price for pack ${pack.id}:`, error);
            return {
              packId: pack.id,
              data: {
                zone: effectiveZone,
                display: {
                  total: `${pack.base_price.toLocaleString()} EUR`,
                  three_times: `3 x ${Math.round(pack.base_price / 3).toLocaleString()} EUR`,
                  twelve_times: `12 x ${Math.round(pack.base_price / 12).toLocaleString()} EUR`
                }
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

    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached (10s), forcing loading end');
        setLoading(false);
      }
    }, 10000);

    fetchPacksAndPricing();
    return () => clearTimeout(timeoutId);
  }, [zone, geoLoading, t, loading]);

  const getPackSlug = (pack) => {
    const nameSlugMap = {
      'Pack Analyse': 'analyse',
      'Pack Succursales': 'succursales',
      'Pack Franchise': 'franchise'
    };
    const frenchName = pack.name?.fr || '';
    return nameSlugMap[frenchName] || pack.slug || pack.id;
  };

  const handleOrderPack = async (pack) => {
    const slug = getPackSlug(pack);
    const packPricing = packsPricing[pack.id];

    if (slug === 'analyse') {
      await handleMoneticoPayment(pack, packPricing);
    } else {
      showWireTransferInfo(pack, packPricing);
    }
  };

  const handleMoneticoPayment = async (pack, pricing) => {
    try {
      const { initMoneticoPayment, submitMoneticoForm } = await import('../api/paymentsApi');
      const slug = getPackSlug(pack);
      const amount = pricing?.price || pack.base_price || 0;
      const orderRef = `IGV-${slug.toUpperCase()}-${Date.now()}`;

      toast.info('Initialisation du paiement...');

      const formData = await initMoneticoPayment({
        pack: slug,
        amount: amount,
        currency: pricing?.currency || 'EUR',
        customer_email: 'client@example.com',
        customer_name: 'Client IGV',
        order_reference: orderRef
      });

      submitMoneticoForm(formData);

    } catch (error) {
      console.error('Monetico payment error:', error);
      toast.error(error.message || 'Paiement CB indisponible');
      setTimeout(() => {
        toast.info('Vous pouvez effectuer un virement bancaire');
        showWireTransferInfo(pack, pricing);
      }, 2000);
    }
  };

  const showWireTransferInfo = (pack, pricing) => {
    const slug = getPackSlug(pack);
    const amount = pricing?.display?.total || `${pack.base_price} EUR`;
    const orderRef = `IGV-${slug.toUpperCase()}-${Date.now()}`;

    toast.info(
      `Paiement par virement bancaire\n\n` +
      `Pack: ${pack.name.fr}\n` +
      `Montant: ${amount}\n` +
      `Référence: ${orderRef}\n\n` +
      `Merci de nous contacter pour recevoir les coordonnées bancaires (CIC France ou Mizrahi Israël)`,
      { duration: 8000 }
    );

    setTimeout(() => {
      navigate('/contact');
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-20 font-sans" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6 font-bold">
            {t('packs.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('packs.subtitle')}
          </p>

          <div className="flex justify-center items-center gap-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-48 rounded-md"></div>
            ) : (
              <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <span className="text-gray-600 mr-2 text-sm">{t('pricing.region')}:</span>
                <span className="font-bold text-blue-700">{country_name || 'International'}</span>
                <div className="ml-4">
                  <ZoneSelector />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Packs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack, index) => {
              const packPricing = packsPricing[pack.id];
              const isHighlighted = index === 1;
              const currentLang = i18n.language;

              return (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${isHighlighted
                      ? 'bg-white shadow-xl scale-105 border-2 border-blue-600 z-10'
                      : 'bg-white border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg'
                    }`}
                  data-testid={`pack-${pack.id}`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                        Recommandé
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 font-work-sans">
                      {pack.name[currentLang] || pack.name.fr || pack.name}
                    </h3>
                    <p className="text-sm text-gray-500 min-h-[40px]">
                      {pack.description[currentLang] || pack.description.fr || pack.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 pb-8 border-b border-gray-100">
                    {loading ? (
                      <div className="h-10 w-32 bg-gray-100 animate-pulse rounded"></div>
                    ) : packPricing ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPriceForLanguage(packPricing.display.total)}
                          </span>
                        </div>
                        {packPricing.display.three_times && (
                          <div className="mt-2 text-xs text-gray-400 font-medium">
                            ou {formatPriceForLanguage(packPricing.display.three_times)} / mois
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xl font-bold">{t('pricing.region')}</div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {(pack.features[currentLang] || pack.features.fr || pack.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleOrderPack(pack)}
                    className={`w-full btn-emergent ${isHighlighted
                        ? 'btn-primary shadow-lg shadow-blue-500/20'
                        : 'btn-secondary'
                      }`}
                    data-testid={`order-pack-${pack.id}`}
                  >
                    {t('packs.orderButton')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-work-sans">
            {t('packs.customPack.title')}
          </h2>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            {t('packs.customPack.description')}
          </p>
          <a
            href="mailto:contact@israelgrowthventure.com"
            className="btn-emergent btn-secondary"
            data-testid="custom-pack-contact"
          >
            <Mail className="w-5 h-5 mr-2" />
            {t('packs.customPack.contact')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Packs;
