import React, { useState, useEffect } from 'react';
import apiClient from './../utils/apiClient'

const NewsletterPopup = () => {
    // State for showing/hiding the popup and handling the email input
    const [showPopup, setShowPopup] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showButton, setShowButton] = useState(false); // State to control the visibility of the open button
    const [isSubscribed, setIsSubscribed] = useState(false);
    // Check if the user is already subscribed from localStorage
  useEffect(() => {
    const subscriptionStatus = localStorage.getItem('isSubscribed');
    if (subscriptionStatus === 'true') {
      setIsSubscribed(true);
    }
  }, []);
  
  // Trigger popup after 3 seconds if the user is not subscribed
  useEffect(() => {
    if (!isSubscribed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer); // Clean up the timer if the component unmounts
    }
  }, [isSubscribed]);
  
    // Handle email input change
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!email) return;
  
      setLoading(true);
      setError(null);
      setSuccess(false);
  
      try {
        // Send email to the newsletter API
        const response = await apiClient.post('newsletter', { email });
        if (response.status === 200) {
            localStorage.setItem("isSubscribed",true)
          setSuccess(true);
        }
        console.log(response.status)
        
      } catch (error) {
        if (error.status ===400){
            localStorage.setItem("isSubscribed",true)
          setShowPopup(false)
        } else{
            setError('Failed to subscribe. Please try again later.');
        }
        
      } finally {
        setLoading(false);
      }
    };
  
    // Close the pop-up and show the button at the bottom of the screen
    const handleClose = () => {
      setShowPopup(false);
      setShowButton(true); // Show the "Subscribe and get 100 pages more!" button
    };
  
    // Open the pop-up again when the button is clicked
    const handleOpen = () => {
      setShowPopup(true);
      setShowButton(false); // Hide the button when the pop-up opens
    };
  
    return (
      <>
        {showPopup && (
          <div className="min-h-screen flex justify-center items-center bg-indigo-600 bg-opacity-15 px-2 fixed inset-0 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center text-purple-700 mb-4">
              Get 100 Pages FREE! Subscribe to Our Newsletter
            </h2>
              <p className="text-center text-purple-600 mb-4">
                Sign up now and receive <strong>100 additional pages</strong> absolutely FREE! Stay updated with our latest features, exclusive offers, and more.
              </p>
  
              {success && (
                <div className="text-green-600 text-center mb-4">
                  <strong>Thank you for subscribing!</strong>
                </div>
              )}
  
              {error && (
                <div className="text-red-600 text-center mb-4">
                  <strong>{error}</strong>
                </div>
              )}
  
              <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="w-full p-3 mb-4 rounded-md border-2 border-gray-300 text-gray-700"
                  disabled={loading || success}
                />
                <button
                  type="submit"
                  className={`w-full py-2 rounded-md text-white ${loading || success ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                  disabled={loading || success}
                >
                  {loading ? 'Subscribing...' : success ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
           
              <button
                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                onClick={handleClose}
              >
                Close
              </button>
              <small className="text-gray-500 block text-center mb-4">
  * Additional pages will be added only if you already have an account.
</small>
            </div>
       

          </div>
        )}
  
        {/* Button to show at the bottom of the screen once the pop-up is closed */}
        {showButton && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 ">
          <button
            onClick={handleOpen}
            className="w-full py-4 px-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 active:scale-95"
          >
            <span className="font-semibold text-lg">
              Subscribe and get 100 pages more!
            </span>
          </button>
        </div>
        
        )}
      </>
    );
  };
  
export default NewsletterPopup;
