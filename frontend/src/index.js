import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NotificationProvider } from './components/Notification';
import { ScenarioProvider } from './utils/ScenarioContext';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
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

);
