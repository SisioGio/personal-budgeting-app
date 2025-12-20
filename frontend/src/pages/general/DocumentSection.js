import { Loader2 } from "lucide-react"; // Or any spinner icon you prefer
import { motion, AnimatePresence } from "framer-motion";
import { File, X } from 'lucide-react';
const DocumentSection = ({ section,handleChange,formData,sectionIndex,showNotification, handleFileChange,removeFile,filesBySection ,handleFilesSubmit,loading}) => {


    return(
 
    <div className="space-y-2 bg-gray-50 p-6 rounded-lg shadow-md relative">
      <h2 className="text-lg font-semibold text-gray-800">{section.section}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {section.fields.map((field) => (
          <div key={`${section.section}.${field.id}`} className="text-gray-600">
            <input
              type={field.type}
              value={formData[`${section.section}.${field.id}`] || ""}
              onChange={(e) =>
                handleChange(e, section.section, field.id, e.target.value)
              }
              autoComplete="off"
              name={field.nome}
              placeholder={field.comment || `Enter ${field.nome}`}
              className="w-full p-4 bg-white bg-opacity-60 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-green-100 focus:bg-opacity-80 transition duration-200"
              required
            />
          </div>
        ))}
      </div>

      {section.attachments && section.attachments.length > 0 && (
        <div>
          <div>Allegati</div>
          <div className="mt-2 gap-2 grid grid-cols-4">
            {section.attachments.map((attachment, index) => (
              <div key={index}>
                <img src={attachment.url || "/default-icon.png"} alt="" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block mb-2 font-medium text-gray-700">
          Carica documenti per '{section.section}'
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, section.section)}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />

        {/* Preview uploaded files */}
        {filesBySection[section.section] && filesBySection[section.section].length > 0 && (
          <div className="flex mt-3 max-h-40 overflow-y-auto space-x-3">
            {filesBySection[section.section].map((file, idx) => (
              <div
                key={idx}
                className="bg-white p-2 rounded shadow flex flex-col items-start relative justify-center max-w-56 max-h-56"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover rounded mx-auto max-h-32"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <File width={36} height={36} className="text-gray-600 mb-2" />
                    <span className="block truncate text-xs text-gray-500 max-w-40">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute top-2 right-2 hover:text-gray-800 text-red-600"
                  onClick={() => removeFile(section.section, idx)}
                >
                  <X />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <button
          type="button"
          className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition duration-200"
          onClick={(e) => handleFilesSubmit(e, section.section)}
        >
          Estrazione Automatica
        </button>
      </div>


      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center z-10">
             <AnimatePresence>
   
        <motion.div
          className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />

            {/* Animate text */}
            <motion.p
                className="text-gray-800 text-lg font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.1,
                }}
                >
  Stiamo elaborando i documenti...
</motion.p>
          </motion.div>
          
        </motion.div>
    
    </AnimatePresence>
        </div>
      )}
    </div>
 
      )
  }



export default DocumentSection;
