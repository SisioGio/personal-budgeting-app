import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const decodeAccessToken = useCallback((token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }, []);
  const login = useCallback((token) => {
    try {
      const userData = decodeAccessToken(token);

      if (!userData) return;

      const api_key = userData.api_key;
      if (api_key) {
        localStorage.setItem('api_key', api_key);
      }
      localStorage.setItem('accessToken', token);
      setAuth(userData);
    } catch (error) {
      console.error(error);
      setAuth(null);
    }
  }, [decodeAccessToken]);

  const logout = () => {
    // Implement logout logic
    localStorage.removeItem('accessToken')
    localStorage.removeItem("refreshToken")
   
    setAuth(null);
  };

  useEffect(() => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('accessToken');
  if (token) login(token);
  else setAuth(false);
}, [login]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
