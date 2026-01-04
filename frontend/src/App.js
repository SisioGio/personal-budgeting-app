import React from 'react';

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/general/Home";
import NotFound from "./pages/general/NotFound";
import Login from './pages/account/Login';
import Private from './pages/general/Private';
import ProtectedRoute from './utils/ProtectedRoute'
import CategoryCRUD from './pages/forms/Category';
import ScenarioCRUD from './pages/forms/Scenario';
import EntriesCRUD from './pages/forms/Entries';
import CRM from './pages/forms/CRM';
import EntriesReport from './pages/forms/EntriesReport';



const App = () => {




  return (


     
        <Layout>
          <Routes>
            <Route path="/"  element={<Home />} />
            <Route path="/login"  element={<Login/>} />
            <Route path="/private"  element={<ProtectedRoute children={<Private/>}></ProtectedRoute>} />
             <Route path="/category"  element={<ProtectedRoute children={<CategoryCRUD/>}></ProtectedRoute>} />
             <Route path="/scenario"  element={<ProtectedRoute children={<ScenarioCRUD/>}></ProtectedRoute>} />
             <Route path="/entries"  element={<ProtectedRoute children={<EntriesCRUD/>}></ProtectedRoute>} />
             <Route path="/crm"  element={<ProtectedRoute children={<CRM/>}></ProtectedRoute>} />
             <Route path="/report"  element={<ProtectedRoute children={<EntriesReport/>}></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
   
  );
};

export default App;
