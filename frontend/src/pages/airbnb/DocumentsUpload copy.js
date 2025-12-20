import React, { useState } from "react";
import axios from "axios";
import { useNotification } from "../../components/Notification";
import stati from "./data/stati.json";
import comuni from "./data/comuni.json";
import documenti from "./data/documenti.json";
import tipiOspite from "./data/tipo_alloggiato.json";
import province from "./data/province.json";
const DocumentUpload = ({
  host_id,
  apartment_id,
  booking_id,
  token,
  fetchGuests,
}) => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [newGuestForm, setNewGuestForm] = useState(false);
  const { showNotification } = useNotification();
  const [selectedStep, setSelectedStep] = useState(0);
  const [error,setError] = useState({})
  const [frontDocumentKey,setFrontDocumentKey] = useState(null)
  const [backDocumentKey,setBackDocumentKey] = useState(null)
  const [selfieKey,setSelfieKey] = useState(null)
  const [formData, setFormData] = useState({
    guest_id: null,
    booking_id: booking_id || "",
    guest_type: "",
    guest_type_code: "",
    name: "",
    last_name: "",
    birthdate: "",
    gender: "",
    comune_nascita: "",
    comune_nascita_code: "",
    provincia_nascita: "",
    paese_nascita: "",
    paese_nascita_code: "",
    cittadinanza: "",
    cittadinanza_code: "",
    tipo_documento: "",
    tipo_documento_code: "",
    numero_documento: "",
    luogo_rilascio: "",
    luogo_rilascio_code: "",
  });
  const [guestId, setGuestId] = useState(null);
  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (side === "front") setFrontFile(file);
    if (side === "back") setBackFile(file);
    if (side === "selfie") setSelfie(file);
  };

  const handleChange = (e) => {
    const { name, value, options, selectedIndex } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name.includes("_code") && {
        [name.replace("_code", "")]: options[selectedIndex]?.text || "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://cnho0zr7e8.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/guest",
        formData,
        {
          headers: { Authorization: token },
        }
      );

      showNotification({ text: "🎯 Data successfully saved!", error: false });
      fetchGuests();
      const guestId = res.data["guest_id"];
      setGuestId(guestId);
      if (['16','17','18'].includes(formData.guest_type_code)){
        setSelectedStep(3);
      } else{

         setNewGuestForm(false)
        showNotification({ text: "🎯 Identity successfully validated!", error: false });
      }
      
      setFormData((prev) => ({ ...prev, name: "", last_name: "" })); 
    } catch (err) {
      showNotification({ text: "⚠️ Something went wrong...", error: true });
      setError(err.response.data)
      console.error(err);
    }
  };

  const getPresignedUrl = async (fileName, contentType) => {
    console.log(fileName, contentType);
    const res = await axios.post(
      "https://cnho0zr7e8.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/uploadurl",
      {
        fileName: fileName,
        bnb_id: host_id,
        apartment_id: apartment_id,
        booking_id: booking_id,
        content_type: contentType,
      },
      {
        headers: { Authorization: token },
      }
    );
    return res.data;
  };

  const uploadToS3 = async (file, label) => {
    if (!file) return;
    var uploadResponse = await getPresignedUrl(file.name, file.type);
    console.log(uploadResponse);
    const presignedUrl = uploadResponse.uploadUrl;
    const fileKey = uploadResponse.fileKey;
    const response = await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });

    setMessage((prev) => prev + `${label} uploaded successfully.\n`);
    return fileKey;
  };

  const extractDataFromDocument = async (files) => {
    console.log(files);
    const res = await axios.post(
      "https://cnho0zr7e8.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/extract",
      { files: files },
      {
        headers: { Authorization: token },
      }
    );
    return res.data;
  };

  const validateIdentity = async () => {

    const selfieKey = await uploadToS3(selfie, "Selfie");
    setSelfieKey(selfieKey)
    const res = await axios.post(
      "https://cnho0zr7e8.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/verify",
      { selfie: selfieKey, document: frontDocumentKey, guest_id: guestId,backDocumentKey:backDocumentKey },
      {
        headers: { Authorization: token },
      }
    );
    console.log(res.data);

    setNewGuestForm(false)
    showNotification({ text: "🎯 Identity successfully validated!", error: false });
    return res.data;
  };


  const handleUpload = async () => {
    try {
      setUploading(true);
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
      const extractionResponse = await extractDataFromDocument(files, selfie);
      extractionResponse['guest_type_code'] = formData.guest_type_code
      extractionResponse['guest_type'] = formData.guest_type
      setFormData(extractionResponse);
      
      setSelectedStep(2);
      // const verificationResponse = await validateIdentity(guestId,selfieDocumentKey,frontDocumentKey)
      // console.log(verificationResponse)
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };



  if (newGuestForm) {
    return (
      <div className="absolute top-0 start-0 w-full mx-auto p-4 border rounded-2xl shadow-md space-y-4 bg-white min-h-screen">
        <div className="w-1/2 mx-auto">
          <h1 className="text-2xl text-center font-bold">Checking Procedure</h1>
          {/* <div className="flex justify-center gap-2">
            <button
              className={`p-3 text-center rounded-md flex-grow block ${
                selectedStep === 0 ? " bg-green-600" : "bg-gray-300"
              }`}
              onClick={() => setSelectedStep(1)}
            >
              Guest Type
            </button>
            <button
              className={`p-3 text-center rounded-md flex-grow block ${
                selectedStep === 1 ? " bg-green-600" : "bg-gray-300"
              }`}
              onClick={() => setSelectedStep(1)}
            >
              Upload Your Documents
            </button>
            <button
              className={`p-3 text-center rounded-md flex-grow block ${
                selectedStep === 2 ? " bg-green-600" : "bg-gray-300"
              }`}
              onClick={() => setSelectedStep(2)}
            >
              Verify Your Data
            </button>
            <button
              className={`p-3 text-center rounded-md flex-grow block ${
                selectedStep === 3 ? " bg-green-600" : "bg-gray-300"
              }`}
              onClick={() => setSelectedStep(3)}
            >
              Identity Check
            </button>
          </div> */}
            {
              selectedStep === 0 &&(
                <div>

                  Select the type of guest
                       {/* Guest Type */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label
                    htmlFor="guest_type_code"
                    className="font-medium text-gray-700 mb-1 "
                  >
                    Guest Type
                  </label>
                  <select
                    id="guest_type_code"
                    name="guest_type_code"
                    value={formData.guest_type_code}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'guest_type_code' in error  && ' border-red-500'}`}
                  >
                    <option value="">Select a type</option>
                    {tipiOspite.map(({ Codice, Descrizione }) => (
                      <option key={Codice} value={Codice}>
                        {Descrizione}
                      </option>
                    ))}
                  </select>
                  
                  {'guest_type_code' in error && <small className="text-sm text-red-500 px-1">{error['guest_type_code']}</small>}

                </div>
           {/* Submit Button */}
                <div className="col-span-full flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={()=>['16','17','18'].includes(formData.guest_type_code) ? setSelectedStep(1): setSelectedStep(2)}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
                  >
                    Next
                  </button>
                </div>

                </div>
              )
            }
          {selectedStep === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-center">
                Upload Document
              </h2>

              <div className="space-y-2">
                <label className="block font-medium">Front of Document</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, "front")}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Back of Document</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, "back")}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !frontFile || !backFile}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Submit Documents"}
              </button>

              {/* {message && <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>} */}
            </div>
          )}

          {selectedStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-center">
                Review Your Data
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 border border-blue-200 rounded-xl"
              >
           

                {/* First Name */}
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'name' in error  && ' border-red-500'}`}
                  />
                  {'name' in error && <small className="text-sm text-red-500 px-1">{error['name']}</small>}
                </div>

                {/* Last Name */}
                <div className="flex flex-col">
                  <label
                    htmlFor="last_name"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'last_name' in error  && ' border-red-500'}`}
                  />
                  {'last_name' in error && <small className="text-sm text-red-500 px-1">{error['last_name']}</small>}
                </div>

                {/* Birthdate */}
                <div className="flex flex-col">
                  <label
                    htmlFor="birthdate"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Birthdate
                  </label>
                  <input
                    id="birthdate"
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'birthdate' in error  && ' border-red-500'}`}
                  />

                  {'birthdate' in error && <small className="text-sm text-red-500 px-1">{error['birthdate']}</small>}
                </div>

                {/* Gender */}
                <div className="flex flex-col">
                  <label
                    htmlFor="gender"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'gender' in error  && ' border-red-500'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </select>
                   {'gender' in error && <small className="text-sm text-red-500 px-1">{error['gender']}</small>}
                </div>

                {/* Country of Birth */}
                <div className="flex flex-col">
                  <label
                    htmlFor="paese_nascita_code"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Country of Birth
                  </label>
                  <select
                    id="paese_nascita_code"
                    name="paese_nascita_code"
                    value={formData.paese_nascita_code}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${formData.paese_nascita_score<.8 || 'paese_nascita_code' in error  && 'border-red-500'}`}
                  >
                    <option value="">Select Country</option>
                    {stati.map(({ Codice, Descrizione }) => (
                      <option key={Codice} value={Codice}>
                        {Descrizione}
                      </option>
                    ))}
                  </select>

                   {'paese_nascita_code' in error && <small className="text-sm text-red-500 px-1">{error['paese_nascita_code']}</small>}
                </div>

                {/* Citizenship */}
                <div className="flex flex-col">
                  <label
                    htmlFor="cittadinanza_code"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Citizenship
                  </label>
                  <select
                    id="cittadinanza_code"
                    name="cittadinanza_code"
                    value={formData.cittadinanza_code}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${formData.cittadinanza_score<.8 || 'cittadinanza_code' in error  && 'border-red-500'}`}
                  >
                    <option value="">Select Citizenship</option>
                    {stati.map(({ Codice, Descrizione }) => (
                      <option key={Codice} value={Codice}>
                        {Descrizione}
                      </option>
                    ))}
                  </select>

                   {'cittadinanza_code' in error && <small className="text-sm text-red-500 px-1">{error['cittadinanza_code']}</small>}
                </div>

                {/* Province of Birth */}
                {formData.paese_nascita_code == "100000100" && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="provincia_nascita"
                      className="font-medium text-gray-700 mb-1"
                    >
                      Province of Birth
                    </label>
                    <select
                      id="provincia_nascita"
                      name="provincia_nascita"
                      value={formData.provincia_nascita}
                      onChange={handleChange}
                      required
                     className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'provincia_nascita' in error  && ' border-red-500'}`}
                    >
                      <option value="">Select Province</option>
                      {province.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    {'provincia_nascita' in error && <small className="text-sm text-red-500 px-1">{error['provincia_nascita']}</small>}
                  </div>
                )}

                {/* City of Birth (conditional) */}
                {formData.paese_nascita_code == "100000100" && (
                  <div className="flex flex-col">
                    <label
                      htmlFor="comune_nascita_code"
                      className="font-medium text-gray-700 mb-1"
                    >
                      City of Birth
                    </label>
                    <select
                      id="comune_nascita_code"
                      name="comune_nascita_code"
                      value={formData.comune_nascita_code}
                      onChange={handleChange}
                      className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${formData.comune_nascita_score<.8 || 'comune_nascita_code' in error && 'border-red-500'}`}
                    >
                      <option value="">Select City</option>
                      {comuni
                        .filter(
                          (comune) =>
                            comune.Provincia === formData.provincia_nascita
                        )
                        .map(({ Codice, Descrizione }) => (
                          <option key={Codice} value={Codice}>
                            {Descrizione}
                          </option>
                        ))}
                    </select>
                     {'comune_nascita_code' in error && <small className="text-sm text-red-500 px-1">{error['comune_nascita_code']}</small>}
                  </div>
                )}

                {/* Document Type */}
                {['16','17','18'].includes(formData.guest_type_code) && (
                  
               <>
                <div className="flex flex-col">
                  <label
                    htmlFor="tipo_documento_code"
                    className="font-medium text-gray-700 mb-1"
                  >
                    Document Type
                  </label>
                  <select
                    id="tipo_documento_code"
                    name="tipo_documento_code"
                    value={formData.tipo_documento_code}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${formData.tipo_documento_score<.9 || 'tipo_documento_code' in error  && 'border-red-300'}`}
                  >
                    <option value="">Select Document Type</option>
                    {documenti.map(({ Codice, Descrizione }) => (
                      <option key={Codice} value={Codice}>
                        {Descrizione}
                      </option>
                    ))}
                  </select>
                   {'tipo_documento_code' in error && <small className="text-sm text-red-500 px-1">{error['tipo_documento_code']}</small>}
                </div>

                {/* Document Number */}
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
                    className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500 ${'numero_documento' in error  && ' border-red-500'}`}
                  />

                  {'numero_documento' in error && <small className="text-sm text-red-500 px-1">{error['numero_documento']}</small>}
                </div>
</>
 )}
                {/* Submit Button */}
                <div className="col-span-full flex justify-end mt-6">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition"
                  >
                   {['16','17','18'].includes(formData.guest_type_code)?'Submit & Verify':'Submit'} 
                  </button>
                </div>

                
 
              </form>
            </div>
          )}

          {selectedStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-center">
                Verify Your Identity
              </h2>
              <div className="space-y-2">
                <label className="block font-medium">Your selfie</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, "selfie")}
                />
              </div>
              <button
                onClick={validateIdentity}
                disabled={uploading || !selfie}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? "Verifying..." : "Start Identification"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <button
          className="btn border-green-500 border p-3 rounded-md"
          onClick={() => (setSelectedStep(0),setNewGuestForm(true))}
        >
          Add a new guest
        </button>
      </div>
    );
  }
};

export default DocumentUpload;
