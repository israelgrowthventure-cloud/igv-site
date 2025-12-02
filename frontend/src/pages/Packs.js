import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import { API_BASE_URL } from '../config/apiConfig';
import { toast } from 'sonner';

const Packs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { zone, country_name, isLoading: geoLoading } = useGeo();
  const [packsPricing, setPacksPricing] = useState({});
  const [loading, setLoading] = useState(true);

  // Fonction pour inverser les chiffres en hébreu (RTL)
  const formatPriceForLanguage = (priceString) => {
    if (!priceString) return '';
    
    if (i18n.language === 'he') {
      // Pour l'hébreu, inverser uniquement les groupes de chiffres
      // Ex: "7 000 ₪" -> "000 7 ₪"
      return priceString.replace(/\d[\d\s]*/g, (match) => {
        // Inverser les chiffres et espaces dans le groupe
        return match.split('').reverse().join('');
      });
    }
    return priceString;
  };

  useEffect(() => {
    const fetchAllPricing = async () => {
      if (!zone || geoLoading) return;

      try {
        // Récupérer tous les packs et règles de pricing
        const [packsRes, pricingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/packs`),
          fetch(`${API_BASE_URL}/api/pricing-rules`)
        ]);

        const packs = await packsRes.json();
        const pricingRules = await pricingRes.json();

        // Trouver la règle de pricing pour la zone
        const rule = pricingRules.find(r => r.zone === zone) || pricingRules.find(r => r.zone === 'IL');
        
        // Calculer les prix pour chaque pack
        const pricingData = {};
        packs.forEach(pack => {
          const basePrice = pack.base_price;
          const adjustedPrice = Math.round(basePrice * rule.multiplier);
          
          pricingData[pack.slug] = {
            zone: rule.zone,
            display: {
              total: `${adjustedPrice.toLocaleString()} ${rule.currency}`,
              three_times: `3 x ${Math.round(adjustedPrice / 3).toLocaleString()} ${rule.currency}`,
              twelve_times: `12 x ${Math.round(adjustedPrice / 12).toLocaleString()} ${rule.currency}`
            }
          };
        });

        setPacksPricing(pricingData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pricing:', error);
        toast.error(t('errors.loading_packs'));
        setLoading(false);
      }
    };

    fetchAllPricing();
  }, [zone, geoLoading, t]);  // Configuration des packs
  const packsConfig = [
    {
      id: 'analyse',
      name: t('packs.analyse.name'),
      description: t('packs.analyse.description'),
      features: t('packs.analyse.features', { returnObjects: true }),
      note: t('packs.analyse.note'),
      highlighted: false,
      checkoutPath: '/checkout/analyse'
    },
    {
      id: 'succursales',
      name: t('packs.succursales.name'),
      description: t('packs.succursales.description'),
      features: t('packs.succursales.features', { returnObjects: true }),
      note: t('packs.succursales.note'),
      highlighted: true,
      checkoutPath: '/checkout/succursales'
    },
    {
      id: 'franchise',
      name: t('packs.franchise.name'),
      description: t('packs.franchise.description'),
      features: t('packs.franchise.features', { returnObjects: true }),
      note: t('packs.franchise.note'),
      highlighted: false,
      checkoutPath: '/checkout/franchise'
    }
  ];

  const handleOrderPack = (checkoutPath) => {
    navigate(checkoutPath);
  };

  return (
    <div className="min-h-screen pt-20" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('packs.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('packs.subtitle')}
          </p>
          {loading ? (
            <p className="text-sm text-gray-500">{t('pricing.detecting')}</p>
          ) : country_name && (
            <p className="text-sm text-gray-500">
              {t('pricing.region')} : <span className="font-semibold text-blue-600">{country_name}</span>
            </p>
          )}
        </div>
      </section>

      {/* Packs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packsConfig.map((pack) => {
              const packPricing = packsPricing[pack.id];
              
              return (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-8 ${
                    pack.highlighted
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-600 transition-colors shadow-lg'
                  }`}
                  data-testid={`pack-${pack.id}`}
                >
                  {pack.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-4 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                        POPULAIRE
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      pack.highlighted ? 'text-white' : 'text-gray-900'
                    }`}>
                      {pack.name}
                    </h3>
                    <p className={`text-sm ${
                      pack.highlighted ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {pack.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {loading ? (
                      <div className="text-xl font-bold">{t('checkout.loading')}</div>
                    ) : packPricing ? (
                      <div>
                        <div className={`text-4xl font-bold mb-2 ${
                          pack.highlighted ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPriceForLanguage(packPricing.display.total)}
                        </div>
                        <div className={`text-sm ${
                          pack.highlighted ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          <div>{t('pricing.or')} {formatPriceForLanguage(packPricing.display.three_times)}</div>
                          <div>{t('pricing.or')} {formatPriceForLanguage(packPricing.display.twelve_times)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl font-bold">{t('pricing.region')}</div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          pack.highlighted ? 'text-blue-200' : 'text-blue-600'
                        }`} />
                        <span className={`text-sm ${
                          pack.highlighted ? 'text-blue-50' : 'text-gray-600'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {pack.note && (
                    <p className={`text-xs mb-6 italic ${
                      pack.highlighted ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {pack.note}
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => handleOrderPack(pack.checkoutPath)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      pack.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('packs.customPack.title')}
          </h2>
          <p className="text-base text-gray-600 mb-6">
            {t('packs.customPack.description')}
          </p>
          <a
            href="mailto:contact@israelgrowthventure.com"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
