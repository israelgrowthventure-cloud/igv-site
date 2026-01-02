/**
 * AuthContext - Centralized Authentication State Management
 * Provides user authentication state, role-based helpers, and logout
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');

        if (token && userEmail) {
          setUser({
            email: userEmail,
            name: userName || userEmail.split('@')[0],
            role: userRole || 'admin',
            token: token
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login - Store user data in state and localStorage
   */
  const login = (token, email, name, role = 'admin') => {
    const userData = {
      email,
      name: name || email.split('@')[0],
      role,
      token
    };

    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name || '');
    localStorage.setItem('userRole', role);
  };

  /**
   * Logout - Clear user data and redirect to login
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  /**
   * Update user data (e.g., after profile edit)
   */
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    if (updates.name) {
      localStorage.setItem('userName', updates.name);
    }
    if (updates.role) {
      localStorage.setItem('userRole', updates.role);
    }
  };

  // Role-based helpers
  const isAdmin = () => user?.role === 'admin';
  const isCommercial = () => user?.role === 'commercial';
  const hasRole = (...roles) => roles.includes(user?.role);

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin,
    isCommercial,
    hasRole
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Access authentication context in any component
 * 
 * @example
 * const { user, isAdmin, logout } = useAuth();
 * 
 * if (isAdmin()) {
 *   // Show admin-only content
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
