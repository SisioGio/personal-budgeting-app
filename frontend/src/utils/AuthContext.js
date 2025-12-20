import React, { createContext, useContext, useState,useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(localStorage.getItem('accessToken')?true:false);

  const decodeAccessToken = (token)=>{
  
    const decoded = jwtDecode(token);

      return decoded
  }
  const login = (token) => {
   
    // Implement login logic
    try{
      const userData = decodeAccessToken(token)
    
      const api_key = userData.api_key
      if (api_key){
 
        localStorage.setItem('api_key',api_key)
      }
      setAuth(userData);
    }catch (error) {
        console.error(error);
        setAuth(null);
      
    } 
  };

  const logout = () => {
    // Implement logout logic
    localStorage.removeItem('accessToken')
    localStorage.removeItem("refreshToken")
   
    setAuth(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      login(token)
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
