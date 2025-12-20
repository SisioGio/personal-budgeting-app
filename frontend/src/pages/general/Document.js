import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import {  FaCog, FaDollarSign, FaTools,FaClock,FaExchangeAlt,FaShieldAlt } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';


import apiClient from '../../utils/apiClient';
import TemplateForm from './DocumentInput';


const Document = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const templateId = queryParams.get('template');
    const documentId = queryParams.get('document');

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            var response;
            if (templateId && !documentId) {
               response = await apiClient.get(`/templates?template_id=${templateId}`);
               console.log("Document response:", response.data);
            setDocument(response.data);
            } else if(documentId && templateId) {
              
               response = await apiClient.get(`/documents?document_id=${documentId}&template_id=${templateId}`);
               console.log("Document response:", response.data);
               const documentData = response.data 
              setDocument(documentData);
            }
            
            
        } catch (err) {
            setError('Failed to fetch document');
        } finally {
            setLoading(false);
        }
    }


    
  useEffect(() => {
    fetchDocument()
 
  },[]);

  if (loading) {
    return <p>Loading document...</p>;
  }
  if(!document) {
    return <p className="text-red-500">No document found for the provided template ID.</p>;
  }


  return (
 <div>

  
<TemplateForm template={document} documentId={documentId} />
 </div>
  );
};

export default Document;