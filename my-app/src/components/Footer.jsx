import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto ">
      <div className="container">
        <div className="row">
          {/* Left Section */}
          <div className="col-md-4 text-center text-md-start">
            <h5>My Website</h5>
            <p>&copy; {new Date().getFullYear()} All Rights Reserved</p>
          </div>

          {/* Center Section */}
          <div className="col-md-4 text-center">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/About" className="text-light text-decoration-none">About</a></li>
              <li><a href="/contactus" className="text-light text-decoration-none">Contact</a></li>
            </ul>
          </div>

          {/* Right Section - Social Media */}
          <div className="col-md-4 text-center text-md-end">
            <h5>Follow Us</h5>
            <a href="/" className="text-light me-3">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="/" className="text-light me-3">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="/" className="text-light">
              <i className="bi bi-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
