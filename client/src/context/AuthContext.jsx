import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Re-verify token when tab regains focus — catches mid-session expiry
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkAuth();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Handle session expiry signalled by the api.js interceptor
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      toast.error('Your session has expired. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data.data; // { email } — user is not set until email is verified
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    setUser(data.data.user);
    return data.data.user;
  };

  const resendVerification = async (email) => {
    await api.post('/auth/resend-verification', { email });
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data.data.user);
    return data.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendVerification, logout, updateProfile, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
