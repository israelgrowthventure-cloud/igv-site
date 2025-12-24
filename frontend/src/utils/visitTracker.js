/**
 * MISSION D: Visit Tracking Utility
 * Track page visits with consent-aware analytics
 */

import api from './api';

class VisitTracker {
  constructor() {
    this.hasConsent = false;
    this.checkConsent();
    
    // Listen for consent updates
    window.addEventListener('igv-consent-updated', (e) => {
      this.hasConsent = e.detail?.preferences?.analytics || false;
    });
  }

  checkConsent() {
    try {
      const consentData = localStorage.getItem('igv-cookie-consent');
      if (consentData) {
        const parsed = JSON.parse(consentData);
        this.hasConsent = parsed.preferences?.analytics || false;
      }
    } catch (e) {
      console.error('Error checking consent:', e);
      this.hasConsent = false;
    }
  }

  async trackPageView(page, additionalData = {}) {
    // Always check consent before tracking
    this.checkConsent();
    
    if (!this.hasConsent) {
      console.log('Analytics tracking skipped: no consent');
      return { status: 'skipped', reason: 'no_consent' };
    }

    try {
      // Extract UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      const trackingData = {
        page: page || window.location.pathname,
        referrer: document.referrer || null,
        language: document.documentElement.lang || 'fr',
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        consent_analytics: true,
        ...additionalData
      };

      const response = await fetch(`${api.getBackendUrl()}/api/track/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackingData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Visit tracked:', data);
        return data;
      }
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }

  /**
   * Track visit on component mount
   * Usage: useEffect(() => { visitTracker.trackOnMount(); }, []);
   */
  trackOnMount() {
    this.trackPageView();
  }

  /**
   * Track custom event (e.g., form submission, download)
   */
  async trackEvent(eventName, eventData = {}) {
    this.checkConsent();
    
    if (!this.hasConsent) {
      return { status: 'skipped', reason: 'no_consent' };
    }

    // Store custom events in visits collection with event metadata
    return this.trackPageView(window.location.pathname, {
      event: eventName,
      event_data: eventData
    });
  }
}

// Export singleton instance
const visitTracker = new VisitTracker();
export default visitTracker;
