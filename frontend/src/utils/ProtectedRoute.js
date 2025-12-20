import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Assuming you are using a context to manage auth state

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true); // Track loading state
  const { auth, login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('bnb-demo-accessToken');
   
    if (token) {
      login(token); 
      setLoading(false)
    } else {
      setLoading(false); // No token, stop loading state
    }
  }, []);
  
  // If still loading, return null or a loading spinner
  if (loading) {
    return <div>Loading...</div>; // Or replace with a spinner or placeholder
  }

  // Once loading is complete, check auth and render the appropriate component
  if (auth) {
     return children;
    // if (auth.verified) {
    //   // If account is verified, render children

    //   return children;
    // } 
    // else {
    //   // If account is not verified, redirect to confirmation page

    //   return <Navigate to="/confirm" />;
    // }
  } else {
    // If no auth state is available, redirect to login page
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
