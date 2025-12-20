import React from 'react';

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/general/Home";
import NotFound from "./pages/general/NotFound";




const App = () => {




  return (


     
        <Layout>
          <Routes>
            <Route path="/"  element={<Home />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
   
  );
};

export default App;
