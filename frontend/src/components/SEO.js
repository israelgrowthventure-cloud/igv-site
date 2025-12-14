import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image = 'https://israelgrowthventure.com/og-image.jpg',
  type = 'website',
  pathname = ''
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const siteUrl = 'https://www.israelgrowthventure.com';
  const canonicalUrl = `${siteUrl}${pathname}`;
  
  // Hreflang URLs
  const alternateUrls = {
    fr: `${siteUrl}${pathname}`,
    en: `${siteUrl}/en${pathname}`,
    he: `${siteUrl}/he${pathname}`
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
