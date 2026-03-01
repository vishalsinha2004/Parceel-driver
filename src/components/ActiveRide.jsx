import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from '../api/axios'; // Your configured axios

// Connect to your Django backend URL (Update port if needed)
const socket = io('http://localhost:8000'); 

export default function DriverActiveRide({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // 1. Fetch Order Details to get Customer Phone Number
    axios.get(`/api/orders/${orderId}/`).then((res) => setOrder(res.data));

    // 2. Join the Socket Room for this specific order
    socket.emit('join_order', { order_id: orderId });

    return () => socket.disconnect();
  }, [orderId]);

  const handleAcceptRide = async () => {
    try {
      await axios.post(`/api/orders/${orderId}/accept_ride/`);
      socket.emit('ride_accepted', { order_id: orderId });
      alert("Ride accepted!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRide = async () => {
    try {
      // Hit backend API to complete ride
      await axios.post(`/api/orders/${orderId}/complete_ride/`);
      
      // Notify customer app in real-time
      socket.emit('ride_completed', { order_id: orderId });
      alert("Ride completed successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded shadow-lg">
      <h2 className="text-xl font-bold">Current Ride</h2>
      
      {/* SHOW CUSTOMER DETAILS TO DRIVER */}
      <div className="my-4 p-2 bg-gray-100 rounded">
        <p><strong>Customer:</strong> {order.customer_name}</p>
        <p><strong>Phone:</strong> {order.customer_phone || "Not provided"}</p>
      </div>

      <div className="flex gap-4">
        <button onClick={handleAcceptRide} className="bg-blue-500 text-white p-2 rounded">
          Accept Ride
        </button>
        <button onClick={handleCompleteRide} className="bg-green-500 text-white p-2 rounded">
          Complete Delivery
        </button>
      </div>
    </div>
  );
}