import React, { useState } from 'react';
import axios from 'axios';

const RegisterUser = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('users', {
        email,
        name,
      });
      setMessage('User registered successfully!');
      setEmail('');
      setName('');
    } catch (error) {
        console.log(error)
      setMessage('Error registering user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Create an Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="relative">
          <label htmlFor="email" className="absolute text-sm text-gray-500 left-3 top-3 transition-all duration-300 transform -translate-y-1/2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-3 mt-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Name Input */}
        <div className="relative">
          <label htmlFor="name" className="absolute text-sm text-gray-500 left-3 top-3 transition-all duration-300 transform -translate-y-1/2">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-3 mt-4 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-blue-500 text-white font-semibold rounded-md transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path d="M4 12a8 8 0 1 1 16 0A8 8 0 1 1 4 12z" fill="none" />
              </svg>
              Registering...
            </div>
          ) : (
            'Register'
          )}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`mt-6 text-center p-3 rounded-md text-white ${
            message.includes('success') ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
