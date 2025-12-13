import React from 'react';
import { Globe } from 'lucide-react';

const ZONES = [
    { code: 'EU', label: '🇪🇺 Europe', currency: '€' },
    { code: 'US', label: '🇺🇸 USA / Canada', currency: '$' },
    { code: 'IL', label: '🇮🇱 Israël', currency: '₪' },
    { code: 'ASIA', label: '🌍 Asie / Afrique', currency: '$' }
];

export const ZoneSelector = ({ currentZone, onZoneChange, className = '' }) => {
    return (
        <div className={`inline-flex items-center space-x-2 ${className}`}>
            <Globe className="w-4 h-4 text-gray-500" />
            <select
                value={currentZone || 'EU'}
                onChange={(e) => onZoneChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                aria-label="Sélectionner votre région"
            >
                {ZONES.map(zone => (
                    <option key={zone.code} value={zone.code}>
                        {zone.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ZoneSelector;
