import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { ZONES } from '../config/pricingConfig';

const GeoContext = createContext();

export const useGeo = () => {
  const context = useContext(GeoContext);
  if (!context) {
    throw new Error('useGeo must be used within GeoProvider');
  }
  return context;
};

export const GeoProvider = ({ children }) => {
  const [geoData, setGeoData] = useState({
    ip: null,
    country_code: null,
    country_name: null,
    zone: ZONES.EU, // Défaut
    loading: true,
    error: null,
    isManuallySet: false,
  });

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        // ✅ AMÉLIORATION: Ajout d'un timeout de 1 seconde
        const fetchPromise = fetch(`${API_BASE_URL}/api/geo`);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Geolocation timeout')), 1000)
        );

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
          throw new Error('Failed to fetch geo data');
        }

        const data = await response.json();

        setGeoData({
          ip: data.ip,
          country_code: data.country_code,
          country_name: data.country_name,
          zone: data.zone,
          loading: false,
          error: null,
          isManuallySet: false,
        });
      } catch (error) {
        console.warn('Geo detection failed or timeout, using default zone:', error.message);
        // ✅ AMÉLIORATION: Fallback immédiat vers zone par défaut
        setGeoData({
          ip: null,
          country_code: 'FR',
          country_name: 'France',
          zone: ZONES.EU,
          loading: false,
          error: error.message,
          isManuallySet: false,
        });
      }
    };

    fetchGeoData();
  }, []);

  // ✅ NOUVEAU: Fonction pour définir manuellement la zone
  const setZoneManually = (zone) => {
    setGeoData(prev => ({
      ...prev,
      zone,
      isManuallySet: true,
    }));
  };

  const value = {
    ...geoData,
    isLoading: geoData.loading,
    setZoneManually, // Exposer la fonction
  };

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};
