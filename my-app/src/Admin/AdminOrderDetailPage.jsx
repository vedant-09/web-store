import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminOrderDetailPage() {
  const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);
  const [error, setError] = useState("");

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("Please enter a valid order ID.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/admin/order-details/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setOrderDetails(data.orderDetails);
        setError("");
      } else {
        setOrderDetails([]);
        setError(data.message || "No order details found.");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Server error. Please try again later.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchOrderDetails();
    }
  };

  return (
    <div className="container mt-4">
      <Link type="button" className="btn btn-secondary mb-3" to="/admin/dashboard/orders">
        Back to Orders
      </Link>

      <h2>Order Details</h2>

      {/* Order ID Input */}
      <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="btn btn-primary" onClick={fetchOrderDetails}>
          Fetch Order
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {/* Order Details Table */}
      {orderDetails.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((order, index) => (
              <tr key={index}>
                <td>{order.user_name}</td>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>${Number(order.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        error === "" && <p className="text-muted">Enter an order ID to fetch details.</p>
      )}
    </div>
  );
}
