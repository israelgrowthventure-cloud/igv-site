// ============================================================
// ATTENTION - Layout final IGV validé (Phase 6 - Design V2)
// ============================================================
// Page Packs avec pricing dynamique géolocalisé + paiements Monetico.
// 3 packs: Analyse (CB Monetico), Succursales/Franchise (virements).
// Stripe retiré de l'interface (code backend conservé en legacy).
// 
// NE PAS MODIFIER la structure sans demande explicite du client.
// Modifications futures : via backend packs/pricing uniquement.
// ============================================================

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import { useGeo } from '../context/GeoContext';
import { packsAPI, pricingAPI } from '../utils/api';
import { pagesAPI } from '../utils/api';
import { toast } from 'sonner';
import ZoneSelector from '../components/ZoneSelector';

const Packs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { zone, country_name, isLoading: geoLoading, setZoneManually, error: geoError } = useGeo();
  const [packs, setPacks] = useState([]);
  const [packsPricing, setPacksPricing] = useState({});
  const [loading, setLoading] = useState(true);
  // CMS overlay logic removed: always render React v2 Packs page

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
      const DEFAULT_ZONE = 'EU'; // Zone par défaut si géolocalisation échoue
      
      // Attendre que la géolocalisation soit terminée
      if (geoLoading) return;
      
      // Utiliser la zone détectée ou la zone par défaut
      const effectiveZone = zone || DEFAULT_ZONE;
      
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

        // ✅ AMÉLIORATION: Paralléliser les appels pricing avec Promise.all
        const pricingPromises = sortedPacks.map(async (pack) => {
          try {
            const packSlug = getPackSlug(pack);
            const priceResponse = await pricingAPI.calculatePrice(packSlug, effectiveZone);
            return { packId: pack.id, data: priceResponse.data };
          } catch (error) {
            console.error(`Error calculating price for pack ${pack.id}:`, error);
            // Fallback avec prix de base
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
        
        // Construire l'objet pricingData à partir des résultats
        const pricingData = {};
        pricingResults.forEach(result => {
          pricingData[result.packId] = result.data;
        });

        setPacksPricing(pricingData);
      } catch (error) {
        console.error('Error fetching packs:', error);
        toast.error(t('errors.loading_packs') || 'Error loading packs');
      } finally {
        // ✅ GARANTIE: setLoading(false) toujours appelé
        setLoading(false);
      }
    };

    // ✅ SÉCURITÉ: Timeout de 10 secondes pour forcer la fin du loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached (10s), forcing loading end');
        setLoading(false);
      }
    }, 10000);

    fetchPacksAndPricing();
    
    return () => clearTimeout(timeoutId);
  }, [zone, geoLoading, t, loading]);

  // CMS overlay logic removed: always render React v2 Packs page

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

  // ============================================================
  // GESTION PAIEMENTS - Phase 6 (Monetico + Virements)
  // ============================================================
  // Pack Analyse: CB via Monetico prioritaire + virement optionnel
  // Packs Succursales/Franchise: Virement uniquement (montants élevés)
  // Stripe retiré de l'interface utilisateur (code backend conservé en legacy)
  // ============================================================
  
  const handleOrderPack = async (pack) => {
    const slug = getPackSlug(pack);
    const packPricing = packsPricing[pack.id];

    // Pack Analyse = paiement CB Monetico
    if (slug === 'analyse') {
      await handleMoneticoPayment(pack, packPricing);
    } 
    // Autres packs = virement bancaire uniquement
    else {
      showWireTransferInfo(pack, packPricing);
    }
  };

  const handleMoneticoPayment = async (pack, pricing) => {
    try {
      const { initMoneticoPayment, submitMoneticoForm } = await import('../api/paymentsApi');
      
      const slug = getPackSlug(pack);
      const amount = pricing?.price || pack.base_price || 0;
      
      // Générer référence commande unique
      const orderRef = `IGV-${slug.toUpperCase()}-${Date.now()}`;

      toast.info('Initialisation du paiement...');

      const formData = await initMoneticoPayment({
        pack: slug,
        amount: amount,
        currency: pricing?.currency || 'EUR',
        customer_email: 'client@example.com', // TODO: Récupérer email utilisateur connecté
        customer_name: 'Client IGV', // TODO: Récupérer nom utilisateur
        order_reference: orderRef
      });

      // Soumettre le formulaire Monetico
      submitMoneticoForm(formData);

    } catch (error) {
      console.error('Monetico payment error:', error);
      
      // Si Monetico non disponible, proposer virement
      toast.error(error.message || 'Paiement CB indisponible');
      
      // Afficher alternative virement après 2s
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

    // TODO Phase 7: Créer modal dédiée virements avec RIB
    toast.info(
      `Paiement par virement bancaire\n\n` +
      `Pack: ${pack.name.fr}\n` +
      `Montant: ${amount}\n` +
      `Référence: ${orderRef}\n\n` +
      `Merci de nous contacter pour recevoir les coordonnées bancaires (CIC France ou Mizrahi Israël)`,
      { duration: 8000 }
    );
    
    // Redirection vers contact
    setTimeout(() => {
      navigate('/contact');
    }, 3000);
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
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
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
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
