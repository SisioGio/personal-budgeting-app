import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, UploadCloud, Image } from "lucide-react";
import axios from "axios";
import { useNotification } from "../../components/Notification";
import clsx from "clsx";
import stati from "./data/stati.json";
import comuni from "./data/comuni.json";
import documenti from "./data/documenti.json";
import province from "./data/province.json";
import Select from 'react-select';




const DataReview = ({handleSubmit,formData,handleChange}) => {
    const [error,setError] = useState({})
   
  const { showNotification } = useNotification();
const documentOptions =
  formData.stato_nascita_code === "100000100"
    ? comuni.map(({ Codice, Descrizione }) => ({
        value: Codice,
        label: Descrizione,
      }))
    : stati.map(({ Codice, Descrizione }) => ({
        value: Codice,
        label: Descrizione,
      }));
const countryOptions =
 stati.map(({ Codice, Descrizione }) => ({
        value: Codice,
        label: Descrizione,
      }))
const tipoDocumento =
 documenti.map(({ Codice, Descrizione }) => ({
        value: Codice,
        label: Descrizione,
      }))
const provinceOptions =
 province.map((item) => ({
        value: item,
        label: item,
      }))



const isItalian = formData.stato_nascita_code === "100000100";

const isMainGuest = ["16", "17", "18"].includes(formData.tipo_allogiato_code);


const comuniNascitaOptions = comuni
  .filter((comune) => comune.Provincia === formData.provincia_nascita)
  .map(({ Codice, Descrizione }) => ({
    value: Codice,
    label: Descrizione,
  }));


const comuniOptions = comuni
  .filter((comune) => comune.Provincia === formData.luogo_rilascio_provincia)
  .map(({ Codice, Descrizione }) => ({
    value: Codice,
    label: Descrizione,
  }));

  return (
    <div className="w-full mx-auto p-1">
      <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-8">
          Review Your Data
        </h2>


        <form
          onSubmit={handleSubmit}
         
        >
          <div  className="grid grid-cols-1 md:grid-cols-2 w-full gap-6 mb-6">
 {[
            {
              label: "First Name",
              name: "nome",
              type: "text",
            },
            {
              label: "Last Name",
              name: "cognome",
              type: "text",
            },
            {
              label: "Birthdate",
              name: "data_nascita",
              type: "date",
            },
          ].map(({ label, name, type }) => (
            <div key={name} className=" w-full flex flex-col">
              <label htmlFor={name} className="font-medium text-gray-700 mb-1 ">
                {label}
              </label>
              <input
                id={name}
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                className={clsx(
                  "p-3 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                  "border-gray-300",
                  error[name] && "border-red-500"
                )}
              />
              {error[name] && (
                <small className="text-sm text-red-500 mt-1">
                  {error[name]}
                </small>
              )}
            </div>
          ))}

          {/* sesso */}
          <div className="flex flex-col">
            <label htmlFor="sesso" className="font-medium text-gray-700 mb-1">
              Gender
            </label>

           <Select
                                id="sesso"
                                name="sesso"
                                options={[{'value' : '1', 'label':'Male'},{'value' : '2', 'label':'Female'}]}
                                value={[{'value' : '1', 'label':'Male'},{'value' : '2', 'label':'Female'}].find((opt) => opt.value === formData.sesso)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "sesso",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  error.sesso
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />

          
            {error.sesso && (
              <small className="text-sm text-red-500 mt-1">
                {error.sesso}
              </small>
            )}
          </div>  

          <div className="flex flex-col">
            <label
              htmlFor="stato_nascita_code"
              className="font-medium text-gray-700 mb-1"
            >
              Country of Birth
            </label>

            <Select
                                id="stato_nascita_code"
                                name="stato_nascita_code"
                                options={countryOptions}
                                value={countryOptions.find((opt) => opt.value === formData.stato_nascita_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "stato_nascita_code",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  error.sesso
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />
      
            {error.stato_nascita_code && (
              <small className="text-sm text-red-500 mt-1">
                {error.stato_nascita_code}
              </small>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="cittadinanza_code"
              className="font-medium text-gray-700 mb-1"
            >
              Citizenship
            </label>

             <Select
                                id="cittadinanza_code"
                                name="cittadinanza_code"
                                options={countryOptions}
                                value={countryOptions.find((opt) => opt.value === formData.cittadinanza_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "cittadinanza_code",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  error.sesso
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />

            {error.cittadinanza_code && (
              <small className="text-sm text-red-500 mt-1">
                {error.cittadinanza_code}
              </small>
            )}
          </div>

          {isItalian &&(
            <div className="flex flex-col">
                <label
                  htmlFor="provincia_nascita"
                  className="font-medium text-gray-700 mb-1"
                >
                  Province of Birth
                </label>

                 <Select
                                id="provincia_nascita"
                                name="provincia_nascita"
                                options={provinceOptions}
                                value={provinceOptions.find((opt) => opt.value === formData.provincia_nascita)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "provincia_nascita",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  error.sesso
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />
           
                {error.provincia_nascita && (
                  <small className="text-sm text-red-500 mt-1">
                    {error.provincia_nascita}
                  </small>
                )}
              </div>
          )}

          {isItalian && formData.provincia_nascita !== '' && (
            <div className="flex flex-col">
                <label
                  htmlFor="comune_nascita_code"
                  className="font-medium text-gray-700 mb-1"
                >
                  City of Birth
                </label>

                <Select
                                id="comune_nascita_code"
                                name="comune_nascita_code"
                                options={comuniNascitaOptions}
                                value={comuniNascitaOptions.find((opt) => opt.value === formData.comune_nascita_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "comune_nascita_code",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  formData.tipo_documento_score < 0.9 || error.tipo_documento_code
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />


                {error.comune_nascita_code && (
                  <small className="text-sm text-red-500 mt-1">
                    {error.comune_nascita_code}
                  </small>
                )}
              </div>
          )
          }
        {isMainGuest && (
              <div className="flex flex-col">
                <label
                  htmlFor="tipo_documento_code"
                  className="font-medium text-gray-700 mb-1"
                >
                  Document Type
                </label>

                <Select
                                id="tipo_documento_code"
                                name="tipo_documento_code"
                                options={tipoDocumento}
                                value={tipoDocumento.find((opt) => opt.value === formData.tipo_documento_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "tipo_documento_code",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  formData.tipo_documento_score < 0.9 || error.tipo_documento_code
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />

                {error.tipo_documento_code && (
                  <small className="text-sm text-red-500 mt-1">
                    {error.tipo_documento_code}
                  </small>
                )}
              </div>

        )}

        {isMainGuest && (
          <div className="flex flex-col">
                <label
                  htmlFor="numero_documento"
                  className="font-medium text-gray-700 mb-1"
                >
                  Document Number
                </label>
                <input
                  id="numero_documento"
                  type="text"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleChange}
                  required
                  className={clsx(
                    "w-full p-3 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                    "border-gray-300",
                    error.numero_documento && "border-red-500"
                  )}
                />
                {error.numero_documento && (
                  <small className="text-sm text-red-500 mt-1">
                    {error.numero_documento}
                  </small>
                )}
              </div>
        )
        }
        {isMainGuest && (
          

                       <div className="flex flex-col">
                              <label htmlFor="luogo_rilascio_paese_code" className="font-medium text-gray-700 mb-1">
                                Document Issuing Country
                              </label>
                    
                              <Select
                                id="luogo_rilascio_paese_code"
                                name="luogo_rilascio_paese_code"
                                options={countryOptions}
                                value={countryOptions.find((opt) => opt.value === formData.luogo_rilascio_paese_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "luogo_rilascio_paese_code",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                                  "border-gray-300",
                                  formData.luogo_rilascio_paese_score < 0.9 || error.luogo_rilascio_paese_code
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />

                              {error.luogo_rilascio_paese_code && (
                                <small className="text-sm text-red-500 mt-1">
                                  {error.luogo_rilascio_paese_code}
                                </small>
                              )}
                      </div>
)
        }


        {isMainGuest && formData.luogo_rilascio_paese_code && formData.luogo_rilascio_paese_code === "100000100" && (
<div className="flex flex-col">
                              <label htmlFor="luogo_rilascio_provincia" className="font-medium text-gray-700 mb-1">
                                Document Issuing Province
                              </label>
                    
                              <Select
                                id="luogo_rilascio_provincia"
                                name="luogo_rilascio_provincia"
                                options={provinceOptions}
                                value={provinceOptions.find((opt) => opt.value === formData.luogo_rilascio_provincia)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "luogo_rilascio_provincia",
                                      value: selected?.value || "",
                                      text: selected?.label || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                    "border-gray-300",
                                  error.luogo_rilascio_provincia
                                    ? "border-red-500"
                                    : ""
                                )}

                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                              />

                              {error.luogo_rilascio_provincia && (
                                <small className="text-sm text-red-500 mt-1">
                                  {error.luogo_rilascio_provincia}
                                </small>
                              )}
                      </div>

        )
        
        }


        {isMainGuest && formData.luogo_rilascio_paese_code && formData.luogo_rilascio_paese_code === "100000100" && formData.luogo_rilascio_provincia && (

<div className="flex flex-col">
                              <label htmlFor="luogo_rilascio_comune_code" className="font-medium text-gray-700 mb-1">
                                Document Issuing Comune
                              </label>
                    
                              <Select
                                id="luogo_rilascio_comune_code"
                                name="luogo_rilascio_comune_code"
                                options={comuniOptions}
                                value={comuniOptions.find((opt) => opt.value === formData.luogo_rilascio_comune_code)}
                                onChange={(selected) =>
                                  handleChange({
                                    target: {
                                      name: "luogo_rilascio_comune_code",
                                      value: selected?.value || "",
                                    },
                                  })
                                }
                                placeholder="Start typing to search..."
                                classNamePrefix="react-select"
                                className={clsx(
                                  "w-full p-1 border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                    "border-gray-300",
                                  formData.luogo_rilascio_comune_score < 0.9 || error.luogo_rilascio_comune_code
                                    ? "border-red-500"
                                    : ""
                                )}
                                styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "none",
                                  boxShadow: "none", // removes inner shadow on focus
                                  backgroundColor: "transparent", // optional: match your background
                                }),
                              }}
                                
                              />

                              {error.luogo_rilascio_comune_code && (
                                <small className="text-sm text-red-500 mt-1">
                                  {error.luogo_rilascio_comune_code}
                                </small>
                              )}
                      </div>
        )}
                      
                     
                      
          
        


          </div>  

          
         
         

          

       



         
          
          {/* Submit Button */}
          <div className="col-span-full">
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-md transition duration-200"
            >
              {["16", "17", "18"].includes(formData.guest_type_code)
                ? "Submit & Verify"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataReview;