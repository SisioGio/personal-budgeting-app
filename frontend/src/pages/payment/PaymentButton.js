import React, { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '../../utils/apiClient';

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();

  const paymentOptions = [
    { price_id: 'price_1RCFASGigBa3rtfTqPuLfwBS', name: 'Starter', quantity: 10, price: 1, currency: 'EUR' },
    { price_id: 'price_1RCFA5GigBa3rtfTFgDscTGQ', name: 'Medium', quantity: 100, price: 5, currency: 'EUR' },
    { price_id: 'price_1RBzmiGigBa3rtfTU4NvKfcM', name: 'Premium', quantity: 1000, price: 20, currency: 'EUR' },
  ];

  const [selectedOption, setSelectedOption] = useState(paymentOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [pagesAvailable, setPagesAvailable] = useState(0);
  const [pagesProcessed, setPagesProcessed] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(paymentOptions[0].price);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const returnedStatus = query.get('status');
    if (returnedStatus) {
      setStatus(returnedStatus);
      fetchPages();
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await apiClient.get('/documents');
      setPagesAvailable(res.data.pages_available);
      setPagesProcessed(res.data.pages_processed);
    } catch (err) {
      console.error('Failed to fetch pages data');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const urlParams = new URL(window.location.href);
      urlParams.searchParams.set('status', 'confirmed');
      const successUrl = urlParams.toString();

      urlParams.searchParams.set('status', 'canceled');
      const cancelUrl = urlParams.toString();

      const response = await apiClient.post('/payment/create', {
        price_id: selectedOption.price_id,
        quantity,
        pages: selectedOption.quantity * quantity,
        plan_name: selectedOption.name,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to create payment session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (event) => {
    const newQuantity = Math.max(1, parseInt(event.target.value) || 1);
    setQuantity(newQuantity);
    setTotalPrice(newQuantity * selectedOption.price);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    const newTotal = option.price * quantity;
    setTotalPrice(newTotal);
  };

  return (
    <div className=" py-2 flex flex-col items-center gap-3 rounded-lg bg-opacity-20 h-100 overflow-auto max-h-screen" >

      {/* Result Box */}
      <div className="from-indigo-900 w-full px-2 lg:p-6  rounded-3xl  text-center space-y-6">
        {status === 'confirmed' && (
          <>
            <h1 className="text-4xl font-extrabold text-green-400">🎉 Payment Successful</h1>
            <p className="text-lg text-gray-300">Thanks! Your credits have been added.</p>
          </>
        )}
        {status === 'canceled' && (
          <>
            <h1 className="text-4xl font-extrabold text-yellow-400">⚠️ Payment Canceled</h1>
            <p className="text-lg text-gray-300">No worries, you can try again anytime.</p>
          </>
        )}
        {!status && (
          <>
            <h1 className="text-4xl font-bold text-white">Increase your capacity</h1>
            <p className="text-gray-400">Choose your plan to get started.</p>
          </>
        )}

        <div className="mt-6 border-t text-white pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">📄 Pages Available:</span>
            <span>{pagesAvailable}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">🧾 Pages Processed:</span>
            <span>{pagesProcessed}</span>
          </div>
        </div>
      
       
        <div className="space-y-2">
          {paymentOptions.map((option) => (
            <label
              key={option.price_id}
              className={`block px-6 py-2 rounded-xl cursor-pointer border transition ${
                selectedOption.price_id === option.price_id
                  ? 'bg-indigo-700 border-indigo-400 text-white'
                  : 'bg-indigo-900 bg-opacity-30 border-indigo-600 text-gray-200 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={option.price_id}
                checked={selectedOption.price_id === option.price_id}
                onChange={() => handleOptionChange(option)}
                className="hidden"
              />
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">{option.name}</div>
                  <div className="text-sm">{option.quantity} pages</div>
                </div>
                <div className="text-xl font-bold">€{option.price}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-white font-medium text-lg">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full p-2 px-4 rounded-xl text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500 bg-opacity-15"
              placeholder="Enter quantity"
            />
          </div>

          <div className="flex justify-between items-center text-white font-medium text-md border-t border-gray-600 pt-4">
            <span>Total:</span>
            <span className="text-xl font-bold">€{(totalPrice).toFixed(2)}</span>
          </div>
          <div className="text-right text-sm text-gray-400">
            {quantity} unit{quantity > 1 ? 's' : ''} = {quantity * selectedOption.quantity} pages
          </div>
        </div>

        {error && <p className="text-red-400 text-center font-medium">{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white text-xl font-bold disabled:opacity-60"
        >
          {loading ? 'Redirecting…' : `Pay €${totalPrice.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
