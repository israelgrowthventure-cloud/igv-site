import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { useGeo } from '../context/GeoContext';

/**
 * usePricing Hook
 * ===============
 * Reusable hook for fetching zone-based pricing for any pack.
 * 
 * TECHNICAL LOGIC PRESERVATION:
 * This hook preserves the pricing calculation logic that was in Checkout.js
 * but makes it reusable for CMS-rendered components.
 * 
 * Usage in CMS blocks:
 * const { pricing, isLoading, error } = usePricing('analyse');
 * 
 * Returns:
 * - pricing: Object with currency, prices, and formatted display strings
 * - isLoading: Boolean indicating if pricing is being fetched
 * - error: Error object if fetch failed
 * 
 * Example pricing object:
 * {
 *   zone: "IL",
 *   currency: "ils",
 *   currency_symbol: "₪",
 *   total_price: 7000,
 *   monthly_3x: 2334,
 *   monthly_12x: 584,
 *   display: {
 *     total: "7 000 ₪",
 *     three_times: "3 x 2 334 ₪",
 *     twelve_times: "12 x 584 ₪"
 *   }
 * }
 */
export const usePricing = (packId) => {
  const { zone, isLoading: geoLoading } = useGeo();
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      if (geoLoading) return; // Wait for geo detection
      if (!zone || !packId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/pricing?packId=${packId}&zone=${zone}`);
        if (!response.ok) throw new Error('Failed to fetch pricing');
        const data = await response.json();
        setPricing(data);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError(err);
        
        // Fallback pricing to not block users
        const fallbackPrices = {
          analyse: { total: 7000, monthly_3x: 2334, monthly_12x: 584 },
          succursales: { total: 55000, monthly_3x: 18334, monthly_12x: 4584 },
          franchise: { total: 55000, monthly_3x: 18334, monthly_12x: 4584 },
        };

        const packPrices = fallbackPrices[packId] || fallbackPrices.analyse;

        setPricing({
          zone: zone || 'IL',
          currency: 'ils',
          currency_symbol: '₪',
          total_price: packPrices.total,
          monthly_3x: packPrices.monthly_3x,
          monthly_12x: packPrices.monthly_12x,
          display: {
            total: `${packPrices.total.toLocaleString()} ₪`,
            three_times: `3 x ${packPrices.monthly_3x.toLocaleString()} ₪`,
            twelve_times: `12 x ${packPrices.monthly_12x.toLocaleString()} ₪`
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, [zone, packId, geoLoading]);

  return { pricing, isLoading, error };
};

export default usePricing;
