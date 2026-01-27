import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from './apiClient';

import {useNotification} from './../components/Notification';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const  {showNotification} = useNotification();

  const loginWithToken = useCallback(async () => {
  try {

    localStorage.getItem('access_token');
    
    const res = await apiClient.get("/private/signin");

    showNotification({ text: "Logged in", error: false });
    setAuth(res.data.data);
  } catch (error) {
    console.error("Token validation failed", error);
    showNotification({
      text:  `Login Failed`,
      error: true,
    });
    logout();
  }
}, [ showNotification, setAuth]);

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
