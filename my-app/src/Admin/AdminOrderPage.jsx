import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaCog } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminOrderPage.css";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from backend
  const fetchOrders = () => {
    fetch("http://localhost:5000/admin/orders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error("Error fetching orders:", err));
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("http://localhost:5000/admin/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
        credentials: "include",
      });

      const data = await res.json();
        // console.log(data);
        
      if (data.success) {
        // Update the state immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Close dropdown manually
        document.getElementById(`dropdown-${orderId}`).classList.remove("show");
      } else {
        console.error("Failed to update status:", data.message);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Filter orders based on selected date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const statusMatch = status === "all" || order.status.toLowerCase() === status.toLowerCase();

    return statusMatch &&(!start || orderDate >= start) && (!end || orderDate <= end);
  });

  return (
    <div className="order-container">
      <h2 className="mt-3">Orders</h2>
      <Link type="button" className="btn btn-secondary " to="/admin/dashboard/order_details">Order Details</Link>

      <div className="d-flex justify-content-end align-items-center gap-2 my-3">
        {/* Status Filter */}
        <div className="d-flex gap-3">
          {["all", "pending", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              className={`btn border-0 ${
                status === s ? "fw-bold text-dark border-bottom border-primary" : "text-muted"
              }`}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Start Date Input */}
        <div className="input-group" style={{ maxWidth: "200px" }}>
          <span className="input-group-text bg-light">
            <FaCalendarAlt />
          </span>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <span className="fw-bold text-muted">To</span>

        {/* End Date Input */}
        <div className="input-group" style={{ maxWidth: "200px" }}>
          <span className="input-group-text bg-light">
            <FaCalendarAlt />
          </span>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="order-table">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Date</th>
              <th>Price</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.user_name}</td>
                  <td>{order.address}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{Number(order.price).toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span
                      className={`status ${
                        order.status === "pending"
                          ? "pending"
                          : order.status === "shipped"
                          ? "shipped"
                          : order.status === "delivered"
                          ? "delivered"
                          : "cancelled"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button
                        className="btn btn-light dropdown-toggle"
                        id={`dropdown-${order.order_id}`}
                        data-bs-toggle="dropdown"
                      >
                        <FaCog />
                      </button>
                      <ul className="dropdown-menu">
                        {["pending", "shipped", "delivered", "cancelled"].map((status) => (
                          <li key={status}>
                            <button
                              className="dropdown-item"
                              onClick={() => updateStatus(order.order_id, status)}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No orders found in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
