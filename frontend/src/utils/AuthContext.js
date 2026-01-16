import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from './apiClient';



const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const loginWithToken = useCallback(async (accessToken) => {
    try {
      // Save token temporarily for the request
      localStorage.setItem("access_token", accessToken);

      const res = await apiClient.get("/private/signin");

      setAuth(res.data.data); // backend-validated user
    } catch (error) {
      console.error("Token validation failed", error);
      logout();
    }
  }, []);

  const logout = () => {
    // Implement logout logic
    localStorage.removeItem('access_token')
    localStorage.removeItem("refresh_token")
   
    setAuth(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setAuth(false);
      return;
    }

    loginWithToken(token);
  }, [loginWithToken]);

  return (
    <AuthContext.Provider value={{ auth, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
