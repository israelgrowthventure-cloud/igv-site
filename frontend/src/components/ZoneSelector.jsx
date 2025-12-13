import React, { useState } from 'react';
import { useGeo } from '../context/GeoContext';
import { Globe, Check } from 'lucide-react';

const ZoneSelector = () => {
    const { zone, setPreferredZone, clearPreferredZone, manualOverride } = useGeo();
    const [isOpen, setIsOpen] = useState(false);

    const zones = [
        { id: 'EU', name: 'Europe', flag: '🇪🇺', description: 'EUR (€)' },
        { id: 'US_CA', name: 'USA / Canada', flag: '🇺🇸', description: 'USD ($)' },
        { id: 'IL', name: 'Israel', flag: '🇮🇱', description: 'ILS (₪)' },
        { id: 'ASIA_AFRICA', name: 'Asia / Africa', flag: '🌏', description: 'USD ($)' }
    ];

    const handleZoneSelect = (zoneId) => {
        setPreferredZone(zoneId);
        setIsOpen(false);
    };

    const handleReset = () => {
        clearPreferredZone();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Select Region"
            >
                <Globe size={16} />
                <span className="hidden sm:inline">
                    {zones.find(z => z.id === zone)?.name || 'Select Zone'}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Select Your Region</h3>
                            {manualOverride && (
                                <p className="text-xs text-gray-500 mt-1">Custom selection active</p>
                            )}
                        </div>

                        <div className="py-1">
                            {zones.map((zoneItem) => (
                                <button
                                    key={zoneItem.id}
                                    onClick={() => handleZoneSelect(zoneItem.id)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${zone === zoneItem.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{zoneItem.flag}</span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{zoneItem.name}</div>
                                            <div className="text-xs text-gray-500">{zoneItem.description}</div>
                                        </div>
                                    </div>
                                    {zone === zoneItem.id && (
                                        <Check size={18} className="text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {manualOverride && (
                            <div className="p-3 border-t border-gray-100">
                                <button
                                    onClick={handleReset}
                                    className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                >
                                    Reset to Auto-Detect
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ZoneSelector;
