import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom"; // Use NavLink for active styling
import AuthModal from "./AuthModal";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
// Removed ProfileSliderbar import for now as it wasn't used in the return
import { useCart } from "./CartContext";
import './Navbar.css'; // Import custom CSS file (create this file)

export default function Navbar(props) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const { cart, refreshCart, clearLocalCart } = useCart();

  useEffect(() => {
    // Debounce or throttle this if it causes performance issues on rapid state changes
    fetch("http://localhost:5000/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) { // Handle non-JSON error responses
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Navbar check-session response:", data);
        setIsLoggedIn(!!data.user);
      })
      .catch((error) => {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
      });
  }, []);

  const handleLoginClick = () => setShowAuthModal(true);
  const handleModalClose = () => setShowAuthModal(false);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    console.log("Auth Success: Refreshing cart...");
    refreshCart();
  };

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) {
          console.error("Logout failed:", res.statusText);
           // Maybe display an error message to the user
        }
        return res;
      })
      .then(() => {
        console.log("Logout successful: Clearing local cart and setting logged out state.");
        setIsLoggedIn(false);
        clearLocalCart();
      })
      .catch((error) => console.error("Logout fetch error:", error));
  };

  const uniqueItemsInCart = cart.length;

  return (
    <>
      <AuthModal
        show={showAuthModal}
        onClose={handleModalClose}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* --- Enhancements ---
        - Changed bg-body-tertiary to bg-white for a cleaner look
        - Added shadow-sm for subtle depth
        - Increased padding py-2
      */}
      <div className="container">
      <nav className="navbar navbar-expand-lg bg-white sticky-top shadow-sm py-2">
        <div className="container-fluid">
          {/* --- Enhancement: Bolder Brand --- */}
          <Link className="navbar-brand fw-bold" to="/">
            {props.title}
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* --- Enhancements: NavLink for active state, adjusted padding --- */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                {/* Use NavLink for automatic active class */}
                <NavLink className="nav-link" aria-current="page" to="/" end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/About">
                  {props.aboutus}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/Porducts">
                  Products
                </NavLink>
              </li>
            </ul>

            {/* --- Enhancements: Adjusted spacing and button style --- */}
            <div className="d-flex align-items-center">
              <Link
                to="/cart"
                className="btn btn-outline-secondary me-3 position-relative rounded-pill px-3" // Changed color, rounded, padding
              >
                <FaShoppingCart size={20} className="me-1"/> {/* Adjusted size, added margin */}
                {uniqueItemsInCart > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"> {/* Changed badge color */}
                    {uniqueItemsInCart}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </Link>

              {isLoggedIn === null ? (
                <span className="navbar-text me-2">Loading...</span>
              ) : isLoggedIn ? (
                // Link to profile - consider adding a dropdown via ProfileSliderbar later
                 <div className="dropdown">
                    <button
                      className="btn btn-link p-0 me-2 text-decoration-none" // Removed underline
                      type="button"
                      id="profileDropdown"
                      data-bs-toggle="dropdown" // Added dropdown toggle
                      aria-expanded="false"
                    >
                      <FaUserCircle size={30} className="text-secondary" /> {/* Changed color */}
                    </button>
                    {/* Basic Dropdown Menu */}
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                       <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                       <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                       <li><hr className="dropdown-divider" /></li>
                       <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                    </ul>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm rounded-pill px-3" // Changed style, rounded, padding
                  type="button"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      </div>       
      {/* You would reintegrate ProfileSliderbar if needed, potentially triggered by the profile icon */}
      {/* <ProfileSliderbar handleLogout={handleLogout} userName={props.userName} isLoggedIn={isLoggedIn} /> */}
    </>
  );
}

Navbar.propTypes = {
  title: PropTypes.string,
  aboutus: PropTypes.string,
  userName: PropTypes.string
};

Navbar.defaultProps = {
  title: "TUI",
  aboutus: "About",
};