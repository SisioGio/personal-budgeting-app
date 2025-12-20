import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';


import { NotificationProvider } from './components/Notification';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
              <App />
          </NotificationProvider>
        </AuthProvider>
    </BrowserRouter>


);
