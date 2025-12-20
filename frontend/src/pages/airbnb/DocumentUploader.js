import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, UploadCloud, Image } from "lucide-react";

import { useNotification } from "../../components/Notification";
import axios from "axios";

const DocumentsUploader = ({setSelectedStep,formData,setBackDocumentKey,setFrontDocumentKey,setFormData,uploadToS3,token,loading,setLoading}) => {
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    
    const [message,setMessage]  = useState('')
const { showNotification } = useNotification();
  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (side === "front") setFrontFile(file);
    else setBackFile(file);
  };



    const extractDataFromDocument = async (files) => {
      console.log(files);
      const res = await axios.post(
        "https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/extract",
        { files: files },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    };
  

   const handleUpload = async () => {
     try {
       setLoading(true);
       setMessage("Uploading...");
 
       const frontDocumentKey = await uploadToS3(frontFile, "Front");
       setFrontDocumentKey(frontDocumentKey)
       const backDocumentKey = await uploadToS3(backFile, "Back");
       setBackDocumentKey(backDocumentKey)
 
       const files = [
         {
           key: frontDocumentKey,
           name: "front",
           type: frontFile.type,
         },
         {
           key: backDocumentKey,
           name: "back",
           type: backFile.type,
         },
       ];
       const extractionResponse = await extractDataFromDocument(files);
       extractionResponse['tipo_allogiato_code'] = formData.tipo_allogiato_code
       extractionResponse['tipo_allogiato'] = formData.tipo_allogiato_code
       setFormData(extractionResponse);
       showNotification({ text: "🎯 Documents successfully imported!", error: false });
       setLoading(false);
       setSelectedStep(2);
      

     } catch (err) {
       console.error(err);
       showNotification({ text: "⚠️ Upload failed. Please try again.", error: true });
 
     } finally {
       setLoading(false);
     }
   };

  return (
    <motion.div
      className="max-w-xl mx-auto bg-white p-2 md:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Upload Your Document
      </h2>

      {/* FRONT */}
      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Front of Document
        </label>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <Camera className="w-5 h-5 text-indigo-500" />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, "front")}
            className="text-sm text-gray-600"
          />
        </div>
        {frontFile && (
          <motion.img
            src={URL.createObjectURL(frontFile)}
            alt="Front Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* BACK */}
      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Back of Document
        </label>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <Camera className="w-5 h-5 text-indigo-500" />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, "back")}
            className="text-sm text-gray-600"
          />
        </div>
        {backFile && (
          <motion.img
            src={URL.createObjectURL(backFile)}
            alt="Back Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* SUBMIT BUTTON */}
      <motion.button
        onClick={handleUpload}
        disabled={loading || !frontFile || !backFile}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition 
          ${
            loading || !frontFile || !backFile
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500"
          }`}
      >
        {loading ? (
          <>
            <Image className="animate-pulse w-5 h-5" />
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud className="w-5 h-5" />
            Submit Documents
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default DocumentsUploader;
