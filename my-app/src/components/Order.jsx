import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileDownload,FaCheckCircle, FaShippingFast, FaBoxOpen, FaClipboardList, FaTimesCircle  } from "react-icons/fa";
import { Modal, Button, ProgressBar } from "react-bootstrap";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/orders", { withCredentials: true })
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/invoice/generate/${orderId}`,
        {
          responseType: "blob", // Important: ensures correct PDF format
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/orders/track/${orderId}`,
        { withCredentials: true }
      );
      setTrackingDetails(response.data.tracking);
      setSelectedOrder(orderId);
      setShowModal(true);
      
      
    } catch (error) {
      console.error("Error fetching tracking details:", error);
    }
  };
  
  // Order tracking steps with icons
  const allTrackingSteps = [
    { label: "Confirmed Order", icon: <FaClipboardList />, status: "pending" },
    { label: "Processing Order", icon: <FaBoxOpen />, status: "processing" },
    { label: "Dispatched Item", icon: <FaShippingFast />, status: "shipped" },
    { label: "Product Delivered", icon: <FaCheckCircle />, status: "delivered" },
    { label: "Order Canceled", icon: <FaTimesCircle />, status: "canceled" },
   
  
  ];

  const getFilteredSteps = (trackingDetails) => {
    if (trackingDetails.includes("Order Canceled")) {
      return allTrackingSteps.filter((step) =>
        ["Confirmed Order", "Processing Order", "Dispatched Item", "Order Canceled"].includes(step.label)
      );
    }
    return allTrackingSteps.filter((step) =>
      ["Confirmed Order", "Processing Order", "Dispatched Item", "Product Delivered"].includes(step.label)
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="alert alert-warning text-center">No orders found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Order Id</th>
                <th>Items</th>
                <th>Total Price</th>
                <th>Track</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <ul className="list-unstyled">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span className="fw-semibold">
                            {item.product_name}
                          </span>{" "}
                          - {item.quantity} x ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-success">₹{order.total_price}</td>
                  <td>
                  <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleTrackOrder(order.id)}
                    >
                      Track Your Order
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      Download Invoice{<FaFileDownload/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     {/* Order Tracking Modal */}
     <Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Order Tracking - #{selectedOrder}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="tracking-container text-center">
      <div className="d-flex justify-content-between align-items-center">
        {getFilteredSteps(trackingDetails).map((step, index) => (
          <div key={index} className="step">
            <div
              className={`icon-circle ${
                trackingDetails.includes(step.label) ? "completed" : "pending"
              }`}
            >
              {step.icon}
            </div>
            <p className="mt-2">{step.label}</p>
          </div>
        ))}
      </div>
      <ProgressBar
        now={(trackingDetails.length / getFilteredSteps(trackingDetails).length) * 100}
        className="mt-3"
        variant="success"
      />
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
<style>
  {`
    .tracking-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tracking-steps {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 650px; /* Increased width to allow more spacing */
      position: relative;
      margin: 30px 0;
      gap: 20px; /* Adds spacing between steps */
    }

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 2;
      min-width: 100px; /* Ensures even spacing */
    }

    .icon-circle {
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      font-size: 20px;
      color: white;
      transition: background 0.3s ease, transform 0.3s ease;
      margin-bottom: 10px; /* Increased spacing between icon and text */
      margin-left: 5px;
    }

    .icon-circle.completed {
      background: #28a745;
      box-shadow: 0px 0px 10px rgba(40, 167, 69, 0.5);
      transform: scale(1.1);
    }

    .icon-circle.pending {
      background: #6c757d;
      opacity: 0.6;
    }

    /* Progress bar container */
    .progress-bar-container {
      position: absolute;
      top: 35px;
      left: 0;
      width: 100%;
      height: 10px;
      background: #d1d1d1;
      border-radius: 10px;
      z-index: 1;
    }

    .progress {
      height: 100%;
      border-radius: 10px;
      background: #28a745;
      transition: width 0.4s ease-in-out;
    }

    .step p {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      padding: 0 10px; /* Adds spacing between text labels */
    }
  `}
</style>

    </div>
  );
}
