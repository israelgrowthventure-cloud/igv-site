import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import { packsAPI, pricingAPI } from '../utils/api';
import { pagesAPI } from '../utils/api';
import { toast } from 'sonner';

const Packs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { zone, country_name, isLoading: geoLoading } = useGeo();
  const [packs, setPacks] = useState([]);
  const [packsPricing, setPacksPricing] = useState({});
  const [loading, setLoading] = useState(true);
  const [cmsContent, setCmsContent] = useState(null);
  const [loadingCMS, setLoadingCMS] = useState(true);

  // Tenter de charger le contenu CMS
  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const response = await pagesAPI.getBySlug('packs');
        if (response.data && response.data.published && response.data.content_html) {
          setCmsContent(response.data);
        }
      } catch (error) {
        console.log('CMS content not available for packs, using React fallback');
      } finally {
        setLoadingCMS(false);
      }
    };
    loadCMSContent();
  }, []);

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
    const fetchPacksAndPricing = async () => {
      if (!zone || geoLoading) return;

      try {
        // Récupérer les packs actifs du backend
        const packsResponse = await packsAPI.getAll(true);
        const packsData = packsResponse.data;
        
        // Trier par ordre
        const sortedPacks = packsData.sort((a, b) => a.order - b.order);
        setPacks(sortedPacks);

        // Helper pour convertir pack en slug
        const getPackSlug = (pack) => {
          const nameSlugMap = {
            'Pack Analyse': 'analyse',
            'Pack Succursales': 'succursales',
            'Pack Franchise': 'franchise'
          };
          return nameSlugMap[pack.name?.fr || ''] || pack.slug || pack.id;
        };

        // Calculer les prix pour chaque pack selon la zone
        const pricingData = {};
        for (const pack of sortedPacks) {
          try {
            // ✅ CORRECTION: Utiliser le slug au lieu de l'UUID
            const packSlug = getPackSlug(pack);
            const priceResponse = await pricingAPI.calculatePrice(packSlug, zone);
            pricingData[pack.id] = priceResponse.data;
          } catch (error) {
            console.error(`Error calculating price for pack ${pack.id}:`, error);
            // Fallback avec prix de base
            pricingData[pack.id] = {
              zone: zone,
              display: {
                total: `${pack.base_price.toLocaleString()} EUR`,
                three_times: `3 x ${Math.round(pack.base_price / 3).toLocaleString()} EUR`,
                twelve_times: `12 x ${Math.round(pack.base_price / 12).toLocaleString()} EUR`
              }
            };
          }
        }

        setPacksPricing(pricingData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching packs:', error);
        toast.error(t('errors.loading_packs') || 'Error loading packs');
        setLoading(false);
      }
    };

    fetchPacksAndPricing();
  }, [zone, geoLoading, t]);

  // Si le contenu CMS est disponible, l'afficher
  if (!loadingCMS && cmsContent) {
    return (
      <div className="cms-packs-page">
        <style dangerouslySetInnerHTML={{ __html: cmsContent.content_css }} />
        <div dangerouslySetInnerHTML={{ __html: cmsContent.content_html }} />
      </div>
    );
  }

  // Mapping UUID des packs vers leurs slugs pour le checkout
  const getPackSlug = (pack) => {
    const nameSlugMap = {
      'Pack Analyse': 'analyse',
      'Pack Succursales': 'succursales',
      'Pack Franchise': 'franchise'
    };
    const frenchName = pack.name?.fr || '';
    return nameSlugMap[frenchName] || pack.slug || pack.id;
  };

  const handleOrderPack = (pack) => {
    const slug = getPackSlug(pack);
    navigate(`/checkout/${slug}`);
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
            {packs.map((pack, index) => {
              const packPricing = packsPricing[pack.id];
              const isHighlighted = index === 1; // Le pack du milieu est mis en avant
              const currentLang = i18n.language;
              
              return (
                <div
                  key={pack.id}
                  className={`relative rounded-2xl p-8 ${
                    isHighlighted
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-600 transition-colors shadow-lg'
                  }`}
                  data-testid={`pack-${pack.id}`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block px-4 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                        POPULAIRE
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isHighlighted ? 'text-white' : 'text-gray-900'
                    }`}>
                      {pack.name[currentLang] || pack.name.fr || pack.name}
                    </h3>
                    <p className={`text-sm ${
                      isHighlighted ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {pack.description[currentLang] || pack.description.fr || pack.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {loading ? (
                      <div className="text-xl font-bold">{t('checkout.loading')}</div>
                    ) : packPricing ? (
                      <div>
                        <div className={`text-4xl font-bold mb-2 ${
                          isHighlighted ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatPriceForLanguage(packPricing.display.total)}
                        </div>
                        <div className={`text-sm ${
                          isHighlighted ? 'text-blue-100' : 'text-gray-600'
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
                    {(pack.features[currentLang] || pack.features.fr || pack.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isHighlighted ? 'text-blue-200' : 'text-blue-600'
                        }`} />
                        <span className={`text-sm ${
                          isHighlighted ? 'text-blue-50' : 'text-gray-600'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleOrderPack(pack)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      isHighlighted
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
