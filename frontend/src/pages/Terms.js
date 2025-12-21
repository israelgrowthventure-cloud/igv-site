import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Legal & Privacy | Israel Growth Venture</title>
        <meta name="description" content="Terms of service, privacy policy, and legal information for Israel Growth Venture." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" content="https://israelgrowthventure.com/legal" />
      </Helmet>
      <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.terms')}
          </h1>
          <p className="text-base text-gray-600">
            Dernière mise à jour : Juin 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto prose prose-blue">
          {/* Company Info */}
          <div className="mb-12 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Israel Growth Venture (IGV)</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">Type d'entreprise:</p>
                <p className="text-gray-600">Essek Mourché (עוסק מורשה) – Entreprise enregistrée</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Numéro d'identification:</p>
                <p className="text-gray-600">319258083</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Adresse:</p>
                <p className="text-gray-600">21 Rue Gefen, Harish, Israël</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email:</p>
                <p className="text-gray-600">contact@israelgrowthventure.com</p>
              </div>
            </div>
          </div>

          {/* Article 1 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 – Objet</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation et de Vente (ci-après "CGUV") définissent les droits et obligations des parties dans le cadre de l'utilisation du site web et des services proposés par Israel Growth Venture, une entreprise spécialisée dans le développement commercial en Israël.
            </p>
          </div>

          {/* Article 2 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 – Acceptation des conditions</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              L'utilisation des services d'IGV implique l'acceptation pleine et entière des présentes CGUV. Elles s'appliquent à toute demande, devis, contrat ou prestation de services.
            </p>
          </div>

          {/* Article 3 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 – Description des services</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              IGV fournit des services comprenant (mais sans s'y limiter) :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-gray-700">
              <li>Études de marché ciblées pour Israël</li>
              <li>Développement de franchises et de succursales</li>
              <li>Conseil en localisation (régions, villes, zones commerciales)</li>
              <li>Support stratégique et juridique</li>
              <li>Connexion avec des partenaires locaux et les autorités</li>
              <li>Programmes de développement sur 3, 5 et 10 ans</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              Les services sont personnalisés en fonction de la nature du projet et de la géolocalisation du client.
            </p>
          </div>

          {/* Article 4 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 – Commandes et modalités de paiement</h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Commandes</h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Toute commande nécessite un accord écrit, un devis signé ou un paiement en ligne. L'activation du service ne débute qu'après réception du paiement.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Tarification</h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Les prix varient en fonction de la localisation géographique du client (détectée automatiquement via l'adresse IP ou sélectionnée manuellement). Le contrat d'expansion commerciale comprend des frais d'ouverture de dossier (définis au cas par cas) et des commissions sur la location ou la vente de biens immobiliers commerciaux générés par IGV.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Paiement</h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Le paiement peut être effectué par :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-gray-700 mb-4">
              <li>Virement bancaire</li>
              <li>Carte de crédit via PayPal ou un autre fournisseur</li>
              <li>Toute autre méthode convenue mutuellement</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4.4 Retards de paiement</h3>
            <p className="text-base text-gray-700 leading-relaxed">
              En cas de retard de paiement, IGV peut appliquer des pénalités conformément à l'article 5 de la loi israélienne sur les contrats.
            </p>
          </div>

          {/* Article 5 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 – Annulation / Rétractation / Remboursement</h2>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
              <p className="text-base text-gray-700 leading-relaxed">
                Conformément à la loi israélienne sur la protection des consommateurs (חוק הגנת הצרכן, 1981) :
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-base text-gray-700">
              <li>Un client privé peut annuler un service dans les 14 jours suivant la signature, sauf si le service a déjà commencé.</li>
              <li>Aucun remboursement ne sera accordé pour les services partiellement ou entièrement livrés, sauf dans des cas spécifiques définis par contrat.</li>
              <li>Les politiques d'annulation pour les services B2B sont définies au cas par cas.</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed mt-4">
              <strong>Note :</strong> Étant donné que le paiement est effectué uniquement lorsque le client lance l'analyse, aucun remboursement n'est applicable après l'activation du service.
            </p>
          </div>

          {/* Article 6 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 – Confidentialité</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              IGV s'engage à respecter la loi israélienne sur la protection de la vie privée (חוק הגנת הפרטיות, 1981). Toutes les informations fournies lors de la prestation de services seront traitées avec une stricte confidentialité. Aucune information ne sera divulguée à des tiers sans consentement écrit, sauf si la loi l'exige.
            </p>
          </div>

          {/* Article 7 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 – Propriété intellectuelle</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Tous les matériaux fournis ou publiés par IGV (rapports, études, stratégies, visuels, textes, outils) restent la propriété exclusive d'IGV. Aucune reproduction ou distribution n'est autorisée sans consentement écrit préalable, conformément à la loi israélienne sur le droit d'auteur (חוק זכויות יוצרים, 2007).
            </p>
          </div>

          {/* Article 8 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 – Responsabilité</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              IGV s'engage à une obligation de moyens dans la réalisation de ses services. IGV ne peut être tenu responsable d'un échec commercial dû à des facteurs externes (conditions de marché, partenaires, réglementations, force majeure...). IGV ne sera pas tenu responsable des dommages indirects, pertes de profits ou préjudices immatériels.
            </p>
          </div>

          {/* Article 9 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 – Loi applicable et juridiction</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Les présentes CGUV sont régies par le droit israélien. Tout litige sera soumis à la juridiction exclusive des tribunaux de Tel Aviv-Yafo.
            </p>
          </div>

          {/* Charte éthique */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Charte éthique IGV</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base text-gray-700">
              <li>IGV agit avec intégrité, transparence et neutralité.</li>
              <li>Aucun projet discriminatoire, activité illégale ou action violant la dignité humaine ne sera accepté.</li>
              <li>IGV privilégie les initiatives durables, justes et ancrées localement.</li>
              <li>Tous les partenariats sont basés sur le respect mutuel et la communication professionnelle.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Terms;
