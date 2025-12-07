import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const AdminAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = 'Ancien mot de passe requis';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Nouveau mot de passe requis';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirmation requise';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setErrorMessage('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccess(false);

    try {
      await authAPI.changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password
      });

      setSuccess(true);
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Afficher le message de succès pendant 3 secondes
      setTimeout(() => {
        navigate('/admin');
      }, 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(
        error.response?.data?.detail || 
        'Erreur lors du changement de mot de passe. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          Mon Compte
        </h1>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '8px 16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#475569',
            fontWeight: '500'
          }}
        >
          ← Retour au dashboard
        </button>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '40px 24px' 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#1e293b'
          }}>
            Changer mon mot de passe
          </h2>
          <p style={{ 
            color: '#64748b', 
            marginBottom: '32px' 
          }}>
            Modifiez votre mot de passe d'administration
          </p>

          {/* Messages de succès/erreur */}
          {success && (
            <div style={{
              padding: '16px',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '8px',
              marginBottom: '24px',
              color: '#166534'
            }}>
              <strong>✅ Succès !</strong> Votre mot de passe a été modifié avec succès.
              <br />
              Redirection vers le dashboard...
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '16px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              marginBottom: '24px',
              color: '#991b1b'
            }}>
              <strong>❌ Erreur :</strong> {errorMessage}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Ancien mot de passe */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="old_password"
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#334155'
                }}
              >
                Ancien mot de passe *
              </label>
              <input
                type="password"
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.old_password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.old_password && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.old_password}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="new_password"
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#334155'
                }}
              >
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.new_password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.new_password && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.new_password}
                </p>
              )}
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                Minimum 8 caractères
              </p>
            </div>

            {/* Confirmation */}
            <div style={{ marginBottom: '32px' }}>
              <label 
                htmlFor="confirm_password"
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#334155'
                }}
              >
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.confirm_password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.confirm_password && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || success}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: loading || success ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Modification en cours...' : 'Changer le mot de passe'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Annuler
              </button>
            </div>
          </form>

          {/* Recommandations de sécurité */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#475569'
            }}>
              💡 Conseils pour un mot de passe sécurisé :
            </h3>
            <ul style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              paddingLeft: '20px',
              margin: 0
            }}>
              <li>Au moins 8 caractères</li>
              <li>Mélangez majuscules, minuscules, chiffres et symboles</li>
              <li>Évitez les mots du dictionnaire</li>
              <li>N'utilisez pas d'informations personnelles</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAccount;
