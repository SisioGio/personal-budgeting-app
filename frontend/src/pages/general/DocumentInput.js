import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';

import Loader from '../../utils/Loader'
import { useNotification } from "../../components/Notification";
import DocumentSection from './DocumentSection';
const TemplateForm = ({ template }) => {
  const { name, description, url, schema } = template;
const { showNotification } = useNotification();
    const [loading, setLoading] = useState({
      'all': false
      
    });

  const [formData, setFormData] = useState({});
 const [filesBySection, setFilesBySection] = useState({});

  // Initialize formData with values from the template schema
  useEffect(() => {
    const initialData = {};
    console.log("Template schema:", schema);
    schema.forEach((section) => {
      section.fields.forEach((field) => {
        initialData[`${section.section}.${field.id}`] = field.value || '';
      });
    });
    console.log("Initial form data:", initialData);
    setFormData(initialData);
  }, [schema]);

  const handleChange = (e,section,key, value) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      [`${section}.${key}`]: value,
    }));


  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading({ 'all': true });
    try{
        const payload ={
            'template_id': template.template_id,
            'payload': formData
        }
        var response;
        
        response = await apiClient.post(`/document?document_id=${template.document_id}`, payload);
        
        console.log("Response from API:", response.data);
        console.log("Form submitted successfully:", response.data);
   
        showNotification({ text: "Document created", error:false });
        const documentId = response.data.document_id;
        console.log("Document ID:", documentId);
        window.location.href = `/document?document=${documentId}&template=${template.template_id}`;
        const documentUrl = response.data.url
        window.open(documentUrl, '_blank');
        


    } catch (error) {
        console.log("Error submitting form:", error);
    } finally {
        setLoading({ 'all': false });
    }
    
  }
// Handle file input changes
  const handleFileChange = (e, section) => {
    const selectedFiles = e.target.files;
    console.log("Selected files for section:", section, selectedFiles.length);
    if (!selectedFiles.length) return;

    // Store files for this section (append multiple files if needed)
    console.log(Array.from(selectedFiles));
    var sectionFiles = filesBySection[section] || [];
    console.log("Current files for section:", sectionFiles);
    // Check if files already exist in the section
    const existingFileNames = new Set(sectionFiles.map(file => file.name));
    for (let file of selectedFiles) {
      if (existingFileNames.has(file.name)) {
        showNotification({ text: `File ${file.name} already exists in this section`, error: true });
        return;
      }
    }


    sectionFiles = [...sectionFiles, ...Array.from(selectedFiles)];

    console.log("Updated files for section:", sectionFiles);
    setFilesBySection((prev) => ({
      ...prev,
      [section]: sectionFiles,
    }));
    console.log("Files by section after change:", filesBySection);
    // Reset file input value so user can upload same file again if needed
    e.target.value = null;
  };

  useEffect(() => {
    console.log("Files by section updated:", filesBySection);
  }, [filesBySection]);
  // Remove a file preview
  const removeFile = (section, index) => {
    setFilesBySection((prev) => {
      const newFiles = [...(prev[section] || [])];
      newFiles.splice(index, 1);
      return {
        ...prev,
        [section]: newFiles,
      };
    });
  };



  const handleFilesSubmit = async (e, section) => {
    e.preventDefault();
    setLoading({ ...loading, [section]: true });
    try {
      const files = filesBySection[section] || [];
      if (files.length === 0) {
        showNotification({ text: "No files to upload", error: true });
        return;
      }
      var filesKeys=[]
      for (let i = 0; i < files.length; i++) {
        var uploadResponse = await apiClient.get(`upload_url?file_name=${files[i].name}&file_type=${files[i].type}`);
        if (uploadResponse.status !== 200) {
          showNotification({ text: "Error getting upload URL", error: true });
          return;
        }
        const uploadUrl = uploadResponse.data.upload_url;
        await apiClient.put(uploadUrl, files[i]);
        console.log(`File ${files[i].name} uploaded successfully`);
        filesKeys.push(uploadResponse.data.attachment_key);
      }

      const response = await apiClient.post(`/extract`, {
        'document_id': template.document_id,
        'template_id': template.template_id,
        'section': section,
        'files': filesKeys
      });

      console.log("Files uploaded successfully:", response.data);

      const extractedData = response.data.extracted_data;
      console.log("Extracted data:", extractedData);
      // Update formData with extracted data
      const updatedFormData = { ...formData };
      Object.keys(extractedData).forEach((key) => {
        updatedFormData[`${section}.${key}`] = extractedData[key];
      });
      
      setFormData(updatedFormData);
      showNotification({ text: "Files processed successfully", error: false });
      
      // console.log("Files uploaded successfully:", response.data);
      showNotification({ text: "Files uploaded successfully", error: false });
    } catch (error) {
      console.error("Error uploading files:", error);
      showNotification({ text: "Error uploading files", error: true });
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    console.log('Form data updated:', formData);
    }, [formData]);

 

  return (
     <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="text-gray-600">{description}</p>

      <p className="text-gray-700 text-sm leading-relaxed">
  <span className="font-semibold">Come funziona?</span>
  <br />
  I campi possono essere compilati manualmente o automaticamente caricando i documenti richiesti.
  <br />
  Per compilare i campi in maniera automatica, seleziona i documenti corrispondenti alla sezione in oggetto e poi clicca sul pulsante <span className="font-medium italic">'Estrai Dati dai Documenti'</span>.
</p>
      </div>

      {schema.map((section, sectionIndex) => (
        <DocumentSection
          key={sectionIndex}
          section={section}
          handleChange={handleChange}
          formData={formData}
          showNotification={showNotification}
          removeFile={removeFile}
          handleFileChange={handleFileChange}
          filesBySection={filesBySection}
          handleFilesSubmit={handleFilesSubmit}
          loading={loading[section.section] || false}
        />
      ))}

      <button
        onClick={handleSubmit}
        className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 fixed bottom-2 left-1/2 w-96 -translate-x-1/2"
      >
        Salva
      </button>

      <Loader loading={loading['all']} />
    </div>
  );
};

export default TemplateForm;
