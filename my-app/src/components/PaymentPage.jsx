import React, { useState } from 'react';

const PaymentPage = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you would typically send the payment data to your backend or a payment gateway.
    console.log({ cardNumber, expiryDate, cvv, name });
    alert('Payment submitted (check console)'); // Replace with actual payment logic
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Payment Information</div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cardNumber"
                    placeholder="Enter card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="expiryDate" className="form-label">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="cvv" className="form-label">
                    CVV
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cvv"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter cardholder name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;