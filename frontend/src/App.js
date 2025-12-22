import React from 'react';

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/general/Home";
import NotFound from "./pages/general/NotFound";
import Login from './pages/account/Login';




const App = () => {




  return (


     
        <Layout>
          <Routes>
            <Route path="/"  element={<Home />} />
            <Route path="/login"  element={<Login/>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
   
  );
};

export default App;
