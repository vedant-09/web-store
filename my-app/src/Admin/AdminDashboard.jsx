import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import {
  FaShoppingCart, FaChartBar, FaBox, FaWarehouse, FaTag, FaSignOutAlt,
  FaUpload
} from "react-icons/fa";
import AdminProducts from "./AdminProducts"; // Import AdminProducts
import AdminInsertForm from "./AdminInsertForm";
import AdminNavbar from "./AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css"; // Custom CSS for styling
import AdminOrders from "./AdminOrderPage";
import AdminOrderDetailPage from "./AdminOrderDetailPage";
import EditProduct from "./EditProduct";



export default function AdminDashboard({ setIsAdminAuthenticated }) {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [admin, setAdmin] = useState(null);
  
    const recentOrders = [
      { id: "#10234", customer: "Alice", amount: "$99.99", status: "Delivered" },
      { id: "#10235", customer: "Bob", amount: "$149.49", status: "Pending" },
    ];
  
    const salesData = {
      totalSales: "$25,400",
      orders: 1243,
      users: 654,
      products: 132,
    };

  useEffect(() => {
    fetch("http://localhost:5000/admin/check-session", {
      credentials: "include", // ✅ Ensures cookies are sent
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          navigate("/admin");
        } else {
          setAdmin(data.admin);
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    fetch("http://localhost:5000/admin/logout", {
      method: "POST",
      credentials: "include", // ✅ Required for session logout
    })
      .then((res) => res.json())
      .then(() => {
        setIsAdminAuthenticated(false);
      })
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <>
     
      <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-primary text-white vh-100 p-3">
        <h4 className="mb-4">eProduct</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/admin/dashboard" className="nav-link text-white">
              <FaChartBar /> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/dashboard/orders" className="nav-link text-white">
              <FaShoppingCart /> Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/dashboard/products" className="nav-link text-white">
              <FaBox /> Products
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/dashboard/" className="nav-link text-white">
              <FaUpload /> Upload
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/dashboard/stock" className="nav-link text-white">
              <FaWarehouse /> Stock
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin/dashboard/offers" className="nav-link text-white">
              <FaTag /> Offers
            </Link>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="content p-4 flex-grow-1">
        <AdminNavbar />
        
        
    <div className="container my-4">
      <h2 className="mb-4">Dashboard</h2>

      {/* Summary Cards */}
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <h5 className="card-title">Total Sales</h5>
              <p className="card-text fs-4">{salesData.totalSales}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Orders</h5>
              <p className="card-text fs-4">{salesData.orders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info h-100">
            <div className="card-body">
              <h5 className="card-title">Users</h5>
              <p className="card-text fs-4">{salesData.users}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning h-100">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <p className="card-text fs-4">{salesData.products}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card my-5">
        <div className="card-header">
          <h5 className="mb-0">Recent Orders</h5>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "Delivered"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>






        
        <Routes>
          <Route path="products" element={<AdminProducts />} />
          <Route path="insert" element={<AdminInsertForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="order_details" element={<AdminOrderDetailPage />} />
          <Route path="edit/:id" element={<EditProduct />} />
       
          {/* Add more sub-routes as needed */}
        </Routes>
      </div>
    </div>
    </>
  );
}
