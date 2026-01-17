import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from './apiClient';



const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const loginWithToken = useCallback(async () => {
    try {

      
      const res = await apiClient.get("/private/signin");

      setAuth(res.data.data); // backend-validated user
    } catch (error) {
      console.error("Token validation failed", error);
      logout();
    }
  }, []);

  const logout = () => {
    setAuth(null);
  };

  useEffect(() => {
    
    loginWithToken();
  }, [loginWithToken]);

  return (
    <AuthContext.Provider value={{ auth, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
