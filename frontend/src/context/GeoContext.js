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
  });

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/geo`);
        
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
        });
      } catch (error) {
        console.error('Geo detection error:', error);
        setGeoData({
          ip: null,
          country_code: 'FR',
          country_name: 'France',
          zone: ZONES.EU,
          loading: false,
          error: error.message,
        });
      }
    };

    fetchGeoData();
  }, []);

  const value = {
    ...geoData,
    isLoading: geoData.loading,
  };

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};
