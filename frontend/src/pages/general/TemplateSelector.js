import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import {  FaCog, FaDollarSign, FaTools,FaClock,FaExchangeAlt,FaShieldAlt } from 'react-icons/fa';

import apiClient from '../../utils/apiClient';
import PdfViewer from './PdfViewer';
import { Link } from 'react-router-dom';



const TemplateSelector = () => {

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/templates');
      console.log("Templates response:", response.data);
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

 fetchTemplates()
  },[]);
  return (
<div className="bg-white shadow-xl rounded-2xl p-8 mx-auto max-w-7xl my-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📂 Seleziona un Modello</h1>
      <p className="text-gray-600 mb-4 leading-relaxed">
  Qui puoi scegliere uno dei modelli disponibili per avviare rapidamente la compilazione della tua pratica edilizia.
  I modelli sono pensati per adattarsi a diverse esigenze tecniche, amministrative o fiscali.
</p>
<p className="text-gray-600 mb-6 leading-relaxed">
  Clicca su un modello per visualizzarne la descrizione dettagliata e procedere con la compilazione guidata.
  Puoi modificarlo, personalizzarlo e scaricare i documenti generati in formato PDF o Word.
</p>

      {loading && <p className="text-blue-500">⏳ Caricamento modelli in corso...</p>}
      {error && <p className="text-red-500 font-medium">❌ {error}</p>}

      {templates.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              className={`p-6 border rounded-xl shadow-sm transition-colors duration-200 ${
                selectedTemplate === template.template_id ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTemplate(template.template_id)}
            >
              <h2 className="text-lg font-semibold text-gray-800">{template.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <Link
                to={`/document?template=${template.template_id}`}
                className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline"
              >
                🚀 Inizia
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">⚠️ Nessun modello disponibile al momento.</p>
      )}
    </div>
  );
};

export default TemplateSelector;