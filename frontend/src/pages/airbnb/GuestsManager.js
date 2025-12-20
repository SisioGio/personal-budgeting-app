import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useNotification } from "../../components/Notification";
import DocumentUpload from "./GuestDataCollector";
import apiClient from "../../utils/apiClient";
import FullScreenLoader from "../../utils/Loader";


const useDecodedToken = (token) => {
  const [decoded, setDecoded] = useState(null);
  
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        
        setDecoded(decodedToken);
      } catch (error) {
        setDecoded(null)
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  return decoded;
};

const GuestsManager = () => {
  const [loading,setLoading] = useState(true);
  const [bookingCompleted,setBookingCompleted] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const { showNotification } = useNotification();
  const [guests, setGuests] = useState([]);
  const decodedToken = useDecodedToken(token);
  const [showForm,setShowForm] = useState(false);

  useEffect(() => {
    if (decodedToken) {
      fetchGuests();
    }
  }, [decodedToken]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/guest`,{ headers: {'Authorization': `Bearer ${token}`}}  );
      setGuests(res.data.guests || []);
      setBookingCompleted(res.data.booking_complete || false);

    } catch (err) {
      console.error("Error fetching guests:", err);
      showNotification({ text: "Failed to fetch guests", error:true });
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (guest_id) => {
    try {
      setLoading(true);
      await axios.delete(`https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/guest?guest_id=${guest_id}`,{headers: {'Authorization': `Bearer ${token}`}});
      fetchGuests();
      showNotification({ text: "Guest successfully deleted!", error:false });
    } catch (err) {
      console.error("Error deleting guest:", err);
      showNotification({ text: "Failed to delete guest", error:true });
    } finally {
      setLoading(false);
    }
  };

  const submitDocuments = async () => {
    try {
      setLoading(true);
      await axios.post(
        "https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/airbnb/api/guest/submit",
        {},
        {headers: {'Authorization': `Bearer ${token}`}}
      );
      showNotification({ text: "Data successfully submitted!", error:false});
      fetchGuests();
    } catch (err) {
      console.error("Error submitting documents:", err);
      showNotification({ text: err?.response?.data?.message || "Failed to submit documents", error:true });
    } finally {
      setLoading(false);
    }
  };
if (!token ) return (
  
  <div className="flex justify-center items-center h-screen fixed top-0 start-0 w-full bg-gray-300 z-40">
    <h1 className="text-2xl text-red-500">Invalid URL, please verify your link and try again</h1>
  </div>

  )
if (token && !decodedToken ) return (
  
  <div className="flex justify-center items-center h-screen fixed top-0 start-0 w-full bg-gray-300 z-40">
    <h1 className="text-2xl text-red-500">Invalid token, please verify your link and try again</h1>
  </div>

  )

  if (!token || !decodedToken) return (
  
  <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>

  )


  if(bookingCompleted) {

    return(
  <div className="flex justify-center items-center h-screen fixed top-0 start-0 w-full bg-green-300  bg-opacity-50 z-40">
        <h1 className="text-2xl text-gray-700 font-bold p-3 ">Booking completed, you can now proceed to check-in</h1>
      </div>
    )


  }

  if (showForm) return (
<div className="min-h-screen bg-indigo-400  absolute top-0 start-0 w-full z-50 flex items-center justify-center">
   <div className="w-full md:w-3/4 lg:w-1/2   rounded-lg overflow-hidden">
    <DocumentUpload 
          loading={loading}
          setLoading={setLoading}
            fetchGuests={fetchGuests} 
            booking_id={decodedToken.booking_id} 
            host_id={decodedToken.host_id} 
            apartment_id={decodedToken.apartment_id}  
            token={token}
            setShowForm={setShowForm}
          />
    </div>

     <FullScreenLoader loading={loading}/>

   </div>
  )
    
  return (
    <div className="min-h-screen bg-gray-100   mx-auto absolute top-0 start-0 w-full z-50 flex items-center">



      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
    
   
        <div className="p-2 space-y-8 mt-0"  >
          <BookingDetails booking={decodedToken} />
          <GuestList guests={guests} onDeleteGuest={deleteGuest} loading={loading} expectedGuests={decodedToken.number_of_guests} />
          

           <div>
        <button
          className="btn border-green-500 border p-3 rounded-md"
          onClick={() => (setShowForm(true),console.log("Show form clicked"))}
        >
          Add a new guest
        </button>
      </div>
          <SubmitButton 
            onSubmit={submitDocuments} 
            
            disabled={false && guests.length !== decodedToken.number_of_guests} 
          />
        </div>
      </div>

      <FullScreenLoader loading={loading}/>
    </div>
  );
};

const BookingDetails = ({ booking }) => (
  <div className="bg-gray-50 rounded-lg p-6 shadow">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <p><span className="font-medium">Booking Code:</span> {booking.booking_id}</p>
      <p><span className="font-medium">Guests:</span> {booking.number_of_guests}</p>
      <p><span className="font-medium">Check-in:</span> {new Date(booking.checkin).toLocaleDateString()}</p>
      <p><span className="font-medium">Check-out:</span> {new Date(booking.checkout).toLocaleDateString()}</p>
    </div>
  </div>
);

const GuestList = ({ guests, onDeleteGuest, loading, expectedGuests }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800">Guest List</h2>
    {loading ? (
      <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guests.map((guest) => (
          <GuestCard key={guest.guest_id} guest={guest} onDelete={onDeleteGuest} />
        ))}
        {Array.from({ length: expectedGuests - guests.length }, (_, index) => (
          <EmptyGuestCard key={index} guestNumber={index + guests.length + 1} />
        ))}
      </div>
    )}
  </div>
);

const GuestCard = ({ guest, onDelete }) => (
  <div className={`border rounded-lg p-1 shadow-sm ${guest.sent ? 'bg-green-50' : 'bg-white'}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{guest.nome} {guest.cognome}</h3>
        <p className="text-sm text-gray-600">{guest.tipo_documento}: {guest.numero_documento}</p>
        <p className="text-sm text-gray-600">{guest.guest_type_code}</p>
      </div>
      <button
        onClick={() => onDelete(guest.guest_id)}
        className="text-red-600 hover:text-red-800 transition"
      >
        Delete
      </button>
    </div>
  </div>
);

const EmptyGuestCard = ({ guestNumber }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 flex flex-col items-center justify-center  text-gray-400">
    <span className="text-lg font-semibold">Guest {guestNumber}</span>
    <span className="text-sm">No data entered</span>
  </div>
);

const SubmitButton = ({ onSubmit, disabled }) => (
  <button
    onClick={onSubmit}
    disabled={disabled}
    className={`w-full py-3 rounded-lg text-white font-semibold transition ${
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"
    }`}
  >
    Submit Data
  </button>
);

export default GuestsManager;