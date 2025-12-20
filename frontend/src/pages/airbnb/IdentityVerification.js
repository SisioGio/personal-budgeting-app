import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, UploadCloud, Loader2 } from "lucide-react";
import axios from "axios";

const IdentityVerification = ({
  uploadToS3,
  frontDocumentKey,
  guestId,
  backDocumentKey,
  token,
  setNewGuestForm,
  showNotification,
  loading,
  setLoading,
  setShowForm
}) => {
  
  const [selfie, setSelfie] = useState(null);
  const [selfieKey, setSelfieKey] = useState(null);

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (side === "selfie") setSelfie(file);
  };

  const validateIdentity = async () => {
    if (!selfie) return;
    setLoading(true);

    try {
      const uploadedSelfieKey = await uploadToS3(selfie, "Selfie");
      setSelfieKey(uploadedSelfieKey);

      const res = await axios.post(
        "https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/verify",
        {
          selfie: uploadedSelfieKey,
          front: frontDocumentKey,
          guest_id: guestId,
          back: backDocumentKey,
        },{headers: {'Authorization': `Bearer ${token}`}}
      );
      const result = res.data.resul
      console.log(res.data)
      if (result){
        console.log(res.data);
        showNotification({ text: "🎯 Identity successfully validated!", error: false });
        setShowForm(false)
        
      } else {

        showNotification({ text: "❌ Identity validation failed. Try again.", error: true });

      }

      
      return res.data;
    } catch (error) {
      console.error(error);
      showNotification({ text: "❌ Identity validation failed. Try again.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = (file) =>
    file && (
      <img
        src={URL.createObjectURL(file)}
        alt="Selfie Preview"
        className="mt-2 w-full h-40 object-cover rounded-xl border border-gray-300"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-2xl space-y-6 border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Identity</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Selfie</label>
        <label className="cursor-pointer flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-gray-100 transition">
          <Camera className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Tap to capture or upload</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, "selfie")}
            className="hidden"
          />
        </label>
        {renderPreview(selfie)}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={validateIdentity}
        disabled={loading || !selfie}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
          loading || !selfie
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <UploadCloud className="w-5 h-5" />
            Start Identification
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default IdentityVerification;
