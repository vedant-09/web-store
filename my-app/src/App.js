import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import About from "./components/About";
import Main from "./components/Main";
import Navbar from "./components/Navbar";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminLogin from "./Admin/AdminLogin";

import Footer from "./components/Footer";
import Porducts from "./components/Porducts";
import PaymentPage from "./components/PaymentPage";
import CategoryProducts from "./components/CategoryProducts";
import ProductDetail from "./components/ProductDetail";

import ContactUs from "./components/ContactUs";
import { CartProvider } from "./components/CartContext";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import Orders from "./components/Order";
import "bootstrap/dist/css/bootstrap.min.css";
import Checkout from "./components/Checkout";


function Layout() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetch("http://localhost:5000/admin/check-session", {
      method: "GET",
      credentials: "include", // ✅ Important for cookies/sessions
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log("Session Check Response:", data);
        setIsAdminAuthenticated(data.loggedIn);
      })
      .catch((error) => console.error("Error checking session:", error));
  }, [location.pathname]); // ✅ Re-run when route changes

  useEffect(() => {
    // console.log("isAdminAuthenticated changed:", isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  // Hide the regular Navbar on any /admin page
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
     <div className="d-flex flex-column min-vh-100">
      {!isAdminPage && <Navbar title="TextUI" aboutus="About us" />}

      <main className="flex-fill">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<About />} />
          <Route path="/Porducts" element={<Porducts />} />
          <Route path="/PaymentPage" element={<PaymentPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/CategoryProducts" element={<CategoryProducts />} />
          <Route
            path="/CategoryProducts/:categoryId"
            element={<CategoryProducts />}
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />
            }
          />
          <Route
            path="/admin/dashboard/*"
            element={
              isAdminAuthenticated === null ? (
                <div>Loading...</div>
              ) : isAdminAuthenticated ? (
                <AdminDashboard
                  setIsAdminAuthenticated={setIsAdminAuthenticated}
                />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
    </div>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      {" "}
      {/* ✅ Wrap everything inside CartProvider */}
      <Router>
        <Layout />
      </Router>
    </CartProvider>
  );
}

export default App;
