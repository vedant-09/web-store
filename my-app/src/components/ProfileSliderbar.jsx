import React from 'react';

export default function ProfileSidebar({ handleLogout, userName }) {

  
  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="profileSidebar"
      aria-labelledby="profileSidebarLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="profileSidebarLabel">Profile</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <p>Welcome, {userName || "User"}</p>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
