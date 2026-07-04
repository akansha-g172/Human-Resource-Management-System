import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../features/auth/authService';

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

    if (savedToken && savedUserId && savedRole) {
      setToken(savedToken);
      setUser({
        userId: savedUserId,
        role: savedRole,
        name: savedName || 'User',
        employeeId: savedEmpId || ''
      });
    }
    setLoading(false);
  }, []);

  const loginUser = async (identifier, password) => {
    try {
      const data = await authService.login(identifier, password);
      const { accessToken, userId, employeeId, name, role } = data;
      
      // Store in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('employeeId', employeeId);
      
      setToken(accessToken);
      setUser({
        userId,
        employeeId,
        name,
        role
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
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login: loginUser,
      signUp: signUpUser,
      logout: logoutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
