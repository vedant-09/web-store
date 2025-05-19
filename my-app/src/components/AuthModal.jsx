import React, { useState } from 'react';
import PropTypes from 'prop-types'


export default function AuthModal({ show, onClose,onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
 
  const toggleForm = () => {
    setIsLogin(!isLogin);
  }; 

  // Handler for Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for sessions
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
  
      const result = await response.json();
      if (result.status === "success") {
        onAuthSuccess();
        onClose();
        window.location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  

  // Handler for Sign Up form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
  
      const result = await response.json();
      console.log(result);
  
      if (result.status === "success") {
        alert("User registered successfully! Please login.");
        toggleForm(); // Switch to login form
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  

  // Login form component
  const LoginForm = () => (
    <form onSubmit={handleLoginSubmit}>
      <div className="mb-3">
        <label htmlFor="loginEmail" className="form-label">Email address</label>
        <input
          type="email"
          className="form-control"
          name="email"
          id="loginEmail"
          placeholder="Enter email"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="loginPassword" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          name="password"
          id="loginPassword"
          placeholder="Password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" >Login</button>
    </form>
  );

  // Sign Up form component
  const SignupForm = () => (
    <form onSubmit={handleSignupSubmit}>
      <div className="mb-3">
        <label htmlFor="signupName" className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          name="name"
          id="signupName"
          placeholder="Enter name"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="signupPhone" className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-control"
          name="phone"
          id="signupPhone"
          placeholder="Enter phone number"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="signupEmail" className="form-label">Email address</label>
        <input
          type="email"
          className="form-control"
          name="email"
          id="signupEmail"
          placeholder="Enter email"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="signupPassword" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          name="password"
          id="signupPassword"
          placeholder="Password"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password</label>
        <input
          type="password"
          className="form-control"
          name="confirmPassword"
          id="signupConfirmPassword"
          placeholder="Confirm Password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Sign Up</button>
    </form>
  );

  if (!show) {
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal-backdrop show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isLogin ? "Login" : "Sign Up"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {isLogin ? <LoginForm /> : <SignupForm />}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={toggleForm}>
                {isLogin ? "Switch to Sign Up" : "Switch to Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
AuthModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAuthSuccess: PropTypes.func.isRequired,
};