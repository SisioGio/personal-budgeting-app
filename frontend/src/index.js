import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NotificationProvider } from './components/Notification';
import { ScenarioProvider } from './utils/ScenarioContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_ID_CLIENT}>
<QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <AuthProvider>
            <ScenarioProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
          </ScenarioProvider>
        </AuthProvider>
    </BrowserRouter>
</QueryClientProvider>
</GoogleOAuthProvider>

);
