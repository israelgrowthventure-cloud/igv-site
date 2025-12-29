import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Check, Mail } from 'lucide-react';
import { api } from '../utils/api';
import { getPricing } from '../utils/pricing';
import { toast } from 'sonner';

const Packs = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.detectLocation().then(data => {
      setLocation(data);
      setPricing(getPricing(data.region));
      setLoading(false);
    }).catch(() => {
      setLocation({ region: 'europe', country: 'France', currency: '€' });
      setPricing(getPricing('europe'));
      setLoading(false);
    });
  }, []);

  const packs = [
    {
      id: 'analyse',
      name: t('packs.analyse.name'),
      description: t('packs.analyse.description'),
      features: t('packs.analyse.features', { returnObjects: true }),
      note: t('packs.analyse.note'),
      highlighted: false
    },
    {
      id: 'succursales',
      name: t('packs.succursales.name'),
      description: t('packs.succursales.description'),
      features: t('packs.succursales.features', { returnObjects: true }),
      highlighted: true
    },
    {
      id: 'franchise',
      name: t('packs.franchise.name'),
      description: t('packs.franchise.description'),
      features: t('packs.franchise.features', { returnObjects: true }),
      highlighted: false
    }
  ];

  const handleContactAboutPack = (packName) => {
    window.location.href = `mailto:israel.growth.venture@gmail.com?subject=Demande d'information - ${packName}`;
  };

  const handleRequestInvoice = (packId, packName) => {
    if (!pricing) {
      toast.error('Pricing information not available');
      return;
    }

    const packPrice = pricing.packs[packId];
    window.location.href = `mailto:israel.growth.venture@gmail.com?subject=Demande de facture - ${packName}&body=Bonjour,%0D%0A%0D%0AJe souhaite obtenir une facture pour le ${packName}.%0D%0APrix: ${packPrice.label}%0D%0A%0D%0AMerci`;
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pt-20">
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
          ) : location && (
            <p className="text-sm text-gray-500">
              {t('pricing.region')}: <span className="font-semibold text-blue-600">{location.country}</span>
            </p>
          )}
        </div>
      </section>

      {/* Packs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack) => {
              const packPrice = pricing?.packs[pack.id];
              
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
                      <div className="text-xl font-bold">{t('pricing.detecting')}</div>
                    ) : packPrice ? (
                      <div>
                        <div className={`text-4xl font-bold ${
                          pack.highlighted ? 'text-white' : 'text-gray-900'
                        }`}>
                          {packPrice.label}
                        </div>
                        <div className={`text-xs mt-1 ${
                          pack.highlighted ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {location?.country || 'International'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl font-bold">Prix sur demande</div>
                        <div className="text-xs mt-1 text-gray-500">International</div>
                      </div>
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

                  {/* CTAs */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRequestInvoice(pack.id, pack.name)}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        pack.highlighted
                          ? 'bg-white text-blue-600 hover:bg-gray-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      data-testid={`request-invoice-${pack.id}`}
                    >
                      {t('packs.cta')}
                    </button>
                    <button
                      onClick={() => handleContactAboutPack(pack.name)}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                        pack.highlighted
                          ? 'border-2 border-white text-white hover:bg-white/10'
                          : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                      data-testid={`talk-about-${pack.id}`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>{t('packs.ctaTalk')}</span>
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
            Besoin d'un pack personnalisé ?
          </h2>
          <p className="text-base text-gray-600 mb-6">
            Chaque projet est unique. Contactez-nous pour discuter d'une solution sur mesure adaptée à vos besoins spécifiques.
          </p>
          <a
            href="mailto:israel.growth.venture@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="custom-pack-contact"
          >
            <Mail className="w-5 h-5 mr-2" />
            Nous contacter
          </a>
        </div>
      </section>
    </div>
    </>
  );
};

export default Packs;
