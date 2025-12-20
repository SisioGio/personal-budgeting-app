import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Check if the user has already accepted cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true); // Show the banner if no consent is saved
    }
  }, []);

  // Function to handle the accept button click
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted'); // Save the user's choice
    setIsVisible(false); // Hide the banner
  };

  // Function to handle the decline button click
  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined'); // Save the user's choice
    setIsVisible(false); // Hide the banner
  };

  // If the banner is visible, render it
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-lg z-50">
      <div className="flex items-center space-x-4">
        <p className="text-sm sm:text-base">
          This website uses cookies to ensure you get the best experience on our website. 
          <a href="/privacy-policy" className="text-yellow-400 underline ml-1">Learn more</a>.
        </p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleDecline}
          className="px-4 py-2 text-sm bg-gray-600 rounded-full hover:bg-gray-500 transition duration-200"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 text-sm bg-green-500 text-gray-800 rounded-full hover:bg-green-400 transition duration-200"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
