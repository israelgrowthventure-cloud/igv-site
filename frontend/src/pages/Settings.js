import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Globe, Clock, Mail, AlertTriangle } from 'lucide-react';
import './Settings.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const Settings = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        site_name: 'Israel Growth Venture',
        default_language: 'fr',
        timezone: 'Europe/Paris',
        maintenance_mode: false,
        contact_email: '',
        max_leads_per_day: 100
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            toast.error('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            
            if (response.ok) {
                toast.success('Paramètres sauvegardés avec succès!');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-loading">
                    <div className="spinner"></div>
                    <p>Chargement des paramètres...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div className="settings-title">
                    <SettingsIcon className="settings-icon" />
                    <h1>{t('settings.title', 'Paramètres')}</h1>
                </div>
                <button 
                    className="save-button" 
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </div>

            <div className="settings-content">
                {/* General Settings */}
                <section className="settings-section">
                    <h2>Paramètres généraux</h2>
                    
                    <div className="settings-field">
                        <label htmlFor="site_name">
                            <Globe size={16} />
                            Nom du site
                        </label>
                        <input
                            id="site_name"
                            type="text"
                            value={settings.site_name || ''}
                            onChange={(e) => handleChange('site_name', e.target.value)}
                            placeholder="Nom de votre site"
                        />
                    </div>

                    <div className="settings-field">
                        <label htmlFor="contact_email">
                            <Mail size={16} />
                            Email de contact
                        </label>
                        <input
                            id="contact_email"
                            type="email"
                            value={settings.contact_email || ''}
                            onChange={(e) => handleChange('contact_email', e.target.value)}
                            placeholder="contact@example.com"
                        />
                    </div>
                </section>

                {/* Localization Settings */}
                <section className="settings-section">
                    <h2>Localisation</h2>
                    
                    <div className="settings-field">
                        <label htmlFor="default_language">
                            <Globe size={16} />
                            Langue par défaut
                        </label>
                        <select
                            id="default_language"
                            value={settings.default_language || 'fr'}
                            onChange={(e) => handleChange('default_language', e.target.value)}
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="he">עברית (Hébreu)</option>
                        </select>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="timezone">
                            <Clock size={16} />
                            Fuseau horaire
                        </label>
                        <select
                            id="timezone"
                            value={settings.timezone || 'Europe/Paris'}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                        >
                            <option value="Europe/Paris">Paris (UTC+1)</option>
                            <option value="Asia/Jerusalem">Tel Aviv (UTC+2)</option>
                            <option value="America/New_York">New York (UTC-5)</option>
                            <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </div>
                </section>

                {/* Advanced Settings */}
                <section className="settings-section">
                    <h2>Paramètres avancés</h2>
                    
                    <div className="settings-field">
                        <label htmlFor="max_leads_per_day">
                            Limite de leads par jour
                        </label>
                        <input
                            id="max_leads_per_day"
                            type="number"
                            min="1"
                            max="1000"
                            value={settings.max_leads_per_day || 100}
                            onChange={(e) => handleChange('max_leads_per_day', parseInt(e.target.value))}
                        />
                    </div>

                    <div className="settings-field checkbox-field">
                        <label htmlFor="maintenance_mode">
                            <AlertTriangle size={16} />
                            Mode maintenance
                        </label>
                        <div className="toggle-switch">
                            <input
                                id="maintenance_mode"
                                type="checkbox"
                                checked={settings.maintenance_mode || false}
                                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </div>
                        <span className="field-hint">
                            {settings.maintenance_mode 
                                ? 'Le site est en maintenance' 
                                : 'Le site est en ligne'}
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
