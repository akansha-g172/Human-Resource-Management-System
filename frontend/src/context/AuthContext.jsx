import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../features/auth/authService';
import { mockGetProfileMe } from '../mocks/profileMock';
import apiClient from '../api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    const savedRole = localStorage.getItem('role');
    const savedName = localStorage.getItem('userName');
    const savedEmpId = localStorage.getItem('employeeId');
    const savedPhoto = localStorage.getItem('photoUrl');

    if (savedToken && savedUserId && savedRole) {
      setToken(savedToken);
      setUser({
        userId: savedUserId,
        role: savedRole,
        name: savedName || 'User',
        employeeId: savedEmpId || '',
        photoUrl: savedPhoto || null
      });

      // Background self-heal: Fetch profile details to ensure the name/avatar are up-to-date
      const syncProfile = async () => {
        try {
          const useMock = import.meta.env.VITE_USE_MOCK === 'true';
          let profileData;
          if (useMock) {
            profileData = await mockGetProfileMe(savedUserId);
          } else {
            const response = await apiClient.get('/profile/me');
            profileData = response.data;
          }
          if (profileData) {
            setUser(prev => {
              if (!prev) return null;
              return {
                ...prev,
                name: profileData.name || prev.name,
                photoUrl: profileData.photoUrl || null
              };
            });
            localStorage.setItem('userName', profileData.name || '');
            localStorage.setItem('photoUrl', profileData.photoUrl || '');
          }
        } catch (err) {
          console.error("Background profile sync failed:", err);
        }
      };
      syncProfile();
    }
    setLoading(false);
  }, []);

  const loginUser = async (identifier, password) => {
    try {
      const data = await authService.login(identifier, password);
      const { accessToken, userId, employeeId, name, role, photoUrl } = data;
      
      // Store in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('employeeId', employeeId);
      localStorage.setItem('photoUrl', photoUrl || '');
      
      setToken(accessToken);
      setUser({
        userId,
        employeeId,
        name,
        role,
        photoUrl: photoUrl || null
      });
      return { success: true, role };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Invalid credentials";
      return { success: false, error: errorMsg };
    }
  };

  const signUpUser = async (formData) => {
    try {
      const data = await authService.signUp(formData);
      return { success: true, data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Email already registered";
      return { success: false, error: errorMsg };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('photoUrl');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      if (newData.name !== undefined) localStorage.setItem('userName', newData.name);
      if (newData.photoUrl !== undefined) localStorage.setItem('photoUrl', newData.photoUrl || '');
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login: loginUser,
      signUp: signUpUser,
      logout: logoutUser,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
