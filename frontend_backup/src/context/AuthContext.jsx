import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    useEffect(() => {
        // Check for saved token on mount
        const savedToken = localStorage.getItem('igv_admin_token');
        const savedUser = localStorage.getItem('igv_admin_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                email,
                password
            });

            const { access_token, user: userData } = response.data;

            setToken(access_token);
            setUser(userData);

            localStorage.setItem('igv_admin_token', access_token);
            localStorage.setItem('igv_admin_user', JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('igv_admin_token');
        localStorage.removeItem('igv_admin_user');
    };

    const getAuthHeader = () => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        getAuthHeader,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
