import React from 'react';
import { Helmet } from 'react-helmet-async';

const SchemaOrg = ({ type = 'LocalBusiness', data = {} }) => {
  const getSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      name: 'Israel Growth Venture',
      description: 'Votre partenaire stratégique pour une expansion réussie en Israël',
      url: 'https://www.israelgrowthventure.com',
      telephone: '+972-XX-XXX-XXXX',
      email: 'israel.growth.venture@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '21 Rue Gefen',
        addressLocality: 'Harish',
        addressCountry: 'IL'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 32.45,
        longitude: 35.05
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        }
      ],
      priceRange: '€€€',
      areaServed: {
        '@type': 'Country',
        name: 'Israel'
      },
      ...data
    };

    return baseSchema;
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getSchema())}
      </script>
    </Helmet>
  );
};

export default SchemaOrg;
