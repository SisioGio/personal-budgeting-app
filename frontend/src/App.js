import React, { useState,useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/general/Home";
import NotFound from "./pages/general/NotFound";
import Document from './pages/general/Document';
import Modelli from './pages/general/Modelli';
import TemplateSelector from './pages/general/TemplateSelector';



const App = () => {




  return (


     
        <Layout>
          <Routes>
            <Route path="/"  element={<Home />} />
            <Route path="/document"  element={<Document />} />
            <Route path="/modelli"  element={<TemplateSelector />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
   
  );
};

export default App;
