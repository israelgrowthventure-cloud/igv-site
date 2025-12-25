import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, FileText, Mail, Trash2 } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <>
      <Helmet>
        <title>{t('gdpr.privacy.page_title') || 'Politique de confidentialité - IGV'}</title>
        <html lang={i18n.language} dir={isRTL ? 'rtl' : 'ltr'} />
      </Helmet>

      <div className={`min-h-screen bg-gray-50 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold">{t('gdpr.privacy.title') || 'Politique de confidentialité'}</h1>
            </div>

            <p className="text-gray-600 mb-8">
              {t('gdpr.privacy.intro') || 'Dernière mise à jour : Décembre 2024. Cette politique décrit comment Israel Growth Venture collecte, utilise et protège vos données personnelles.'}
            </p>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.privacy.section1.title') || '1. Données collectées'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    {t('gdpr.privacy.section1.p1') || 'Nous collectons uniquement les données nécessaires pour vous fournir nos services :'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t('gdpr.privacy.section1.data1') || 'Informations de contact : nom, email, téléphone, entreprise'}</li>
                    <li>{t('gdpr.privacy.section1.data2') || 'Données de navigation : adresse IP (anonymisée), pages visitées, durée'}</li>
                    <li>{t('gdpr.privacy.section1.data3') || 'Préférences : langue, consentement cookies'}</li>
                  </ul>
                  <p className="font-semibold text-blue-600">
                    {t('gdpr.privacy.section1.important') || 'Important : Aucune donnée de navigation n\'est collectée sans votre consentement explicite.'}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.privacy.section2.title') || '2. Utilisation des données'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>{t('gdpr.privacy.section2.p1') || 'Vos données sont utilisées pour :'}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t('gdpr.privacy.section2.use1') || 'Répondre à vos demandes de renseignements'}</li>
                    <li>{t('gdpr.privacy.section2.use2') || 'Générer des analyses personnalisées (mini-analyses)'}</li>
                    <li>{t('gdpr.privacy.section2.use3') || 'Améliorer nos services (avec consentement analytique)'}</li>
                    <li>{t('gdpr.privacy.section2.use4') || 'Vous envoyer notre newsletter (opt-in explicite uniquement)'}</li>
                  </ul>
                  <p className="font-semibold text-blue-600">
                    {t('gdpr.privacy.section2.important') || 'Nous ne vendons jamais vos données à des tiers.'}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.privacy.section3.title') || '3. Protection des données'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>{t('gdpr.privacy.section3.p1') || 'Nous prenons la sécurité de vos données très au sérieux :'}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t('gdpr.privacy.section3.security1') || 'Chiffrement SSL/TLS pour toutes les communications'}</li>
                    <li>{t('gdpr.privacy.section3.security2') || 'Stockage sécurisé sur serveurs conformes RGPD'}</li>
                    <li>{t('gdpr.privacy.section3.security3') || 'Accès restreint aux données (équipe autorisée uniquement)'}</li>
                    <li>{t('gdpr.privacy.section3.security4') || 'Anonymisation des adresses IP'}</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.privacy.section4.title') || '4. Newsletter et marketing'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    {t('gdpr.privacy.section4.p1') || 'Nous n\'envoyons la newsletter qu\'aux personnes ayant explicitement accepté de la recevoir via une case à cocher dédiée.'}
                  </p>
                  <p>
                    {t('gdpr.privacy.section4.p2') || 'Vous pouvez vous désinscrire à tout moment en cliquant sur le lien de désinscription dans chaque email ou en nous contactant.'}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">{t('gdpr.privacy.section5.title') || '5. Vos droits'}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>{t('gdpr.privacy.section5.p1') || 'Conformément au RGPD, vous avez le droit de :'}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t('gdpr.privacy.section5.right1') || 'Accéder à vos données personnelles'}</li>
                    <li>{t('gdpr.privacy.section5.right2') || 'Rectifier des données inexactes'}</li>
                    <li>{t('gdpr.privacy.section5.right3') || 'Demander l\'effacement de vos données'}</li>
                    <li>{t('gdpr.privacy.section5.right4') || 'Limiter le traitement de vos données'}</li>
                    <li>{t('gdpr.privacy.section5.right5') || 'Porter réclamation auprès de la CNIL'}</li>
                  </ul>
                  <p className="mt-4">
                    {t('gdpr.privacy.section5.contact') || 'Pour exercer ces droits, contactez-nous à :'}{' '}
                    <a href="mailto:contact@israelgrowthventure.com" className="text-blue-600 hover:underline font-semibold">
                      contact@israelgrowthventure.com
                    </a>
                  </p>
                </div>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-4">{t('gdpr.privacy.section6.title') || 'Contact'}</h2>
                <p className="text-gray-700">
                  {t('gdpr.privacy.section6.p1') || 'Pour toute question sur cette politique ou vos données personnelles :'}
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold">Israel Growth Venture</p>
                  <p>Email : <a href="mailto:contact@israelgrowthventure.com" className="text-blue-600 hover:underline">contact@israelgrowthventure.com</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
