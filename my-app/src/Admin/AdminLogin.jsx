import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ setIsAdminAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for session handling
      });

      const result = await response.json();

      if (result.status === "success") {
        setIsAdminAuthenticated(true); // Store session
        navigate("/admin/dashboard"); // Redirect to dashboard
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
      <h2>Admin Login</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>

      </div>
    </div>
  );
}
