import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = location.state || { products: [] };

  // Address fields
  const [addressId, setAddressId] = useState(null);
  const [pincode, setPincode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [country, setCountry] = useState("");
  const [typeOfAddress, setTypeOfAddress] = useState("home");
  const [isEditing, setIsEditing] = useState(false);

  // Other states
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Fetch existing address on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/user/address", { withCredentials: true })
      .then((response) => {
        const addr = response.data.address;
        if (addr) {
          setAddressId(addr.id);
          setPincode(addr.pincode);
          setFullAddress(addr.full_address);
          setLandmark(addr.landmark || "");
          setCity(addr.city);
          setStateField(addr.state);
          setCountry(addr.country);
          setTypeOfAddress(addr.type_of_address);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      })
      .catch((error) => console.error("Error fetching address:", error));
  }, []);

  // Fetch session & delivery charge
  useEffect(() => {
    axios
      .get("http://localhost:5000/check-session", { withCredentials: true })
      .then((response) => {
        if (response.data.user && response.data.user.id) {
          fetchDeliveryCharge(response.data.user.id);
        }
      })
      .catch((error) => console.error("Error fetching session:", error));
  }, []);

  const fetchDeliveryCharge = (userId) => {
    axios
      .post(
        "http://localhost:5000/api/calculate-charge",
        { userId },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.deliveryCharge !== undefined) {
          setDeliveryCharge(response.data.deliveryCharge);
        }
      })
      .catch((error) => console.error("Error fetching delivery charge:", error));
  };

  // Save or update address
  const handleSaveAddress = () => {
    const payload = {
      id: addressId,
      pincode,
      full_address: fullAddress,
      landmark,
      city,
      state: stateField,
      country,
      type_of_address: typeOfAddress,
    };

    axios
      .post("http://localhost:5000/user/address", payload, { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          alert("Address saved!");
          setIsEditing(false);
          if (!addressId && response.data.addressId) {
            setAddressId(response.data.addressId);
          }
        } else {
          alert("Failed to save address");
        }
      })
      .catch((error) => console.error("Error saving address:", error));
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (!fullAddress.trim()) {
      alert("Please provide your address before placing the order.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/order/create",
        { products, addressId, paymentMethod, deliveryCharge },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Order placed successfully!");
        navigate("/orders");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      {/* Address Section */}
      <section className="my-2 bg-light p-3">
        <label className="form-label">Shipping Address</label>
        {isEditing ? (
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode"
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                required
              />
            </div>
            <div className="col-12">
              <input
                type="text"
                className="form-control"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Full Address"
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Landmark (optional)"
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={stateField}
                onChange={(e) => setStateField(e.target.value)}
                placeholder="State"
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                required
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={typeOfAddress}
                onChange={(e) => setTypeOfAddress(e.target.value)}
              >
                <option value="home">Home</option>
                <option value="office">Office</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-12 text-end">
              <button className="btn btn-success" onClick={handleSaveAddress}>
                Save Address
              </button>
            </div>
          </div>
        ) : (
          <div className="border p-3 d-flex justify-content-between align-items-start">
            <div>
            <p className="mb-1">
  <strong>{typeOfAddress?.toUpperCase() ?? "ADDRESS"}</strong>
</p>
              <p className="mb-1">{fullAddress}</p>
              {landmark && <p className="mb-1">Landmark: {landmark}</p>}
              <p className="mb-1">{city}, {stateField} - {pincode}</p>
              <p className="mb-0">{country}</p>
            </div>
            <button className="btn btn-warning btn-sm" onClick={() => setIsEditing(true)}>
              Change
            </button>
          </div>
        )}
      </section>

      {/* Payment Method Section */}
      <section className="my-2 bg-light p-3">
        <label className="form-label">Payment Method</label>
        <select
          className="form-control"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="card">Credit/Debit Card</option>
        </select>
      </section>

      {/* Order Summary */}
      <section className="my-2 bg-light">
        <div className="card shadow p-3 mb-4">
          <h4 className="card-title text-center mb-3">🛒 Order Summary</h4>
          <ul className="list-group list-group-flush">
            {products.map((item) => (
              <li key={item.id} className="list-group-item d-flex align-items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded me-3"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <strong>{item.name}</strong>
                  <br />
                  <small className="text-muted">Qty: {item.quantity}</small>
                </div>
                <span className="fw-bold text-success">
                  ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>

          {/* Price Details */}
          <div className="border-top pt-3 mt-3">
            <h5 className="text-center mb-3">Price Details</h5>
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span className="fw-bold">
                ₹{products.reduce((sum, item) => sum + item.price * item.quantity, 0)}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Delivery Charges:</span>
              <span className="fw-bold text-danger">
                ₹{deliveryCharge || "Calculating..."}
              </span>
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Total Amount:</strong>
              <strong className="text-success">
                ₹{products.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryCharge}
              </strong>
            </div>
          </div>

          <div className="text-center mt-3">
            <button
              className="btn btn-primary w-100 py-2"
              onClick={handlePlaceOrder}
              disabled={deliveryCharge === 0}
            >
              ✅ Place Order
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
