import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../services/api/axiosClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const response = await axiosClient.get('/auth/me');
          if (response.data && response.data.success) {
            const freshUser = response.data.data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { accessToken, user: loggedUser } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      }
      throw new Error('Login failed');
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Invalid email or password';
      throw new Error(errMsg);
    }
  };

  const signup = async (fullName, email, phone, password, role) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/register', {
        fullName,
        email,
        phone,
        password,
        confirmPassword: password,
        role,
      });
      if (response.data && response.data.success) {
        // Auto login after signup
        const loginRes = await axiosClient.post('/auth/login', { email, password });
        const { accessToken, user: loggedUser } = loginRes.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      }
      throw new Error('Registration failed');
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const forgotPassword = async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate lookup/success
    if (!email) {
      throw new Error('Email address is required');
    }
    return true;
  };

  const resetPassword = async (token, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword, resetPassword, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

