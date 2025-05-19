import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/user-profile", {
      method: "GET",
      credentials: "include", // ✅ Important for sessions
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(error => console.error("Profile fetch error:", error));
  }, []);
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Profile</h2>
      {user ? (
        <div className="card p-4 shadow-sm">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <Link to="/orders">My order</Link>
          <button className="btn btn-danger" onClick={() => {
            fetch("http://localhost:5000/logout", {
              method: "POST",
              credentials: "include",
            }).then(() => window.location.href = "/");
          }}>Logout</button>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}
