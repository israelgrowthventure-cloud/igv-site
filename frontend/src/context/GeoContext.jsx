import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GeoContext = createContext();

export const useGeo = () => {
    const context = useContext(GeoContext);
    if (!context) {
        throw new Error('useGeo must be used within GeoProvider');
    }
    return context;
};

export const GeoProvider = ({ children }) => {
    const [zone, setZone] = useState('EU'); // Default to EU
    const [countryCode, setCountryCode] = useState('FR');
    const [countryName, setCountryName] = useState('France');
    const [currency, setCurrency] = useState('EUR');
    const [symbol, setSymbol] = useState('€');
    const [isLoading, setIsLoading] = useState(true);
    const [manualOverride, setManualOverride] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    useEffect(() => {
        const detectLocation = async () => {
            // Check if there's a saved preference
            const savedZone = localStorage.getItem('igv_preferred_zone');
            if (savedZone) {
                updateZone(savedZone);
                setManualOverride(true);
                setIsLoading(false);
                return;
            }

            try {
                // 1-second timeout already implemented in backend
                const response = await axios.get(`${BACKEND_URL}/api/detect-location`, {
                    timeout: 1500 // Client-side safety timeout (1.5s)
                });

                const data = response.data;
                setZone(data.zone);
                setCountryCode(data.country_code);
                setCountryName(data.country_name);
                setCurrency(data.currency);
                setSymbol(data.symbol);
            } catch (error) {
                console.warn('Geolocation failed, using default (EU):', error.message);
                // Fallback to EU (already set as default)
            } finally {
                setIsLoading(false);
            }
        };

        detectLocation();
    }, [BACKEND_URL]);

    const updateZone = (newZone) => {
        // Zone to currency/symbol mapping
        const zoneConfig = {
            'EU': { currency: 'EUR', symbol: '€', country: 'Europe' },
            'US_CA': { currency: 'USD', symbol: '$', country: 'USA/Canada' },
            'IL': { currency: 'ILS', symbol: '₪', country: 'Israel' },
            'ASIA_AFRICA': { currency: 'USD', symbol: '$', country: 'International' }
        };

        const config = zoneConfig[newZone] || zoneConfig['EU'];
        setZone(newZone);
        setCurrency(config.currency);
        setSymbol(config.symbol);
        setCountryName(config.country);
        setCountryCode(newZone === 'EU' ? 'FR' : newZone === 'IL' ? 'IL' : 'US');
    };

    const setPreferredZone = (newZone) => {
        localStorage.setItem('igv_preferred_zone', newZone);
        updateZone(newZone);
        setManualOverride(true);
    };

    const clearPreferredZone = () => {
        localStorage.removeItem('igv_preferred_zone');
        setManualOverride(false);
        // Re-detect location
        window.location.reload();
    };

    const value = {
        zone,
        country_code: countryCode,
        country_name: countryName,
        currency,
        symbol,
        isLoading,
        manualOverride,
        setPreferredZone,
        clearPreferredZone
    };

    return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};

export default GeoContext;
