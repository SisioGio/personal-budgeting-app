import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import {  FaCog, FaDollarSign, FaTools,FaClock,FaExchangeAlt,FaShieldAlt } from 'react-icons/fa';

import apiClient from '../../utils/apiClient';
import PdfViewer from './PdfViewer';
import { Link } from 'react-router-dom';



const DocumentsList = () => {

  const [documents, setDocuments] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/documents');
      console.log("Documents response:", response.data);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

 fetchDocuments()
  },[]);
  return (
 <div className='bg-white shadow-md rounded-lg p-6 mx-auto mt-10'>



  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    {loading && <p>Loading documents...</p>}
    {error && <p className="text-red-500">{error}</p>}
    {!loading && !error && documents.map((document) => (
      <motion.div
        key={document.id}
        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        whileHover={{ scale: 1.05 }}
      >
        <h3 className="text-lg font-semibold mb-2">{document.template_id}</h3>
        <p className="text-gray-600 mb-4">{document.document_id}</p>
        <div className="flex justify-between items-center">
          <Link to={`/document?document=${document.document_id}`} className="text-blue-500 hover:underline">
            View Document
          </Link>
          <span className="text-gray-500 text-sm">{new Date(document.created_at).toLocaleDateString()}</span>
        </div>
      </motion.div>
    ))}
 </div>

 </div>
  );
};

export default DocumentsList;