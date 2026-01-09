import React, { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
const GoogleLoginButton = () => {

  const responseMessage = (response) => {
        console.log(response);
    };
    const errorMessage = (error) => {
        console.error(error)
      
    };



  return (
  

           <div className="w-full">
    <GoogleLogin
      onSuccess={responseMessage}
      onError={errorMessage}
      width="100%"
      size="large"
      text="signin_with"
      shape="rectangular"
    />
          </div>
          
  
  );
};

export default GoogleLoginButton;
