import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({
  title,
  description,
  keywords,
  image = 'https://israelbiz.preview.emergentagent.com/og-image.jpg',
  type = 'website',
  pathname = ''
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const siteUrl = 'https://www.israelgrowthventure.com';
  // Canonical should render the cleaner version? Or the current one?
  // Usually canonical points to the "main" version. If current page is ?lang=en, canonical should be self.
  // But strictly, if content is identical but translated, they are variants.

  // Let's assume canonical is always without query params for the "default" (fr)
  // and with query params for others? No, that's messy.

  // Best practice: 
  // Canonical: current page URL (absolute)
  // Alternates: distinct URLs for each language.

  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const canonicalUrl = `${siteUrl}${cleanPath}${currentLang !== 'fr' ? `?lang=${currentLang}` : ''}`;

  // Hreflang URLs
  const alternateUrls = {
    fr: `${siteUrl}${cleanPath}`,
    en: `${siteUrl}${cleanPath}?lang=en`,
    he: `${siteUrl}${cleanPath}?lang=he`
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} dir={currentLang === 'he' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags */}
      <link rel="alternate" hrefLang="fr" href={alternateUrls.fr} />
      <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
      <link rel="alternate" hrefLang="he" href={alternateUrls.he} />
      <link rel="alternate" hrefLang="x-default" href={alternateUrls.fr} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Israel Growth Venture" />
      <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : currentLang === 'en' ? 'en_US' : 'he_IL'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
    </Helmet>
  );
};

export default SEO;
